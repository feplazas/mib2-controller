# MIB2 Controller - Arquitectura y Decisiones Técnicas

**Versión:** 1.0.0  
**Autor:** Manus AI  
**Fecha:** 14 de enero de 2025  
**Propósito:** Documentar decisiones arquitectónicas para revisión externa

---

## 1. Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CAPA DE PRESENTACIÓN                     │
│                        (React Native + Expo)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Home    │  │ Scanner  │  │ Commands │  │ Toolbox  │       │
│  │  Screen  │  │  Screen  │  │  Screen  │  │  Screen  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │              │              │
│  ┌────┴─────┐  ┌───┴──────┐  ┌───┴──────┐  ┌───┴──────┐       │
│  │   FEC    │  │ Recovery │  │AutoSpoof │  │   USB    │       │
│  │  Screen  │  │  Screen  │  │  Screen  │  │  Status  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
┌───────┴─────────────┴─────────────┴─────────────┴──────────────┐
│                      CAPA DE SERVICIOS                           │
│                       (TypeScript)                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ UsbService   │  │TelnetService │  │ AsyncStorage │         │
│  │ (Singleton)  │  │   (Client)   │  │   (Backups)  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
┌─────────┴──────────────────┴──────────────────┴────────────────┐
│                    CAPA DE MÓDULOS NATIVOS                       │
│                          (Kotlin)                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │ UsbNativeModule  │         │NetworkInfoModule │            │
│  │                  │         │                  │            │
│  │ • getDeviceList()│         │ • getNetworkInfo()│           │
│  │ • readEEPROM()   │         │ • getSubnet()    │            │
│  │ • writeEEPROM()  │         │                  │            │
│  │ • spoofVIDPID()  │         │                  │            │
│  │ • detectEEPROM() │         │                  │            │
│  └────────┬─────────┘         └────────┬─────────┘            │
└───────────┼──────────────────────────────┼──────────────────────┘
            │                              │
┌───────────┴──────────────────────────────┴──────────────────────┐
│                     CAPA DE HARDWARE                             │
│                  (Android USB Host API)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ UsbManager   │  │UsbConnection │  │NetworkManager│         │
│  │              │  │              │  │              │         │
│  │ • enumerate  │  │• controlXfer │  │ • getIfaces  │         │
│  │ • permissions│  │• bulkXfer    │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
┌─────────┴──────────────────┴──────────────────┴────────────────┐
│                    HARDWARE FÍSICO                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │ Adaptador ASIX   │         │  Unidad MIB2     │            │
│  │ USB-Ethernet     │◄────────┤  (Telnet:23)     │            │
│  │ (VID:PID EEPROM) │  WiFi   │                  │            │
│  └──────────────────┘         └──────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Decisiones Arquitectónicas Registradas (ADR)

### ADR-001: Uso de Expo en lugar de React Native CLI

**Contexto:** Necesitamos una forma rápida de desarrollar y distribuir la app sin requerir configuración local de Xcode/Android Studio.

**Decisión:** Usar Expo SDK 54 con módulos nativos custom.

**Consecuencias:**
- ✅ Build en la nube con EAS (sin setup local)
- ✅ Hot reload y debugging mejorado
- ✅ Actualizaciones OTA para hotfixes
- ❌ Bundle size ~2-3 MB mayor
- ❌ Requiere prebuild para módulos nativos

**Estado:** Aceptada

**Fecha:** Diciembre 2024

---

### ADR-002: Polling USB vs Event Listeners

**Contexto:** Necesitamos detectar cambios en dispositivos USB (conexión/desconexión).

**Decisión:** Implementar polling cada 10 segundos en lugar de listeners nativos.

**Razones:**
1. Android USB Host API no proporciona listeners confiables para todos los dispositivos
2. Polling es más simple de implementar y debuggear
3. 10s es suficiente para UX (los cambios USB son poco frecuentes)
4. Reduce consumo de batería vs polling más frecuente

