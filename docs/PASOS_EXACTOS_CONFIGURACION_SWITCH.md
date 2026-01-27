# Pasos Exactos: Configuración de Conexión MIB2 con Switch

## ⚠️ IMPORTANTE: Leer ANTES de empezar

- **Tiempo estimado:** 30-45 minutos
- **Requisitos:** Switch TP-Link, 2 cables Ethernet, adaptadores USB-Ethernet, Android con app instalada
- **Condiciones:** Vehículo con contacto ON, motor APAGADO
- **Batería:** Asegúrate de tener batería suficiente (>50%) o motor encendido brevemente cada 15 min

---

## FASE 1: Preparación (ANTES de ir al auto)

### 1.1 Verificar el Adaptador Spoofed

**En tu casa/oficina:**

1. ✅ Abrir app **MIB2 Controller**
2. ✅ Ir a **Home** → **USB Spoof**
3. ✅ Conectar el adaptador que usarás en la MIB2
4. ✅ Presionar **Read EEPROM**
5. ✅ Verificar que muestre:
   ```
   Vendor ID: 0x2001
   Product ID: 0x3C05
   ```
6. ✅ Si NO muestra esos valores → Presionar **Write D-Link DUB-E100**
7. ✅ Esperar confirmación "EEPROM written successfully"
8. ✅ Desconectar y reconectar el adaptador
9. ✅ Leer nuevamente para confirmar

**Marcar el adaptador:** Poner una etiqueta o marca para identificarlo como "SPOOFED - MIB2"

### 1.2 Preparar el Kit de Conexión

**Empacar en una bolsa:**
- ✅ Switch TP-Link TL-SF1005D + cable de alimentación
- ✅ Adaptador USB-Ethernet SPOOFED (marcado)
- ✅ Adaptador USB-Ethernet NO spoofed (para Android)
- ✅ 2x cables Ethernet (cualquier largo, directos)
- ✅ Android con app MIB2 Controller instalada
- ✅ Cable USB-C/Micro-USB para cargar Android
- ✅ Esta guía impresa o en otro dispositivo

### 1.3 Verificar Configuración de Android

**Antes de salir:**

1. ✅ Ir a **Ajustes** → **Redes e Internet**
2. ✅ Buscar opción **Ethernet** (puede estar oculta)
3. ✅ Si NO aparece Ethernet:
   - Conectar el adaptador USB-Ethernet al Android
   - Esperar 5 segundos
   - Volver a buscar en Ajustes
4. ✅ Si sigue sin aparecer → Anotar modelo de Android para investigar después

---

## FASE 2: Configuración de la MIB2 (EN EL AUTO)

### 2.1 Preparar el Vehículo

1. ✅ Encender contacto (llave en posición ON o botón START sin pisar freno)
2. ✅ Motor APAGADO
3. ✅ Esperar a que la MIB2 arranque completamente (~30 segundos)
4. ✅ Pantalla debe mostrar menú principal

### 2.2 Verificar/Habilitar Modo Desarrollador

**Si ya lo hiciste antes, saltar al paso 2.3**

**Necesitas:** OBD11, VCDS, o VCP conectado al puerto OBD2

1. ✅ Conectar herramienta de diagnóstico al OBD2
2. ✅ Encender herramienta
3. ✅ Buscar módulo **5F - Multimedia**
4. ✅ Entrar en **Adaptación** o **Adaptation channels**
5. ✅ Buscar canal **Developer mode**
6. ✅ Cambiar valor a **Activated** o **On**
7. ✅ Guardar cambios
8. ✅ Desconectar herramienta OBD

### 2.3 Habilitar Ethernet en MIB2

**Paso crítico - seguir exactamente:**

1. ✅ En la pantalla de la MIB2, mantener presionado el botón **MENU** por **10 segundos**
   - Botón MENU = botón físico en el panel de la MIB2
   - NO soltar hasta que aparezca el menú

2. ✅ Aparecerá **"Testmode Menue"** (menú oculto)

3. ✅ Seleccionar **"Green Engineering Menu"**

4. ✅ Navegar a **"debugging mlp"**

5. ✅ Usar la **perilla de sintonía** (NO la de volumen) para desplazarte

6. ✅ Buscar la opción **"Ethernet"**

7. ✅ Presionar la perilla para **HABILITAR** Ethernet
   - Debe aparecer una marca de verificación o cambiar de color

8. ✅ Presionar **BACK** o salir del menú

### 2.4 REINICIAR la MIB2

**Método 1 (recomendado):**
1. ✅ Mantener presionada la **perilla de volumen** por **10 segundos**
2. ✅ Primero aparecerá el reloj → seguir presionando
3. ✅ Pantalla se apagará → soltar
4. ✅ Esperar a que reinicie automáticamente (~1 minuto)

