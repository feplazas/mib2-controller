# Hallazgos de Investigación - MIB2 USB Controller

## Resumen Ejecutivo

La unidad **MIB2 STD2 Technisat Preh con firmware T480** es un sistema de infoentretenimiento utilizado en vehículos Volkswagen Group. La comunicación con esta unidad requiere acceso al sistema de archivos interno y ejecución de comandos a través de interfaces específicas.

## Protocolo de Comunicación MIB2

### Características de la Unidad
- **Fabricante**: Technisat/Preh
- **Firmware**: Serie MST2_XX_XX_XX_X0XXXT (T480 corresponde a P0480T)
- **Sistema Operativo**: QNX Neutrino 6.5
- **Arquitectura**: Basada en eMMC con sistema de archivos Linux-like
- **Interfaz de Diagnóstico**: Green Engineering Menu (GEM)

### Métodos de Acceso Conocidos

#### 1. Acceso por SD Card (Método Oficial)
- Requiere dos ranuras SD (unidades con navegación)
- Utiliza archivos `metainfo2.txt` con firma digital
- Instalación mediante "Service Mode" → "Software Update"
- **Limitación**: No funciona en todas las variantes de hardware

#### 2. Acceso por Consola Serial/Telnet
- Credenciales por defecto: `root/root`
- Requiere habilitación previa mediante Toolbox
- Permite ejecución de scripts shell (ksh)
- Acceso completo al sistema de archivos

#### 3. Acceso por USB (Método Requerido)
- **USB2HSD Cable**: Convierte puerto USB en acceso directo a eMMC
- **USB SD Card Reader**: Conexión directa al chip eMMC mediante soldadura
- **Puntos de montaje**: `/media/mp000` (SD1), `/media/mp001` (SD2), `/media/mp002` (USB1)

### Comandos y Estructura del Sistema

El MIB2 Toolbox proporciona las siguientes capacidades:
- **Adaptación**: Modificación de parámetros del sistema (BAP, CAN, menús)
- **Customización**: Reemplazo de archivos HMI, skins, sonidos
- **Remap de Botones**: Reasignación de funciones de hardware
- **Network**: Activación de telnet y servicios de red
- **Dump**: Extracción de archivos del sistema
- **Restore**: Restauración de backups

### Protocolo de Diagnóstico
- **Basado en**: UDS (Unified Diagnostic Services) sobre ISO-TP
- **Formato de Comandos**: Hexadecimal
- **Comunicación**: Serie sobre USB o CAN bus
- **Permisos**: Requiere adaptación en bloque 5F para habilitar GEM

## Implementación en React Native/Expo

### Desafío Principal
**Expo no soporta nativamente comunicación USB Host en Android**. Las librerías disponibles requieren módulos nativos que no son compatibles con el entorno gestionado de Expo.

### Librerías Investigadas

#### 1. `react-native-usb-serialport-for-android`
- **Estado**: Activa, última actualización 2023
- **Compatibilidad**: Solo React Native CLI (NO Expo)
- **Funcionalidades**:
  - Listado de dispositivos USB
  - Solicitud de permisos USB
  - Apertura de puerto serial con configuración (baudRate, parity, dataBits, stopBits)
  - Envío/recepción de datos en formato hexadecimal
- **Limitación**: Requiere `react-native link` y configuración nativa

#### 2. `@fugood/react-native-usb-serialport`
- **Estado**: Activa, última actualización 2024
- **Compatibilidad**: Solo React Native CLI
- **Ventaja**: Alto rendimiento con gateway JAVA nativo
- **Limitación**: No compatible con Expo

#### 3. `expo-serialport`
- **Estado**: Experimental
- **Compatibilidad**: Expo con custom dev client
- **Limitación**: Documentación limitada, soporte incompleto

### Solución Propuesta

Dado que **Expo no puede acceder directamente al USB Host**, se proponen dos enfoques:

#### Opción A: Módulo Nativo Personalizado (Recomendado)
1. Crear un módulo Expo personalizado usando Expo Modules API
2. Implementar wrapper nativo en Java/Kotlin para Android USB Host API
3. Exponer funciones JavaScript para:
   - Detectar dispositivos USB
   - Solicitar permisos
   - Abrir conexión serial
   - Enviar/recibir comandos hexadecimales

**Ventajas**:
- Control total sobre la implementación
- Compatible con Expo Development Build
- Puede publicarse como paquete reutilizable

**Desventajas**:
- Requiere conocimientos de desarrollo nativo Android
- Mayor complejidad de implementación