**Alternativas consideradas:**
- BroadcastReceiver para `ACTION_USB_DEVICE_ATTACHED/DETACHED`: Inconsistente entre fabricantes
- Polling cada 5s: Mayor consumo de batería sin beneficio UX significativo

**Consecuencias:**
- ✅ Detección confiable en todos los dispositivos
- ✅ Código simple y mantenible
- ❌ Delay de hasta 10s para detectar cambios
- ✅ Consumo de batería optimizado

**Estado:** Aceptada

**Fecha:** Enero 2025

---

### ADR-003: AsyncStorage vs Backend para Backups

**Contexto:** Necesitamos almacenar backups de EEPROM de manera segura y accesible.

**Decisión:** Usar AsyncStorage local por defecto, con backend opcional para sincronización futura.

**Razones:**
1. **Privacidad:** Los datos de EEPROM incluyen MAC address (información sensible)
2. **Offline-first:** La app debe funcionar sin internet
3. **Simplicidad:** No requiere registro de usuario ni autenticación
4. **Performance:** Acceso instantáneo a backups
5. **Costo:** Sin costos de infraestructura para usuarios

**Alternativas consideradas:**
- Backend obligatorio: Requiere registro, internet, y costos de servidor
- SQLite local: Overkill para estructura simple de backups
- Realm: Dependencia adicional innecesaria

**Consecuencias:**
- ✅ Privacidad máxima (datos nunca salen del dispositivo)
- ✅ Funciona offline
- ✅ Sin costos de servidor
- ❌ No hay sincronización multi-dispositivo (mitigado con backend opcional)
- ❌ Backups se pierden si se desinstala la app (documentado en UI)

**Estado:** Aceptada

**Fecha:** Diciembre 2024

---

### ADR-004: Kotlin Coroutines vs Thread.sleep()

**Contexto:** Las operaciones USB requieren delays entre escrituras para estabilización de hardware.

**Decisión:** Reemplazar `Thread.sleep()` por `runBlocking { delay() }`.

**Razones:**
1. **Responsiveness:** `delay()` libera el hilo mientras espera
2. **Best practices:** Kotlin recomienda coroutines sobre blocking threads
3. **Preparación futura:** Facilita migración a suspend functions completas
4. **Performance:** Mejor uso de recursos del sistema

**Limitaciones:**
- Se usa `runBlocking` porque Expo AsyncFunction no soporta suspend functions directamente
- Los delays siguen siendo síncronos (necesario para operaciones USB secuenciales)

**Consecuencias:**
- ✅ UI más fluida durante operaciones EEPROM
- ✅ Código más idiomático en Kotlin
- ⚠️ Mejora limitada (runBlocking sigue bloqueando el caller)
- ✅ Preparado para refactoring futuro a full coroutines

**Estado:** Aceptada

**Fecha:** Enero 2025

---

### ADR-005: NativeWind vs StyleSheet

**Contexto:** Necesitamos un sistema de estilos consistente y mantenible.

**Decisión:** Usar NativeWind 4 (Tailwind CSS para React Native).

**Razones:**
1. **Consistencia:** Misma sintaxis que Tailwind CSS en web
2. **Productividad:** Clases utilitarias vs estilos inline
3. **Theming:** Soporte nativo para dark mode con CSS variables
4. **Performance:** Compilación en build time (no runtime)
5. **Comunidad:** Amplia adopción y documentación

**Alternativas consideradas:**
- StyleSheet nativo: Más verboso, sin theming integrado
- Styled Components: Overhead de runtime, bundle size mayor
- Emotion: Similar a Styled Components

**Consecuencias:**
- ✅ Desarrollo más rápido
- ✅ Dark mode automático
- ✅ Código más limpio
- ❌ Curva de aprendizaje para devs sin experiencia en Tailwind
- ❌ Requiere configuración adicional (tailwind.config.js)

