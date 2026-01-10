# MIB2 Controller

Aplicación Android full stack para comunicarse con unidades **MIB2 STD2 Technisat Preh** (firmware T480) mediante **Telnet sobre Ethernet** y realizar modificaciones avanzadas al comportamiento del sistema.

![MIB2 Controller Logo](./assets/images/icon.png)

## 📋 Descripción

MIB2 Controller es una herramienta profesional de control remoto diseñada específicamente para unidades de infoentretenimiento MIB2 STD2 Technisat/Preh. La aplicación implementa las funcionalidades descritas en el documento técnico **MIB2Acceso.pdf**, incluyendo procedimientos VCDS, generación de códigos FEC, asistente de instalación del Toolbox, y un completo sistema de validación y advertencias de seguridad.

## ✨ Características Principales

### 🔧 Procedimientos VCDS
- **Biblioteca completa** de procedimientos VCDS con traducciones alemán-español
- **6 procedimientos predefinidos** para modificaciones MQB (SEAT León Cupra 290 5F):
  - Control XDS+ (Bloqueo Diferencial Electrónico)
  - Optimización del Diferencial VAQ (Tracción Aumentada)
  - Asistente de Freno Temprano
  - Activación del Monitor Offroad
  - Personalización del Cuadro Digital (Carbono/Cupra)
  - Developer Mode
- **Tabla de referencia rápida** con todos los canales y valores
- **Glosario técnico** alemán-español integrado
- **Sistema de advertencias críticas** (especialmente XDS+ "Strong")

### 🔑 Generador de Códigos FEC
- **Códigos predefinidos** para funciones comunes:
  - Apple CarPlay (00060800)
  - Android Auto (00060900)
  - Performance Monitor (00060400)
- **Generación de ExceptionList.txt** para inyección de códigos
- **Comandos de inyección** vía MIB2 Toolbox
- **Validación de formato** de códigos FEC
- **Soporte para códigos personalizados**

### 🛠️ Asistente de Instalación del Toolbox
- **Guía paso a paso** para instalación vía Telnet (11 pasos detallados)
- **Script de instalación automatizado** generado dinámicamente
- **Comandos de diagnóstico** del sistema QNX
- **Verificación de instalación** exitosa
- **Documentación del método alternativo** (acceso directo eMMC)

### 🌐 Comunicación Telnet
- **Cliente Telnet** integrado para comunicación con MIB2
- **Detección automática de IP** mediante escaneo de red local (rápido y completo)
- **Gestión de perfiles** para múltiples unidades MIB2
- **Detección automática de MIB2 Toolbox** instalado
- **Indicador visual de estado** de conexión en tiempo real

### 📊 Sistema de Logs y Macros
- **Historial completo** de comandos ejecutados con timestamps
- **9 macros predefinidas** para operaciones comunes:
  - Backup completo del sistema
  - Activación de todas las adaptaciones
  - Diagnóstico completo
  - Mantenimiento del sistema
  - Y más...
- **Ejecución secuencial** con delays configurables
- **Indicador de progreso** durante ejecución de macros
- **Exportación de logs** en formato texto

### 🔒 Modo Experto con PIN
- **Protección por PIN** de 4 dígitos con almacenamiento seguro
- **Filtrado de comandos** según nivel de riesgo
- **Confirmación doble** para operaciones críticas
- **Desbloqueo de procedimientos avanzados**

### ✅ Validador de Configuraciones
- **Verificación de compatibilidad** de hardware (790, 790A, 790B, 790B+)
- **Validación de firmware** (T480, T490, T500)
- **Sistema de alertas** por nivel de riesgo (seguro, moderado, alto, crítico)
- **Recomendaciones técnicas** específicas por procedimiento
- **Generación de reportes** de validación

### 👤 Gestión de Perfiles
- **Múltiples perfiles** para diferentes unidades MIB2
- **Colores personalizables** para identificación visual
- **Cambio rápido** entre perfiles
- **Almacenamiento local** de configuraciones

## 🔧 Requisitos

### Hardware
- Dispositivo Android (teléfono o tablet)
- Unidad MIB2 STD2 Technisat/Preh con firmware T480 o superior
- Adaptador USB-Ethernet D-Link DUB-E100 (chipset ASIX AX88772)
- Cable Ethernet
- Adaptador USB-C a Ethernet para Android (opcional)

### Software
- Android 8.0 (API 26) o superior
- Unidad MIB2 con Telnet habilitado
- Red local (WiFi o Ethernet) compartida

## 📱 Instalación

### Opción 1: Expo Go (Desarrollo)
1. Instala Expo Go desde Google Play Store
2. Escanea el código QR proporcionado
3. La app se cargará en Expo Go

### Opción 2: APK (Producción)
1. Descarga el archivo APK desde releases
2. Habilita "Instalar aplicaciones de fuentes desconocidas"
3. Instala el APK
4. Abre la aplicación

## 🚀 Uso

### 1. Configuración de Red

**Conexión física:**
```
[Unidad MIB2] --USB--> [D-Link DUB-E100] --Ethernet--> [Router WiFi]
                                                            |
                                                            v
                                                  [Dispositivo Android]
```

**Configuración de IP:**
- Unidad MIB2: 192.168.1.4 (típica)
- Dispositivo: 192.168.1.10 (configurar IP estática)
- Máscara: 255.255.255.0
- Gateway: 192.168.1.1

### 2. Conexión en la App
1. Abre MIB2 Controller
2. En **Home**, ingresa IP: 192.168.1.4
3. O usa **"Buscar MIB2"** para detección automática
4. Presiona **"Conectar a MIB2"**
5. Credenciales por defecto: root/root

