#!/usr/bin/env python3
"""
Traducciones adicionales para comandos MIB2 y textos técnicos
"""
import json
from pathlib import Path

PROJECT_ROOT = Path('/home/ubuntu/mib2_controller')
LOCALES_DIR = PROJECT_ROOT / 'locales'

# Traducciones adicionales para comandos MIB2
ADDITIONAL_TRANSLATIONS = {
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
    
    # Adaptaciones
    "Lista todas las adaptaciones disponibles": {"en": "Lists all available adaptations", "de": "Listet alle verfügbaren Anpassungen auf"},
    "Crea un backup de las adaptaciones actuales": {"en": "Creates a backup of current adaptations", "de": "Erstellt ein Backup der aktuellen Anpassungen"},
    "Activa el menú de ingeniería (Green Menu)": {"en": "Activates the engineering menu (Green Menu)", "de": "Aktiviert das Engineering-Menü (Green Menu)"},
    "Desactiva el menú de ingeniería (Green Menu)": {"en": "Deactivates the engineering menu (Green Menu)", "de": "Deaktiviert das Engineering-Menü (Green Menu)"},
    "Permite reproducir video mientras el vehículo está en movimiento": {"en": "Allows video playback while vehicle is in motion", "de": "Ermöglicht Videowiedergabe während der Fahrt"},
    "Activa las líneas guía en la cámara de reversa": {"en": "Activates guide lines on reverse camera", "de": "Aktiviert Hilfslinien bei der Rückfahrkamera"},
    
    # Skins
    "Lista todos los skins instalados": {"en": "Lists all installed skins", "de": "Listet alle installierten Skins auf"},
    "Muestra el skin actualmente activo": {"en": "Shows currently active skin", "de": "Zeigt den aktuell aktiven Skin an"},
    "Crea un backup del skin actual": {"en": "Creates a backup of current skin", "de": "Erstellt ein Backup des aktuellen Skins"},
    "Restaura el skin de fábrica": {"en": "Restores factory skin", "de": "Stellt den Werks-Skin wieder her"},
    
    # Red
    "Muestra el estado de la conexión WiFi": {"en": "Shows WiFi connection status", "de": "Zeigt den WLAN-Verbindungsstatus an"},
    "Muestra la tabla de rutas de red": {"en": "Shows network routing table", "de": "Zeigt die Netzwerk-Routing-Tabelle an"},
    "Prueba conectividad con el gateway": {"en": "Tests connectivity with gateway", "de": "Testet die Konnektivität mit dem Gateway"},
    "Muestra los servidores DNS configurados": {"en": "Shows configured DNS servers", "de": "Zeigt die konfigurierten DNS-Server an"},
    
    # Sistema de archivos
    "Lista el contenido del directorio raíz": {"en": "Lists root directory contents", "de": "Listet den Inhalt des Stammverzeichnisses auf"},
    "Lista archivos en la partición de persistencia": {"en": "Lists files in persistence partition", "de": "Listet Dateien in der Persistenz-Partition auf"},
    "Lista archivos en la partición del sistema": {"en": "Lists files in system partition", "de": "Listet Dateien in der Systempartition auf"},
    "Muestra información de particiones": {"en": "Shows partition information", "de": "Zeigt Partitionsinformationen an"},
    
    # Comandos peligrosos
    "Reinicia la unidad MIB2": {"en": "Restarts the MIB2 unit", "de": "Startet die MIB2-Einheit neu"},
    "Termina un proceso específico (requiere PID)": {"en": "Terminates a specific process (requires PID)", "de": "Beendet einen bestimmten Prozess (erfordert PID)"},
    "Elimina los archivos de log del sistema": {"en": "Deletes system log files", "de": "Löscht Systemprotokolldateien"},
    "Restaura todas las adaptaciones a valores de fábrica": {"en": "Restores all adaptations to factory values", "de": "Stellt alle Anpassungen auf Werkseinstellungen zurück"},
    
    # Hardware
    "MIB2 STD2 Revisión A": {"en": "MIB2 STD2 Revision A", "de": "MIB2 STD2 Revision A"},
    "MIB2 STD2 Revisión B": {"en": "MIB2 STD2 Revision B", "de": "MIB2 STD2 Revision B"},
    "MIB2 STD2 Revisión B+ (Vista Sport)": {"en": "MIB2 STD2 Revision B+ (Sport View)", "de": "MIB2 STD2 Revision B+ (Sport-Ansicht)"},
    "Hardware con Limitaciones": {"en": "Hardware with Limitations", "de": "Hardware mit Einschränkungen"},
    "Firmware con Problemas Conocidos": {"en": "Firmware with Known Issues", "de": "Firmware mit bekannten Problemen"},
    "Hardware No Identificado": {"en": "Unidentified Hardware", "de": "Nicht identifizierte Hardware"},
    "Firmware No Identificado": {"en": "Unidentified Firmware", "de": "Nicht identifizierte Firmware"},
    
    # Validaciones
    "No se puede validar la compatibilidad de códigos FEC sin identificar el hardware": {"en": "Cannot validate FEC code compatibility without identifying hardware", "de": "FEC-Code-Kompatibilität kann ohne Hardware-Identifizierung nicht validiert werden"},
    "No se puede garantizar que el método de inyección funcione correctamente": {"en": "Cannot guarantee that the injection method will work correctly", "de": "Es kann nicht garantiert werden, dass die Injektionsmethode korrekt funktioniert"},
    "Validación de Inyección FEC": {"en": "FEC Injection Validation", "de": "FEC-Injektions-Validierung"},
    "La inyección de códigos FEC sortea la validación de firmware": {"en": "FEC code injection bypasses firmware validation", "de": "FEC-Code-Injektion umgeht die Firmware-Validierung"},
    
    # Advertencias
    "⚠️ ADVERTENCIA CRÍTICA: XDS+ en Modo": {"en": "⚠️ CRITICAL WARNING: XDS+ in Mode", "de": "⚠️ KRITISCHE WARNUNG: XDS+ im Modus"},
    "NO configurar el XDS+ en modo": {"en": "DO NOT configure XDS+ in mode", "de": "XDS+ NICHT im Modus konfigurieren"},
    "Recomendación: VAQ Tracción Aumentada": {"en": "Recommendation: VAQ Enhanced Traction", "de": "Empfehlung: VAQ Erhöhte Traktion"},
    "Para maximizar tracción, ajustar el VAQ a": {"en": "To maximize traction, adjust VAQ to", "de": "Um die Traktion zu maximieren, VAQ anpassen auf"},
    "Limitación: Vista Sport": {"en": "Limitation: Sport View", "de": "Einschränkung: Sport-Ansicht"},
    "La Vista Sport solo está disponible en unidades de hardware revisión B+": {"en": "Sport View is only available on hardware revision B+ units", "de": "Sport-Ansicht ist nur auf Hardware-Revision B+-Einheiten verfügbar"},
    "⚠️ ADVERTENCIA CRÍTICA: Acceso Directo eMMC": {"en": "⚠️ CRITICAL WARNING: Direct eMMC Access", "de": "⚠️ KRITISCHE WARNUNG: Direkter eMMC-Zugriff"},
    "El acceso directo al chip eMMC es un método avanzado que puede dañar permanentemente la unidad": {"en": "Direct access to eMMC chip is an advanced method that can permanently damage the unit", "de": "Der direkte Zugriff auf den eMMC-Chip ist eine fortgeschrittene Methode, die die Einheit dauerhaft beschädigen kann"},
    
    # Instrucciones de conexión
    "Conectar Adaptador USB-Ethernet": {"en": "Connect USB-Ethernet Adapter", "de": "USB-Ethernet-Adapter verbinden"},
    "Conectar el adaptador D-Link DUB-E100 al puerto USB de la unidad MIB2": {"en": "Connect the D-Link DUB-E100 adapter to the MIB2 unit USB port", "de": "D-Link DUB-E100-Adapter an den USB-Anschluss der MIB2-Einheit anschließen"},
    "La unidad MIB2 generalmente tiene una dirección IP estática 192.168.1.4": {"en": "The MIB2 unit usually has a static IP address 192.168.1.4", "de": "Die MIB2-Einheit hat normalerweise eine statische IP-Adresse 192.168.1.4"},
    "Verificar que se puede hacer ping a la unidad MIB2 antes de continuar": {"en": "Verify that you can ping the MIB2 unit before continuing", "de": "Überprüfen Sie, dass Sie die MIB2-Einheit pingen können, bevor Sie fortfahren"},
    "Conectar por Telnet": {"en": "Connect via Telnet", "de": "Über Telnet verbinden"},
    "El servicio Telnet (puerto 23) puede estar activo pero protegido": {"en": "Telnet service (port 23) may be active but protected", "de": "Telnet-Dienst (Port 23) kann aktiv, aber geschützt sein"},
    "Iniciar Sesión como Root": {"en": "Log in as Root", "de": "Als Root anmelden"},
    
    # Categorías de comandos
    "Sistema": {"en": "System", "de": "System"},
    "Red": {"en": "Network", "de": "Netzwerk"},
    "Adaptaciones": {"en": "Adaptations", "de": "Anpassungen"},
    "Skins": {"en": "Skins", "de": "Skins"},
    "Archivos": {"en": "Files", "de": "Dateien"},
    "Peligroso": {"en": "Dangerous", "de": "Gefährlich"},
    
    # Otros
    "Ejecutar": {"en": "Execute", "de": "Ausführen"},
    "Copiar": {"en": "Copy", "de": "Kopieren"},
    "Compartir": {"en": "Share", "de": "Teilen"},
    "Actualizar": {"en": "Refresh", "de": "Aktualisieren"},
    "Buscar": {"en": "Search", "de": "Suchen"},
    "Filtrar": {"en": "Filter", "de": "Filtern"},
    "Ordenar": {"en": "Sort", "de": "Sortieren"},
    "Seleccionar": {"en": "Select", "de": "Auswählen"},
    "Deseleccionar": {"en": "Deselect", "de": "Abwählen"},
    "Seleccionar todo": {"en": "Select all", "de": "Alle auswählen"},
    "Deseleccionar todo": {"en": "Deselect all", "de": "Alle abwählen"},
    "Ninguno": {"en": "None", "de": "Keine"},
    "Todos": {"en": "All", "de": "Alle"},
    "Activo": {"en": "Active", "de": "Aktiv"},
    "Inactivo": {"en": "Inactive", "de": "Inaktiv"},
    "Habilitado": {"en": "Enabled", "de": "Aktiviert"},
    "Deshabilitado": {"en": "Disabled", "de": "Deaktiviert"},
    "Disponible": {"en": "Available", "de": "Verfügbar"},
    "No disponible": {"en": "Not available", "de": "Nicht verfügbar"},
    "Pendiente": {"en": "Pending", "de": "Ausstehend"},
    "Completado": {"en": "Completed", "de": "Abgeschlossen"},
    "Fallido": {"en": "Failed", "de": "Fehlgeschlagen"},
    "En progreso": {"en": "In progress", "de": "In Bearbeitung"},
    "Cancelado": {"en": "Cancelled", "de": "Abgebrochen"},
    "Desconocido": {"en": "Unknown", "de": "Unbekannt"},
    "N/A": {"en": "N/A", "de": "N/V"},
    "Sí": {"en": "Yes", "de": "Ja"},
    "No": {"en": "No", "de": "Nein"},
    "OK": {"en": "OK", "de": "OK"},
    "Aceptar": {"en": "Accept", "de": "Akzeptieren"},
    "Rechazar": {"en": "Reject", "de": "Ablehnen"},
    "Reintentar": {"en": "Retry", "de": "Wiederholen"},
    "Omitir": {"en": "Skip", "de": "Überspringen"},
    "Anterior": {"en": "Previous", "de": "Zurück"},
    "Listo": {"en": "Done", "de": "Fertig"},
    "Aplicar": {"en": "Apply", "de": "Anwenden"},
    "Restablecer": {"en": "Reset", "de": "Zurücksetzen"},
    "Predeterminado": {"en": "Default", "de": "Standard"},
    "Personalizado": {"en": "Custom", "de": "Benutzerdefiniert"},
    "Avanzado": {"en": "Advanced", "de": "Erweitert"},
    "Básico": {"en": "Basic", "de": "Einfach"},
    "Detalles": {"en": "Details", "de": "Details"},
    "Resumen": {"en": "Summary", "de": "Zusammenfassung"},
    "Información": {"en": "Information", "de": "Information"},
    "Ayuda": {"en": "Help", "de": "Hilfe"},
    "Soporte": {"en": "Support", "de": "Support"},
    "Contacto": {"en": "Contact", "de": "Kontakt"},
    "Privacidad": {"en": "Privacy", "de": "Datenschutz"},
    "Términos": {"en": "Terms", "de": "Bedingungen"},
    "Créditos": {"en": "Credits", "de": "Credits"},
}