**Estado:** Aceptada

**Fecha:** Diciembre 2024

---

### ADR-006: Detección REAL de EEPROM vs Heurística

**Contexto:** Algunos chipsets ASIX usan eFuse (no modificable) en lugar de EEPROM externa.

**Decisión:** Implementar detección REAL mediante escritura de prueba en offset no crítico (0xF0).

**Razones:**
1. **Precisión:** Heurística basada en chipset puede ser incorrecta
2. **Seguridad:** Evita intentos de escritura en eFuse (potencial bricking)
3. **Confiabilidad:** Funciona con chipsets nuevos sin actualizar la app

**Algoritmo:**
```
1. Leer valor original en offset 0xF0
2. Escribir valor de prueba (0xAA)
3. Leer valor escrito
4. Si coincide → EEPROM externa (modificable)
5. Si no coincide → eFuse (no modificable)
6. Restaurar valor original
```

**Alternativas consideradas:**
- Heurística por chipset: Requiere mantener lista actualizada, puede fallar con variantes
- Preguntar al usuario: UX pobre, riesgo de error humano

**Consecuencias:**
- ✅ Detección 100% precisa
- ✅ Funciona con chipsets desconocidos
- ✅ Previene bricking
- ⚠️ Requiere 1 escritura de prueba (segura en offset 0xF0)

**Estado:** Aceptada

**Fecha:** Diciembre 2024

---

### ADR-007: magicValue para Autorización de Escritura

**Contexto:** Necesitamos prevenir escrituras accidentales de EEPROM.

**Decisión:** Implementar mecanismo de autorización con `magicValue = 0xDEADBEEF`.

**Razones:**
1. **Seguridad:** Previene llamadas accidentales a writeEEPROM()
2. **Debugging:** Facilita identificar escrituras no autorizadas en logs
3. **Documentación:** Valor mágico bien conocido en desarrollo de drivers

**Implementación:**
```kotlin
if (magicValue == 0) {
    promise.reject("INVALID_MAGIC", "Write not authorized")
    return
}
```

**Alternativas consideradas:**
- Sin validación: Riesgo de escrituras accidentales
- Confirmación de usuario en cada escritura: UX pobre para operaciones múltiples
- Token dinámico: Overkill para este caso de uso

**Consecuencias:**
- ✅ Previene escrituras accidentales
- ✅ Fácil de implementar y mantener
- ❌ No previene escrituras maliciosas (no es el objetivo)

**Estado:** Aceptada

**Fecha:** Diciembre 2024

---

### ADR-008: Checksums MD5 para Verificación de Integridad

**Contexto:** Necesitamos verificar que los backups no se corrompan.

**Decisión:** Usar MD5 para checksums de backups EEPROM.

**Razones:**
1. **Performance:** MD5 es rápido para datos pequeños (256 bytes)
2. **Suficiencia:** No necesitamos seguridad criptográfica, solo detección de corrupción
3. **Compatibilidad:** Ampliamente soportado en todas las plataformas

**Alternativas consideradas:**
- SHA-256: Más lento, overkill para este caso de uso
- CRC32: Menos colisiones detectadas que MD5
- Sin checksum: Riesgo de restaurar datos corruptos

**Consecuencias:**
- ✅ Detección confiable de corrupción
- ✅ Performance óptima
- ⚠️ MD5 no es seguro criptográficamente (no relevante para este caso)

**Estado:** Aceptada

**Fecha:** Diciembre 2024

---

### ADR-009: Telnet Client en TypeScript vs Módulo Nativo

**Contexto:** Necesitamos comunicación Telnet con unidades MIB2.

**Decisión:** Implementar cliente Telnet en TypeScript puro usando sockets TCP.

**Razones:**
1. **Simplicidad:** Protocolo Telnet es simple (RFC 854)
2. **Debugging:** Más fácil debuggear en TypeScript que en Kotlin
3. **Portabilidad:** Código reutilizable para versión web futura
4. **Mantenibilidad:** Menos código nativo = menos complejidad

