# Diseño de Interfaz - MIB2 USB Controller

## Orientación y Uso
- **Orientación**: Retrato móvil (9:16)
- **Uso**: Una mano, optimizado para Android
- **Estilo**: Siguiendo Apple Human Interface Guidelines adaptado a Android Material Design

## Lista de Pantallas

### 1. **Home (Pantalla Principal)**
- **Contenido**: 
  - Estado de conexión USB (conectado/desconectado)
  - Información de la unidad MIB2 detectada (modelo, firmware)
  - Botón principal "Conectar a MIB2"
  - Lista de acciones rápidas
- **Funcionalidad**:
  - Detectar dispositivo USB conectado
  - Mostrar estado en tiempo real
  - Acceso rápido a funciones comunes

### 2.### Conexión de Red
- **Contenido**:
  - Indicador visual de estado de conexión Telnet
  - Campo de entrada para IP de la unidad MIB2 (por defecto: 192.168.1.4)
  - Campo de entrada para puerto (por defecto: 23)
  - Botón "Conectar"
  - Log de eventos de conexión
- **Funcionalidad**:
  - Establecer conexión Telnet con la unidad
  - Autenticación automática (root/root)
  - Mostrar errores de conexión
  - Guardar configuración de IPn

### 3. **Comandos**
- **Contenido**:
  - Lista de comandos predefinidos (categorías: Diagnóstico, Configuración, Modificación)
  - Campo de entrada para comandos personalizados (hexadecimal)
  - Botón "Enviar Comando"
  - Historial de comandos enviados
- **Funcionalidad**:
  - Enviar comandos a la unidad MIB2
  - Guardar comandos favoritos
  - Validar formato de comandos

### 4. **Respuestas y Logs**
- **Contenido**:
  - Área de texto con respuestas de la unidad (formato hex y decodificado)
  - Timestamp de cada respuesta
  - Botón "Limpiar Log"
  - Botón "Exportar Log"
- **Funcionalidad**:
  - Mostrar respuestas en tiempo real
  - Guardar logs en base de datos
  - Exportar logs como archivo

### 5. **Configuración**
- **Contenido**:
  - Ajustes de comunicación (baudrate, timeout)
  - Modo de visualización (hex, ASCII, decodificado)
  - Gestión de comandos guardados
  - Información de la app (versión, créditos)
- **Funcionalidad**:
  - Personalizar parámetros de comunicación
  - Gestionar preferencias del usuario

## Flujos de Usuario Principales

### Flujo 1: Conectar a Unidad MIB2
1. Usuario abre la app → Pantalla Home
2. Conecta adaptador USB-Ethernet al puerto USB de la unidad MIB2
3. Conecta teléfono Android a la red (WiFi o adaptador Ethernet USB-C)
4. Usuario toca "Conectar a MIB2" → App intenta conexión Telnet a 192.168.1.4:23
5. Autenticación automática con root/root
6. Pantalla Home muestra estado "Conectado" con versión de firmware

### Flujo 2: Enviar Comando de Diagnóstico
1. Usuario toca "Comandos" en tab bar → Pantalla Comandos
2. Selecciona comando predefinido "Leer Información de Firmware"
3. Toca "Enviar Comando" → Comando se envía a la unidad
4. App navega a "Respuestas y Logs" → Muestra respuesta decodificada

### Flujo 3: Modificar Configuración de la Unidad
1. Usuario en Pantalla Comandos → Selecciona categoría "Modificación"
2. Elige "Habilitar Función X" → Aparece confirmación
3. Confirma acción → Comando se envía
4. Respuesta muestra éxito/fallo → Log se guarda automáticamente

## Paleta de Colores

### Colores Principales
- **Primary (Acento)**: `#0066CC` (Azul tecnológico, representa conectividad)
- **Background (Claro)**: `#FFFFFF`
- **Background (Oscuro)**: `#121212`
- **Surface (Claro)**: `#F5F5F5`
- **Surface (Oscuro)**: `#1E1E1E`

### Colores de Estado
- **Success (Conectado)**: `#10B981` (Verde)
- **Warning (Esperando)**: `#F59E0B` (Ámbar)
- **Error (Desconectado/Error)**: `#EF4444` (Rojo)
- **Info (Procesando)**: `#3B82F6` (Azul claro)

### Colores de Texto
- **Foreground (Claro)**: `#1F2937`
- **Foreground (Oscuro)**: `#F9FAFB`
- **Muted (Claro)**: `#6B7280`
- **Muted (Oscuro)**: `#9CA3AF`

## Componentes Clave

### Indicador de Conexión USB
- Icono animado (cable USB con señal)
- Cambio de color según estado (gris/verde/rojo)
- Texto descriptivo debajo

### Tarjeta de Comando
- Título del comando
- Descripción breve
- Badge con categoría
- Botón de acción

### Log Entry
- Timestamp
- Tipo (enviado/recibido)
- Contenido (colapsable para comandos largos)
- Indicador de éxito/error

## Navegación

### Tab Bar (Inferior)
1. **Home** - Icono: casa
2. **Comandos** - Icono: terminal/código
3. **Logs** - Icono: documento con líneas
4. **Configuración** - Icono: engranaje

## Consideraciones Técnicas

### Comunicación Telnet/Ethernet
- Usar cliente Telnet JavaScript puro (sin módulos nativos)
- Conexión vía adaptador USB-Ethernet D-Link en puerto USB de MIB2
- Comunicación TCP/IP sobre red local (IP típica: 192.168.1.4, puerto 23)
- Autenticación: root/root

### Almacenamiento Local
- AsyncStorage para configuraciones
- SQLite (vía backend) para logs históricos
- Caché de comandos favoritos

### Backend (Opcional)
- API para sincronizar comandos personalizados entre dispositivos
- Almacenamiento de logs en la nube
- Base de datos de comandos conocidos para diferentes versiones de firmware

## Notas de Implementación

1. **No implementar autenticación de usuario** a menos que se requiera explícitamente
2. **Priorizar funcionalidad local** - la app debe funcionar sin conexión a internet
3. **Validación de comandos** - prevenir envío de comandos que puedan dañar la unidad
4. **Modo experto** - ocultar comandos avanzados detrás de una opción en configuración
