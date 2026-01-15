#!/usr/bin/env python3
"""
Genera traducciones completas EN/DE basadas en es.json
Usa traducciones manuales de alta calidad para textos técnicos de MIB2
"""
import json
import re
from pathlib import Path

PROJECT_ROOT = Path('/home/ubuntu/mib2_controller')
LOCALES_DIR = PROJECT_ROOT / 'locales'

# Diccionario completo de traducciones ES -> EN, DE
TRANSLATIONS = {
    # === COMMON ===
    "Cancelar": {"en": "Cancel", "de": "Abbrechen"},
    "Confirmar": {"en": "Confirm", "de": "Bestätigen"},
    "Continuar": {"en": "Continue", "de": "Fortfahren"},
    "Atrás": {"en": "Back", "de": "Zurück"},
    "Siguiente": {"en": "Next", "de": "Weiter"},
    "Finalizar": {"en": "Finish", "de": "Fertigstellen"},
    "Cerrar": {"en": "Close", "de": "Schließen"},
    "Guardar": {"en": "Save", "de": "Speichern"},
    "Eliminar": {"en": "Delete", "de": "Löschen"},
    "Editar": {"en": "Edit", "de": "Bearbeiten"},
    "Cargando...": {"en": "Loading...", "de": "Laden..."},
    "Error": {"en": "Error", "de": "Fehler"},
    "Éxito": {"en": "Success", "de": "Erfolg"},
    "Advertencia": {"en": "Warning", "de": "Warnung"},
    "Sí": {"en": "Yes", "de": "Ja"},
    "No": {"en": "No", "de": "Nein"},
    "Desconectar": {"en": "Disconnect", "de": "Trennen"},
    "Conectar": {"en": "Connect", "de": "Verbinden"},
    "Escanear": {"en": "Scan", "de": "Scannen"},
    
    # === USB/SPOOFING ===
    "No hay dispositivo conectado": {"en": "No device connected", "de": "Kein Gerät verbunden"},
    "Creando backup de seguridad": {"en": "Creating security backup", "de": "Sicherheitsbackup wird erstellt"},
    "• Esta operación es IRREVERSIBLE sin backup": {"en": "• This operation is IRREVERSIBLE without backup", "de": "• Diese Operation ist IRREVERSIBEL ohne Backup"},
    "• NO desconectes el adaptador durante el proceso": {"en": "• DO NOT disconnect the adapter during the process", "de": "• Trennen Sie den Adapter NICHT während des Vorgangs"},
    "• Solo funciona con ASIX AX88772A/B con EEPROM externa": {"en": "• Only works with ASIX AX88772A/B with external EEPROM", "de": "• Funktioniert nur mit ASIX AX88772A/B mit externem EEPROM"},
    "• Dispositivos con eFuse NO son compatibles": {"en": "• Devices with eFuse are NOT compatible", "de": "• Geräte mit eFuse sind NICHT kompatibel"},
    "• Se creará un backup automático antes de escribir": {"en": "• An automatic backup will be created before writing", "de": "• Ein automatisches Backup wird vor dem Schreiben erstellt"},
    "⚠️ Forzar sin Verificación": {"en": "⚠️ Force without Verification", "de": "⚠️ Ohne Überprüfung erzwingen"},
    "Omite la verificación post-escritura. Úsalo solo si la verificación normal falla debido a protección de escritura del adaptador. Después del spoofing, desconecta y reconecta el adaptador para verificar manualmente.": {"en": "Skips post-write verification. Use only if normal verification fails due to adapter write protection. After spoofing, disconnect and reconnect the adapter to verify manually.", "de": "Überspringt die Nachschreibprüfung. Nur verwenden, wenn die normale Überprüfung aufgrund des Schreibschutzes des Adapters fehlschlägt. Nach dem Spoofing den Adapter trennen und wieder anschließen, um manuell zu überprüfen."},
    "Verifica si el adaptador tiene VID/PID 0x2001:0x3C05": {"en": "Verifies if the adapter has VID/PID 0x2001:0x3C05", "de": "Überprüft, ob der Adapter VID/PID 0x2001:0x3C05 hat"},
    "Ejecuta spoofing con una sola confirmación": {"en": "Executes spoofing with a single confirmation", "de": "Führt Spoofing mit einer einzigen Bestätigung aus"},
    "Conecta un adaptador compatible para continuar": {"en": "Connect a compatible adapter to continue", "de": "Schließen Sie einen kompatiblen Adapter an, um fortzufahren"},
    "Con triple confirmación y validaciones completas": {"en": "With triple confirmation and complete validations", "de": "Mit dreifacher Bestätigung und vollständigen Validierungen"},
    "Sí, Continuar": {"en": "Yes, Continue", "de": "Ja, Fortfahren"},
    "NO, Cancelar": {"en": "NO, Cancel", "de": "NEIN, Abbrechen"},
    "SÍ, Ejecutar": {"en": "YES, Execute", "de": "JA, Ausführen"},
    "🔧 Spoofing Automático": {"en": "🔧 Automatic Spoofing", "de": "🔧 Automatisches Spoofing"},
    "Reprogramación automática de EEPROM para adaptadores ASIX compatibles": {"en": "Automatic EEPROM reprogramming for compatible ASIX adapters", "de": "Automatische EEPROM-Neuprogrammierung für kompatible ASIX-Adapter"},
    "📱 Dispositivo Conectado": {"en": "📱 Connected Device", "de": "📱 Verbundenes Gerät"},
    "Estado de Conexión USB": {"en": "USB Connection Status", "de": "USB-Verbindungsstatus"},
    "Sin Dispositivo USB": {"en": "No USB Device", "de": "Kein USB-Gerät"},
    "Conecta un adaptador USB-Ethernet": {"en": "Connect a USB-Ethernet adapter", "de": "USB-Ethernet-Adapter verbinden"},
    "Dispositivo Detectado": {"en": "Device Detected", "de": "Gerät erkannt"},
    
    # === FEC ===
    "Comandos Rápidos": {"en": "Quick Commands", "de": "Schnellbefehle"},
    "Éxitos": {"en": "Successes", "de": "Erfolge"},
    "📝 Nota Técnica": {"en": "📝 Technical Note", "de": "📝 Technischer Hinweis"},
    "Datos del Vehículo (Opcional)": {"en": "Vehicle Data (Optional)", "de": "Fahrzeugdaten (Optional)"},
    "Para generación de códigos personalizados basados en VIN/VCRN": {"en": "For custom code generation based on VIN/VCRN", "de": "Für benutzerdefinierte Codegenerierung basierend auf VIN/VCRN"},
    "VCRN (Número de Serie)": {"en": "VCRN (Serial Number)", "de": "VCRN (Seriennummer)"},
    "VIN inválido (debe tener 17 caracteres alfanuméricos)": {"en": "Invalid VIN (must have 17 alphanumeric characters)", "de": "Ungültige VIN (muss 17 alphanumerische Zeichen haben)"},
    "VCRN inválido (debe tener entre 8 y 20 caracteres)": {"en": "Invalid VCRN (must have between 8 and 20 characters)", "de": "Ungültige VCRN (muss zwischen 8 und 20 Zeichen haben)"},
    "Códigos FEC Predefinidos": {"en": "Predefined FEC Codes", "de": "Vordefinierte FEC-Codes"},
    "Agregar Código Personalizado": {"en": "Add Custom Code", "de": "Benutzerdefinierten Code hinzufügen"},
    "Agregar Código": {"en": "Add Code", "de": "Code hinzufügen"},
    "Ver Comando de Inyección": {"en": "View Injection Command", "de": "Injektionsbefehl anzeigen"},
    "Comando de Inyección": {"en": "Injection Command", "de": "Injektionsbefehl"},
    "Generador FEC": {"en": "FEC Generator", "de": "FEC-Generator"},
    "Genera códigos FEC para activar funciones en tu MIB2": {"en": "Generate FEC codes to activate features on your MIB2", "de": "FEC-Codes generieren, um Funktionen auf Ihrem MIB2 zu aktivieren"},
    "Códigos seleccionados": {"en": "Selected codes", "de": "Ausgewählte Codes"},
    "Código FEC (8 dígitos hex)": {"en": "FEC Code (8 hex digits)", "de": "FEC-Code (8 Hex-Ziffern)"},
    "Generar Comando": {"en": "Generate Command", "de": "Befehl generieren"},
    "Generar ExceptionList.txt": {"en": "Generate ExceptionList.txt", "de": "ExceptionList.txt generieren"},
    "Copiar Comando": {"en": "Copy Command", "de": "Befehl kopieren"},
    "Abrir Generador Online": {"en": "Open Online Generator", "de": "Online-Generator öffnen"},
    
    # === COMMANDS/TELNET ===
    "Conectar a MIB2": {"en": "Connect to MIB2", "de": "Mit MIB2 verbinden"},
    "Instrucciones de Conexión": {"en": "Connection Instructions", "de": "Verbindungsanweisungen"},
    "1. Conecta el adaptador USB-Ethernet al puerto USB de la unidad MIB2": {"en": "1. Connect the USB-Ethernet adapter to the MIB2 unit USB port", "de": "1. Verbinden Sie den USB-Ethernet-Adapter mit dem USB-Anschluss der MIB2-Einheit"},
    "2. Conecta tu dispositivo Android a la misma red (WiFi o adaptador Ethernet)": {"en": "2. Connect your Android device to the same network (WiFi or Ethernet adapter)", "de": "2. Verbinden Sie Ihr Android-Gerät mit demselben Netzwerk (WLAN oder Ethernet-Adapter)"},
    "3. Verifica que la unidad MIB2 tenga Telnet habilitado (root/root)": {"en": "3. Verify that the MIB2 unit has Telnet enabled (root/root)", "de": "3. Stellen Sie sicher, dass die MIB2-Einheit Telnet aktiviert hat (root/root)"},
    "4. Ingresa la dirección IP de la unidad (por defecto: 192.168.1.4)": {"en": "4. Enter the unit IP address (default: 192.168.1.4)", "de": "4. Geben Sie die IP-Adresse der Einheit ein (Standard: 192.168.1.4)"},
    "5. Presiona &quot;Conectar a MIB2&quot; para establecer la conexión": {"en": "5. Press &quot;Connect to MIB2&quot; to establish the connection", "de": "5. Drücken Sie &quot;Mit MIB2 verbinden&quot;, um die Verbindung herzustellen"},
    "⚠️ Advertencia": {"en": "⚠️ Warning", "de": "⚠️ Warnung"},
    "Esta aplicación permite ejecutar comandos directamente en la unidad MIB2. \n              Usa con precaución y solo si sabes lo que estás haciendo. Los comandos \n              incorrectos pueden dañar el sistema.": {"en": "This application allows executing commands directly on the MIB2 unit. \n              Use with caution and only if you know what you are doing. Incorrect commands \n              can damage the system.", "de": "Diese Anwendung ermöglicht die direkte Ausführung von Befehlen auf der MIB2-Einheit. \n              Mit Vorsicht verwenden und nur wenn Sie wissen, was Sie tun. Falsche Befehle \n              können das System beschädigen."},
    "Terminal Telnet": {"en": "Telnet Terminal", "de": "Telnet-Terminal"},
    "Ejecuta comandos directamente en la unidad MIB2": {"en": "Execute commands directly on the MIB2 unit", "de": "Befehle direkt auf der MIB2-Einheit ausführen"},
    "Conectado": {"en": "Connected", "de": "Verbunden"},
    "Desconectado": {"en": "Disconnected", "de": "Getrennt"},
    "Dirección IP": {"en": "IP Address", "de": "IP-Adresse"},
    "Puerto": {"en": "Port", "de": "Port"},
    "Usuario": {"en": "User", "de": "Benutzer"},
    "Contraseña": {"en": "Password", "de": "Passwort"},
    "Enviar comando": {"en": "Send command", "de": "Befehl senden"},
    "Limpiar consola": {"en": "Clear console", "de": "Konsole leeren"},
    "Error de conexión": {"en": "Connection error", "de": "Verbindungsfehler"},
    "Conectado exitosamente": {"en": "Connected successfully", "de": "Erfolgreich verbunden"},
    
    # === RECOVERY ===
    "Forzar Restauración": {"en": "Force Restore", "de": "Wiederherstellung erzwingen"},
    "💾 Gestión de Backups": {"en": "💾 Backup Management", "de": "💾 Backup-Verwaltung"},
    "Los backups se crean automáticamente antes de modificar archivos críticos del sistema MIB2.": {"en": "Backups are automatically created before modifying critical MIB2 system files.", "de": "Backups werden automatisch erstellt, bevor kritische MIB2-Systemdateien geändert werden."},
    "No hay backups disponibles": {"en": "No backups available", "de": "Keine Backups verfügbar"},
    "Continuar Sin Backup": {"en": "Continue Without Backup", "de": "Ohne Backup fortfahren"},
    "Recuperación y Backups": {"en": "Recovery & Backups", "de": "Wiederherstellung & Backups"},
    "Gestiona backups y restaura archivos críticos del sistema MIB2": {"en": "Manage backups and restore critical MIB2 system files", "de": "Backups verwalten und kritische MIB2-Systemdateien wiederherstellen"},
    "Crear Backup": {"en": "Create Backup", "de": "Backup erstellen"},
    "Restaurar Backup": {"en": "Restore Backup", "de": "Backup wiederherstellen"},
    "Compartir Backup": {"en": "Share Backup", "de": "Backup teilen"},
    "Eliminar Backup": {"en": "Delete Backup", "de": "Backup löschen"},
    
    # === SETTINGS ===
    "Guardar PIN": {"en": "Save PIN", "de": "PIN speichern"},
    "PIN de Seguridad": {"en": "Security PIN", "de": "Sicherheits-PIN"},
    "Configuración de Conexión": {"en": "Connection Settings", "de": "Verbindungseinstellungen"},
    "Dirección IP de la unidad MIB2 en la red local": {"en": "MIB2 unit IP address on the local network", "de": "IP-Adresse der MIB2-Einheit im lokalen Netzwerk"},
    "Usuario para autenticación Telnet": {"en": "User for Telnet authentication", "de": "Benutzer für Telnet-Authentifizierung"},
    "Contraseña para autenticación Telnet": {"en": "Password for Telnet authentication", "de": "Passwort für Telnet-Authentifizierung"},
    "Gestión de Datos": {"en": "Data Management", "de": "Datenverwaltung"},
    "Limpiar Historial de Comandos": {"en": "Clear Command History", "de": "Befehlsverlauf löschen"},
    "🔌 Estado de Conexión": {"en": "🔌 Connection Status", "de": "🔌 Verbindungsstatus"},
    "📱 Dispositivo Actual": {"en": "📱 Current Device", "de": "📱 Aktuelles Gerät"},
    "⚙️ Información Técnica": {"en": "⚙️ Technical Information", "de": "⚙️ Technische Informationen"},
    "Módulo Nativo:": {"en": "Native Module:", "de": "Natives Modul:"},
    "📋 Copiar Info de Debug": {"en": "📋 Copy Debug Info", "de": "📋 Debug-Info kopieren"},
    "Información de la App": {"en": "App Information", "de": "App-Informationen"},
    "Versión": {"en": "Version", "de": "Version"},
    "Creada por": {"en": "Created by", "de": "Erstellt von"},
    "Compatible con": {"en": "Compatible with", "de": "Kompatibel mit"},
    "⚠️ Advertencia de Seguridad": {"en": "⚠️ Security Warning", "de": "⚠️ Sicherheitswarnung"},
    "Esta aplicación permite ejecutar comandos con privilegios root en la unidad MIB2. \n              El uso incorrecto puede resultar en daños permanentes al sistema. \n              Usa esta herramienta bajo tu propia responsabilidad.": {"en": "This application allows executing commands with root privileges on the MIB2 unit. \n              Incorrect use may result in permanent system damage. \n              Use this tool at your own risk.", "de": "Diese Anwendung ermöglicht die Ausführung von Befehlen mit Root-Rechten auf der MIB2-Einheit. \n              Falsche Verwendung kann zu dauerhaften Systemschäden führen. \n              Verwenden Sie dieses Tool auf eigene Gefahr."},
    "Creada por Felipe Plazas": {"en": "Created by Felipe Plazas", "de": "Erstellt von Felipe Plazas"},
    "Para unidades MIB2 STD2 Technisat/Preh": {"en": "For MIB2 STD2 Technisat/Preh units", "de": "Für MIB2 STD2 Technisat/Preh-Einheiten"},
    "Configuración": {"en": "Settings", "de": "Einstellungen"},
    "Ajusta los parámetros de la aplicación": {"en": "Adjust application parameters", "de": "Anwendungsparameter anpassen"},
    "Tienes acceso a comandos que pueden dañar la unidad MIB2. Procede con extrema precaución.": {"en": "You have access to commands that can damage the MIB2 unit. Proceed with extreme caution.", "de": "Sie haben Zugriff auf Befehle, die die MIB2-Einheit beschädigen können. Gehen Sie mit äußerster Vorsicht vor."},
    "Configurar PIN de Seguridad": {"en": "Configure Security PIN", "de": "Sicherheits-PIN konfigurieren"},
    "Nuevo PIN (mínimo 4 dígitos)": {"en": "New PIN (minimum 4 digits)", "de": "Neue PIN (mindestens 4 Ziffern)"},
    "Idioma": {"en": "Language", "de": "Sprache"},
    "Tema": {"en": "Theme", "de": "Design"},
    "Modo experto": {"en": "Expert mode", "de": "Expertenmodus"},
    "PIN de experto": {"en": "Expert PIN", "de": "Experten-PIN"},
    "Establecer PIN": {"en": "Set PIN", "de": "PIN festlegen"},
    "Cambiar PIN": {"en": "Change PIN", "de": "PIN ändern"},
    "Notificaciones": {"en": "Notifications", "de": "Benachrichtigungen"},
    "Habilitar notificaciones": {"en": "Enable notifications", "de": "Benachrichtigungen aktivieren"},
    "Acerca de": {"en": "About", "de": "Über"},
    "Desarrollador": {"en": "Developer", "de": "Entwickler"},
    "Licencia": {"en": "License", "de": "Lizenz"},
    
    # === TOOLBOX ===
    "ADVERTENCIA CRÍTICA": {"en": "CRITICAL WARNING", "de": "KRITISCHE WARNUNG"},
    "Un error puede BRICKEAR la unidad MIB2": {"en": "An error can BRICK the MIB2 unit", "de": "Ein Fehler kann die MIB2-Einheit BRICKEN"},
    "No interrumpas el proceso una vez iniciado.": {"en": "Do not interrupt the process once started.", "de": "Unterbrechen Sie den Vorgang nicht, sobald er gestartet wurde."},
    "Si algo falla, la única forma de recuperar la unidad es mediante acceso directo a la memoria eMMC (soldadura).": {"en": "If something fails, the only way to recover the unit is through direct access to eMMC memory (soldering).", "de": "Wenn etwas fehlschlägt, ist die einzige Möglichkeit, die Einheit wiederherzustellen, der direkte Zugriff auf den eMMC-Speicher (Löten)."},
    "Estado de Prerequisitos": {"en": "Prerequisites Status", "de": "Voraussetzungsstatus"},
    "⚠️ Completa los prerequisitos antes de instalar": {"en": "⚠️ Complete prerequisites before installing", "de": "⚠️ Voraussetzungen vor der Installation abschließen"},
    "🔍 Diagnósticos": {"en": "🔍 Diagnostics", "de": "🔍 Diagnose"},
    "⚙️ Método eMMC": {"en": "⚙️ eMMC Method", "de": "⚙️ eMMC-Methode"},
    "Pasos de Instalación": {"en": "Installation Steps", "de": "Installationsschritte"},
    "Volver a la lista": {"en": "Back to list", "de": "Zurück zur Liste"},
    "Comandos de Diagnóstico": {"en": "Diagnostic Commands", "de": "Diagnosebefehle"},
    "❌ Error": {"en": "❌ Error", "de": "❌ Fehler"},
    "Comando de Verificación": {"en": "Verification Command", "de": "Überprüfungsbefehl"},
    "Utilidades avanzadas para MIB2": {"en": "Advanced utilities for MIB2", "de": "Erweiterte Dienstprogramme für MIB2"},
    "Generar códigos FEC personalizados": {"en": "Generate custom FEC codes", "de": "Benutzerdefinierte FEC-Codes generieren"},
    "Asistente de instalación": {"en": "Installation wizard", "de": "Installationsassistent"},
    "Información del adaptador conectado": {"en": "Connected adapter information", "de": "Informationen zum angeschlossenen Adapter"},
    "Caja de Herramientas": {"en": "Toolbox", "de": "Werkzeugkasten"},
    "Herramientas avanzadas para MIB2": {"en": "Advanced tools for MIB2", "de": "Erweiterte Werkzeuge für MIB2"},
    "Instalación de Firmware": {"en": "Firmware Installation", "de": "Firmware-Installation"},
    "Instalar firmware personalizado en la unidad MIB2": {"en": "Install custom firmware on the MIB2 unit", "de": "Benutzerdefinierte Firmware auf der MIB2-Einheit installieren"},
    "Diagnósticos del Sistema": {"en": "System Diagnostics", "de": "Systemdiagnose"},
    "Ejecutar diagnósticos y verificar estado del sistema": {"en": "Run diagnostics and verify system status", "de": "Diagnose ausführen und Systemstatus überprüfen"},
    
    # === HOME ===
    "Información en tiempo real de tu dispositivo USB": {"en": "Real-time information of your USB device", "de": "Echtzeitinformationen Ihres USB-Geräts"},
    "📱 Información del Dispositivo": {"en": "📱 Device Information", "de": "📱 Geräteinformationen"},
    "Solicitar permisos y abrir conexión USB": {"en": "Request permissions and open USB connection", "de": "Berechtigungen anfordern und USB-Verbindung öffnen"},
    "Leer y verificar integridad de EEPROM (256 bytes)": {"en": "Read and verify EEPROM integrity (256 bytes)", "de": "EEPROM-Integrität lesen und überprüfen (256 Bytes)"},
    "Cerrar conexión USB de forma segura": {"en": "Close USB connection safely", "de": "USB-Verbindung sicher schließen"},
    "Copia de seguridad preventiva de EEPROM": {"en": "Preventive EEPROM backup", "de": "Präventives EEPROM-Backup"},
    "📊 Estadísticas": {"en": "📊 Statistics", "de": "📊 Statistiken"},
    "Estado del Servicio:": {"en": "Service Status:", "de": "Dienststatus:"},
    "Este dispositivo no es compatible con MIB2. Se recomienda aplicar el siguiente perfil:": {"en": "This device is not compatible with MIB2. It is recommended to apply the following profile:", "de": "Dieses Gerät ist nicht mit MIB2 kompatibel. Es wird empfohlen, das folgende Profil anzuwenden:"},
    "No hay dispositivos conectados": {"en": "No devices connected", "de": "Keine Geräte verbunden"},
    "Conecta un adaptador USB-Ethernet compatible para comenzar": {"en": "Connect a compatible USB-Ethernet adapter to begin", "de": "Schließen Sie einen kompatiblen USB-Ethernet-Adapter an, um zu beginnen"},
    "• Conecta el adaptador USB con un cable OTG": {"en": "• Connect the USB adapter with an OTG cable", "de": "• Verbinden Sie den USB-Adapter mit einem OTG-Kabel"},
    "• Asegúrate de que el adaptador tenga alimentación": {"en": "• Make sure the adapter has power", "de": "• Stellen Sie sicher, dass der Adapter mit Strom versorgt wird"},
    "• Los adaptadores ASIX son los más compatibles": {"en": "• ASIX adapters are the most compatible", "de": "• ASIX-Adapter sind am kompatibelsten"},
    "• Desliza hacia abajo para actualizar el estado": {"en": "• Swipe down to refresh status", "de": "• Nach unten wischen, um den Status zu aktualisieren"},
    "Conectar Adaptador USB": {"en": "Connect USB Adapter", "de": "USB-Adapter verbinden"},
    "Conecta tu adaptador USB-Ethernet al dispositivo Android usando un cable OTG con alimentación externa.": {"en": "Connect your USB-Ethernet adapter to the Android device using an OTG cable with external power.", "de": "Verbinden Sie Ihren USB-Ethernet-Adapter mit dem Android-Gerät über ein OTG-Kabel mit externer Stromversorgung."},
    "La app detectará automáticamente el chipset y mostrará si es compatible para spoofing MIB2.": {"en": "The app will automatically detect the chipset and show if it is compatible for MIB2 spoofing.", "de": "Die App erkennt automatisch den Chipsatz und zeigt an, ob er für MIB2-Spoofing kompatibel ist."},
    "Usa Auto Spoof para modificar automáticamente el VID/PID del adaptador a valores compatibles con MIB2.": {"en": "Use Auto Spoof to automatically modify the adapter VID/PID to MIB2 compatible values.", "de": "Verwenden Sie Auto Spoof, um die VID/PID des Adapters automatisch auf MIB2-kompatible Werte zu ändern."},
    "MIB2 USB Controller": {"en": "MIB2 USB Controller", "de": "MIB2 USB Controller"},
    "Control completo de tu unidad MIB2": {"en": "Complete control of your MIB2 unit", "de": "Vollständige Kontrolle über Ihre MIB2-Einheit"},
    "Inicio": {"en": "Home", "de": "Startseite"},
    "Auto Spoof": {"en": "Auto Spoof", "de": "Auto Spoof"},
    "Comandos": {"en": "Commands", "de": "Befehle"},
    "Diagnóstico": {"en": "Diagnostics", "de": "Diagnose"},
    
    # === DIAG ===
    "Diagnóstico del Sistema": {"en": "System Diagnostics", "de": "Systemdiagnose"},
    "Información detallada del sistema MIB2": {"en": "Detailed MIB2 system information", "de": "Detaillierte MIB2-Systeminformationen"},
    "Exportar Logs": {"en": "Export Logs", "de": "Logs exportieren"},
    "Información del Sistema": {"en": "System Information", "de": "Systeminformationen"},
    "Versión de Firmware": {"en": "Firmware Version", "de": "Firmware-Version"},
    "Número de Serie": {"en": "Serial Number", "de": "Seriennummer"},
    "Modelo": {"en": "Model", "de": "Modell"},
    "Estado de Memoria": {"en": "Memory Status", "de": "Speicherstatus"},
    "Memoria Total": {"en": "Total Memory", "de": "Gesamtspeicher"},
    "Memoria Libre": {"en": "Free Memory", "de": "Freier Speicher"},
    "Memoria Usada": {"en": "Used Memory", "de": "Verwendeter Speicher"},
    
    # === ERRORS ===
    "No se detectó ningún adaptador USB": {"en": "No USB adapter detected", "de": "Kein USB-Adapter erkannt"},
    "Permiso USB denegado": {"en": "USB permission denied", "de": "USB-Berechtigung verweigert"},
    "Error al leer EEPROM": {"en": "Error reading EEPROM", "de": "Fehler beim Lesen des EEPROM"},
    "Error al escribir EEPROM": {"en": "Error writing EEPROM", "de": "Fehler beim Schreiben des EEPROM"},
    "Error de verificación": {"en": "Verification error", "de": "Überprüfungsfehler"},
    "Error al crear backup": {"en": "Error creating backup", "de": "Fehler beim Erstellen des Backups"},
    "Error al restaurar backup": {"en": "Error restoring backup", "de": "Fehler beim Wiederherstellen des Backups"},
    "Error de red": {"en": "Network error", "de": "Netzwerkfehler"},
    "Tiempo de espera agotado": {"en": "Timeout expired", "de": "Zeitüberschreitung"},
    "Entrada inválida": {"en": "Invalid input", "de": "Ungültige Eingabe"},
    "Chipset incompatible con spoofing": {"en": "Chipset incompatible with spoofing", "de": "Chipsatz nicht kompatibel mit Spoofing"},
    "eFuse detectado - No se puede modificar": {"en": "eFuse detected - Cannot modify", "de": "eFuse erkannt - Kann nicht geändert werden"},
    "Ha ocurrido un error": {"en": "An error has occurred", "de": "Ein Fehler ist aufgetreten"},
    
    # === WARNINGS ===
    "⚠️ RIESGO DE BRICKING": {"en": "⚠️ BRICKING RISK", "de": "⚠️ BRICKING-RISIKO"},
    "Esta operación puede dañar permanentemente tu adaptador USB. Asegúrate de tener un backup antes de continuar.": {"en": "This operation can permanently damage your USB adapter. Make sure you have a backup before continuing.", "de": "Diese Operation kann Ihren USB-Adapter dauerhaft beschädigen. Stellen Sie sicher, dass Sie ein Backup haben, bevor Sie fortfahren."},
    "Esta función requiere modo experto": {"en": "This function requires expert mode", "de": "Diese Funktion erfordert den Expertenmodus"},
    "No tienes backups disponibles": {"en": "You have no backups available", "de": "Sie haben keine Backups verfügbar"},
    "Tienes cambios sin guardar": {"en": "You have unsaved changes", "de": "Sie haben ungespeicherte Änderungen"},
    "¿Estás seguro de que deseas eliminar?": {"en": "Are you sure you want to delete?", "de": "Sind Sie sicher, dass Sie löschen möchten?"},
    "Esta acción es irreversible": {"en": "This action is irreversible", "de": "Diese Aktion ist irreversibel"},
    
    # === SUCCESS ===
    "Spoofing completado exitosamente": {"en": "Spoofing completed successfully", "de": "Spoofing erfolgreich abgeschlossen"},
    "Backup creado exitosamente": {"en": "Backup created successfully", "de": "Backup erfolgreich erstellt"},
    "Backup restaurado exitosamente": {"en": "Backup restored successfully", "de": "Backup erfolgreich wiederhergestellt"},
    "Conexión establecida": {"en": "Connection established", "de": "Verbindung hergestellt"},
    "Comando ejecutado exitosamente": {"en": "Command executed successfully", "de": "Befehl erfolgreich ausgeführt"},
    "Configuración guardada": {"en": "Settings saved", "de": "Einstellungen gespeichert"},
    "PIN establecido exitosamente": {"en": "PIN set successfully", "de": "PIN erfolgreich festgelegt"},
    
    # === ALERTS ===
    "Código Duplicado": {"en": "Duplicate Code", "de": "Doppelter Code"},
    "Código Inválido": {"en": "Invalid Code", "de": "Ungültiger Code"},
    "Escaneo Completo": {"en": "Scan Complete", "de": "Scan abgeschlossen"},
    "Inyectando": {"en": "Injecting", "de": "Injizieren"},
    "Modo Experto Activado": {"en": "Expert Mode Activated", "de": "Expertenmodus aktiviert"},
    "Modo Experto Desactivado": {"en": "Expert Mode Deactivated", "de": "Expertenmodus deaktiviert"},
    "Múltiples Dispositivos": {"en": "Multiple Devices", "de": "Mehrere Geräte"},
    "No Conectado": {"en": "Not Connected", "de": "Nicht verbunden"},
    "PIN Incorrecto": {"en": "Incorrect PIN", "de": "Falsche PIN"},
    "PIN Inválido": {"en": "Invalid PIN", "de": "Ungültige PIN"},
    "PIN Restablecido": {"en": "PIN Reset", "de": "PIN zurückgesetzt"},
    "Sin Comando": {"en": "No Command", "de": "Kein Befehl"},
    "Sin Códigos": {"en": "No Codes", "de": "Keine Codes"},
    "Sin Resultados": {"en": "No Results", "de": "Keine Ergebnisse"},
    "✅ Éxito": {"en": "✅ Success", "de": "✅ Erfolg"},
    "✅ Copiado": {"en": "✅ Copied", "de": "✅ Kopiert"},
    "✅ Desconectado": {"en": "✅ Disconnected", "de": "✅ Getrennt"},
    "✅ Logs Exportados": {"en": "✅ Logs Exported", "de": "✅ Logs exportiert"},
    "💾 Creando Backup": {"en": "💾 Creating Backup", "de": "💾 Backup wird erstellt"},
    "Ahora tienes acceso a comandos avanzados": {"en": "You now have access to advanced commands", "de": "Sie haben jetzt Zugriff auf erweiterte Befehle"},
    "Backup eliminado": {"en": "Backup deleted", "de": "Backup gelöscht"},
    "Backup restaurado correctamente": {"en": "Backup restored successfully", "de": "Backup erfolgreich wiederhergestellt"},
    "Configuración guardada correctamente": {"en": "Settings saved successfully", "de": "Einstellungen erfolgreich gespeichert"},
    "Creando backup del binario crítico antes de continuar...": {"en": "Creating backup of critical binary before continuing...", "de": "Backup der kritischen Binärdatei wird vor dem Fortfahren erstellt..."},
    "Códigos FEC enviados. La unidad se reiniciará.": {"en": "FEC codes sent. The unit will restart.", "de": "FEC-Codes gesendet. Die Einheit wird neu gestartet."},
    "Debes conectarte a la unidad MIB2 primero": {"en": "You must connect to the MIB2 unit first", "de": "Sie müssen zuerst eine Verbindung zur MIB2-Einheit herstellen"},
    "Debes estar conectado por Telnet para ver los backups": {"en": "You must be connected via Telnet to view backups", "de": "Sie müssen über Telnet verbunden sein, um Backups anzuzeigen"},
    "El PIN actual es incorrecto": {"en": "Current PIN is incorrect", "de": "Aktuelle PIN ist falsch"},
    "El PIN debe tener al menos 4 dígitos": {"en": "PIN must have at least 4 digits", "de": "PIN muss mindestens 4 Ziffern haben"},
    "El PIN ha sido eliminado": {"en": "PIN has been deleted", "de": "PIN wurde gelöscht"},
    "El PIN ingresado no es válido": {"en": "Entered PIN is not valid", "de": "Eingegebene PIN ist ungültig"},
    "El archivo de backup no existe en el sistema": {"en": "Backup file does not exist in the system", "de": "Backup-Datei existiert nicht im System"},
    "El código FEC debe tener 8 dígitos hexadecimales.": {"en": "FEC code must have 8 hexadecimal digits.", "de": "FEC-Code muss 8 hexadezimale Ziffern haben."},
    "El dispositivo USB se desconectó correctamente.": {"en": "USB device disconnected successfully.", "de": "USB-Gerät erfolgreich getrennt."},
    "El dispositivo USB se desconectó. Por favor reconecta y vuelve a intentar.": {"en": "USB device disconnected. Please reconnect and try again.", "de": "USB-Gerät getrennt. Bitte erneut verbinden und versuchen."},
    "Error al ejecutar comando": {"en": "Error executing command", "de": "Fehler beim Ausführen des Befehls"},
    "Error al escanear la red": {"en": "Error scanning network", "de": "Fehler beim Scannen des Netzwerks"},
    "Error inesperado al crear backup. Operación cancelada.": {"en": "Unexpected error creating backup. Operation cancelled.", "de": "Unerwarteter Fehler beim Erstellen des Backups. Vorgang abgebrochen."},
    "Error inesperado al eliminar backup": {"en": "Unexpected error deleting backup", "de": "Unerwarteter Fehler beim Löschen des Backups"},
    "Error inesperado al restaurar backup": {"en": "Unexpected error restoring backup", "de": "Unerwarteter Fehler beim Wiederherstellen des Backups"},
    "Este código ya está en la lista.": {"en": "This code is already in the list.", "de": "Dieser Code ist bereits in der Liste."},
    "Este paso no tiene un comando asociado": {"en": "This step has no associated command", "de": "Dieser Schritt hat keinen zugehörigen Befehl"},
    "Historial eliminado": {"en": "History deleted", "de": "Verlauf gelöscht"},
    "Información de debug copiada al portapapeles": {"en": "Debug information copied to clipboard", "de": "Debug-Informationen in die Zwischenablage kopiert"},
    "Ingresa tu PIN de seguridad": {"en": "Enter your security PIN", "de": "Geben Sie Ihre Sicherheits-PIN ein"},
    "La función de compartir no está disponible en este dispositivo": {"en": "Share function is not available on this device", "de": "Teilen-Funktion ist auf diesem Gerät nicht verfügbar"},
    "Los PINs deben tener al menos 4 dígitos": {"en": "PINs must have at least 4 digits", "de": "PINs müssen mindestens 4 Ziffern haben"},
    "Los PINs no coinciden": {"en": "PINs do not match", "de": "PINs stimmen nicht überein"},
    "Los comandos avanzados están ahora ocultos": {"en": "Advanced commands are now hidden", "de": "Erweiterte Befehle sind jetzt ausgeblendet"},
    "Los nuevos PINs no coinciden": {"en": "New PINs do not match", "de": "Neue PINs stimmen nicht überein"},
    "No hay dispositivo USB conectado": {"en": "No USB device connected", "de": "Kein USB-Gerät verbunden"},
    "No hay dispositivo USB detectado": {"en": "No USB device detected", "de": "Kein USB-Gerät erkannt"},
    "No se encontraron unidades MIB2 en la red": {"en": "No MIB2 units found on the network", "de": "Keine MIB2-Einheiten im Netzwerk gefunden"},
    "No se encontraron unidades MIB2 en las IPs comunes": {"en": "No MIB2 units found at common IPs", "de": "Keine MIB2-Einheiten an gängigen IPs gefunden"},
    "No se encontró la ruta del archivo de backup": {"en": "Backup file path not found", "de": "Backup-Dateipfad nicht gefunden"},
    "No se pudieron cargar los backups": {"en": "Could not load backups", "de": "Backups konnten nicht geladen werden"},
    "No se pudo abrir el generador online": {"en": "Could not open online generator", "de": "Online-Generator konnte nicht geöffnet werden"},
    "No se pudo compartir el resultado": {"en": "Could not share result", "de": "Ergebnis konnte nicht geteilt werden"},
    "No se pudo conectar a la unidad MIB2": {"en": "Could not connect to MIB2 unit", "de": "Verbindung zur MIB2-Einheit konnte nicht hergestellt werden"},
    "No se pudo eliminar el backup": {"en": "Could not delete backup", "de": "Backup konnte nicht gelöscht werden"},
    "No se pudo generar el archivo ExceptionList.txt": {"en": "Could not generate ExceptionList.txt file", "de": "ExceptionList.txt-Datei konnte nicht generiert werden"},
    "No se pudo generar el script de instalación": {"en": "Could not generate installation script", "de": "Installationsskript konnte nicht generiert werden"},
    "No se pudo guardar la configuración": {"en": "Could not save settings", "de": "Einstellungen konnten nicht gespeichert werden"},
    "PIN cambiado correctamente": {"en": "PIN changed successfully", "de": "PIN erfolgreich geändert"},
    "PIN configurado correctamente": {"en": "PIN configured successfully", "de": "PIN erfolgreich konfiguriert"},
    "Selecciona al menos un código FEC": {"en": "Select at least one FEC code", "de": "Wählen Sie mindestens einen FEC-Code"},
    "Selecciona al menos un código FEC para generar el comando.": {"en": "Select at least one FEC code to generate the command.", "de": "Wählen Sie mindestens einen FEC-Code, um den Befehl zu generieren."},
    "Selecciona al menos un código FEC para generar la lista.": {"en": "Select at least one FEC code to generate the list.", "de": "Wählen Sie mindestens einen FEC-Code, um die Liste zu generieren."},
    "No se pudo compartir el backup:\n{{error}}": {"en": "Could not share backup:\n{{error}}", "de": "Backup konnte nicht geteilt werden:\n{{error}}"},
    "No se pudo realizar el test:\n\n{{error}}": {"en": "Could not perform test:\n\n{{error}}", "de": "Test konnte nicht durchgeführt werden:\n\n{{error}}"},
    "No se pudieron exportar los logs:\n{{error}}": {"en": "Could not export logs:\n{{error}}", "de": "Logs konnten nicht exportiert werden:\n{{error}}"},
    "Se encontraron {{count}} dispositivos. Selecciona uno de la lista.": {"en": "Found {{count}} devices. Select one from the list.", "de": "{{count}} Geräte gefunden. Wählen Sie eines aus der Liste."},
    "Se encontraron {{count}} dispositivos": {"en": "Found {{count}} devices", "de": "{{count}} Geräte gefunden"},
}

