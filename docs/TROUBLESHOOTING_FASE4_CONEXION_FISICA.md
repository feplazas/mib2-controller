# Troubleshooting Detallado: FASE 4 - Conexión Física

## Índice de Problemas

1. [Switch no enciende (LED Power apagado)](#problema-1-switch-no-enciende)
2. [LED del puerto del switch no enciende (MIB2)](#problema-2-led-puerto-mib2-no-enciende)
3. [LED del puerto del switch no enciende (Android)](#problema-3-led-puerto-android-no-enciende)
4. [LEDs encienden pero no parpadean](#problema-4-leds-encienden-pero-no-parpadean)
5. [Adaptador USB no reconocido por MIB2](#problema-5-adaptador-no-reconocido-por-mib2)
6. [Adaptador USB no reconocido por Android](#problema-6-adaptador-no-reconocido-por-android)
7. [LEDs parpadean pero no hay conectividad](#problema-7-leds-parpadean-sin-conectividad)
8. [Conexión intermitente](#problema-8-conexion-intermitente)

---

## Problema 1: Switch no enciende (LED Power apagado)

### Síntomas
- Switch completamente apagado
- Ningún LED encendido
- No hay señales de vida

### Diagnóstico

#### Verificación 1: Alimentación del switch

**Paso 1.1:** Verificar cable de alimentación
```
✓ Cable conectado firmemente al switch
✓ Cable conectado a la fuente de poder
✓ Fuente conectada a toma 12V del auto
```

**Paso 1.2:** Verificar voltaje de entrada
- El TP-Link TL-SF1005D requiere: **5V DC / 0.6A**
- Verificar que tu fuente proporcione exactamente eso
- Muchos switches incluyen adaptador 220V → 5V DC

**Paso 1.3:** Verificar toma del vehículo
```bash
# Probar con otro dispositivo (ej: cargador de celular)
# Si el celular carga → la toma funciona
# Si no carga → problema con la toma del auto
```

### Soluciones

#### Solución 1.A: Usar inversor 12V → 220V
```
Auto (12V) → Inversor → Adaptador del switch (220V → 5V) → Switch
```

**Ventajas:**
- ✅ Usa el adaptador original del switch
- ✅ Voltaje garantizado correcto

**Desventajas:**
- ❌ Requiere comprar inversor (~$15-20 USD)
- ❌ Más cables

#### Solución 1.B: Usar adaptador 12V → 5V USB
```
Auto (12V) → Adaptador USB → Cable USB → Switch (si tiene entrada USB)
```

**Verificar:**
- ⚠️ El TL-SF1005D NO tiene entrada USB
- ⚠️ Solo funciona con modelos que tengan puerto USB-C de alimentación

#### Solución 1.C: Usar powerbank
```
Powerbank (5V USB) → Cable USB → Switch (con adaptador USB)
```

**Ventajas:**
- ✅ Portátil
- ✅ No depende del auto

**Desventajas:**
- ❌ Batería limitada
- ❌ Requiere recarga

### Verificación Final
```
✓ LED Power del switch encendido (verde/azul)
✓ Switch emite sonido leve (ventilador interno si lo tiene)
```

---

## Problema 2: LED puerto MIB2 no enciende

### Síntomas
- Switch encendido (LED Power ON)
- Puerto donde conectaste el cable de la MIB2 → LED apagado
- Otros puertos pueden o no funcionar

### Diagnóstico

#### Verificación 2.1: Cable Ethernet

**Paso 2.1.1:** Inspección visual del cable
```
✓ Conector RJ45 sin daños
✓ Clip de plástico no roto
✓ Pines dorados visibles y rectos
✓ Cable sin cortes o dobleces extremos
```

**Paso 2.1.2:** Probar cable en otro puerto
```
1. Desconectar cable del Puerto 1
2. Conectar al Puerto 2 o 3
3. ¿LED enciende ahora?
   → SÍ: Puerto 1 defectuoso, usar otro puerto
   → NO: Problema con el cable o adaptador
```

**Paso 2.1.3:** Probar con otro cable
```
1. Usar el segundo cable Ethernet (el del Android)
2. Conectar MIB2 → Switch con ese cable
3. ¿LED enciende?
   → SÍ: Cable original defectuoso
   → NO: Problema con adaptador o switch
```

#### Verificación 2.2: Adaptador USB-Ethernet (MIB2)

**Paso 2.2.1:** Verificar conexión USB
```
1. Desconectar adaptador del USB de la MIB2
2. Esperar 5 segundos
3. Reconectar firmemente
4. Esperar 10 segundos
5. ¿LED del adaptador enciende?
   → SÍ: Adaptador recibe poder
   → NO: Puerto USB de MIB2 sin corriente
```

**Paso 2.2.2:** Verificar LED del adaptador
```
Adaptador ASIX típico:
- LED verde/azul = Conectado y con link
- LED apagado = Sin link o sin poder
- LED parpadeante = Transmitiendo datos
```

**Paso 2.2.3:** Verificar spoof del adaptador
```
1. Desconectar adaptador de la MIB2
2. Conectar al Android
3. Abrir app MIB2 Controller → USB Spoof
4. Leer EEPROM
5. Verificar VID: 0x2001, PID: 0x3C05
6. Si es diferente → Re-hacer spoof
```

#### Verificación 2.3: Puerto USB de la MIB2

**Paso 2.3.1:** Probar con otro dispositivo
```
1. Desconectar adaptador Ethernet
2. Conectar USB con música o pendrive
3. ¿MIB2 lo reconoce?
   → SÍ: Puerto USB funciona
   → NO: Puerto USB dañado o sin corriente
```

**Paso 2.3.2:** Verificar que Ethernet esté habilitado
```
1. Green Engineering Menu → debugging mlp
2. Verificar que "Ethernet" tenga marca de verificación
3. Si no → Habilitar y reiniciar MIB2
```

### Soluciones

#### Solución 2.A: Usar otro puerto del switch
```
Puerto 1 no funciona → Usar Puerto 2, 3, 4 o 5
Todos los puertos son idénticos en funcionalidad
```

#### Solución 2.B: Reemplazar cable Ethernet
```
Comprar cable Cat5e o Cat6 nuevo
Longitud recomendada: 0.5m - 2m
Evitar cables muy largos (>5m) en el auto
```

#### Solución 2.C: Re-spoof del adaptador
```
1. Conectar adaptador al Android
2. App MIB2 Controller → USB Spoof
3. Write D-Link DUB-E100
4. Desconectar y reconectar
5. Verificar con Read EEPROM
```

#### Solución 2.D: Reiniciar MIB2
```
Mantener perilla de volumen 10 segundos
Esperar reinicio completo (~1 minuto)
Reconectar adaptador
```

### Verificación Final
```
✓ LED del puerto del switch encendido (verde/naranja)
✓ LED del adaptador USB-Ethernet encendido
✓ MIB2 muestra en0: 192.168.1.4 en Green Menu
```

---

## Problema 3: LED puerto Android no enciende

### Síntomas
- Switch encendido
- Puerto MIB2 funciona (LED encendido)
- Puerto Android → LED apagado

### Diagnóstico

#### Verificación 3.1: Cable Ethernet

**Repetir pasos de Verificación 2.1** (idéntico al problema anterior)

#### Verificación 3.2: Adaptador USB-Ethernet (Android)

**Paso 3.2.1:** Verificar conexión USB al Android
```
1. Desconectar adaptador del Android
2. Esperar 5 segundos
3. Reconectar firmemente
4. ¿Android muestra notificación "Ethernet conectado"?
   → SÍ: Android reconoce el adaptador
   → NO: Adaptador no reconocido
```

**Paso 3.2.2:** Verificar LED del adaptador
```
LED verde/azul = Conectado
LED apagado = Sin link o sin poder
LED parpadeante = Transmitiendo datos
```

**Paso 3.2.3:** Verificar compatibilidad del adaptador
```
Chipsets compatibles con Android:
✓ ASIX AX88179 (USB 3.0)
✓ ASIX AX88178A (USB 2.0)
✓ Realtek RTL8156 (USB 3.0)
✓ Realtek RTL8152 (USB 2.0)

Chipsets NO compatibles:
✗ Realtek RTL8111 (PCI-E, no USB)
✗ Intel I219-V (integrado, no USB)
```

#### Verificación 3.3: Puerto USB del Android

**Paso 3.3.1:** Probar con otro dispositivo USB
```
1. Desconectar adaptador Ethernet
2. Conectar pendrive o teclado USB
3. ¿Android lo reconoce?
   → SÍ: Puerto USB funciona
   → NO: Puerto USB dañado o sin OTG
```

**Paso 3.3.2:** Verificar soporte USB OTG
```
Algunos Android NO soportan USB OTG
Verificar en especificaciones del fabricante
Probar con app "USB OTG Checker" de Play Store
```

### Soluciones

#### Solución 3.A: Usar otro puerto del switch
```
Idéntico a Solución 2.A
```

#### Solución 3.B: Reemplazar cable Ethernet
```
Idéntico a Solución 2.B
```

#### Solución 3.C: Usar adaptador compatible
```
Comprar adaptador con chipset ASIX AX88179
Verificar en descripción del producto
Precio típico: $15-25 USD
```

#### Solución 3.D: Habilitar USB OTG en Android
```
Algunos Android requieren:
1. Ajustes → Opciones de desarrollador
2. Habilitar "Depuración USB"
3. Habilitar "USB OTG"
4. Reiniciar Android
```

#### Solución 3.E: Usar hub USB con alimentación
```
Android → Hub USB (con corriente externa) → Adaptador Ethernet
Útil si el Android no proporciona suficiente corriente
```

### Verificación Final
```
✓ LED del puerto del switch encendido
✓ LED del adaptador USB-Ethernet encendido
✓ Android muestra notificación "Ethernet conectado"
✓ App MIB2 Controller muestra "Local IP: 192.168.1.10"
```

---

## Problema 4: LEDs encienden pero no parpadean

### Síntomas
- Todos los LEDs encendidos (switch + adaptadores)
- LEDs fijos, NO parpadean
- No hay actividad de red

### Diagnóstico

#### Verificación 4.1: Velocidad de negociación

**Paso 4.1.1:** Verificar color del LED del switch
```
LED verde = 100 Mbps
LED naranja/amarillo = 10 Mbps
LED apagado = Sin link

Ambos puertos deben mostrar el mismo color
```

**Paso 4.1.2:** Verificar Auto-MDIX del switch
```
TP-Link TL-SF1005D tiene Auto-MDIX en todos los puertos
No debería haber problema con cables directos
```

#### Verificación 4.2: Configuración de IPs

**Paso 4.2.1:** Verificar IP de la MIB2
```
Green Menu → production → mmx_prod → ip-setting_prod
Debe mostrar: en0: inet 192.168.1.4
```

**Paso 4.2.2:** Verificar IP del Android
```
App MIB2 Controller → Tools → Network Scanner
Debe mostrar: Local IP: 192.168.1.10
```

**Paso 4.2.3:** Verificar que estén en la misma subred
```
MIB2:    192.168.1.4   / 255.255.255.0
Android: 192.168.1.10  / 255.255.255.0

Subred: 192.168.1.x ✓ (ambos en la misma)
```

#### Verificación 4.3: Interferencia eléctrica

**Paso 4.3.1:** Verificar fuente de alimentación
```
Switch alimentado por:
✓ Adaptador original del fabricante
✓ Inversor de calidad
✗ Cargador genérico de celular (puede causar ruido)
✗ Puerto USB del auto (corriente insuficiente)
```

**Paso 4.3.2:** Verificar proximidad a fuentes de ruido
```
Alejar el switch de:
✗ Inversor de corriente (genera ruido EMI)
✗ Cargador de celular de mala calidad
✗ Cables de alta corriente (batería, alternador)
```

### Soluciones

#### Solución 4.A: Forzar reinicio de negociación
```
1. Desconectar ambos cables Ethernet del switch
2. Esperar 10 segundos
3. Reconectar cable de la MIB2
4. Esperar 5 segundos (debe negociar)
5. Reconectar cable del Android
6. Esperar 5 segundos (debe negociar)
7. LEDs deben parpadear ahora
```

#### Solución 4.B: Reiniciar todos los dispositivos
```
1. Apagar contacto del auto (apaga MIB2)
2. Desconectar adaptador del Android
3. Desconectar alimentación del switch
4. Esperar 30 segundos
5. Conectar switch
6. Encender contacto (enciende MIB2)
7. Conectar adaptador al Android
8. Esperar 20 segundos
```

#### Solución 4.C: Verificar configuración de red
```
1. Reconfigurar IP estática en Android
2. Verificar máscara de subred: 255.255.255.0
3. Gateway: dejar vacío o 192.168.1.1
4. Guardar y reconectar
```

#### Solución 4.D: Usar cables más cortos
```
Cables muy largos (>5m) pueden causar problemas
Usar cables de 0.5m - 2m
Cat5e o Cat6 de buena calidad
```

### Verificación Final
```
✓ LEDs del switch parpadean ocasionalmente
✓ LEDs de adaptadores parpadean ocasionalmente
✓ Ping a 192.168.1.4 exitoso
```

---

## Problema 5: Adaptador no reconocido por MIB2

### Síntomas
- Adaptador conectado al USB de la MIB2
- LED del adaptador apagado o sin parpadeo
- Green Menu no muestra en0

### Diagnóstico

#### Verificación 5.1: Spoof del adaptador

**Paso 5.1.1:** Verificar VID/PID
```
1. Desconectar adaptador de la MIB2
2. Conectar al Android
3. App MIB2 Controller → USB Spoof → Read EEPROM
4. Verificar:
   Vendor ID: 0x2001
   Product ID: 0x3C05
```

**Paso 5.1.2:** Verificar firmware de la MIB2
```
Firmware T480 soporta:
✓ D-Link DUB-E100 (0x2001:0x3C05) ← MEJOR OPCIÓN
✓ D-Link DUB-E100 Rev.B (0x2001:0x1A02)
✓ ASIX AX88178 (0x0B95:0x1780) - solo firmware reciente
✓ ASIX AX88179 (0x0B95:0x1790) - solo firmware reciente
```

#### Verificación 5.2: Ethernet habilitado en MIB2

**Paso 5.2.1:** Verificar en Green Menu
```
1. Mantener MENU 10 segundos
2. Green Engineering Menu → debugging mlp
3. Buscar "Ethernet"
4. Debe tener marca de verificación ✓
```

**Paso 5.2.2:** Verificar después de reinicio
```
Ethernet se deshabilita si:
- Batería del auto se desconecta
- Fusible de la MIB2 se quema
- Actualización de firmware

Solución: Re-habilitar y reiniciar
```

#### Verificación 5.3: Puerto USB de la MIB2

**Paso 5.3.1:** Probar con dispositivo conocido
```
1. Conectar pendrive con música
2. ¿MIB2 lo reconoce y reproduce?
   → SÍ: Puerto USB funciona
   → NO: Puerto USB dañado
```

### Soluciones

#### Solución 5.A: Re-hacer spoof correctamente
```
1. Conectar adaptador al Android
2. App MIB2 Controller → USB Spoof
3. Presionar "Write D-Link DUB-E100"
4. Esperar "EEPROM written successfully"
5. Desconectar y reconectar adaptador
6. Presionar "Read EEPROM"
7. Verificar VID: 0x2001, PID: 0x3C05
8. Conectar a la MIB2
```

#### Solución 5.B: Habilitar Ethernet en MIB2
```
1. Green Engineering Menu → debugging mlp
2. Seleccionar "Ethernet" con perilla
3. Presionar perilla para habilitar (✓)
4. Salir del menú
5. Reiniciar MIB2 (mantener perilla volumen 10 seg)
6. Esperar arranque completo
7. Conectar adaptador
```

#### Solución 5.C: Usar adaptador diferente
```
Si el adaptador actual no funciona:
1. Conseguir ASIX AX88179 nuevo
2. Hacer spoof a D-Link DUB-E100
3. Probar en la MIB2
```

### Verificación Final
```
✓ LED del adaptador enciende al conectar a MIB2
✓ Green Menu muestra en0: inet 192.168.1.4
✓ LED del switch enciende en el puerto correspondiente
```

---

## Problema 6: Adaptador no reconocido por Android

### Síntomas
- Adaptador conectado al Android
- No aparece notificación "Ethernet conectado"
- Ajustes → Ethernet no aparece

### Diagnóstico

#### Verificación 6.1: Compatibilidad del adaptador

**Paso 6.1.1:** Verificar chipset
```
Chipsets compatibles con Android:
✓ ASIX AX88179
✓ ASIX AX88178A
✓ Realtek RTL8156
✓ Realtek RTL8152

Verificar en especificaciones del adaptador
```

**Paso 6.1.2:** Verificar versión de Android
```
Android 6.0+ → Soporte nativo de Ethernet
Android 5.x o menor → Puede requerir root
```

#### Verificación 6.2: USB OTG

**Paso 6.2.1:** Verificar soporte OTG
```
1. Descargar app "USB OTG Checker" de Play Store
2. Ejecutar app
3. ¿Dice "OTG Supported"?
   → SÍ: OTG habilitado
   → NO: Dispositivo no soporta OTG
```

**Paso 6.2.2:** Verificar cable USB-C
```
Algunos cables USB-C NO soportan OTG
Usar cable USB-C original del fabricante
O cable certificado USB-IF
```

#### Verificación 6.3: Configuración de Android

**Paso 6.3.1:** Verificar opciones de desarrollador
```
1. Ajustes → Acerca del teléfono
2. Tocar "Número de compilación" 7 veces
3. Volver → Opciones de desarrollador
4. Habilitar "Depuración USB"
5. Habilitar "USB OTG" (si existe la opción)
```

### Soluciones

#### Solución 6.A: Usar adaptador compatible
```
Comprar adaptador con chipset ASIX AX88179
Verificar en Amazon/MercadoLibre:
"USB 3.0 to Ethernet ASIX AX88179"
Precio: $15-25 USD
```

#### Solución 6.B: Habilitar Ethernet manualmente
```
Método 1 (sin root):
1. App MIB2 Controller → Tools → Guides
2. Android Network Config
3. Seguir instrucciones específicas

Método 2 (con root):
1. Instalar app "Ethernet Settings" de Play Store
2. Habilitar Ethernet
3. Configurar IP estática
```

#### Solución 6.C: Usar hub USB con alimentación
```
Android → Hub USB (alimentado) → Adaptador Ethernet
Útil si Android no proporciona suficiente corriente
```

#### Solución 6.D: Actualizar Android
```
Algunos Android viejos no soportan Ethernet
Actualizar a Android 9+ si es posible
O usar custom ROM con soporte Ethernet
```

### Verificación Final
```
✓ Android muestra notificación "Ethernet conectado"
✓ Ajustes → Ethernet aparece y está habilitado
✓ App MIB2 Controller muestra "Local IP: 192.168.1.10"
```

---

## Problema 7: LEDs parpadean sin conectividad

### Síntomas
- Todos los LEDs encendidos y parpadeando
- Configuración de IPs correcta
- Ping falla (timeout)

### Diagnóstico

#### Verificación 7.1: Capa de red (Layer 3)

**Paso 7.1.1:** Verificar IPs en la misma subred
```
MIB2:    192.168.1.4   / 255.255.255.0
Android: 192.168.1.10  / 255.255.255.0

Cálculo de subred:
192.168.1.4   AND 255.255.255.0 = 192.168.1.0
192.168.1.10  AND 255.255.255.0 = 192.168.1.0

✓ Ambos en subred 192.168.1.0/24
```

**Paso 7.1.2:** Verificar máscara de subred
```
Máscara correcta: 255.255.255.0
Máscara incorrecta: 255.255.0.0 (demasiado amplia)
Máscara incorrecta: 255.255.255.255 (demasiado estrecha)
```

**Paso 7.1.3:** Verificar gateway
```
Gateway debe estar:
- Vacío (sin configurar)
- O en la misma subred (192.168.1.1)

Gateway incorrecto: 192.168.0.1 (subred diferente)
```

#### Verificación 7.2: Firewall o seguridad

**Paso 7.2.1:** Verificar firewall en Android
```
Algunas ROMs personalizadas tienen firewall
Verificar en:
- Ajustes → Seguridad → Firewall
- Apps de seguridad (Avast, Kaspersky, etc.)

Solución: Deshabilitar temporalmente
```

**Paso 7.2.2:** Verificar VPN activa
```
VPN puede interferir con Ethernet
Verificar en:
- Ajustes → Redes → VPN

Solución: Desconectar VPN
```

#### Verificación 7.3: Prioridad de interfaz

**Paso 7.3.1:** Verificar WiFi deshabilitado
```
WiFi activo puede tener prioridad sobre Ethernet
Solución:
1. Ajustes → WiFi → Desactivar
2. Verificar que solo Ethernet esté activo
```

**Paso 7.3.2:** Verificar datos móviles
```
Datos móviles pueden interferir
Solución:
1. Ajustes → Redes móviles → Desactivar datos
2. O activar "Modo avión" + habilitar solo Ethernet
```

### Soluciones

#### Solución 7.A: Reconfigurar red completa
```
1. Android: Borrar configuración Ethernet
2. Android: Reconfigurar IP estática
   - IP: 192.168.1.10
   - Máscara: 255.255.255.0
   - Gateway: (vacío)
   - DNS: (vacío)
3. Guardar
4. Desconectar y reconectar adaptador
5. Esperar 10 segundos
6. Probar ping
```

#### Solución 7.B: Deshabilitar otras interfaces
```
1. Desactivar WiFi
2. Desactivar datos móviles
3. Desactivar Bluetooth
4. Solo dejar Ethernet activo
5. Probar ping
```

#### Solución 7.C: Usar IP diferente
```
Si 192.168.1.10 no funciona:
Probar: 192.168.1.20
O:      192.168.1.100

Mantener máscara: 255.255.255.0
```

#### Solución 7.D: Reiniciar stack de red
```
Método 1 (sin root):
1. Activar modo avión
2. Esperar 10 segundos
3. Desactivar modo avión
4. Reconectar Ethernet

Método 2 (con root):
1. Terminal: su
2. Terminal: ip link set eth0 down
3. Terminal: ip link set eth0 up
```

### Verificación Final
```
✓ Ping a 192.168.1.4 exitoso
✓ Latencia < 10ms
✓ 0% packet loss
```

---

## Problema 8: Conexión intermitente

### Síntomas
- Conexión funciona a veces
- Ping exitoso, luego falla
- LEDs parpadean erráticamente

### Diagnóstico

#### Verificación 8.1: Conexiones físicas

**Paso 8.1.1:** Verificar cables flojos
```
1. Desconectar todos los cables Ethernet
2. Inspeccionar conectores RJ45
3. Reconectar firmemente (debe hacer "click")
4. Mover cable suavemente
5. ¿Conexión se pierde al mover?
   → SÍ: Cable o conector dañado
   → NO: Problema en otro lado
```

**Paso 8.1.2:** Verificar adaptadores USB flojos
```
1. Verificar adaptador en USB de MIB2
2. Verificar adaptador en USB de Android
3. Mover adaptador suavemente
4. ¿LED se apaga al mover?
   → SÍ: Puerto USB flojo o adaptador dañado
   → NO: Problema en otro lado
```

#### Verificación 8.2: Alimentación inestable

**Paso 8.2.1:** Verificar voltaje del auto
```
Batería baja puede causar:
- Switch se reinicia
- Adaptadores pierden poder
- MIB2 se reinicia

Solución: Encender motor brevemente
```

**Paso 8.2.2:** Verificar alimentación del switch
```
1. Observar LED Power del switch
2. ¿Se apaga o parpadea?
   → SÍ: Alimentación inestable
   → NO: Switch recibe poder constante
```

#### Verificación 8.3: Interferencia

**Paso 8.3.1:** Verificar proximidad a fuentes EMI
```
Fuentes de interferencia:
✗ Inversor de corriente (genera ruido)
✗ Cargador de celular genérico
✗ Radio FM/AM transmitiendo
✗ Cables de alta corriente

Solución: Alejar switch y cables
```

**Paso 8.3.2:** Verificar calidad de cables
```
Cables de mala calidad:
✗ Sin blindaje
✗ Muy largos (>5m)
✗ Dañados o viejos

Solución: Usar cables Cat5e/Cat6 blindados
```

### Soluciones

#### Solución 8.A: Asegurar conexiones físicas
```
1. Usar cinta adhesiva o velcro para fijar cables
2. Evitar que cables se muevan con vibración del auto
3. Asegurar adaptadores USB con cinta
4. Colocar switch en superficie estable
```

#### Solución 8.B: Estabilizar alimentación
```
1. Usar inversor de calidad (no genérico)
2. Conectar a toma de 12V directa (no encendedor)
3. Verificar fusible de la toma
4. Mantener batería cargada (>12V)
```

#### Solución 8.C: Reducir interferencia
```
1. Alejar switch de inversor (>50cm)
2. Usar cables blindados (STP, no UTP)
3. Apagar radio/Bluetooth durante pruebas
4. Separar cables de datos de cables de poder
```

#### Solución 8.D: Usar cables más cortos y de calidad
```
1. Reemplazar cables por Cat6 blindados
2. Longitud máxima: 2m
3. Verificar certificación del cable
4. Evitar cables "planos" o ultra-delgados
```

### Verificación Final
```
✓ Conexión estable por >5 minutos
✓ Ping constante sin packet loss
✓ LEDs parpadean regularmente
✓ No se pierde conexión al mover cables suavemente
```

---

## Checklist de Verificación Completa

Antes de pedir ayuda, verificar:

### Hardware
- [ ] Switch enciende (LED Power ON)
- [ ] Ambos puertos del switch con LED encendido
- [ ] Ambos adaptadores USB con LED encendido
- [ ] Cables Ethernet bien conectados (click audible)
- [ ] Adaptadores USB bien conectados

### Configuración MIB2
- [ ] Developer Mode habilitado
- [ ] Ethernet habilitado en Green Menu
- [ ] MIB2 reiniciada después de habilitar Ethernet
- [ ] Green Menu muestra en0: 192.168.1.4

### Configuración Android
- [ ] Adaptador USB-Ethernet compatible (ASIX/Realtek)
- [ ] Ethernet aparece en Ajustes
- [ ] IP estática configurada: 192.168.1.10
- [ ] Máscara: 255.255.255.0
- [ ] WiFi y datos móviles desactivados

### Spoof
- [ ] Adaptador MIB2 spoofed a 0x2001:0x3C05
- [ ] Verificado con Read EEPROM
- [ ] Adaptador Android NO spoofed (VID/PID original)

### Conectividad
- [ ] Ping a 192.168.1.4 exitoso
- [ ] Latencia < 10ms
- [ ] 0% packet loss
- [ ] Puerto 23 (Telnet) abierto

---

## Contacto para Soporte

Si después de seguir todos estos pasos el problema persiste:

**Información a proporcionar:**

1. **Fase y paso específico donde falla**
   - Ejemplo: "FASE 4, Paso 4.2, LED puerto MIB2 no enciende"

2. **Estado de LEDs**
   ```
   Switch Power: [Encendido/Apagado]
   Switch Puerto MIB2: [Encendido/Apagado/Parpadeando]
   Switch Puerto Android: [Encendido/Apagado/Parpadeando]
   Adaptador MIB2: [Encendido/Apagado/Parpadeando]
   Adaptador Android: [Encendido/Apagado/Parpadeando]
   ```

3. **Resultado de Network Scanner**
   ```
   Local IP: [IP mostrada]
   Target IP: 192.168.1.4
   ICMP Ping: [SUCCESS/TIMEOUT]
   Port 23: [OPEN/CLOSED/TIMEOUT]
   ```

4. **Fotos**
   - Conexión completa (switch + cables + adaptadores)
   - Pantalla de Green Menu (IP de MIB2)
   - Pantalla de Network Scanner (resultado)
   - LEDs del switch (close-up)

5. **Modelo de dispositivos**
   ```
   Switch: [Modelo exacto]
   Adaptador MIB2: [Marca y modelo]
   Adaptador Android: [Marca y modelo]
   Android: [Marca, modelo y versión de Android]
   MIB2: [Firmware version]
   ```

---

*Última actualización: Enero 2026*
*Versión: 1.0*
