# MIB2 Controller

Aplicación Android full stack para comunicarse con unidades **MIB2 STD2 Technisat Preh** mediante Telnet sobre Ethernet y ejecutar comandos de diagnóstico y modificación.

![MIB2 Controller Logo](./assets/images/icon.png)

## 📋 Descripción

MIB2 Controller es una herramienta de control remoto diseñada específicamente para unidades de infoentretenimiento MIB2 STD2 Technisat/Preh con firmware T480 (y variantes). La aplicación permite establecer conexiones Telnet a través de Ethernet, ejecutar comandos shell, y gestionar el historial de operaciones.

## ✨ Características

### Conexión Telnet
- Conexión remota a unidades MIB2 vía Telnet (puerto 23)
- Autenticación automática con credenciales root/root
- Gestión de configuración de conexión (IP, puerto, credenciales)
- Indicador visual de estado de conexión en tiempo real

### Comandos Predefinidos
- Biblioteca de comandos seguros categorizados:
  - **Información**: Versión de firmware, información del sistema
  - **Diagnóstico**: CPU, memoria, procesos, interfaces de red
  - **Configuración**: Dispositivos montados, uso de disco
- Ejecución de comandos personalizados con validación de seguridad
- Confirmación para comandos potencialmente peligrosos

### Historial de Logs
- Registro completo de todos los comandos ejecutados
- Visualización de salidas y errores
- Exportación de logs a archivo de texto
- Timestamps y estado de éxito/error

### Configuración
- Ajustes de conexión personalizables
- Gestión de datos (limpieza de historial)
- Información de la aplicación

## 🔧 Requisitos

### Hardware
- Dispositivo Android (teléfono o tablet)
- Unidad MIB2 STD2 Technisat/Preh
- Adaptador USB-Ethernet (ej: D-Link)
- Cable Ethernet
- Adaptador USB-C a Ethernet para Android (opcional, si se conecta directamente)

### Software
- Android 8.0 (API 26) o superior
- Unidad MIB2 con Telnet habilitado (requiere MIB2 Toolbox instalado)
- Red local (WiFi o Ethernet) compartida entre el dispositivo Android y la unidad MIB2

## 📱 Instalación

### Opción 1: Expo Go (Desarrollo)
1. Instala Expo Go desde Google Play Store
2. Escanea el código QR proporcionado por el desarrollador
3. La app se cargará en Expo Go

### Opción 2: APK (Producción)
1. Descarga el archivo APK desde la página de releases
2. Habilita "Instalar aplicaciones de fuentes desconocidas" en Android
3. Instala el APK
4. Abre la aplicación

## 🚀 Uso

### 1. Preparación de la Unidad MIB2

Antes de usar la aplicación, asegúrate de que tu unidad MIB2 tenga Telnet habilitado:

1. Instala [MIB2 STD2 Toolbox](https://github.com/olli991/mib-std2-pq-zr-toolbox)
2. Habilita el acceso Telnet mediante el menú "Network" del Toolbox
3. Verifica las credenciales (por defecto: root/root)

### 2. Conexión Física

**Configuración típica:**

```
[Unidad MIB2] --USB--> [Adaptador USB-Ethernet] --Ethernet--> [Router WiFi]
                                                                    |
                                                                    v
                                                          [Dispositivo Android]
```

**Pasos:**
1. Conecta el adaptador USB-Ethernet al puerto USB de la unidad MIB2
2. Conecta un cable Ethernet del adaptador a tu router WiFi
3. Conecta tu dispositivo Android a la misma red WiFi
4. Verifica la dirección IP de la unidad MIB2 (típicamente 192.168.1.4)

### 3. Conexión en la App

1. Abre MIB2 Controller
2. En la pantalla Home, ingresa:
   - **IP**: 192.168.1.4 (o la IP de tu unidad)
   - **Puerto**: 23
3. Presiona "Conectar a MIB2"
4. Espera la confirmación de conexión exitosa

### 4. Ejecutar Comandos

#### Comandos Predefinidos:
1. Ve a la pestaña "Comandos"
2. Filtra por categoría (Información, Diagnóstico)
3. Toca un comando para ejecutarlo
4. Revisa la salida en la pestaña "Logs"

#### Comandos Personalizados:
1. En la pestaña "Comandos", desplázate hasta "Comando Personalizado"
2. Ingresa el comando shell (ej: `cat /proc/version`)
3. Presiona "Ejecutar Comando"
4. Confirma la ejecución

### 5. Revisar Logs

1. Ve a la pestaña "Logs"
2. Revisa el historial de comandos ejecutados
3. Exporta los logs con el botón "Exportar"
4. Limpia el historial con el botón "Limpiar"

## 🛡️ Seguridad

### Validación de Comandos

La aplicación incluye validación básica para prevenir comandos peligrosos:

- ❌ `rm -rf /` (eliminación recursiva de root)
- ❌ `mkfs` (formateo de sistema de archivos)
- ❌ `dd if=` (operaciones de disco)
- ❌ Escritura a dispositivos de disco

### Recomendaciones

- ⚠️ **Usa bajo tu propia responsabilidad**: Los comandos incorrectos pueden dañar la unidad MIB2
- 📚 **Conoce lo que haces**: Solo ejecuta comandos que entiendas completamente
- 💾 **Haz backups**: Usa el MIB2 Toolbox para crear respaldos antes de modificaciones
- 🔒 **Cambia credenciales**: Considera cambiar las credenciales root por defecto
- 📝 **Revisa logs**: Mantén un registro de todas las operaciones realizadas

## 📚 Comandos Útiles

### Información del Sistema
```bash
# Versión de firmware
cat /net/rcc/mnt/efs-persist/FW/version.txt

# Información del sistema operativo
uname -a

# Información de CPU
cat /proc/cpuinfo
```

### Diagnóstico
```bash
# Uso de memoria
free

# Procesos en ejecución
ps aux

# Interfaces de red
ifconfig

# Dispositivos montados
mount

# Uso de disco
df -h
```

### Archivos del Sistema
```bash
# Listar archivos en directorio
ls -la /path/to/directory

# Ver contenido de archivo
cat /path/to/file

# Buscar archivos
find /path -name "filename"
```

## 🏗️ Arquitectura Técnica

### Frontend (React Native + Expo)
- **Framework**: Expo SDK 54, React Native 0.81
- **Navegación**: Expo Router 6
- **Estilos**: NativeWind 4 (Tailwind CSS)
- **Estado**: React Context API + AsyncStorage
- **Lenguaje**: TypeScript 5.9

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Cliente Telnet**: telnet-client (npm)
- **Base de Datos**: MySQL + Drizzle ORM
- **Validación**: Zod
- **API**: REST + tRPC

### Base de Datos
- **Tablas**:
  - `command_logs`: Historial de comandos ejecutados
  - `predefined_commands`: Biblioteca de comandos seguros
  - `connection_history`: Registro de conexiones
  - `users`: Gestión de usuarios (opcional)

## 🔌 API Endpoints

### Telnet
- `POST /api/telnet/connect` - Establecer conexión
- `POST /api/telnet/disconnect` - Cerrar conexión
- `POST /api/telnet/execute` - Ejecutar comando
- `GET /api/telnet/status` - Estado de conexión

## 🛠️ Desarrollo

### Requisitos
- Node.js 22+
- pnpm 9+
- MySQL 8+
- Expo CLI

### Instalación
```bash
# Clonar repositorio
git clone <repo-url>
cd mib2_controller

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos

# Ejecutar migraciones
pnpm db:push

# Iniciar servidor de desarrollo
pnpm dev
```

### Scripts Disponibles
```bash
pnpm dev          # Iniciar dev server (backend + metro)
pnpm dev:server   # Solo backend
pnpm dev:metro    # Solo Metro bundler
pnpm android      # Abrir en Android
pnpm ios          # Abrir en iOS
pnpm check        # TypeScript check
pnpm lint         # ESLint
pnpm test         # Tests con Vitest
pnpm db:push      # Ejecutar migraciones
```

## 📖 Documentación Adicional

- [MIB2 STD2 Toolbox](https://github.com/olli991/mib-std2-pq-zr-toolbox)
- [MIB Wiki](https://mibwiki.one)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

## 🐛 Problemas Conocidos

### No se puede conectar
- Verifica que la unidad MIB2 tenga Telnet habilitado
- Confirma que ambos dispositivos estén en la misma red
- Prueba hacer ping a la IP de la unidad desde tu Android
- Revisa que el puerto 23 no esté bloqueado por firewall

### Comandos no se ejecutan
- Asegúrate de estar conectado antes de ejecutar comandos
- Verifica que el comando sea válido en QNX
- Revisa los logs para ver mensajes de error específicos

### La app se cierra inesperadamente
- Limpia el caché de la aplicación
- Reinstala la app
- Reporta el problema con los logs

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

## ⚠️ Disclaimer

Esta aplicación se proporciona "tal cual" sin garantías de ningún tipo. El uso de esta herramienta es bajo tu propia responsabilidad. Los desarrolladores no se hacen responsables por daños a las unidades MIB2, pérdida de datos, o cualquier otro problema derivado del uso de esta aplicación.

**IMPORTANTE**: Modificar el firmware o la configuración de tu unidad MIB2 puede anular la garantía del vehículo y causar mal funcionamiento del sistema de infoentretenimiento.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Soporte

Para reportar problemas o solicitar funcionalidades, abre un issue en GitHub.

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2026  
**Compatible con**: MIB2 STD2 Technisat/Preh (Firmware T480 y variantes)
