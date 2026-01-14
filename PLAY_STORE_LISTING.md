# MIB2 USB Controller - Play Store Listing

**Documento actualizado:** 14 de enero de 2026  
**Versión de la app:** 1.0.0  
**Idiomas soportados:** Español, English, Deutsch

---

## 🇪🇸 Español

### Título de la Aplicación (50 caracteres máximo)
**MIB2 USB Controller**

### Descripción Corta (80 caracteres máximo)
Control completo de unidades MIB2 STD2 Volkswagen vía USB y Telnet

### Descripción Larga (4000 caracteres máximo)

**MIB2 USB Controller** es la herramienta definitiva para entusiastas de Volkswagen que desean desbloquear el potencial completo de sus sistemas de infoentretenimiento MIB2 Standard 2 (firmware T480). Esta aplicación profesional combina comunicación USB de bajo nivel con gestión avanzada de firmware para ofrecer funcionalidades que antes solo estaban disponibles para técnicos especializados.

**Características Principales:**

**Spoofing Automático de Adaptadores USB-Ethernet**
La aplicación detecta automáticamente adaptadores USB-Ethernet basados en chipsets ASIX (AX88772/A/B) y modifica su EEPROM para hacerlos compatibles con unidades MIB2. El proceso incluye detección inteligente de tipo de memoria (EEPROM vs eFuse), backup automático cifrado con AES-256, y verificación post-escritura con checksum MD5. El sistema previene operaciones peligrosas en chipsets bloqueados (AX88772C con eFuse) para evitar daños permanentes.

**Cliente Telnet Integrado**
Conéctate directamente a tu unidad MIB2 a través de adaptadores USB-Ethernet y ejecuta comandos shell con autenticación automática. La aplicación incluye una biblioteca de más de 50 comandos predefinidos organizados por categorías: modificación de adaptaciones, personalización de skins, gestión de archivos, diagnóstico de red, y operaciones avanzadas de sistema.

**Generador de Códigos FEC**
Genera códigos Feature Enable Codes (FEC) para activar funcionalidades ocultas en tu MIB2: CarPlay (00060800), Android Auto (00060900), Performance Monitor (00060400), y muchos más. El algoritmo implementado sigue la especificación documentada basada en VIN y VCRN del vehículo, con exportación directa a formato ExceptionList.txt compatible con MIB2 Toolbox.

**Biblioteca de Procedimientos VCDS**
Accede a procedimientos técnicos traducidos del alemán al español para modificaciones avanzadas: configuración de XDS+ (Standard/Mittel/Schwach/Stark), optimización VAQ para tracción aumentada, activación de monitor offroad, personalización de cuadro digital (temas Carbono/Cupra), y modo desarrollador. Cada procedimiento incluye advertencias de seguridad y recomendaciones técnicas.

**Sistema de Backup y Recuperación**
Todos los backups de EEPROM se cifran automáticamente con AES-256 usando claves almacenadas en hardware-backed secure storage. La aplicación mantiene un historial completo de operaciones con timestamps, información del dispositivo, y resultados de verificación. El modo de recuperación avanzado permite restaurar adaptadores "brickeados" mediante comandos vendor-specific y escritura forzada.

**Modo Experto con PIN de Seguridad**
Los comandos peligrosos están protegidos detrás de un sistema de PIN de 4 dígitos almacenado de forma segura. El modo experto incluye confirmación doble para operaciones críticas, dry-run mode para simular cambios sin escritura real, y validación de compatibilidad de hardware antes de cada operación.

**Detección USB en Tiempo Real**
La aplicación utiliza un BroadcastReceiver nativo para detectar conexión/desconexión de adaptadores USB instantáneamente, sin consumir batería con polling constante. El sistema híbrido combina eventos en tiempo real con polling de 10 segundos como fallback para máxima confiabilidad.

