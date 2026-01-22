# MIB2 Controller - Storyboard del Proceso de Spoofing

## Propósito
Este storyboard visual documenta el proceso completo de spoofing de un adaptador ASIX AX88772 para convertirlo en un D-Link DUB-E100 compatible con MIB2.

---

## Paso 1: Pantalla Inicial - Conexión del Adaptador USB

**Duración**: 0:00 - 0:05

**Acción del usuario**: Conectar adaptador USB ASIX al dispositivo Android mediante cable OTG

**Estado de la app**: Detectando dispositivo USB

**Elementos visuales**:
- Icono de USB con animación de búsqueda
- Texto: "Conecta tu adaptador USB ASIX"
- Ilustración de cable OTG + adaptador

**Narración**: 
"Primero, conecta tu adaptador USB ASIX al dispositivo Android usando un cable OTG. La app detectará automáticamente el adaptador."

**Imagen**: `step1_connect_adapter.png`

---

## Paso 2: Solicitud de Permisos USB

**Duración**: 0:05 - 0:10

**Acción del usuario**: Tocar "Permitir" en el diálogo de permisos de Android

**Estado de la app**: Esperando permiso del usuario

**Elementos visuales**:
- Diálogo nativo de Android "Permitir acceso USB"
- Información del dispositivo: VID 0B95, PID 7720
- Botones: "Cancelar" / "Permitir"

**Narración**: 
"Android solicitará permiso para acceder al adaptador USB. Toca 'Permitir' para continuar."

**Imagen**: `step2_usb_permission.png`

---

## Paso 3: Detección del Chipset

**Duración**: 0:10 - 0:15

**Acción del usuario**: Ninguna (automático)

**Estado de la app**: Identificando chipset ASIX

**Elementos visuales**:
- Badge verde: "ASIX AX88772B"
- Estado: "Compatible ✓"
- VID/PID actual: 0B95:7720
- Botón: "Iniciar Auto-Spoof"

**Narración**: 
"La app identifica automáticamente el chipset. En este caso, un ASIX AX88772B compatible con el proceso de spoofing."

**Imagen**: `step3_chipset_detected.png`

---

## Paso 4: Detección de Tipo de EEPROM

**Duración**: 0:15 - 0:25

**Acción del usuario**: Tocar "Detectar Ahora" en el diálogo de confirmación

**Estado de la app**: Realizando prueba de escritura en EEPROM

**Elementos visuales**:
- Diálogo: "Detectando tipo de EEPROM"
- Spinner de carga
- Texto: "Realizando prueba de escritura no destructiva..."
- Progreso: "Probando offset 0xFE..."

**Narración**: 
"Antes de continuar, la app detecta si el adaptador tiene EEPROM externa modificable o eFuse bloqueado. Esto previene daños al hardware."

**Imagen**: `step4_eeprom_detection.png`

---

## Paso 5: Resultado de Detección - EEPROM Externa

**Duración**: 0:25 - 0:30

**Acción del usuario**: Tocar "Sí, continuar"

**Estado de la app**: EEPROM externa confirmada

**Elementos visuales**:
- Diálogo de éxito con icono ✓
- Título: "EEPROM Externa Detectada"
- Mensaje: "El adaptador es compatible y seguro para spoofing"
- Badge verde: "EXTERNAL_EEPROM"
- Botones: "Cancelar" / "Sí, continuar"

**Narración**: 
"¡Perfecto! Se detectó EEPROM externa. El adaptador es seguro para modificar. Toca 'Sí, continuar' para proceder."

**Imagen**: `step5_eeprom_confirmed.png`

---

## Paso 6: Advertencias de Requisitos

**Duración**: 0:30 - 0:35

**Acción del usuario**: Tocar "Sí, continuar"

**Estado de la app**: Mostrando advertencias previas

**Elementos visuales**:
- Diálogo: "Requisitos Importantes"
- Lista con iconos:
  - ⚡ Cable OTG con alimentación externa
  - 🔌 Adaptador conectado firmemente
  - 📱 No mover el dispositivo durante el proceso
- Botones: "Cancelar" / "Sí, continuar"

**Narración**: 
"Asegúrate de tener un cable OTG con alimentación externa y que el adaptador esté conectado firmemente. No muevas el dispositivo durante el proceso."

**Imagen**: `step6_requirements_warning.png`

---

## Paso 7: Advertencia Crítica

**Duración**: 0:35 - 0:40

**Acción del usuario**: Tocar "Continuar" (botón rojo)

**Estado de la app**: Última advertencia antes de ejecutar