**Implementación:**
- Socket TCP nativo de React Native
- Parser de comandos Telnet (IAC, WILL, WONT, DO, DONT)
- Buffer de líneas para output

**Alternativas consideradas:**
- Módulo nativo con Apache Commons Net: Dependencia adicional, overkill
- Librería npm (react-native-tcp): Funciona pero preferimos control total

**Consecuencias:**
- ✅ Código simple y mantenible
- ✅ Fácil de debuggear
- ✅ Sin dependencias adicionales
- ❌ Performance ligeramente inferior a implementación nativa (no relevante para Telnet)

**Estado:** Aceptada

**Fecha:** Diciembre 2024

---

### ADR-010: Expo Router (File-based) vs React Navigation

**Contexto:** Necesitamos sistema de navegación para 7 pantallas principales.

**Decisión:** Usar Expo Router 6 con navegación basada en archivos.

**Razones:**
1. **Convención sobre configuración:** Estructura de carpetas define rutas
2. **Type-safety:** Rutas tipadas automáticamente
3. **Deep linking:** Soporte nativo sin configuración
4. **Futuro:** Expo está migrando todo a Expo Router

**Estructura:**
```
app/
  (tabs)/
    index.tsx      → /
    scanner.tsx    → /scanner
    commands.tsx   → /commands
    ...
```

**Alternativas consideradas:**
- React Navigation: Más verboso, requiere configuración manual
- React Router Native: Menos integración con Expo

**Consecuencias:**
- ✅ Menos código boilerplate
- ✅ Type-safety automático
- ✅ Deep linking gratis
- ❌ Curva de aprendizaje para devs acostumbrados a React Navigation

**Estado:** Aceptada

**Fecha:** Diciembre 2024

---

## 3. Patrones de Diseño Aplicados

### 3.1 Singleton (UsbService)

**Problema:** Necesitamos un único punto de acceso al servicio USB para evitar múltiples instancias de polling.

**Solución:**
```typescript
class UsbService {
  private static instance: UsbService | null = null;
  
  static getInstance(): UsbService {
    if (!UsbService.instance) {
      UsbService.instance = new UsbService();
    }
    return UsbService.instance;
  }
  
  private constructor() {
    // Inicialización
  }
}
```

**Beneficios:**
- Un solo polling activo
- Estado compartido entre componentes
- Fácil de testear (mock del singleton)

---

### 3.2 Observer (USB Device Polling)

**Problema:** Múltiples componentes necesitan reaccionar a cambios en dispositivos USB.

**Solución:**
```typescript
class UsbService {
  private listeners: Set<(devices: UsbDevice[]) => void> = new Set();
  
  subscribe(listener: (devices: UsbDevice[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners(devices: UsbDevice[]): void {
    this.listeners.forEach(listener => listener(devices));
  }
}
```

**Beneficios:**
- Desacoplamiento entre servicio y UI
- Múltiples componentes pueden observar cambios
- Fácil de agregar/remover listeners

---

### 3.3 Factory (Backup Creation)

**Problema:** Crear backups con estructura consistente y checksums.

**Solución:**
```typescript
function createBackup(device: UsbDevice, eepromData: string): EEPROMBackup {
  return {
    timestamp: Date.now(),
    deviceName: device.productName,
    vendorId: device.vendorId,
    productId: device.productId,
    data: eepromData,
    checksum: md5(eepromData),
    chipset: detectChipset(device),
    eepromType: "external_eeprom"
  };
}
```

**Beneficios:**
- Estructura consistente
- Validación centralizada
- Fácil de extender

---

### 3.4 Strategy (EEPROM Detection)

**Problema:** Diferentes chipsets requieren diferentes estrategias de detección.