**Soporte Multiidioma**
Interfaz completamente traducida a español, inglés y alemán con selector de idioma en tiempo real. Más de 200 cadenas traducidas cubriendo todas las pantallas, mensajes de error, y advertencias de seguridad.

**Tecnología y Seguridad:**

La aplicación está desarrollada en React Native con módulos nativos en Kotlin para acceso USB de bajo nivel. Utiliza control transfers USB (comandos vendor-specific 0x04/0x05) para lectura/escritura directa de EEPROM sin drivers adicionales. Todos los datos sensibles se almacenan cifrados con expo-secure-store (hardware-backed en dispositivos compatibles).

El código fuente está documentado con 11 Architecture Decision Records (ADR) explicando decisiones técnicas clave, guía completa de troubleshooting con 10 FAQs, y 34 tests unitarios validando funcionalidad crítica. La aplicación cumple con GDPR y CCPA: no recopila datos personales, no requiere registro de usuario, y todas las operaciones son locales.

**Compatibilidad:**

- Unidades MIB2 Standard 2 con firmware T480 (Technisat Preh)
- Adaptadores USB-Ethernet: ASIX AX88772, AX88772A, AX88772B
- Dispositivos Android 8.0+ con soporte USB Host
- Requiere MIB2 Toolbox instalado en la unidad para funcionalidades avanzadas

**Advertencia Legal:**

Esta aplicación está diseñada para uso educativo y técnico. Las modificaciones de firmware pueden anular la garantía del vehículo. El usuario asume toda la responsabilidad por el uso de esta herramienta. Recomendamos realizar backups completos antes de cualquier operación crítica.

---

## 🇬🇧 English

### App Title (50 characters max)
**MIB2 USB Controller**

### Short Description (80 characters max)
Complete control of Volkswagen MIB2 STD2 units via USB and Telnet

### Long Description (4000 characters max)

**MIB2 USB Controller** is the ultimate tool for Volkswagen enthusiasts who want to unlock the full potential of their MIB2 Standard 2 infotainment systems (T480 firmware). This professional application combines low-level USB communication with advanced firmware management to deliver functionalities previously available only to specialized technicians.

**Key Features:**

**Automatic USB-Ethernet Adapter Spoofing**
The app automatically detects USB-Ethernet adapters based on ASIX chipsets (AX88772/A/B) and modifies their EEPROM to make them compatible with MIB2 units. The process includes intelligent memory type detection (EEPROM vs eFuse), automatic AES-256 encrypted backup, and post-write verification with MD5 checksum. The system prevents dangerous operations on locked chipsets (AX88772C with eFuse) to avoid permanent damage.

**Integrated Telnet Client**
Connect directly to your MIB2 unit through USB-Ethernet adapters and execute shell commands with automatic authentication. The app includes a library of over 50 predefined commands organized by categories: adaptation modifications, skin customization, file management, network diagnostics, and advanced system operations.

**FEC Code Generator**
Generate Feature Enable Codes (FEC) to activate hidden functionalities in your MIB2: CarPlay (00060800), Android Auto (00060900), Performance Monitor (00060400), and many more. The implemented algorithm follows the documented specification based on vehicle VIN and VCRN, with direct export to ExceptionList.txt format compatible with MIB2 Toolbox.

**VCDS Procedure Library**
Access technical procedures translated from German to English for advanced modifications: XDS+ configuration (Standard/Mittel/Schwach/Stark), VAQ optimization for increased traction, offroad monitor activation, digital dashboard customization (Carbon/Cupra themes), and developer mode. Each procedure includes safety warnings and technical recommendations.

**Backup and Recovery System**
All EEPROM backups are automatically encrypted with AES-256 using keys stored in hardware-backed secure storage. The app maintains a complete operation history with timestamps, device information, and verification results. Advanced recovery mode allows restoring "bricked" adapters through vendor-specific commands and forced writing.