**Método 2 (alternativo):**
1. ✅ Apagar contacto del vehículo
2. ✅ Esperar 10 segundos
3. ✅ Encender contacto nuevamente
4. ✅ Esperar a que MIB2 arranque

### 2.5 Verificar IP de la MIB2

1. ✅ Mantener **MENU** 10 segundos → **Testmode Menue**
2. ✅ **Green Engineering Menu**
3. ✅ Navegar a: **production** → **mmx_prod** → **ip-setting_prod**
4. ✅ Buscar la línea que dice **"en0:"**
5. ✅ Debe mostrar: **"inet 192.168.1.4"**
6. ✅ **Anotar esta IP** (debería ser siempre la misma)

**Si NO aparece en0 o muestra 0.0.0.0:**
- ❌ Ethernet NO está habilitado correctamente
- ❌ Volver al paso 2.3 y repetir

---

## FASE 3: Configuración del Android

### 3.1 Conectar Adaptador USB-Ethernet

1. ✅ Conectar el adaptador USB-Ethernet **NO spoofed** al Android
2. ✅ Esperar 5-10 segundos
3. ✅ Puede aparecer notificación "Ethernet conectado"

### 3.2 Configurar IP Estática

**Opción A: Android 11+ (más común)**

1. ✅ Ir a **Ajustes** → **Redes e Internet**
2. ✅ Buscar y tocar **Ethernet**
3. ✅ Tocar el ícono de ⚙️ (engranaje) o **Configuración avanzada**
4. ✅ Cambiar de **DHCP** a **Estática** o **Manual**
5. ✅ Configurar:
   ```
   Dirección IP:     192.168.1.10
   Máscara de red:   255.255.255.0
   Puerta de enlace: (dejar vacío o 192.168.1.1)
   DNS 1:            (dejar vacío o 8.8.8.8)
   DNS 2:            (dejar vacío)
   ```
6. ✅ Guardar cambios

**Opción B: Si NO aparece Ethernet en Ajustes**

1. ✅ Abrir app **MIB2 Controller**
2. ✅ Ir a **Tools** → **Guides** → **Android Network Config**
3. ✅ Seguir las instrucciones específicas para tu modelo

### 3.3 Verificar Configuración

1. ✅ Abrir app **MIB2 Controller**
2. ✅ Ir a **Tools** → **Network Scanner**
3. ✅ Verificar que en la parte superior diga:
   ```
   Local IP: 192.168.1.10
   ```
4. ✅ Si dice otra IP o "Not configured" → volver al paso 3.2

---

## FASE 4: Conexión Física con Switch

### 4.1 Ubicar el Switch

**Encontrar un lugar en el auto donde:**
- ✅ Esté cerca de una toma de corriente 12V → USB (para alimentar switch)
- ✅ Tenga espacio plano (consola central, asiento trasero, piso)
- ✅ Los cables lleguen sin tensión

**Conectar alimentación del switch:**
1. ✅ Conectar cable de alimentación al switch
2. ✅ Conectar a inversor 12V→220V o adaptador USB (si el switch es USB)
3. ✅ Verificar que encienda (LED de power)

### 4.2 Conectar MIB2 → Switch

1. ✅ Tomar el adaptador **SPOOFED** (marcado)
2. ✅ Conectar al puerto **USB de la MIB2**
   - Usar el puerto USB que normalmente usas para Android Auto/CarPlay
3. ✅ Esperar 3-5 segundos
4. ✅ Tomar un cable Ethernet
5. ✅ Conectar un extremo al adaptador USB-Ethernet (spoofed)
6. ✅ Conectar el otro extremo a **cualquier puerto del switch** (ej: Puerto 1)
7. ✅ Verificar LED del switch en ese puerto → debe encender **verde/naranja**

### 4.3 Conectar Switch → Android

1. ✅ Tomar el segundo cable Ethernet
2. ✅ Conectar un extremo a **otro puerto del switch** (ej: Puerto 2)
3. ✅ Conectar el otro extremo al adaptador USB-Ethernet del Android
4. ✅ Verificar LED del switch en ese puerto → debe encender **verde/naranja**

### 4.4 Verificar LEDs

**Estado esperado:**

| Dispositivo | LED | Estado |
|-------------|-----|--------|
| Switch - Power | Verde | ✅ Encendido fijo |
| Switch - Puerto 1 (MIB2) | Verde/Naranja | ✅ Encendido, parpadea ocasionalmente |
| Switch - Puerto 2 (Android) | Verde/Naranja | ✅ Encendido, parpadea ocasionalmente |
| Adaptador MIB2 | Verde/Azul | ✅ Encendido, parpadea |
| Adaptador Android | Verde/Azul | ✅ Encendido, parpadea |

**Si algún LED NO enciende:**
- ❌ Verificar que el cable esté bien conectado en ambos extremos
- ❌ Probar con otro puerto del switch
- ❌ Probar con otro cable Ethernet

---

## FASE 5: Verificación de Conectividad