def apply_translations(locale_file, translations, target_lang):
    """Aplica traducciones adicionales a un archivo de locale"""
    with open(locale_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    def translate_recursive(d, es_data):
        for key, value in d.items():
            if isinstance(value, dict):
                es_sub = es_data.get(key, {}) if isinstance(es_data, dict) else {}
                translate_recursive(value, es_sub)
            elif isinstance(value, str):
                # Si el valor es igual al español, buscar traducción
                es_value = es_data.get(key, '') if isinstance(es_data, dict) else ''
                if value == es_value or value.startswith('[TODO:'):
                    # Buscar traducción
                    for es_text, trans in translations.items():
                        if es_text in value:
                            d[key] = value.replace(es_text, trans.get(target_lang, es_text))
                            break
    
    # Cargar español para comparar
    with open(LOCALES_DIR / 'es.json', 'r', encoding='utf-8') as f:
        es_data = json.load(f)
    
    translate_recursive(data, es_data)
    
    with open(locale_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return data

def main():
    # Aplicar traducciones adicionales
    en_file = LOCALES_DIR / 'en.json'
    de_file = LOCALES_DIR / 'de.json'
    
    apply_translations(en_file, ADDITIONAL_TRANSLATIONS, 'en')
    print(f"✅ Traducciones adicionales aplicadas a: {en_file}")
    
    apply_translations(de_file, ADDITIONAL_TRANSLATIONS, 'de')
    print(f"✅ Traducciones adicionales aplicadas a: {de_file}")

if __name__ == '__main__':
    main()
