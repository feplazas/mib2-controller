#!/usr/bin/env python3
"""
Genera traducciones completas EN/DE copiando la estructura exacta de es.json
y aplicando traducciones del diccionario
"""
import json
import re
from pathlib import Path

PROJECT_ROOT = Path('/home/ubuntu/mib2_controller')
LOCALES_DIR = PROJECT_ROOT / 'locales'

# Diccionario completo de traducciones ES -> EN, DE
# Ordenado por longitud descendente para evitar reemplazos parciales
TRANSLATIONS = {
    # Frases largas primero
    "Esta aplicación permite ejecutar comandos con privilegios root en la unidad MIB2. \n              El uso incorrecto puede resultar en daños permanentes al sistema. \n              Usa esta herramienta bajo tu propia responsabilidad.": {
        "en": "This application allows executing commands with root privileges on the MIB2 unit. Incorrect use may result in permanent system damage. Use this tool at your own risk.",
        "de": "Diese Anwendung ermöglicht die Ausführung von Befehlen mit Root-Rechten auf der MIB2-Einheit. Falsche Verwendung kann zu dauerhaften Systemschäden führen. Verwenden Sie dieses Tool auf eigene Gefahr."
    },
    "Esta aplicación permite ejecutar comandos directamente en la unidad MIB2. \n              Usa con precaución y solo si sabes lo que estás haciendo. Los comandos \n              incorrectos pueden dañar el sistema.": {
        "en": "This application allows executing commands directly on the MIB2 unit. Use with caution and only if you know what you are doing. Incorrect commands can damage the system.",
        "de": "Diese Anwendung ermöglicht die direkte Ausführung von Befehlen auf der MIB2-Einheit. Mit Vorsicht verwenden und nur wenn Sie wissen, was Sie tun. Falsche Befehle können das System beschädigen."
    },
    "Omite la verificación post-escritura. Úsalo solo si la verificación normal falla debido a protección de escritura del adaptador. Después del spoofing, desconecta y reconecta el adaptador para verificar manualmente.": {
        "en": "Skips post-write verification. Use only if normal verification fails due to adapter write protection. After spoofing, disconnect and reconnect the adapter to verify manually.",
        "de": "Überspringt die Nachschreibprüfung. Nur verwenden, wenn die normale Überprüfung aufgrund des Schreibschutzes des Adapters fehlschlägt. Nach dem Spoofing den Adapter trennen und wieder anschließen, um manuell zu überprüfen."
    },
    "Si algo falla, la única forma de recuperar la unidad es mediante acceso directo a la memoria eMMC (soldadura).": {
        "en": "If something fails, the only way to recover the unit is through direct access to eMMC memory (soldering).",
        "de": "Wenn etwas fehlschlägt, ist die einzige Möglichkeit, die Einheit wiederherzustellen, der direkte Zugriff auf den eMMC-Speicher (Löten)."
    },
    "Los backups se crean automáticamente antes de modificar archivos críticos del sistema MIB2.": {
        "en": "Backups are automatically created before modifying critical MIB2 system files.",
        "de": "Backups werden automatisch erstellt, bevor kritische MIB2-Systemdateien geändert werden."
    },
    "El acceso directo al chip eMMC es un método avanzado que puede dañar permanentemente la unidad": {
        "en": "Direct access to eMMC chip is an advanced method that can permanently damage the unit",
        "de": "Der direkte Zugriff auf den eMMC-Chip ist eine fortgeschrittene Methode, die die Einheit dauerhaft beschädigen kann"
    },
    "Tienes acceso a comandos que pueden dañar la unidad MIB2. Procede con extrema precaución.": {
        "en": "You have access to commands that can damage the MIB2 unit. Proceed with extreme caution.",
        "de": "Sie haben Zugriff auf Befehle, die die MIB2-Einheit beschädigen können. Gehen Sie mit äußerster Vorsicht vor."
    },
    "Conecta tu adaptador USB-Ethernet al dispositivo Android usando un cable OTG con alimentación externa.": {
        "en": "Connect your USB-Ethernet adapter to the Android device using an OTG cable with external power.",
        "de": "Verbinden Sie Ihren USB-Ethernet-Adapter mit dem Android-Gerät über ein OTG-Kabel mit externer Stromversorgung."
    },
    "La app detectará automáticamente el chipset y mostrará si es compatible para spoofing MIB2.": {
        "en": "The app will automatically detect the chipset and show if it is compatible for MIB2 spoofing.",
        "de": "Die App erkennt automatisch den Chipsatz und zeigt an, ob er für MIB2-Spoofing kompatibel ist."
    },
    "Usa Auto Spoof para modificar automáticamente el VID/PID del adaptador a valores compatibles con MIB2.": {
        "en": "Use Auto Spoof to automatically modify the adapter VID/PID to MIB2 compatible values.",
        "de": "Verwenden Sie Auto Spoof, um die VID/PID des Adapters automatisch auf MIB2-kompatible Werte zu ändern."
    },
    "Este dispositivo no es compatible con MIB2. Se recomienda aplicar el siguiente perfil:": {
        "en": "This device is not compatible with MIB2. It is recommended to apply the following profile:",
        "de": "Dieses Gerät ist nicht mit MIB2 kompatibel. Es wird empfohlen, das folgende Profil anzuwenden:"
    },
    "Reprogramación automática de EEPROM para adaptadores ASIX compatibles": {
        "en": "Automatic EEPROM reprogramming for compatible ASIX adapters",
        "de": "Automatische EEPROM-Neuprogrammierung für kompatible ASIX-Adapter"
    },
    "Para generación de códigos personalizados basados en VIN/VCRN": {
        "en": "For custom code generation based on VIN/VCRN",
        "de": "Für benutzerdefinierte Codegenerierung basierend auf VIN/VCRN"
    },
    "La Vista Sport solo está disponible en unidades de hardware revisión B+": {
        "en": "Sport View is only available on hardware revision B+ units",
        "de": "Sport-Ansicht ist nur auf Hardware-Revision B+-Einheiten verfügbar"
    },
    "No se puede validar la compatibilidad de códigos FEC sin identificar el hardware": {
        "en": "Cannot validate FEC code compatibility without identifying hardware",
        "de": "FEC-Code-Kompatibilität kann ohne Hardware-Identifizierung nicht validiert werden"
    },
    "No se puede garantizar que el método de inyección funcione correctamente": {
        "en": "Cannot guarantee that the injection method will work correctly",
        "de": "Es kann nicht garantiert werden, dass die Injektionsmethode korrekt funktioniert"
    },
    "La inyección de códigos FEC sortea la validación de firmware": {
        "en": "FEC code injection bypasses firmware validation",
        "de": "FEC-Code-Injektion umgeht die Firmware-Validierung"
    },
    "La unidad MIB2 generalmente tiene una dirección IP estática 192.168.1.4": {
        "en": "The MIB2 unit usually has a static IP address 192.168.1.4",
        "de": "Die MIB2-Einheit hat normalerweise eine statische IP-Adresse 192.168.1.4"
    },
    "Verificar que se puede hacer ping a la unidad MIB2 antes de continuar": {
        "en": "Verify that you can ping the MIB2 unit before continuing",
        "de": "Überprüfen Sie, dass Sie die MIB2-Einheit pingen können, bevor Sie fortfahren"
    },
    "El servicio Telnet (puerto 23) puede estar activo pero protegido": {
        "en": "Telnet service (port 23) may be active but protected",
        "de": "Telnet-Dienst (Port 23) kann aktiv, aber geschützt sein"
    },
    "Conectar el adaptador D-Link DUB-E100 al puerto USB de la unidad MIB2": {
        "en": "Connect the D-Link DUB-E100 adapter to the MIB2 unit USB port",
        "de": "D-Link DUB-E100-Adapter an den USB-Anschluss der MIB2-Einheit anschließen"
    },
    
    # Frases medianas
    "Conecta un adaptador USB-Ethernet compatible para comenzar": {"en": "Connect a compatible USB-Ethernet adapter to begin", "de": "Schließen Sie einen kompatiblen USB-Ethernet-Adapter an, um zu beginnen"},
    "Conecta un adaptador compatible para continuar": {"en": "Connect a compatible adapter to continue", "de": "Schließen Sie einen kompatiblen Adapter an, um fortzufahren"},
    "Con triple confirmación y validaciones completas": {"en": "With triple confirmation and complete validations", "de": "Mit dreifacher Bestätigung und vollständigen Validierungen"},
    "Ejecuta spoofing con una sola confirmación": {"en": "Executes spoofing with a single confirmation", "de": "Führt Spoofing mit einer einzigen Bestätigung aus"},
    "Verifica si el adaptador tiene VID/PID 0x2001:0x3C05": {"en": "Verifies if the adapter has VID/PID 0x2001:0x3C05", "de": "Überprüft, ob der Adapter VID/PID 0x2001:0x3C05 hat"},
    "Información en tiempo real de tu dispositivo USB": {"en": "Real-time information of your USB device", "de": "Echtzeitinformationen Ihres USB-Geräts"},
    "Leer y verificar integridad de EEPROM (256 bytes)": {"en": "Read and verify EEPROM integrity (256 bytes)", "de": "EEPROM-Integrität lesen und überprüfen (256 Bytes)"},
    "Solicitar permisos y abrir conexión USB": {"en": "Request permissions and open USB connection", "de": "Berechtigungen anfordern und USB-Verbindung öffnen"},
    "Cerrar conexión USB de forma segura": {"en": "Close USB connection safely", "de": "USB-Verbindung sicher schließen"},
    "Copia de seguridad preventiva de EEPROM": {"en": "Preventive EEPROM backup", "de": "Präventives EEPROM-Backup"},
    "Dirección IP de la unidad MIB2 en la red local": {"en": "MIB2 unit IP address on the local network", "de": "IP-Adresse der MIB2-Einheit im lokalen Netzwerk"},
    "Usuario para autenticación Telnet": {"en": "User for Telnet authentication", "de": "Benutzer für Telnet-Authentifizierung"},
    "Contraseña para autenticación Telnet": {"en": "Password for Telnet authentication", "de": "Passwort für Telnet-Authentifizierung"},
    "Un error puede BRICKEAR la unidad MIB2": {"en": "An error can BRICK the MIB2 unit", "de": "Ein Fehler kann die MIB2-Einheit BRICKEN"},
    "No interrumpas el proceso una vez iniciado.": {"en": "Do not interrupt the process once started.", "de": "Unterbrechen Sie den Vorgang nicht, sobald er gestartet wurde."},
    "Información del adaptador conectado": {"en": "Connected adapter information", "de": "Informationen zum angeschlossenen Adapter"},
    "Generar códigos FEC personalizados": {"en": "Generate custom FEC codes", "de": "Benutzerdefinierte FEC-Codes generieren"},
    "Utilidades avanzadas para MIB2": {"en": "Advanced utilities for MIB2", "de": "Erweiterte Dienstprogramme für MIB2"},
    "Ajusta los parámetros de la aplicación": {"en": "Adjust application parameters", "de": "Anwendungsparameter anpassen"},
    "Nuevo PIN (mínimo 4 dígitos)": {"en": "New PIN (minimum 4 digits)", "de": "Neue PIN (mindestens 4 Ziffern)"},
    "Para unidades MIB2 STD2 Technisat/Preh": {"en": "For MIB2 STD2 Technisat/Preh units", "de": "Für MIB2 STD2 Technisat/Preh-Einheiten"},
    
    # Comandos del sistema
    "Muestra la versión del sistema operativo QNX": {"en": "Shows QNX operating system version", "de": "Zeigt die QNX-Betriebssystemversion an"},
    "Muestra información del procesador": {"en": "Shows processor information", "de": "Zeigt Prozessorinformationen an"},
    "Obtiene el número de serie de la unidad": {"en": "Gets the unit serial number", "de": "Ruft die Seriennummer der Einheit ab"},
    "Muestra la versión de hardware de la unidad": {"en": "Shows the unit hardware version", "de": "Zeigt die Hardware-Version der Einheit an"},
    "Muestra el uso actual de memoria": {"en": "Shows current memory usage", "de": "Zeigt die aktuelle Speichernutzung an"},
    "Lista todos los dispositivos y puntos de montaje": {"en": "Lists all devices and mount points", "de": "Listet alle Geräte und Einhängepunkte auf"},
    "Muestra configuración de interfaces de red": {"en": "Shows network interface configuration", "de": "Zeigt die Netzwerkschnittstellenkonfiguration an"},
    "Lista todos los procesos activos": {"en": "Lists all active processes", "de": "Listet alle aktiven Prozesse auf"},
    "Muestra el uso de espacio en disco": {"en": "Shows disk space usage", "de": "Zeigt die Festplattennutzung an"},
    "Muestra la temperatura actual del sistema": {"en": "Shows current system temperature", "de": "Zeigt die aktuelle Systemtemperatur an"},
    "Lista todas las adaptaciones disponibles": {"en": "Lists all available adaptations", "de": "Listet alle verfügbaren Anpassungen auf"},
    "Crea un backup de las adaptaciones actuales": {"en": "Creates a backup of current adaptations", "de": "Erstellt ein Backup der aktuellen Anpassungen"},
    "Activa el menú de ingeniería (Green Menu)": {"en": "Activates the engineering menu (Green Menu)", "de": "Aktiviert das Engineering-Menü (Green Menu)"},
    "Desactiva el menú de ingeniería (Green Menu)": {"en": "Deactivates the engineering menu (Green Menu)", "de": "Deaktiviert das Engineering-Menü (Green Menu)"},
    "Permite reproducir video mientras el vehículo está en movimiento": {"en": "Allows video playback while vehicle is in motion", "de": "Ermöglicht Videowiedergabe während der Fahrt"},
    "Activa las líneas guía en la cámara de reversa": {"en": "Activates guide lines on reverse camera", "de": "Aktiviert Hilfslinien bei der Rückfahrkamera"},
    "Lista todos los skins instalados": {"en": "Lists all installed skins", "de": "Listet alle installierten Skins auf"},
    "Muestra el skin actualmente activo": {"en": "Shows currently active skin", "de": "Zeigt den aktuell aktiven Skin an"},
    "Crea un backup del skin actual": {"en": "Creates a backup of current skin", "de": "Erstellt ein Backup des aktuellen Skins"},
    "Restaura el skin de fábrica": {"en": "Restores factory skin", "de": "Stellt den Werks-Skin wieder her"},
    "Muestra el estado de la conexión WiFi": {"en": "Shows WiFi connection status", "de": "Zeigt den WLAN-Verbindungsstatus an"},
    "Muestra la tabla de rutas de red": {"en": "Shows network routing table", "de": "Zeigt die Netzwerk-Routing-Tabelle an"},
    "Prueba conectividad con el gateway": {"en": "Tests connectivity with gateway", "de": "Testet die Konnektivität mit dem Gateway"},
    "Muestra los servidores DNS configurados": {"en": "Shows configured DNS servers", "de": "Zeigt die konfigurierten DNS-Server an"},
    "Lista el contenido del directorio raíz": {"en": "Lists root directory contents", "de": "Listet den Inhalt des Stammverzeichnisses auf"},
    "Lista archivos en la partición de persistencia": {"en": "Lists files in persistence partition", "de": "Listet Dateien in der Persistenz-Partition auf"},
    "Lista archivos en la partición del sistema": {"en": "Lists files in system partition", "de": "Listet Dateien in der Systempartition auf"},
    "Muestra información de particiones": {"en": "Shows partition information", "de": "Zeigt Partitionsinformationen an"},
    "Reinicia la unidad MIB2": {"en": "Restarts the MIB2 unit", "de": "Startet die MIB2-Einheit neu"},
    "Termina un proceso específico (requiere PID)": {"en": "Terminates a specific process (requires PID)", "de": "Beendet einen bestimmten Prozess (erfordert PID)"},
    "Elimina los archivos de log del sistema": {"en": "Deletes system log files", "de": "Löscht Systemprotokolldateien"},
    "Restaura todas las adaptaciones a valores de fábrica": {"en": "Restores all adaptations to factory values", "de": "Stellt alle Anpassungen auf Werkseinstellungen zurück"},
    "Muestra información detallada del hardware y procesador": {"en": "Shows detailed hardware and processor information", "de": "Zeigt detaillierte Hardware- und Prozessorinformationen an"},
    
    # Palabras y frases cortas
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
    "Copiar": {"en": "Copy", "de": "Kopieren"},
    "Compartir": {"en": "Share", "de": "Teilen"},
    "Actualizar": {"en": "Refresh", "de": "Aktualisieren"},
    "Buscar": {"en": "Search", "de": "Suchen"},
    "Ejecutar": {"en": "Execute", "de": "Ausführen"},
    "Enviar": {"en": "Send", "de": "Senden"},
    "Limpiar": {"en": "Clear", "de": "Löschen"},
    
    # Títulos y secciones
    "Inicio": {"en": "Home", "de": "Startseite"},
    "Configuración": {"en": "Settings", "de": "Einstellungen"},
    "Diagnóstico": {"en": "Diagnostics", "de": "Diagnose"},
    "Comandos": {"en": "Commands", "de": "Befehle"},
    "Recuperación": {"en": "Recovery", "de": "Wiederherstellung"},
    "Herramientas": {"en": "Tools", "de": "Werkzeuge"},
    "Caja de Herramientas": {"en": "Toolbox", "de": "Werkzeugkasten"},
    "Terminal Telnet": {"en": "Telnet Terminal", "de": "Telnet-Terminal"},
    "Generador FEC": {"en": "FEC Generator", "de": "FEC-Generator"},
    "Auto Spoof": {"en": "Auto Spoof", "de": "Auto Spoof"},
    "Estado USB": {"en": "USB Status", "de": "USB-Status"},
    "Escaneo de Red": {"en": "Network Scan", "de": "Netzwerk-Scan"},
    "Acciones Rápidas": {"en": "Quick Actions", "de": "Schnellaktionen"},
    "Comandos Rápidos": {"en": "Quick Commands", "de": "Schnellbefehle"},
    "Información del Sistema": {"en": "System Information", "de": "Systeminformationen"},
    "Información del Dispositivo": {"en": "Device Information", "de": "Geräteinformationen"},
    "Información de la App": {"en": "App Information", "de": "App-Informationen"},
    "Información Técnica": {"en": "Technical Information", "de": "Technische Informationen"},
    "Estado de Conexión": {"en": "Connection Status", "de": "Verbindungsstatus"},
    "Estado de Conexión USB": {"en": "USB Connection Status", "de": "USB-Verbindungsstatus"},
    "Dispositivo Actual": {"en": "Current Device", "de": "Aktuelles Gerät"},
    "Dispositivo Conectado": {"en": "Connected Device", "de": "Verbundenes Gerät"},
    "Dispositivo Detectado": {"en": "Device Detected", "de": "Gerät erkannt"},
    "Sin Dispositivo USB": {"en": "No USB Device", "de": "Kein USB-Gerät"},
    "No hay dispositivo conectado": {"en": "No device connected", "de": "Kein Gerät verbunden"},
    "No hay dispositivos conectados": {"en": "No devices connected", "de": "Keine Geräte verbunden"},
    "Gestión de Backups": {"en": "Backup Management", "de": "Backup-Verwaltung"},
    "Gestión de Datos": {"en": "Data Management", "de": "Datenverwaltung"},
    "Configuración de Conexión": {"en": "Connection Settings", "de": "Verbindungseinstellungen"},
    "PIN de Seguridad": {"en": "Security PIN", "de": "Sicherheits-PIN"},
    "Configurar PIN de Seguridad": {"en": "Configure Security PIN", "de": "Sicherheits-PIN konfigurieren"},
    "Instrucciones de Conexión": {"en": "Connection Instructions", "de": "Verbindungsanweisungen"},
    "Pasos de Instalación": {"en": "Installation Steps", "de": "Installationsschritte"},
    "Estado de Prerequisitos": {"en": "Prerequisites Status", "de": "Voraussetzungsstatus"},
    "Comandos de Diagnóstico": {"en": "Diagnostic Commands", "de": "Diagnosebefehle"},
    "Comando de Inyección": {"en": "Injection Command", "de": "Injektionsbefehl"},
    "Comando de Verificación": {"en": "Verification Command", "de": "Überprüfungsbefehl"},
    "Códigos FEC Predefinidos": {"en": "Predefined FEC Codes", "de": "Vordefinierte FEC-Codes"},
    "Agregar Código Personalizado": {"en": "Add Custom Code", "de": "Benutzerdefinierten Code hinzufügen"},
    "Agregar Código": {"en": "Add Code", "de": "Code hinzufügen"},
    "Ver Comando de Inyección": {"en": "View Injection Command", "de": "Injektionsbefehl anzeigen"},
    "Datos del Vehículo (Opcional)": {"en": "Vehicle Data (Optional)", "de": "Fahrzeugdaten (Optional)"},
    "VCRN (Número de Serie)": {"en": "VCRN (Serial Number)", "de": "VCRN (Seriennummer)"},
    "Nota Técnica": {"en": "Technical Note", "de": "Technischer Hinweis"},
    "Advertencia de Seguridad": {"en": "Security Warning", "de": "Sicherheitswarnung"},
    "ADVERTENCIA CRÍTICA": {"en": "CRITICAL WARNING", "de": "KRITISCHE WARNUNG"},
    "Spoofing Automático": {"en": "Automatic Spoofing", "de": "Automatisches Spoofing"},
    "Forzar sin Verificación": {"en": "Force without Verification", "de": "Ohne Überprüfung erzwingen"},
    "Forzar Restauración": {"en": "Force Restore", "de": "Wiederherstellung erzwingen"},
    "Guardar PIN": {"en": "Save PIN", "de": "PIN speichern"},
    "Limpiar Historial de Comandos": {"en": "Clear Command History", "de": "Befehlsverlauf löschen"},
    "Copiar Info de Debug": {"en": "Copy Debug Info", "de": "Debug-Info kopieren"},
    "Volver a la lista": {"en": "Back to list", "de": "Zurück zur Liste"},
    "Continuar Sin Backup": {"en": "Continue Without Backup", "de": "Ohne Backup fortfahren"},
    "Creando backup de seguridad": {"en": "Creating security backup", "de": "Sicherheitsbackup wird erstellt"},
    "No hay backups disponibles": {"en": "No backups available", "de": "Keine Backups verfügbar"},
    "Asistente de instalación": {"en": "Installation wizard", "de": "Installationsassistent"},
    "Conectar Adaptador USB": {"en": "Connect USB Adapter", "de": "USB-Adapter verbinden"},
    "Conectar Adaptador USB-Ethernet": {"en": "Connect USB-Ethernet Adapter", "de": "USB-Ethernet-Adapter verbinden"},
    "Conecta un adaptador USB-Ethernet": {"en": "Connect a USB-Ethernet adapter", "de": "USB-Ethernet-Adapter verbinden"},
    "Conectar a MIB2": {"en": "Connect to MIB2", "de": "Mit MIB2 verbinden"},
    "Conectar por Telnet": {"en": "Connect via Telnet", "de": "Über Telnet verbinden"},
    "Iniciar Sesión como Root": {"en": "Log in as Root", "de": "Als Root anmelden"},
    "Dirección IP": {"en": "IP Address", "de": "IP-Adresse"},
    "Contraseña": {"en": "Password", "de": "Passwort"},
    "Versión": {"en": "Version", "de": "Version"},
    "Creada por": {"en": "Created by", "de": "Erstellt von"},
    "Creada por Felipe Plazas": {"en": "Created by Felipe Plazas", "de": "Erstellt von Felipe Plazas"},
    "Compatible con": {"en": "Compatible with", "de": "Kompatibel mit"},
    "Módulo Nativo:": {"en": "Native Module:", "de": "Natives Modul:"},
    "Estado del Servicio:": {"en": "Service Status:", "de": "Dienststatus:"},
    "Estadísticas": {"en": "Statistics", "de": "Statistiken"},
    "Diagnósticos": {"en": "Diagnostics", "de": "Diagnose"},
    "Método eMMC": {"en": "eMMC Method", "de": "eMMC-Methode"},
    "Éxitos": {"en": "Successes", "de": "Erfolge"},
    "Sí, Continuar": {"en": "Yes, Continue", "de": "Ja, Fortfahren"},
    "NO, Cancelar": {"en": "NO, Cancel", "de": "NEIN, Abbrechen"},
    "SÍ, Ejecutar": {"en": "YES, Execute", "de": "JA, Ausführen"},
    
    # Hardware
    "MIB2 STD2 Revisión A": {"en": "MIB2 STD2 Revision A", "de": "MIB2 STD2 Revision A"},
    "MIB2 STD2 Revisión B": {"en": "MIB2 STD2 Revision B", "de": "MIB2 STD2 Revision B"},
    "MIB2 STD2 Revisión B+ (Vista Sport)": {"en": "MIB2 STD2 Revision B+ (Sport View)", "de": "MIB2 STD2 Revision B+ (Sport-Ansicht)"},
    "Hardware con Limitaciones": {"en": "Hardware with Limitations", "de": "Hardware mit Einschränkungen"},
    "Firmware con Problemas Conocidos": {"en": "Firmware with Known Issues", "de": "Firmware mit bekannten Problemen"},
    "Hardware No Identificado": {"en": "Unidentified Hardware", "de": "Nicht identifizierte Hardware"},
    "Firmware No Identificado": {"en": "Unidentified Firmware", "de": "Nicht identifizierte Firmware"},
    "Validación de Inyección FEC": {"en": "FEC Injection Validation", "de": "FEC-Injektions-Validierung"},
    "Limitación: Vista Sport": {"en": "Limitation: Sport View", "de": "Einschränkung: Sport-Ansicht"},
    "Recomendación: VAQ Tracción Aumentada": {"en": "Recommendation: VAQ Enhanced Traction", "de": "Empfehlung: VAQ Erhöhte Traktion"},
    "Para maximizar tracción, ajustar el VAQ a": {"en": "To maximize traction, adjust VAQ to", "de": "Um die Traktion zu maximieren, VAQ anpassen auf"},
    "NO configurar el XDS+ en modo": {"en": "DO NOT configure XDS+ in mode", "de": "XDS+ NICHT im Modus konfigurieren"},
    "XDS+ en Modo": {"en": "XDS+ in Mode", "de": "XDS+ im Modus"},
    "Acceso Directo eMMC": {"en": "Direct eMMC Access", "de": "Direkter eMMC-Zugriff"},
    
    # Instrucciones numeradas
    "1. Conecta el adaptador USB-Ethernet al puerto USB de la unidad MIB2": {"en": "1. Connect the USB-Ethernet adapter to the MIB2 unit USB port", "de": "1. Verbinden Sie den USB-Ethernet-Adapter mit dem USB-Anschluss der MIB2-Einheit"},
    "2. Conecta tu dispositivo Android a la misma red (WiFi o adaptador Ethernet)": {"en": "2. Connect your Android device to the same network (WiFi or Ethernet adapter)", "de": "2. Verbinden Sie Ihr Android-Gerät mit demselben Netzwerk (WLAN oder Ethernet-Adapter)"},
    "3. Verifica que la unidad MIB2 tenga Telnet habilitado (root/root)": {"en": "3. Verify that the MIB2 unit has Telnet enabled (root/root)", "de": "3. Stellen Sie sicher, dass die MIB2-Einheit Telnet aktiviert hat (root/root)"},
    "4. Ingresa la dirección IP de la unidad (por defecto: 192.168.1.4)": {"en": "4. Enter the unit IP address (default: 192.168.1.4)", "de": "4. Geben Sie die IP-Adresse der Einheit ein (Standard: 192.168.1.4)"},
    "5. Presiona &quot;Conectar a MIB2&quot; para establecer la conexión": {"en": "5. Press \"Connect to MIB2\" to establish the connection", "de": "5. Drücken Sie \"Mit MIB2 verbinden\", um die Verbindung herzustellen"},
    
    # Bullets
    "• Esta operación es IRREVERSIBLE sin backup": {"en": "• This operation is IRREVERSIBLE without backup", "de": "• Diese Operation ist IRREVERSIBEL ohne Backup"},
    "• NO desconectes el adaptador durante el proceso": {"en": "• DO NOT disconnect the adapter during the process", "de": "• Trennen Sie den Adapter NICHT während des Vorgangs"},
    "• Solo funciona con ASIX AX88772A/B con EEPROM externa": {"en": "• Only works with ASIX AX88772A/B with external EEPROM", "de": "• Funktioniert nur mit ASIX AX88772A/B mit externem EEPROM"},
    "• Dispositivos con eFuse NO son compatibles": {"en": "• Devices with eFuse are NOT compatible", "de": "• Geräte mit eFuse sind NICHT kompatibel"},
    "• Se creará un backup automático antes de escribir": {"en": "• An automatic backup will be created before writing", "de": "• Ein automatisches Backup wird vor dem Schreiben erstellt"},
    "• Conecta el adaptador USB con un cable OTG": {"en": "• Connect the USB adapter with an OTG cable", "de": "• Verbinden Sie den USB-Adapter mit einem OTG-Kabel"},
    "• Asegúrate de que el adaptador tenga alimentación": {"en": "• Make sure the adapter has power", "de": "• Stellen Sie sicher, dass der Adapter mit Strom versorgt wird"},
    "• Los adaptadores ASIX son los más compatibles": {"en": "• ASIX adapters are the most compatible", "de": "• ASIX-Adapter sind am kompatibelsten"},
    "• Desliza hacia abajo para actualizar el estado": {"en": "• Swipe down to refresh status", "de": "• Nach unten wischen, um den Status zu aktualisieren"},
    
    # Validaciones
    "VIN inválido (debe tener 17 caracteres alfanuméricos)": {"en": "Invalid VIN (must have 17 alphanumeric characters)", "de": "Ungültige VIN (muss 17 alphanumerische Zeichen haben)"},
    "VCRN inválido (debe tener entre 8 y 20 caracteres)": {"en": "Invalid VCRN (must have between 8 and 20 characters)", "de": "Ungültige VCRN (muss zwischen 8 und 20 Zeichen haben)"},
    "⚠️ Completa los prerequisitos antes de instalar": {"en": "⚠️ Complete prerequisites before installing", "de": "⚠️ Voraussetzungen vor der Installation abschließen"},
    
    # Emojis con texto
    "📝 Nota Técnica": {"en": "📝 Technical Note", "de": "📝 Technischer Hinweis"},
    "📱 Dispositivo Conectado": {"en": "📱 Connected Device", "de": "📱 Verbundenes Gerät"},
    "📱 Dispositivo Actual": {"en": "📱 Current Device", "de": "📱 Aktuelles Gerät"},
    "📱 Información del Dispositivo": {"en": "📱 Device Information", "de": "📱 Geräteinformationen"},
    "🔌 Estado de Conexión": {"en": "🔌 Connection Status", "de": "🔌 Verbindungsstatus"},
    "🔧 Spoofing Automático": {"en": "🔧 Automatic Spoofing", "de": "🔧 Automatisches Spoofing"},
    "⚙️ Información Técnica": {"en": "⚙️ Technical Information", "de": "⚙️ Technische Informationen"},
    "⚙️ Método eMMC": {"en": "⚙️ eMMC Method", "de": "⚙️ eMMC-Methode"},
    "📋 Copiar Info de Debug": {"en": "📋 Copy Debug Info", "de": "📋 Debug-Info kopieren"},
    "📊 Estadísticas": {"en": "📊 Statistics", "de": "📊 Statistiken"},
    "🔍 Diagnósticos": {"en": "🔍 Diagnostics", "de": "🔍 Diagnose"},
    "💾 Gestión de Backups": {"en": "💾 Backup Management", "de": "💾 Backup-Verwaltung"},
    "💾 Creando Backup": {"en": "💾 Creating Backup", "de": "💾 Backup wird erstellt"},
    "⚠️ Forzar sin Verificación": {"en": "⚠️ Force without Verification", "de": "⚠️ Ohne Überprüfung erzwingen"},
    "⚠️ Advertencia": {"en": "⚠️ Warning", "de": "⚠️ Warnung"},
    "⚠️ Advertencia de Seguridad": {"en": "⚠️ Security Warning", "de": "⚠️ Sicherheitswarnung"},
    "⚠️ ADVERTENCIA CRÍTICA: XDS+ en Modo": {"en": "⚠️ CRITICAL WARNING: XDS+ in Mode", "de": "⚠️ KRITISCHE WARNUNG: XDS+ im Modus"},
    "⚠️ ADVERTENCIA CRÍTICA: Acceso Directo eMMC": {"en": "⚠️ CRITICAL WARNING: Direct eMMC Access", "de": "⚠️ KRITISCHE WARNUNG: Direkter eMMC-Zugriff"},
    "❌ Error": {"en": "❌ Error", "de": "❌ Fehler"},
    "✅ Éxito": {"en": "✅ Success", "de": "✅ Erfolg"},
    "✅ Copiado": {"en": "✅ Copied", "de": "✅ Kopiert"},
    "✅ Desconectado": {"en": "✅ Disconnected", "de": "✅ Getrennt"},
    "✅ Logs Exportados": {"en": "✅ Logs Exported", "de": "✅ Logs exportiert"},
}