**Expert Mode with PIN Security**
Dangerous commands are protected behind a 4-digit PIN system stored securely. Expert mode includes double confirmation for critical operations, dry-run mode to simulate changes without actual writing, and hardware compatibility validation before each operation.

**Real-Time USB Detection**
The app uses a native BroadcastReceiver to detect USB adapter connection/disconnection instantly, without draining battery with constant polling. The hybrid system combines real-time events with 10-second polling as fallback for maximum reliability.

**Multi-Language Support**
Fully translated interface in Spanish, English, and German with real-time language selector. Over 200 translated strings covering all screens, error messages, and safety warnings.

**Technology and Security:**

The app is developed in React Native with native Kotlin modules for low-level USB access. It uses USB control transfers (vendor-specific commands 0x04/0x05) for direct EEPROM read/write without additional drivers. All sensitive data is stored encrypted with expo-secure-store (hardware-backed on compatible devices).

The source code is documented with 11 Architecture Decision Records (ADR) explaining key technical decisions, complete troubleshooting guide with 10 FAQs, and 34 unit tests validating critical functionality. The app complies with GDPR and CCPA: it does not collect personal data, requires no user registration, and all operations are local.

**Compatibility:**

- MIB2 Standard 2 units with T480 firmware (Technisat Preh)
- USB-Ethernet adapters: ASIX AX88772, AX88772A, AX88772B
- Android 8.0+ devices with USB Host support
- Requires MIB2 Toolbox installed on the unit for advanced functionalities

**Legal Disclaimer:**

This application is designed for educational and technical use. Firmware modifications may void vehicle warranty. The user assumes all responsibility for using this tool. We recommend making complete backups before any critical operation.

---

## 🇩🇪 Deutsch

### App-Titel (50 Zeichen maximal)
**MIB2 USB Controller**

### Kurzbeschreibung (80 Zeichen maximal)
Vollständige Kontrolle von Volkswagen MIB2 STD2 über USB und Telnet

### Lange Beschreibung (4000 Zeichen maximal)

**MIB2 USB Controller** ist das ultimative Werkzeug für Volkswagen-Enthusiasten, die das volle Potenzial ihrer MIB2 Standard 2 Infotainment-Systeme (T480 Firmware) freischalten möchten. Diese professionelle Anwendung kombiniert Low-Level-USB-Kommunikation mit erweitertem Firmware-Management, um Funktionen bereitzustellen, die zuvor nur spezialisierten Technikern zur Verfügung standen.

**Hauptmerkmale:**

**Automatisches USB-Ethernet-Adapter-Spoofing**
Die App erkennt automatisch USB-Ethernet-Adapter basierend auf ASIX-Chipsätzen (AX88772/A/B) und modifiziert deren EEPROM, um sie mit MIB2-Einheiten kompatibel zu machen. Der Prozess umfasst intelligente Speichertypenerkennung (EEPROM vs. eFuse), automatisches AES-256-verschlüsseltes Backup und Nachschreibverifizierung mit MD5-Prüfsumme. Das System verhindert gefährliche Operationen auf gesperrten Chipsätzen (AX88772C mit eFuse), um permanente Schäden zu vermeiden.

**Integrierter Telnet-Client**
Verbinden Sie sich direkt mit Ihrer MIB2-Einheit über USB-Ethernet-Adapter und führen Sie Shell-Befehle mit automatischer Authentifizierung aus. Die App enthält eine Bibliothek mit über 50 vordefinierten Befehlen, organisiert nach Kategorien: Anpassungsmodifikationen, Skin-Anpassung, Dateiverwaltung, Netzwerkdiagnose und erweiterte Systemoperationen.

**FEC-Code-Generator**
Generieren Sie Feature Enable Codes (FEC), um versteckte Funktionen in Ihrem MIB2 zu aktivieren: CarPlay (00060800), Android Auto (00060900), Performance Monitor (00060400) und viele mehr. Der implementierte Algorithmus folgt der dokumentierten Spezifikation basierend auf Fahrzeug-VIN und VCRN, mit direktem Export in das ExceptionList.txt-Format, das mit MIB2 Toolbox kompatibel ist.

