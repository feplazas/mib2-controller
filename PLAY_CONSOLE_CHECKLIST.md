# Play Console Submission Checklist - MIB2 Controller

## Pre-Submission Checklist

Use esta lista para verificar que todo está listo antes de enviar a revisión.

---

### 1. App Bundle (AAB)

- [x] AAB generado con EAS Build (profile: production)
- [x] Firmado con keystore de producción
- [x] versionCode: 48
- [x] versionName: 1.0.0
- [x] Target SDK: 34 (Android 14)
- [x] Min SDK: 24 (Android 7.0)
- [x] ProGuard/R8 habilitado para optimización
- [x] Arquitecturas: armeabi-v7a, arm64-v8a

**Ubicación del AAB:** Carpeta EAS/build (subido por el usuario)

---

### 2. Store Listing

#### Información básica
- [x] App name: MIB2 Controller
- [x] Short description (80 chars): Control remoto para unidades MIB2 STD2 Technisat Preh sin navegación
- [x] Full description (4000 chars): Completa con características, compatibilidad y advertencias
- [x] Category: Tools
- [x] Tags: MIB2, Volkswagen, CarPlay, Android Auto, USB, Telnet

#### Gráficos
- [x] App icon: 512x512 PNG (assets/images/icon.png)
- [x] Feature graphic: 1024x500 (pendiente crear o usar existente)
- [x] Screenshots: 8 capturas en inglés, modo oscuro, 354x759px
  - 01_home_screen.png
  - 02_auto_spoof.png
  - 03_telnet_terminal.png
  - 04_actions_menu.png
  - 05_eeprom_backups.png
  - 06_offline_guides.png
  - 07_fec_codes.png
  - 08_settings.png

**Ubicación screenshots:** /play-store-screenshots/

---

### 3. Content Rating

- [x] Cuestionario completado (ver CONTENT_RATING_QUESTIONNAIRE.md)
- [x] Clasificación esperada: Everyone / PEGI 3 / USK 0
- [x] Sin contenido violento, sexual o inapropiado
- [x] Sin publicidad ni compras in-app
- [x] Sin interacción social entre usuarios

---

### 4. Data Safety

- [x] Formulario completado (ver DATA_SAFETY_FORM.md)
- [x] Declaración: NO recopila datos personales
- [x] Declaración: NO comparte datos con terceros
- [x] Declaración: NO usa analytics ni tracking
- [x] Método de eliminación de datos documentado
- [x] Permisos justificados:
  - USB_HOST: Comunicación con adaptadores USB-Ethernet
  - INTERNET: Conexión Telnet a red local (NO a Internet)
  - ACCESS_NETWORK_STATE: Detectar configuración de red local

---

### 5. Privacy Policy

- [x] Política de privacidad v3.0 actualizada
- [x] URL pública: https://github.com/feplazas/mib2-controller/blob/main/PRIVACY.md
- [x] Incluye todos los datos procesados localmente
- [x] Incluye justificación de permisos
- [x] Incluye derechos del usuario (acceso, rectificación, supresión)
- [x] Incluye información de contacto del desarrollador
- [x] Cumple GDPR, CCPA, LOPDGDD

**Archivo local:** PRIVACY_POLICY_PLAYSTORE.md

---

### 6. App Access

- [x] La app NO requiere login
- [x] La app NO requiere hardware especial para funcionar básicamente
- [x] Instrucciones de prueba: Abrir app → navegar por todas las pantallas
- [x] Nota para revisores: La funcionalidad completa requiere adaptador USB-Ethernet y unidad MIB2

---

### 7. Ads Declaration

- [x] La app NO contiene publicidad
- [x] Declaración: No ads

---

### 8. App Category & Contact Details

- [x] Category: Tools
- [x] Email: feplazas@gmail.com
- [x] Website: https://github.com/feplazas/mib2-controller
- [x] Privacy Policy URL: https://github.com/feplazas/mib2-controller/blob/main/PRIVACY.md

---

### 9. Target Audience

- [x] Target age: 18+ (usuarios técnicos avanzados)
- [x] NOT designed for children
- [x] Advertencias de riesgo incluidas en la app

---

### 10. News Apps Declaration

- [x] NOT a news app

---

### 11. COVID-19 Apps Declaration

- [x] NOT a COVID-19 related app

---

### 12. Government Apps Declaration

- [x] NOT a government app

---

### 13. Financial Features Declaration

- [x] NO financial features
- [x] NO cryptocurrency features

---

### 14. Health Features Declaration

- [x] NO health features

---

## Notas para el Revisor de Google

### Propósito de la aplicación

MIB2 Controller es una herramienta técnica especializada para usuarios avanzados que desean:

1. **Modificar adaptadores USB-Ethernet** para hacerlos compatibles con unidades de infoentretenimiento MIB2 de vehículos Volkswagen Group
2. **Conectarse vía Telnet** a unidades MIB2 para diagnóstico y configuración
3. **Activar funciones premium** como CarPlay y Android Auto mediante códigos FEC

### Legalidad

- La aplicación NO contiene software pirateado
- Los códigos FEC son generados matemáticamente, no robados
- El usuario es responsable de verificar la legalidad en su jurisdicción
- La aplicación incluye advertencias claras sobre riesgos y responsabilidades

### Funcionalidad sin hardware

La aplicación puede ser revisada completamente sin hardware especial:
- Todas las pantallas son navegables
- Los menús y configuraciones funcionan
- Las guías offline están disponibles
- Solo las funciones de conexión USB/Telnet requieren hardware real

### Permisos

- **INTERNET**: A pesar del nombre, solo se usa para conexiones Telnet en red LOCAL (192.168.x.x). NO se conecta a Internet.
- **USB_HOST**: Para comunicación con adaptadores USB-Ethernet específicos (ASIX AX88772)

---

## Archivos de documentación incluidos

| Archivo | Propósito |
|---------|-----------|
| PRIVACY_POLICY_PLAYSTORE.md | Política de privacidad completa v3.0 |
| DATA_SAFETY_FORM.md | Respuestas para el formulario de seguridad de datos |
| CONTENT_RATING_QUESTIONNAIRE.md | Respuestas para el cuestionario de clasificación |
| store-listing.md | Textos para el listing de Play Store |
| PLAY_CONSOLE_GUIDE.md | Guía paso a paso para subir a Play Console |
| play-store-screenshots/ | 8 screenshots en PNG para el listing |

---

## Contacto del desarrollador

**Nombre:** Felipe Plazas
**Email:** feplazas@gmail.com
**GitHub:** https://github.com/feplazas

---

*Checklist preparado: 26 de enero de 2026*
*Versión de la app: 1.0.0 (Build 48)*