def translate_value(text, target_lang):
    """Traduce un valor usando el diccionario"""
    # Buscar coincidencia exacta primero
    if text in TRANSLATIONS:
        return TRANSLATIONS[text].get(target_lang, text)
    
    # Buscar coincidencia parcial
    result = text
    sorted_keys = sorted(TRANSLATIONS.keys(), key=len, reverse=True)
    for key in sorted_keys:
        if key in result:
            result = result.replace(key, TRANSLATIONS[key].get(target_lang, key))
    
    return result

def translate_dict(data, target_lang):
    """Traduce recursivamente un diccionario"""
    result = {}
    for key, value in data.items():
        if isinstance(value, dict):
            result[key] = translate_dict(value, target_lang)
        elif isinstance(value, str):
            if value.startswith('alerts.'):
                result[key] = value
            else:
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
    def count_same(es_d, trans_d):
        same = 0
        total = 0
        for k, v in es_d.items():
            if isinstance(v, dict):
                s, t = count_same(v, trans_d.get(k, {}))
                same += s
                total += t
            elif isinstance(v, str):
                total += 1
                trans_v = trans_d.get(k, v)
                if trans_v == v and not v.startswith('alerts.'):
                    same += 1
        return same, total
    
    en_same, total = count_same(es_data, en_data)
    de_same, _ = count_same(es_data, de_data)
    
    print(f"\n📊 Estadísticas:")
    print(f"   Total de strings: {total}")
    print(f"   Sin traducir EN: {en_same} ({en_same*100//total}%)")
    print(f"   Sin traducir DE: {de_same} ({de_same*100//total}%)")
    print(f"   Traducidos EN: {total - en_same} ({(total-en_same)*100//total}%)")
    print(f"   Traducidos DE: {total - de_same} ({(total-de_same)*100//total}%)")

if __name__ == '__main__':
    main()
