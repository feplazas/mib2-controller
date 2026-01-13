# Google Play Store Listing - MIB2 Controller

Este documento contiene todo el contenido necesario para crear el listing de MIB2 Controller en Google Play Console.

---

## 📱 Información Básica

### Título de la App
**MIB2 Controller - VW Diagnostic Tool**

*(Máximo 50 caracteres - Actual: 37)*

### Descripción Corta
**Professional diagnostic and configuration tool for Volkswagen Group MIB2 systems**

*(Máximo 80 caracteres - Actual: 79)*

---

## 📝 Descripción Completa

**MIB2 Controller** is a professional diagnostic and configuration tool designed for Volkswagen Group MIB2 (Modular Infotainment Platform 2) infotainment systems found in VW, Audi, SEAT, and Škoda vehicles.

### 🔧 **Key Features**

**Network Connectivity**
• Automatic detection of USB-Ethernet adapters
• Real-time network scanner to find MIB2 units
• Direct Telnet connection to MIB2 system
• Subnet auto-detection for seamless connectivity

**MIB2 Toolbox Management**
• Detect installed Toolbox version
• Install Toolbox with guided step-by-step process
• Verify system compatibility before installation
• Automatic firmware version detection

**Diagnostic Tools**
• Real-time system diagnostics
• Service status monitoring (Telnet, FTP, SSH)
• Firmware compatibility checker
• Hardware version detection

**FEC Code Generator**
• Generate Feature Enabling Codes for your vehicle
• Support for multiple VW Group brands
• Region-specific code generation
• Direct integration with vwcoding.ru API

**Safety Features**
• Automatic backup system for critical files
• MD5 checksum verification
• Triple confirmation for dangerous operations
• Recovery documentation included

**USB Adapter Support**
• ASIX AX88772 chipset detection
• Real-time adapter status monitoring
• Automatic IP configuration detection
• Connectivity validation before operations

### ⚠️ **Important Warnings**

**FOR ADVANCED USERS ONLY**
This app allows low-level modifications to your vehicle's infotainment system. Improper use can result in permanent damage ("bricking") to the MIB2 unit, which may cost thousands of dollars to repair.

**Requirements:**
• Android device with USB OTG support
• USB-Ethernet adapter (ASIX AX88772 recommended)
• MIB2 infotainment unit with Telnet access
• Technical knowledge of Linux systems and networking
• Understanding of vehicle electronics

**Risks:**
• Void vehicle warranty
• Permanent damage to MIB2 unit
• Loss of infotainment functionality
• Potential violation of manufacturer terms

### 🎯 **Who Should Use This App?**

MIB2 Controller is designed for:
• Automotive technicians
• VW Group enthusiasts with technical expertise
• Professional coders and tuners
• Users comfortable with command-line interfaces
• Anyone willing to accept the risks of system modification

### 📚 **Documentation**

Full documentation, safety guidelines, and recovery procedures are included in the app. We strongly recommend reading all warnings before performing any operations.

### 🔒 **Privacy & Security**

• NO data collection or tracking
• NO personal information transmitted
• All operations are local (device ↔ MIB2)
• Optional API calls are transparent and user-initiated
• Open-source project for full transparency

### 🌐 **Supported Vehicles**

Compatible with Volkswagen Group vehicles equipped with MIB2 systems:
• Volkswagen (Golf, Passat, Tiguan, etc.)
• Audi (A3, A4, Q3, Q5, etc.)
• SEAT (Leon, Ateca, etc.)
• Škoda (Octavia, Superb, etc.)

**Note:** Not all MIB2 units have Telnet access enabled. Some firmware versions require physical access to the eMMC chip.

### 📞 **Support**

For questions, bug reports, or feature requests, visit our GitHub repository or contact us via email.

**USE AT YOUR OWN RISK**

---

## 🏷️ Categoría y Tags

### Categoría Principal
**Tools (Herramientas)**

### Categoría Secundaria
**Auto & Vehicles**

### Tags / Keywords
- MIB2
- Volkswagen
- VW
- Audi
- SEAT
- Skoda
- Diagnostic
- OBD
- Telnet
- FEC
- Coding
- Infotainment
- Car diagnostic
- Vehicle configuration
- USB Ethernet

---

## 🖼️ Assets Visuales

### Ícono de Alta Resolución
**Archivo:** `play-store-assets/icon-512.png`  
**Tamaño:** 512x512 px  
**Formato:** PNG con transparencia