### 5.1 Ping Test (Prueba Básica)

1. ✅ Abrir app **MIB2 Controller**
2. ✅ Ir a **Tools** → **Network Scanner**
3. ✅ En el campo **Target IP**, ingresar: `192.168.1.4`
4. ✅ Presionar **Scan Network**
5. ✅ Esperar 5-10 segundos

**Resultado esperado:**
```
✅ 192.168.1.4
   ICMP Ping: SUCCESS (5ms)
   Port 23 (Telnet): OPEN
   Port 21 (FTP): OPEN
```

**Si muestra TIMEOUT:**
- ❌ Volver a FASE 2.5 y verificar IP de MIB2
- ❌ Volver a FASE 3.3 y verificar IP de Android
- ❌ Verificar LEDs del switch (FASE 4.4)

### 5.2 Telnet Test (Prueba Avanzada)

1. ✅ En la app, ir a **Tools** → **Telnet**
2. ✅ Verificar configuración:
   ```
   Host: 192.168.1.4
   Port: 23
   ```
3. ✅ Presionar **Connect**
4. ✅ Esperar 2-3 segundos

**Resultado esperado:**
```
✅ Connected to 192.168.1.4
   Login:
```

5. ✅ Ingresar usuario: `root`
6. ✅ Presionar Enter
7. ✅ Ingresar contraseña: `root`
8. ✅ Presionar Enter

**Prompt exitoso:**
```
imx6:/#
```

**¡CONEXIÓN EXITOSA!** 🎉

---

## FASE 6: Pruebas Funcionales

### 6.1 Probar Comandos Básicos

En la terminal Telnet, escribir:

```bash
# Ver versión del sistema
uname -a
```

**Resultado esperado:**
```
QNX imx6 6.6.0 ...
```

```bash
# Ver interfaces de red
ifconfig -a
```

**Resultado esperado:**
```
en0: flags=...
     inet 192.168.1.4 netmask 0xffffff00 ...
```

### 6.2 Probar Generación de Códigos FEC

1. ✅ Ir a **Actions** → **FEC Codes**
2. ✅ Presionar **Generate Random Code**
3. ✅ Verificar que genere un código de 16 dígitos
4. ✅ Presionar **Inject via Telnet**
5. ✅ Verificar que diga "Connected to MIB2"
6. ✅ Verificar que inyecte el código exitosamente

---

## FASE 7: Documentar la Configuración

### 7.1 Tomar Fotos

**Para referencia futura:**
- ✅ Foto de la ubicación del switch en el auto
- ✅ Foto de las conexiones (adaptadores + cables)
- ✅ Foto de la pantalla de Network Scanner con resultados exitosos
- ✅ Foto de la terminal Telnet conectada

### 7.2 Anotar Configuración

```
Fecha de configuración: _______________

✅ Switch: TP-Link TL-SF1005D
✅ Adaptador MIB2 (spoofed): _______________
✅ Adaptador Android: _______________
✅ IP MIB2: 192.168.1.4
✅ IP Android: 192.168.1.10
✅ Puerto Switch MIB2: _____
✅ Puerto Switch Android: _____

Notas adicionales:
_________________________________
_________________________________
```

---

## Troubleshooting Rápido

### Problema: Ping funciona pero Telnet falla

**Solución:**
1. Verificar que el puerto 23 esté abierto en Network Scanner
2. Probar contraseña vacía (solo presionar Enter)
3. Reiniciar la MIB2 (paso 2.4)

### Problema: LEDs encienden pero no hay comunicación

**Solución:**
1. Verificar que ambos dispositivos tengan IPs en la misma subred (192.168.1.x)
2. Apagar y encender el switch
3. Desconectar y reconectar los adaptadores USB

### Problema: Android no detecta Ethernet

**Solución:**
1. Ir a **Tools** → **Guides** → **Android Network Config**
2. Seguir instrucciones específicas para tu modelo
3. Puede requerir app de terceros o root

---

## ✅ Checklist Final

Antes de dar por terminado:

- [ ] Ping a 192.168.1.4 exitoso
- [ ] Telnet conectado y prompt `imx6:/#` visible
- [ ] Comando `uname -a` ejecutado correctamente
- [ ] Generación de código FEC funciona
- [ ] Inyección de código FEC vía Telnet funciona
- [ ] Fotos tomadas para referencia
- [ ] Configuración anotada

---

## Próximos Pasos

Una vez confirmada la conexión:

1. **Instalar Toolbox** (si no lo tienes)
2. **Aplicar parche SWaP** (para habilitar funciones ocultas)
3. **Inyectar códigos FEC** (para activar características)
4. **Explorar sistema de archivos** vía FTP

---

**¡Éxito!** 🚀

Si algo falla, anota exactamente en qué paso y qué mensaje de error aparece. Estaré aquí para ayudarte.

---

*Última actualización: Enero 2026*
*Versión: 1.0*