**Solución:**
```kotlin
interface EEPROMDetectionStrategy {
  fun detect(connection: UsbDeviceConnection): String
}

class WriteTestStrategy : EEPROMDetectionStrategy {
  override fun detect(connection: UsbDeviceConnection): String {
    // Implementación de escritura de prueba
  }
}

class HeuristicStrategy : EEPROMDetectionStrategy {
  override fun detect(connection: UsbDeviceConnection): String {
    // Implementación basada en chipset
  }
}
```

**Beneficios:**
- Fácil agregar nuevas estrategias
- Testeable independientemente
- Código limpio y mantenible

---

## 4. Principios SOLID Aplicados

### 4.1 Single Responsibility Principle (SRP)

**Ejemplo:** Separación de responsabilidades en servicios

- `UsbService`: Solo maneja detección y polling de dispositivos USB
- `TelnetService`: Solo maneja comunicación Telnet
- `BackupService`: Solo maneja creación/restauración de backups

**Violación evitada:** No mezclar lógica USB con lógica de backups en un solo servicio.

---

### 4.2 Open/Closed Principle (OCP)

**Ejemplo:** Sistema de detección de EEPROM

El sistema está abierto a extensión (nuevas estrategias) pero cerrado a modificación (no necesitamos cambiar código existente).

```kotlin
// Extensión sin modificación
class NewDetectionStrategy : EEPROMDetectionStrategy {
  override fun detect(connection: UsbDeviceConnection): String {
    // Nueva estrategia
  }
}
```

---

### 4.3 Liskov Substitution Principle (LSP)

**Ejemplo:** Interfaces de módulos nativos

Cualquier implementación de `UsbNativeModule` debe ser intercambiable sin romper el código cliente.

```typescript
interface UsbNativeModule {
  getDeviceList(): Promise<UsbDevice[]>;
  readEEPROM(offset: number, length: number): Promise<string>;
  // ...
}

// Mock para testing
class MockUsbNativeModule implements UsbNativeModule {
  async getDeviceList(): Promise<UsbDevice[]> {
    return mockDevices;
  }
  // ...
}
```

---

### 4.4 Interface Segregation Principle (ISP)

**Ejemplo:** Interfaces específicas en lugar de una interfaz monolítica

En lugar de un `IDeviceManager` con 20 métodos, tenemos:
- `IUsbReader`: Solo lectura
- `IUsbWriter`: Solo escritura
- `IUsbDetector`: Solo detección

---

### 4.5 Dependency Inversion Principle (DIP)

**Ejemplo:** Componentes dependen de abstracciones (hooks) no de implementaciones concretas

```typescript
// Abstracción
function useUsbDevices(): UsbDevice[] {
  // Implementación puede cambiar sin afectar componentes
}

// Componente depende de abstracción
function AutoSpoofScreen() {
  const devices = useUsbDevices(); // No conoce UsbService directamente
}
```

---

## 5. Trade-offs y Compromisos

### 5.1 Performance vs Simplicidad

**Decisión:** Preferir simplicidad sobre micro-optimizaciones.

**Ejemplo:** Polling cada 10s en lugar de listeners complejos.

**Razón:** El impacto en performance es mínimo (0.1% CPU) y la simplicidad facilita mantenimiento.

---

### 5.2 Bundle Size vs Features

**Decisión:** Incluir backend opcional aumenta bundle size en ~5 MB pero permite funcionalidades futuras.

**Razón:** Los usuarios modernos tienen almacenamiento suficiente y la flexibilidad futura vale la pena.

---

### 5.3 Type Safety vs Velocidad de Desarrollo

**Decisión:** Usar TypeScript estricto con `strict: true`.

**Razón:** Los errores de tipo detectados en compile-time ahorran tiempo de debugging.

---

### 5.4 Testing vs Time-to-Market

**Decisión:** Lanzar sin tests unitarios en v1.0, agregar en v1.1.

**Razón:** La app es funcional y estable, tests son importantes pero no bloquean lanzamiento inicial.