**Elementos visuales**:
- Diálogo con icono ⚠️
- Título: "Advertencia Crítica"
- Mensaje: "Este proceso modificará la EEPROM del adaptador. Si se interrumpe, el adaptador puede quedar inutilizable."
- Checkbox: "Entiendo los riesgos"
- Botones: "Cancelar" / "Continuar" (rojo)

**Narración**: 
"Esta es la última advertencia. El proceso modificará la memoria del adaptador. Si se interrumpe, puede quedar inutilizable. Marca 'Entiendo los riesgos' y toca 'Continuar'."

**Imagen**: `step7_critical_warning.png`

---

## Paso 8: Confirmación Final

**Duración**: 0:40 - 0:45

**Acción del usuario**: Tocar "Sí, ejecutar"

**Estado de la app**: Confirmación final con datos del dispositivo

**Elementos visuales**:
- Diálogo: "Confirmación Final"
- Tabla de cambios:
  - VID actual: 0B95 → 2001
  - PID actual: 7720 → 3C05
- Texto: "¿Deseas continuar con el spoofing?"
- Botones: "No, cancelar" / "Sí, ejecutar" (rojo)

**Narración**: 
"Revisa los cambios que se realizarán: VID de 0B95 a 2001, PID de 7720 a 3C05. Toca 'Sí, ejecutar' para comenzar."

**Imagen**: `step8_final_confirmation.png`

---

## Paso 9: Creando Backup

**Duración**: 0:45 - 0:55

**Acción del usuario**: Ninguna (proceso automático)

**Estado de la app**: Leyendo EEPROM completa para backup

**Elementos visuales**:
- Pantalla de progreso
- Paso actual: "Creando backup de seguridad"
- Barra de progreso: 45%
- Indicador de bytes: "115 / 256 bytes"
- Operación: "READ"
- Animación de lectura

**Narración**: 
"La app crea automáticamente un backup completo de la EEPROM antes de realizar cualquier modificación. Esto permite restaurar el adaptador si algo sale mal."

**Imagen**: `step9_creating_backup.png`

---

## Paso 10: Escribiendo VID (Byte Bajo)

**Duración**: 0:55 - 1:00

**Acción del usuario**: Ninguna (proceso automático)

**Estado de la app**: Escribiendo primer byte del VID

**Elementos visuales**:
- Pantalla de progreso
- Paso actual: "Escribiendo VID (byte bajo)"
- Barra de progreso: 25%
- Offset: 0x88
- Valor: 0x01
- Operación: "WRITE"
- Animación de escritura

**Narración**: 
"Ahora comienza la escritura. Primero se escribe el byte bajo del VID en offset 0x88."

**Imagen**: `step10_writing_vid_low.png`

---

## Paso 11: Escribiendo VID (Byte Alto)

**Duración**: 1:00 - 1:05

**Acción del usuario**: Ninguna (proceso automático)

**Estado de la app**: Escribiendo segundo byte del VID

**Elementos visuales**:
- Pantalla de progreso
- Paso actual: "Escribiendo VID (byte alto)"
- Barra de progreso: 50%
- Offset: 0x89
- Valor: 0x20
- Operación: "WRITE"
- Animación de escritura

**Narración**: 
"Luego se escribe el byte alto del VID en offset 0x89. Ahora el VID completo es 0x2001."

**Imagen**: `step11_writing_vid_high.png`

---

## Paso 12: Escribiendo PID (Byte Bajo)

**Duración**: 1:05 - 1:10

**Acción del usuario**: Ninguna (proceso automático)

**Estado de la app**: Escribiendo primer byte del PID

**Elementos visuales**:
- Pantalla de progreso
- Paso actual: "Escribiendo PID (byte bajo)"
- Barra de progreso: 75%
- Offset: 0x8A
- Valor: 0x05
- Operación: "WRITE"
- Animación de escritura

**Narración**: 
"Continuamos con el PID. Se escribe el byte bajo en offset 0x8A."

**Imagen**: `step12_writing_pid_low.png`

---

## Paso 13: Escribiendo PID (Byte Alto)

**Duración**: 1:10 - 1:15

**Acción del usuario**: Ninguna (proceso automático)

**Estado de la app**: Escribiendo segundo byte del PID

**Elementos visuales**:
- Pantalla de progreso
- Paso actual: "Escribiendo PID (byte alto)"
- Barra de progreso: 100%
- Offset: 0x8B
- Valor: 0x3C
- Operación: "WRITE"
- Animación de escritura

**Narración**: 
"Finalmente se escribe el byte alto del PID en offset 0x8B. El PID completo es ahora 0x3C05."

**Imagen**: `step13_writing_pid_high.png`

---

## Paso 14: Verificando Escritura

**Duración**: 1:15 - 1:25

**Acción del usuario**: Ninguna (proceso automático)

**Estado de la app**: Leyendo EEPROM para verificar cambios