**VCDS-Verfahrensbibliothek**
Greifen Sie auf technische Verfahren zu für erweiterte Modifikationen: XDS+-Konfiguration (Standard/Mittel/Schwach/Stark), VAQ-Optimierung für erhöhte Traktion, Offroad-Monitor-Aktivierung, digitale Armaturenbrett-Anpassung (Carbon/Cupra-Themen) und Entwicklermodus. Jedes Verfahren enthält Sicherheitswarnungen und technische Empfehlungen.

**Backup- und Wiederherstellungssystem**
Alle EEPROM-Backups werden automatisch mit AES-256 verschlüsselt, wobei Schlüssel in hardwaregestütztem sicheren Speicher gespeichert werden. Die App führt eine vollständige Operationshistorie mit Zeitstempeln, Geräteinformationen und Verifizierungsergebnissen. Der erweiterte Wiederherstellungsmodus ermöglicht die Wiederherstellung "gebrickter" Adapter durch herstellerspezifische Befehle und erzwungenes Schreiben.

**Expertenmodus mit PIN-Sicherheit**
Gefährliche Befehle sind hinter einem 4-stelligen PIN-System geschützt, das sicher gespeichert wird. Der Expertenmodus umfasst doppelte Bestätigung für kritische Operationen, Dry-Run-Modus zur Simulation von Änderungen ohne tatsächliches Schreiben und Hardwarekompatibilitätsvalidierung vor jeder Operation.

**Echtzeit-USB-Erkennung**
Die App verwendet einen nativen BroadcastReceiver, um USB-Adapter-Verbindung/-Trennung sofort zu erkennen, ohne den Akku durch ständiges Polling zu entleaden. Das Hybridsystem kombiniert Echtzeitereignisse mit 10-Sekunden-Polling als Fallback für maximale Zuverlässigkeit.

**Mehrsprachige Unterstützung**
Vollständig übersetzte Benutzeroberfläche in Spanisch, Englisch und Deutsch mit Echtzeit-Sprachauswahl. Über 200 übersetzte Zeichenfolgen, die alle Bildschirme, Fehlermeldungen und Sicherheitswarnungen abdecken.

**Technologie und Sicherheit:**

Die App ist in React Native mit nativen Kotlin-Modulen für Low-Level-USB-Zugriff entwickelt. Sie verwendet USB-Control-Transfers (herstellerspezifische Befehle 0x04/0x05) für direktes EEPROM-Lesen/-Schreiben ohne zusätzliche Treiber. Alle sensiblen Daten werden verschlüsselt mit expo-secure-store gespeichert (hardwaregestützt auf kompatiblen Geräten).

Der Quellcode ist mit 11 Architecture Decision Records (ADR) dokumentiert, die wichtige technische Entscheidungen erklären, vollständiger Fehlerbehebungsanleitung mit 10 FAQs und 34 Unit-Tests zur Validierung kritischer Funktionen. Die App entspricht DSGVO und CCPA: Sie sammelt keine personenbezogenen Daten, erfordert keine Benutzerregistrierung, und alle Operationen sind lokal.

**Kompatibilität:**

- MIB2 Standard 2 Einheiten mit T480 Firmware (Technisat Preh)
- USB-Ethernet-Adapter: ASIX AX88772, AX88772A, AX88772B
- Android 8.0+ Geräte mit USB-Host-Unterstützung
- Erfordert MIB2 Toolbox auf der Einheit installiert für erweiterte Funktionen

**Rechtlicher Hinweis:**

Diese Anwendung ist für Bildungs- und technische Zwecke konzipiert. Firmware-Modifikationen können die Fahrzeuggarantie erlöschen lassen. Der Benutzer übernimmt die volle Verantwortung für die Verwendung dieses Werkzeugs. Wir empfehlen, vollständige Backups vor jeder kritischen Operation zu erstellen.