def translate_value(text, target_lang):
    """Traduce un valor usando el diccionario"""
    # Buscar coincidencia exacta
    if text in TRANSLATIONS:
        return TRANSLATIONS[text].get(target_lang, text)
    
    # Buscar coincidencia parcial (para textos largos)
    for es_text, trans in TRANSLATIONS.items():
        if es_text == text:
            return trans.get(target_lang, text)
    
    # Si es una referencia a alerts.*, mantener
    if text.startswith('alerts.'):
        return text
    
    # Mantener original si no hay traducción
    return text

def translate_dict(data, target_lang):
    """Traduce recursivamente un diccionario"""
    result = {}
    for key, value in data.items():
        if isinstance(value, dict):
            result[key] = translate_dict(value, target_lang)
        elif isinstance(value, str):
            result[key] = translate_value(value, target_lang)
        else:
            result[key] = value
    return result

def main():
    # Cargar español
    es_file = LOCALES_DIR / 'es.json'
    with open(es_file, 'r', encoding='utf-8') as f:
        es_data = json.load(f)
    
    # Traducir a inglés
    en_data = translate_dict(es_data, 'en')
    en_file = LOCALES_DIR / 'en.json'
    with open(en_file, 'w', encoding='utf-8') as f:
        json.dump(en_data, f, indent=2, ensure_ascii=False)
    print(f"✅ Generado: {en_file}")
    
    # Traducir a alemán
    de_data = translate_dict(es_data, 'de')
    de_file = LOCALES_DIR / 'de.json'
    with open(de_file, 'w', encoding='utf-8') as f:
        json.dump(de_data, f, indent=2, ensure_ascii=False)
    print(f"✅ Generado: {de_file}")
    
    # Contar traducciones
    def count_strings(d):
        count = 0
        for v in d.values():
            if isinstance(v, dict):
                count += count_strings(v)
            elif isinstance(v, str):
                count += 1
        return count
    
    def count_translated(es_d, trans_d):
        translated = 0
        for k, v in es_d.items():
            if isinstance(v, dict):
                translated += count_translated(v, trans_d.get(k, {}))
            elif isinstance(v, str):
                trans_v = trans_d.get(k, v)
                if trans_v != v:
                    translated += 1
        return translated
    
    total = count_strings(es_data)
    en_translated = count_translated(es_data, en_data)
    de_translated = count_translated(es_data, de_data)
    
    print(f"\n📊 Estadísticas:")
    print(f"   Total de strings: {total}")
    print(f"   Traducidos EN: {en_translated} ({en_translated*100//total}%)")
    print(f"   Traducidos DE: {de_translated} ({de_translated*100//total}%)")

if __name__ == '__main__':
    main()