**Elementos visuales**:
- Pantalla de progreso
- Paso actual: "Verificando escritura"
- Spinner de carga
- Texto: "Leyendo VID/PID modificado..."
- Tabla de verificación:
  - VID esperado: 2001 ✓
  - PID esperado: 3C05 ✓

**Narración**: 
"La app verifica automáticamente que los cambios se escribieron correctamente leyendo la EEPROM nuevamente."

**Imagen**: `step14_verifying.png`

---

## Paso 15: Éxito - Spoofing Completado

**Duración**: 1:25 - 1:35

**Acción del usuario**: Tocar "Ver Detalles"

**Estado de la app**: Proceso completado exitosamente

**Elementos visuales**:
- Modal de éxito con icono ✓ grande
- Título: "¡Spoofing Exitoso!"
- Mensaje: "El adaptador ha sido modificado correctamente"
- Tabla de resultados:
  - VID original: 0B95 → Nuevo: 2001
  - PID original: 7720 → Nuevo: 3C05
  - Chipset: ASIX AX88772B
  - Timestamp: 22/01/2026 04:30:15
- Botón: "Ver Detalles"
- Botón: "Cerrar"

**Narración**: 
"¡Éxito! El adaptador ha sido modificado correctamente. Ahora tiene VID 2001 y PID 3C05, identificándose como un D-Link DUB-E100."

**Imagen**: `step15_success.png`

---

## Paso 16: Instrucciones de Reconexión

**Duración**: 1:35 - 1:45

**Acción del usuario**: Desconectar y reconectar el adaptador

**Estado de la app**: Mostrando instrucciones finales

**Elementos visuales**:
- Pantalla de instrucciones
- Título: "Pasos Finales"
- Lista numerada:
  1. 🔌 Desconecta el adaptador USB del dispositivo
  2. ⏱️ Espera 5 segundos
  3. 🔄 Vuelve a conectar el adaptador
  4. ✓ El sistema lo reconocerá como D-Link DUB-E100
- Ilustración de desconexión/reconexión

**Narración**: 
"Para que los cambios surtan efecto, desconecta el adaptador, espera 5 segundos, y vuelve a conectarlo. El sistema lo reconocerá como un D-Link DUB-E100."

**Imagen**: `step16_reconnect_instructions.png`

---

## Paso 17: Verificación Final - Nuevo VID/PID

**Duración**: 1:45 - 1:55

**Acción del usuario**: Ninguna (automático al reconectar)

**Estado de la app**: Detectando adaptador reconectado

**Elementos visuales**:
- Pantalla de estado USB
- Badge verde: "D-Link DUB-E100"
- VID/PID actual: 2001:3C05 ✓
- Estado: "Conectado y listo para MIB2"
- Icono de verificación grande
- Mensaje: "El adaptador ahora es compatible con MIB2 STD2"

**Narración**: 
"¡Perfecto! El adaptador ahora se identifica como D-Link DUB-E100 con VID 2001 y PID 3C05. Está listo para usar con tu unidad MIB2."

**Imagen**: `step17_new_vid_pid_verified.png`

---

## Paso 18: Pantalla Final - Próximos Pasos

**Duración**: 1:55 - 2:00

**Acción del usuario**: Navegar a otras secciones de la app

**Estado de la app**: Proceso completado

**Elementos visuales**:
- Pantalla de inicio con tarjetas:
  - 🔌 "Conectar al MIB2" → Telnet
  - 🔑 "Activar Features" → FEC Codes
  - 🛠️ "Instalar Toolbox" → Guía de instalación
  - 💾 "Crear Backup" → Backups
- Mensaje: "Tu adaptador está listo. Ahora puedes:"

**Narración**: 
"El proceso de spoofing está completo. Ahora puedes conectar el adaptador a tu unidad MIB2, activar features con códigos FEC, o instalar el MIB2 Toolbox."

**Imagen**: `step18_next_steps.png`

---

## Notas Técnicas para Grabación

### Configuración de Grabación
- Resolución: 1080x1920 (vertical)
- FPS: 30
- Codec: H.264
- Audio: Narración en español con música de fondo suave

### Transiciones
- Entre pasos: Fade (0.3s)
- Entre secciones: Slide (0.5s)

### Anotaciones en Pantalla
- Flechas para indicar botones a tocar
- Círculos para resaltar elementos importantes
- Texto explicativo en la parte inferior (subtítulos)

### Música de Fondo
- Volumen: -20dB (bajo para no interferir con narración)
- Estilo: Electrónica suave, tecnológica
- Sin copyright

### Duración Total
- 2:00 minutos (120 segundos)
- Ritmo: Moderado, sin prisas
- Pausas: 1-2 segundos entre pasos críticos