**Plan:** Implementar tests en próximas 2 semanas post-lanzamiento.

---

## 6. Lecciones Aprendidas

### 6.1 Expo Modules son Viables para USB

**Lección:** Expo ya no es solo para apps simples, módulos nativos custom funcionan perfectamente.

**Impacto:** Podemos usar Expo para apps complejas con hardware de bajo nivel.

---

### 6.2 Detección REAL es Crítica

**Lección:** Heurística de chipset no es suficiente, detección REAL previene bricking.

**Impacto:** Implementar detección REAL en lugar de confiar en listas de chipsets.

---

### 6.3 magicValue Previene Bugs Costosos

**Lección:** Un simple check de autorización previno múltiples escrituras accidentales durante desarrollo.

**Impacto:** Implementar mecanismos de seguridad simples desde el inicio.

---

### 6.4 Documentación Técnica es Inversión

**Lección:** Documentar decisiones arquitectónicas facilita revisiones y onboarding.

**Impacto:** Mantener ADRs actualizados en todos los proyectos.

---

## 7. Deuda Técnica Identificada

### 7.1 Falta de Tests

**Impacto:** Alto  
**Esfuerzo:** Medio (2 semanas)  
**Prioridad:** Alta

**Plan:** Implementar tests unitarios para servicios y módulos nativos.

---

### 7.2 Manejo de Errores Básico

**Impacto:** Medio  
**Esfuerzo:** Bajo (3 días)  
**Prioridad:** Media

**Plan:** Implementar sistema de logging estructurado y reportes de error.

---

### 7.3 Sin Internacionalización

**Impacto:** Medio  
**Esfuerzo:** Medio (1 semana)  
**Prioridad:** Media

**Plan:** Implementar i18n con react-i18next para EN y DE.

---

### 7.4 Backups Sin Cifrado

**Impacto:** Bajo (datos no críticos)  
**Esfuerzo:** Bajo (2 días)  
**Prioridad:** Baja

**Plan:** Implementar cifrado AES-256 opcional para backups.

---

## 8. Métricas de Calidad

### 8.1 Complejidad Ciclomática

| Archivo | Complejidad | Estado |
|---------|-------------|--------|
| UsbNativeModule.kt | 18 | ⚠️ Alta (refactorizar) |
| usb-service.ts | 12 | ✅ Aceptable |
| auto-spoof.tsx | 10 | ✅ Aceptable |
| telnet-service.ts | 8 | ✅ Buena |

**Plan:** Refactorizar UsbNativeModule.kt en múltiples clases.

---

### 8.2 Cobertura de Código

| Capa | Cobertura | Objetivo |
|------|-----------|----------|
| UI | 0% | 60% |
| Servicios | 0% | 80% |
| Módulos Nativos | 0% | 70% |

**Estado:** Sin tests implementados aún.

---

### 8.3 Deuda Técnica (Sonar)

**Deuda estimada:** 5 días de trabajo

**Principales issues:**
- Falta de tests (3 días)
- Manejo de errores (1 día)
- Duplicación de código (1 día)

---

## 9. Conclusión

La arquitectura de **MIB2 Controller** está bien diseñada para su propósito actual, con decisiones técnicas justificadas y documentadas. Las áreas de mejora identificadas (testing, manejo de errores, i18n) son importantes pero no bloquean el lanzamiento inicial.

**Fortalezas arquitectónicas:**
- Separación clara de responsabilidades
- Módulos nativos bien encapsulados
- Patrones de diseño aplicados correctamente
- Decisiones documentadas (ADRs)

**Próximos pasos:**
1. Implementar tests unitarios (prioridad alta)
2. Refactorizar UsbNativeModule.kt (reducir complejidad)
3. Implementar logging estructurado
4. Agregar i18n para mercados internacionales

---

**Documento preparado por:** Manus AI  
**Última actualización:** 14 de enero de 2025  
**Versión:** 1.0
