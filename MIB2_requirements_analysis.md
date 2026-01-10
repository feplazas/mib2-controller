# Análisis de Requisitos - Documento MIB2Acceso.pdf

## Resumen del Documento

El documento es un informe técnico integral sobre optimización de sistemas MQB (Modularer Querbaukasten) del Grupo Volkswagen, específicamente para SEAT León Cupra 290 5F con unidad MIB2 Standard Technisat.

## Funcionalidades Clave que la App Debe Implementar

### 1. Acceso al Sistema MIB2
- **Conexión vía Adaptador D-Link DUB-E100** (USB-Ethernet)
- **Protocolo Telnet** (puerto 23, IP típica 192.168.1.4)
- **Credenciales**: root/root
- **Sistema Operativo**: QNX Neutrino (Unix-like en tiempo real)

### 2. Instalación y Gestión del MIB2 Toolbox
La app debe facilitar:
- Instalación del MIB2 STD2 Toolbox vía Telnet
- Parcheo del sistema (`tsd.mibstd2.system.swap`)
- Gestión de la Lista de Excepciones (ExceptionList.txt) para códigos FEC

### 3. Modificaciones VCDS Específicas

#### 3.1. Control XDS+ (Bloqueo Diferencial Electrónico)
**Módulo**: 03-Bremselektronik  
**Login**: 20103 / 40168  
**Canal**: Erweiterte elektronische Differenzialsperre  
**Valores**:
- `Standard` (Recomendado)
- `Mittel` (Medio)
- `Schwach` (Débil)
- `Stark` (Fuerte - **NO recomendado** por desgaste de frenos)

**Advertencia Técnica**: El documento advierte que configurar XDS+ en "Strong" genera desgaste parasitario y estrés térmico sin beneficios tangibles.

#### 3.2. Optimización del Diferencial VAQ (Tracción)
**Módulo**: 32-Quersperre  
**Login**: 20103  
**Canal**: Akustikmaßnahme, Verspannungslogik  
**Valor**: `Erhöhte Traktion` (Tracción Aumentada)  
**Efecto**: Bloqueo más agresivo de los discos del embrague, mejor rendimiento

#### 3.3. Asistente de Freno Temprano
**Módulo**: 03-Bremselektronik  
**Login**: 20103 / 40168  
**Canal**: Bremsassistent  
**Valor**: `Früh` (Temprano) - Opcional

#### 3.4. Activación del Monitor Offroad (Sin Navegación)
**Módulo**: 5F-Informationselektronik  
**Login**: 20103 (o S12345)  
**Adaptaciones**:
- `Car_Function_Adaptations_Gen2 -> menu_display_compass`: `Auf aktiv`
- `Car_Function_Adaptations_Gen2 -> menu_display_compass_over_threshold_high`: `Auf aktiv`
- `Car_Function_List_BAP_Gen2 -> compass_0x15`: `Auf aktiv`
- `Car_Function_List_BAP_Gen2 -> compass_0x15_msg_bus`: `Databus Infotainment` (o Komfort)

**Reinicio**: Mantener botón Power 10s

#### 3.5. Personalización del Cuadro Digital (Carbono/Cupra)
**Módulo**: 17-Schalttafeleinsatz  
**Login**: 20103 o 25327  
**Canal**: Displaydarstellung (o Tubevaerriante)  
**Valores**:
- `Variante 1`: Estándar (Leon FR)
- `Variante 2`: Estilo carbono / Puntos dorados (asociado a Cupra)
- `Variante 3`: Estilo Cupra específico (depende de versión SW)

#### 3.6. Developer Mode (Modo Desarrollador)
**Módulo**: 5F-Info. Elek.  
**Login**: S12345 / 20103  
**Canal**: Entwicklermodus  
**Valor**: `Auf aktiv`

### 4. Generación de Códigos FEC (Feature Enable Codes)

La app debe permitir:
- Generar códigos FEC basados en VIN y VCRN
- Códigos específicos:
  - `00060800`: Apple CarPlay
  - `00060900`: Android Auto
  - `00060400`: Performance Monitor
- Inyección de códigos mediante ExceptionList.txt

### 5. Gestión de Advertencias y Recomendaciones

La app debe mostrar:
- **Advertencia crítica sobre XDS+ "Strong"**: Desgaste de frenos, incompatibilidad termodinámica
- **Recomendación VAQ**: Mantener "Tracción Aumentada" para maximizar uso del diferencial mecánico
- **Limitaciones de hardware**: Vista Sport central solo disponible en unidades 790 B+ (MY2019+)
- **Precisión terminológica**: Usar términos alemanes correctos de VCDS para evitar errores

### 6. Tabla de Referencia Rápida (Apéndice)

La app debe incluir una tabla de referencia con:
- Función Objetivo
- Módulo (Steuergerät)
- Código Login
- Canal de Adaptación (Alemán)
- Acción / Valor

## Funcionalidades Adicionales Requeridas

### 7. Asistente de Instalación del Toolbox
- Guía paso a paso para instalación vía Telnet o soldadura
- Verificación de instalación exitosa
- Detección automática de versión instalada

### 8. Validador de Configuraciones
- Verificar compatibilidad de modificaciones con hardware específico
- Alertas de riesgo (ej: XDS+ Strong)
- Validación de códigos FEC antes de inyección

### 9. Generador de Códigos FEC
- Interfaz para ingresar VIN y VCRN
- Generación automática de códigos
- Exportación de ExceptionList.txt

### 10. Biblioteca de Procedimientos VCDS
- Procedimientos completos con módulo, login, canal y valores
- Traducciones técnicas alemán-español
- Categorización por tipo (Seguridad, Rendimiento, Estética, Funcionalidad)

## Prioridades de Implementación

1. **Alta Prioridad**:
   - Modificaciones VCDS (XDS+, VAQ, Monitor Offroad, Skin Carbono)
   - Generador de códigos FEC
   - Advertencias de seguridad (XDS+ Strong)

2. **Media Prioridad**:
   - Asistente de instalación Toolbox
   - Validador de configuraciones
   - Tabla de referencia rápida

3. **Baja Prioridad**:
   - Developer Mode
   - Asistente de Freno Temprano
   - Personalizaciones estéticas avanzadas

## Notas Técnicas Importantes

- El documento enfatiza el uso de **adaptador D-Link DUB-E100** específicamente
- La conexión es **Ethernet sobre USB**, no USB serial directo
- El sistema QNX requiere privilegios root para modificaciones
- La validación de firmware oficial VW AG está comprometida en unidades 1-SD
- El método "inyecta" el instalador del Toolbox sorteando validaciones SWDL