#### Opción B: Backend Intermediario (Alternativa)
1. Crear un servicio backend que corra en un dispositivo con acceso USB (PC/Raspberry Pi)
2. El servicio actúa como proxy entre la app móvil y la unidad MIB2
3. La app se comunica con el backend vía WiFi/Bluetooth
4. El backend maneja la comunicación USB directa

**Ventajas**:
- No requiere módulos nativos en la app
- Funciona con Expo gestionado
- Permite control remoto de la unidad

**Desventajas**:
- Requiere hardware adicional
- Mayor latencia en la comunicación
- Dependencia de red local

## Permisos Requeridos en Android

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.USB_PERMISSION" />
<uses-feature android:name="android.hardware.usb.host" />
```

## Configuración de Puerto Serial Típica

```javascript
{
  baudRate: 9600,      // Velocidad de comunicación
  parity: Parity.None, // Sin paridad
  dataBits: 8,         // 8 bits de datos
  stopBits: 1          // 1 bit de parada
}
```

## Comandos de Ejemplo para MIB2

Basado en el análisis del toolbox, los comandos típicos incluyen:

### Lectura de Información
```bash
# Obtener información del sistema
cat /proc/version
cat /proc/cpuinfo

# Listar dispositivos montados
mount

# Verificar versión de firmware
cat /net/rcc/mnt/efs-persist/FW/version.txt
```

### Modificación de Adaptaciones
```bash
# Modificar archivos de adaptación
cp /custom/car_bap_device_list.xml /net/rcc/mnt/efs-persist/FW/
sync
reboot
```

## Estructura de Datos para Comandos

### Comando Predefinido
```typescript
interface MIB2Command {
  id: string;
  name: string;
  category: 'diagnostic' | 'configuration' | 'modification';
  description: string;
  hexCommand: string;
  requiresConfirmation: boolean;
  expectedResponse?: string;
}
```

### Ejemplo
```typescript
{
  id: 'read_firmware',
  name: 'Leer Versión de Firmware',
  category: 'diagnostic',
  description: 'Obtiene la versión actual del firmware instalado',
  hexCommand: '22F187',
  requiresConfirmation: false,
  expectedResponse: '62F187...'
}
```

## Recomendaciones de Implementación

### Fase 1: Prototipo con Backend Proxy
- Implementar servidor Node.js con `serialport` npm package
- Crear API REST para enviar/recibir comandos
- Desarrollar app móvil que se conecte al servidor local
- **Ventaja**: Desarrollo rápido, sin módulos nativos

### Fase 2: Migración a Módulo Nativo (Opcional)
- Si se requiere conexión directa USB desde el móvil
- Crear Expo Module con Android USB Host API
- Migrar lógica del backend al módulo nativo

## Consideraciones de Seguridad

1. **Validación de Comandos**: Implementar whitelist de comandos permitidos
2. **Confirmación de Usuario**: Requerir confirmación para comandos de modificación
3. **Logs Completos**: Registrar todos los comandos enviados y respuestas recibidas
4. **Modo Experto**: Ocultar comandos peligrosos detrás de configuración avanzada
5. **Backups Automáticos**: Crear respaldo antes de modificaciones críticas

## Limitaciones Conocidas

1. **Expo Managed Workflow**: No soporta USB Host directamente
2. **Variantes de Hardware**: Algunos números de parte no son compatibles con instalación por SD
3. **Permisos USB**: Android requiere solicitud explícita de permisos en tiempo de ejecución
4. **Firma Digital**: Los archivos metainfo2.txt no pueden ser modificados
5. **Firmware Específico**: Los comandos pueden variar entre versiones de firmware

## Próximos Pasos

1. Decidir entre implementación con backend proxy o módulo nativo
2. Configurar entorno de pruebas con dispositivo Android
3. Implementar detección y conexión USB básica
4. Crear base de datos de comandos predefinidos para firmware T480
5. Desarrollar interfaz de usuario según design.md
6. Implementar sistema de logs y exportación
7. Realizar pruebas exhaustivas con unidad MIB2 real

## Referencias

- [MIB STD2 Toolbox GitHub](https://github.com/olli991/mib-std2-pq-zr-toolbox)
- [React Native USB Serial Tutorial](https://medium.com/@xeeno/how-to-connect-to-usb-serial-ports-in-react-native-8513e709521)
- [Android USB Host API](https://developer.android.com/guide/topics/connectivity/usb/host)
- [MIB Wiki](https://mibwiki.one)