### Feature Graphic
**Archivo:** `play-store-assets/feature-graphic.png`  
**Tamaño:** 1024x500 px  
**Formato:** PNG

### Screenshots (Pendientes)
**Requerido:** Mínimo 2, máximo 8  
**Tamaño:** Variable según dispositivo  
**Formato:** PNG o JPG

**Screenshots sugeridos:**
1. Pantalla Home con conexión establecida
2. Scanner de red mostrando dispositivos encontrados
3. Pantalla Toolbox con instalación paso a paso
4. Generador de códigos FEC
5. Pantalla USB Status con adaptador conectado
6. Diagnósticos en tiempo real
7. Gestión de backups
8. Pantalla de advertencias de seguridad

---

## 📋 Clasificación de Contenido

### Cuestionario de Clasificación

**¿La app contiene violencia?** NO  
**¿La app contiene contenido sexual?** NO  
**¿La app contiene lenguaje inapropiado?** NO  
**¿La app contiene drogas, alcohol o tabaco?** NO  
**¿La app contiene contenido para adultos?** NO  
**¿La app contiene apuestas?** NO  
**¿La app permite interacción entre usuarios?** NO

### Público Objetivo
**Mayores de 18 años** (requiere conocimientos técnicos avanzados)

### Clasificación Esperada
**PEGI 3** o **Everyone** (contenido técnico, sin elementos inapropiados)

---

## 🌍 Distribución

### Países Disponibles
**Todos los países** (excepto restricciones legales específicas)

**Nota:** Considerar restricciones en países donde la modificación de sistemas electrónicos de vehículos esté prohibida.

### Idiomas Soportados
- **Español** (idioma principal)
- **Inglés** (traducción recomendada para alcance global)

---

## 💰 Modelo de Negocio

### Precio
**GRATIS**

### Compras In-App
**NO**

### Anuncios
**NO**

### Modelo
**Open Source / Gratuito**

---

## 📞 Información de Contacto

### Email de Contacto
**[TU_EMAIL]**

### Sitio Web
**https://github.com/[TU_USUARIO]/mib2-controller**

### Política de Privacidad (URL)
**[URL_DONDE_ALOJES_PRIVACY_POLICY.md]**

**Nota:** Google Play requiere que la política de privacidad esté alojada en una URL pública (no puede ser un archivo local).

---

## 🔐 Data Safety (Declaración de Seguridad de Datos)

### ¿Recopila o comparte datos de usuario?
**NO**

### ¿Transmite datos fuera del dispositivo?
**SÍ** (solo para funcionalidad opcional de FEC)

**Detalles de transmisión:**
- **Tipo de datos:** Modelo de vehículo, región (NO datos personales)
- **Destino:** API pública de vwcoding.ru
- **Propósito:** Generar códigos de habilitación de funciones
- **Cifrado:** HTTPS
- **Opcional:** Usuario debe activar manualmente

### ¿Los datos se pueden eliminar?
**SÍ** (todos los datos son locales y se eliminan al desinstalar la app)

---

## ✅ Checklist de Publicación

Antes de enviar a revisión, asegúrate de:

- [ ] Título y descripción completos
- [ ] Ícono de 512x512 subido
- [ ] Feature graphic de 1024x500 subido
- [ ] Mínimo 2 screenshots subidos
- [ ] Política de privacidad alojada en URL pública
- [ ] Cuestionario de clasificación de contenido completado
- [ ] Data Safety declaration completada
- [ ] AAB (Android App Bundle) generado y subido
- [ ] Información de contacto verificada
- [ ] Categoría y tags configurados
- [ ] Países de distribución seleccionados
- [ ] Versión de prueba (Internal Testing) validada

---

## 📝 Notas Adicionales

### Tiempo de Revisión
Típicamente 3-7 días hábiles

### Posibles Rechazos
- **Permisos no justificados:** Asegúrate de que PLAY_STORE_PERMISSIONS.md esté completo
- **Política de privacidad inválida:** Debe estar en URL pública y accesible
- **Screenshots insuficientes:** Mínimo 2 requeridos
- **Contenido engañoso:** Descripción debe ser precisa

### Recomendaciones
1. Iniciar con **Internal Testing** antes de producción
2. Probar el APK/AAB en múltiples dispositivos
3. Verificar que todos los permisos funcionen correctamente
4. Revisar las políticas de Google Play antes de enviar

---

**¡Buena suerte con la publicación!** 🚀