### 3. Procedimientos VCDS
1. Ve a la pestaña **VCDS**
2. Selecciona el procedimiento deseado
3. Lee las advertencias y recomendaciones
4. Presiona **"Ver Comando VCDS"**
5. Ejecuta el comando en VCDS/OBDeleven

### 4. Generación de Códigos FEC
1. Ve a la pestaña **FEC**
2. Selecciona códigos predefinidos o agrega personalizados
3. Presiona **"Generar ExceptionList.txt"**
4. Comparte el archivo generado
5. Sigue las instrucciones de inyección vía Toolbox

### 5. Instalación del Toolbox
1. Ve a la pestaña **Toolbox**
2. Sigue los 11 pasos de la guía
3. O presiona **"Generar Script de Instalación"**
4. Ejecuta el script desde Telnet

### 6. Ejecución de Comandos
1. Ve a la pestaña **Comandos**
2. Selecciona un comando de la lista
3. Confirma la ejecución
4. Ver resultado en tiempo real

### 7. Macros Automatizadas
1. Ve a la pestaña **Macros**
2. Selecciona una macro predefinida
3. Presiona **"Ejecutar Macro"**
4. Monitorea el progreso

### 8. Gestión de Perfiles
1. Ve a la pestaña **Perfiles**
2. Crea un nuevo perfil con:
   - Nombre descriptivo
   - IP de la unidad
   - Puerto (23 por defecto)
   - Credenciales
   - Color personalizado
3. Cambia entre perfiles con un toque

## 🛡️ Advertencias de Seguridad

### ⚠️ CRÍTICO: XDS+ en Modo "Strong"
**NO configurar el XDS+ en modo "Strong" (Stark)**. Este ajuste genera:
- Desgaste parasitario de frenos
- Temperaturas del disco superiores a 600°C-700°C
- Riesgo de vapor lock (líquido de frenos en ebullición)
- Destrucción de pastillas en una sola sesión de pista
- Bucle de control conflictivo con VAQ

**Configuración recomendada**: "Standard" (Estándar)

### ⚠️ Método de Parcheo FEC
La inyección de códigos FEC sortea la validación de firmware digital de VW AG:
- Modifica el binario del sistema (tsd.mibstd2.system.swap)
- Solo funciona en unidades 1-SD sin rutinas de validación
- Realizar backup completo antes de proceder

### ⚠️ Acceso Directo eMMC
El acceso directo al chip eMMC es un método avanzado:
- Requiere microsoldadura
- Puede "brickear" la unidad permanentemente
- Anula la garantía
- Solo para usuarios con experiencia en electrónica

## 📚 Glosario Técnico (Alemán-Español)

| Alemán | Español |
|--------|---------|
| Steuergerät | Unidad de Control (ECU/Module) |
| Bremselektronik | Electrónica de Frenos (ABS/ESC) |
| Quersperre | Bloqueo Transversal (Diferencial VAQ) |
| Informationselektronik | Electrónica de Información (Multimedia) |
| Schalttafeleinsatz | Inserto del Panel de Instrumentos (Cuadro) |
| Anpassung | Adaptación (Función 10) |
| Zugriffsberechtigung | Autorización de Acceso / Login de Seguridad (Función 16) |
| Codierung | Codificación (Función 07 - Long Coding) |
| Erweiterte elektronische Differenzialsperre | Bloqueo diferencial electrónico extendido (XDS+) |
| Akustikmaßnahme, Verspannungslogik | Medidas acústicas, lógica de tensión (VAQ) |
| Bremsassistent | Asistente de Freno |
| Displaydarstellung | Representación de pantalla |
| Entwicklermodus | Modo Desarrollador |

## 🏗️ Arquitectura Técnica

### Frontend (React Native + Expo)
- **Framework**: Expo SDK 54, React Native 0.81
- **Navegación**: Expo Router 6 con 8 pestañas
- **Estilos**: NativeWind 4 (Tailwind CSS)
- **Estado**: React Context API + AsyncStorage
- **Lenguaje**: TypeScript 5.9

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Cliente Telnet**: telnet-client
- **Base de Datos**: MySQL + Drizzle ORM
- **Validación**: Zod
- **API**: REST + tRPC

### Base de Datos
- **Tablas**:
  - `command_logs`: Historial de comandos
  - `predefined_commands`: Biblioteca de comandos
  - `connection_history`: Registro de conexiones
  - `users`: Gestión de usuarios

## 🛠️ Desarrollo

### Instalación
```bash
# Clonar repositorio
git clone <repo-url>
cd mib2_controller

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones
pnpm db:push

# Iniciar servidor de desarrollo
pnpm dev
```

### Scripts Disponibles
```bash
pnpm dev          # Iniciar dev server (backend + metro)
pnpm android      # Abrir en Android
pnpm check        # TypeScript check
pnpm lint         # ESLint
pnpm test         # Tests
pnpm db:push      # Migraciones
```

## 📖 Referencias

- **Documento técnico**: MIB2Acceso.pdf
- **Repositorio MIB2 Toolbox**: https://github.com/olli991/mib-std2-pq-zr-toolbox
- **Plataforma**: MQB (SEAT León Cupra 290 5F)
- **Firmware**: T480 (Technisat Preh)

## 📄 Licencia

Este proyecto es de código abierto y se proporciona "tal cual" sin garantías de ningún tipo. El uso de esta aplicación es bajo tu propio riesgo. No nos hacemos responsables de daños a la unidad MIB2, pérdida de garantía, o cualquier otro problema derivado del uso de esta herramienta.

## 📧 Soporte

Para reportar problemas o solicitar características, visita: https://help.manus.im

---

**Desarrollado por**: Manus AI  
**Versión**: 2.0.0  
**Fecha**: Enero 2026  
**Compatible con**: MIB2 STD2 Technisat/Preh (Firmware T480 y variantes)