---

## 📋 Información Adicional para Play Store Console

### Categoría
**Herramientas (Tools)**

### Clasificación de Contenido
**PEGI 3 / Everyone**
- Aplicación técnica educativa sin contenido inapropiado

### Permisos Requeridos

| Permiso | Justificación |
|---------|---------------|
| `android.hardware.usb.host` | Comunicación con adaptadores USB-Ethernet para spoofing de EEPROM y detección de dispositivos |
| `android.permission.INTERNET` | Cliente Telnet para comunicación con unidades MIB2 a través de red local |
| `android.permission.ACCESS_NETWORK_STATE` | Detección automática de adaptadores de red USB-Ethernet y validación de conectividad |

### Palabras Clave (Keywords)
MIB2, Volkswagen, VW, VCDS, USB, Telnet, ASIX, spoofing, firmware, infotainment, CarPlay, Android Auto, FEC, adaptation, coding, diagnostic, OBD

### Contacto del Desarrollador
- **Email de Soporte:** [Agregar tu email aquí]
- **Sitio Web:** https://github.com/feplazas/mib2-controller
- **Política de Privacidad:** [URL donde alojes PRIVACY_POLICY.md]

### Data Safety Declaration (Cuestionario de Seguridad de Datos)

**¿La app recopila o comparte datos de usuario?**
NO - La aplicación no recopila ningún dato personal.

**¿La app transmite datos fuera del dispositivo?**
NO - Todas las operaciones son locales (dispositivo ↔ unidad MIB2 vía USB).

**Tipos de datos que NO se recopilan:**
- Información personal (nombre, email, dirección)
- Información financiera
- Ubicación
- Fotos o videos
- Archivos y documentos personales
- Historial de navegación
- Identificadores de dispositivo

**Prácticas de seguridad:**
- Los datos se cifran en tránsito (Telnet sobre red local)
- Los backups se cifran con AES-256
- No se comparten datos con terceros
- El usuario puede solicitar eliminación de datos (desinstalar app)

### Notas para Revisión de Google Play

Esta aplicación está diseñada para entusiastas técnicos de Volkswagen y requiere conocimientos avanzados de sistemas MIB2. Las funcionalidades de modificación de EEPROM y firmware están claramente advertidas con múltiples confirmaciones de seguridad.

**Justificación de permisos:**
- **USB Host:** Necesario para comunicación directa con adaptadores USB-Ethernet y modificación de EEPROM (funcionalidad principal de la app)
- **Internet:** Usado exclusivamente para cliente Telnet local (comunicación con unidad MIB2 a través de adaptador USB-Ethernet conectado al dispositivo Android, NO comunicación externa con servidores)
- **Network State:** Detección automática de configuración de red del adaptador USB-Ethernet

La aplicación incluye advertencias legales claras sobre posible anulación de garantía y responsabilidad del usuario. Todas las operaciones críticas requieren confirmación explícita del usuario y están protegidas con sistema de PIN en modo experto.

**Funcionalidad offline:** La aplicación funciona completamente offline. No requiere conexión a Internet para ninguna funcionalidad principal.

---

## ✅ Checklist de Publicación

- [ ] Título y descripciones en 3 idiomas completos
- [ ] Ícono de 512x512 px generado
- [ ] Feature graphic de 1024x500 px creado
- [ ] Mínimo 2 screenshots por idioma (ES/EN/DE)
- [ ] Política de privacidad alojada en URL pública
- [ ] Cuestionario Data Safety completado
- [ ] AAB de producción generado con EAS Build
- [ ] Información de contacto actualizada
- [ ] Categoría y keywords configurados
- [ ] Internal Testing validado antes de producción

---

**Última actualización:** 14 de enero de 2026  
**Preparado para:** Google Play Store Console  
**Versión de la app:** 1.0.0
