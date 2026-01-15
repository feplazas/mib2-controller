#!/usr/bin/env python3
"""
Traduce TODOS los textos restantes del español al inglés y alemán
usando un diccionario exhaustivo de términos técnicos MIB2
"""
import json
import re
from pathlib import Path

PROJECT_ROOT = Path('/home/ubuntu/mib2_controller')
LOCALES_DIR = PROJECT_ROOT / 'locales'

# Diccionario exhaustivo de palabras/frases ES -> EN, DE
WORD_TRANSLATIONS = {
    # Verbos
    "Muestra": {"en": "Shows", "de": "Zeigt"},
    "Lista": {"en": "Lists", "de": "Listet"},
    "Obtiene": {"en": "Gets", "de": "Ruft ab"},
    "Crea": {"en": "Creates", "de": "Erstellt"},
    "Activa": {"en": "Activates", "de": "Aktiviert"},
    "Desactiva": {"en": "Deactivates", "de": "Deaktiviert"},
    "Permite": {"en": "Allows", "de": "Ermöglicht"},
    "Restaura": {"en": "Restores", "de": "Stellt wieder her"},
    "Reinicia": {"en": "Restarts", "de": "Startet neu"},
    "Termina": {"en": "Terminates", "de": "Beendet"},
    "Elimina": {"en": "Deletes", "de": "Löscht"},
    "Prueba": {"en": "Tests", "de": "Testet"},
    "Verifica": {"en": "Verifies", "de": "Überprüft"},
    "Conectar": {"en": "Connect", "de": "Verbinden"},
    "Iniciar": {"en": "Start", "de": "Starten"},
    "reproducir": {"en": "play", "de": "abspielen"},
    
    # Sustantivos
    "la versión": {"en": "the version", "de": "die Version"},
    "el sistema operativo": {"en": "the operating system", "de": "das Betriebssystem"},
    "información": {"en": "information", "de": "Informationen"},
    "del procesador": {"en": "of the processor", "de": "des Prozessors"},
    "el número de serie": {"en": "the serial number", "de": "die Seriennummer"},
    "de la unidad": {"en": "of the unit", "de": "der Einheit"},
    "la versión de hardware": {"en": "the hardware version", "de": "die Hardware-Version"},
    "el uso actual": {"en": "the current usage", "de": "die aktuelle Nutzung"},
    "de memoria": {"en": "of memory", "de": "des Speichers"},
    "todos los dispositivos": {"en": "all devices", "de": "alle Geräte"},
    "y puntos de montaje": {"en": "and mount points", "de": "und Einhängepunkte"},
    "configuración": {"en": "configuration", "de": "Konfiguration"},
    "de interfaces de red": {"en": "of network interfaces", "de": "der Netzwerkschnittstellen"},
    "todos los procesos activos": {"en": "all active processes", "de": "alle aktiven Prozesse"},
    "el uso de espacio en disco": {"en": "disk space usage", "de": "die Festplattennutzung"},
    "la temperatura actual": {"en": "the current temperature", "de": "die aktuelle Temperatur"},
    "del sistema": {"en": "of the system", "de": "des Systems"},
    "todas las adaptaciones disponibles": {"en": "all available adaptations", "de": "alle verfügbaren Anpassungen"},
    "un backup": {"en": "a backup", "de": "ein Backup"},
    "de las adaptaciones actuales": {"en": "of current adaptations", "de": "der aktuellen Anpassungen"},
    "el menú de ingeniería": {"en": "the engineering menu", "de": "das Engineering-Menü"},
    "Green Menu": {"en": "Green Menu", "de": "Green Menu"},
    "video": {"en": "video", "de": "Video"},
    "mientras el vehículo está en movimiento": {"en": "while the vehicle is in motion", "de": "während das Fahrzeug in Bewegung ist"},
    "las líneas guía": {"en": "the guide lines", "de": "die Hilfslinien"},
    "en la cámara de reversa": {"en": "on the reverse camera", "de": "bei der Rückfahrkamera"},
    "todos los skins instalados": {"en": "all installed skins", "de": "alle installierten Skins"},
    "el skin actualmente activo": {"en": "the currently active skin", "de": "den aktuell aktiven Skin"},
    "del skin actual": {"en": "of the current skin", "de": "des aktuellen Skins"},
    "el skin de fábrica": {"en": "the factory skin", "de": "den Werks-Skin"},
    "el estado": {"en": "the status", "de": "den Status"},
    "de la conexión WiFi": {"en": "of the WiFi connection", "de": "der WLAN-Verbindung"},
    "la tabla de rutas de red": {"en": "the network routing table", "de": "die Netzwerk-Routing-Tabelle"},
    "conectividad con el gateway": {"en": "connectivity with the gateway", "de": "die Konnektivität mit dem Gateway"},
    "los servidores DNS configurados": {"en": "the configured DNS servers", "de": "die konfigurierten DNS-Server"},
    "el contenido": {"en": "the contents", "de": "den Inhalt"},
    "del directorio raíz": {"en": "of the root directory", "de": "des Stammverzeichnisses"},
    "archivos": {"en": "files", "de": "Dateien"},
    "en la partición de persistencia": {"en": "in the persistence partition", "de": "in der Persistenz-Partition"},
    "en la partición del sistema": {"en": "in the system partition", "de": "in der Systempartition"},
    "información de particiones": {"en": "partition information", "de": "Partitionsinformationen"},
    "la unidad MIB2": {"en": "the MIB2 unit", "de": "die MIB2-Einheit"},
    "un proceso específico": {"en": "a specific process", "de": "einen bestimmten Prozess"},
    "requiere PID": {"en": "requires PID", "de": "erfordert PID"},
    "los archivos de log": {"en": "the log files", "de": "die Protokolldateien"},
    "todas las adaptaciones": {"en": "all adaptations", "de": "alle Anpassungen"},
    "a valores de fábrica": {"en": "to factory values", "de": "auf Werkseinstellungen"},
    
    # Hardware/Firmware
    "Revisión A": {"en": "Revision A", "de": "Revision A"},
    "Revisión B": {"en": "Revision B", "de": "Revision B"},
    "Revisión B+": {"en": "Revision B+", "de": "Revision B+"},
    "Vista Sport": {"en": "Sport View", "de": "Sport-Ansicht"},
    "Hardware con Limitaciones": {"en": "Hardware with Limitations", "de": "Hardware mit Einschränkungen"},
    "Firmware con Problemas Conocidos": {"en": "Firmware with Known Issues", "de": "Firmware mit bekannten Problemen"},
    "Hardware No Identificado": {"en": "Unidentified Hardware", "de": "Nicht identifizierte Hardware"},
    "Firmware No Identificado": {"en": "Unidentified Firmware", "de": "Nicht identifizierte Firmware"},
    
    # Validaciones y advertencias
    "No se puede validar": {"en": "Cannot validate", "de": "Kann nicht validiert werden"},
    "la compatibilidad de códigos FEC": {"en": "FEC code compatibility", "de": "die FEC-Code-Kompatibilität"},
    "sin identificar el hardware": {"en": "without identifying the hardware", "de": "ohne die Hardware zu identifizieren"},
    "No se puede garantizar": {"en": "Cannot guarantee", "de": "Kann nicht garantiert werden"},
    "que el método de inyección funcione correctamente": {"en": "that the injection method will work correctly", "de": "dass die Injektionsmethode korrekt funktioniert"},
    "Validación de Inyección FEC": {"en": "FEC Injection Validation", "de": "FEC-Injektions-Validierung"},
    "La inyección de códigos FEC sortea": {"en": "FEC code injection bypasses", "de": "FEC-Code-Injektion umgeht"},
    "la validación de firmware": {"en": "firmware validation", "de": "die Firmware-Validierung"},
    "⚠️ ADVERTENCIA CRÍTICA": {"en": "⚠️ CRITICAL WARNING", "de": "⚠️ KRITISCHE WARNUNG"},
    "XDS+ en Modo": {"en": "XDS+ in Mode", "de": "XDS+ im Modus"},
    "NO configurar el XDS+ en modo": {"en": "DO NOT configure XDS+ in mode", "de": "XDS+ NICHT im Modus konfigurieren"},
    "Recomendación": {"en": "Recommendation", "de": "Empfehlung"},
    "VAQ Tracción Aumentada": {"en": "VAQ Enhanced Traction", "de": "VAQ Erhöhte Traktion"},
    "Para maximizar tracción": {"en": "To maximize traction", "de": "Um die Traktion zu maximieren"},
    "ajustar el VAQ a": {"en": "adjust VAQ to", "de": "VAQ anpassen auf"},
    "Limitación": {"en": "Limitation", "de": "Einschränkung"},
    "La Vista Sport solo está disponible": {"en": "Sport View is only available", "de": "Sport-Ansicht ist nur verfügbar"},
    "en unidades de hardware revisión B+": {"en": "on hardware revision B+ units", "de": "auf Hardware-Revision B+-Einheiten"},
    "Acceso Directo eMMC": {"en": "Direct eMMC Access", "de": "Direkter eMMC-Zugriff"},
    "El acceso directo al chip eMMC": {"en": "Direct access to the eMMC chip", "de": "Der direkte Zugriff auf den eMMC-Chip"},
    "es un método avanzado": {"en": "is an advanced method", "de": "ist eine fortgeschrittene Methode"},
    "que puede dañar permanentemente la unidad": {"en": "that can permanently damage the unit", "de": "die die Einheit dauerhaft beschädigen kann"},
    
    # Instrucciones
    "Conectar Adaptador USB-Ethernet": {"en": "Connect USB-Ethernet Adapter", "de": "USB-Ethernet-Adapter verbinden"},
    "Conectar el adaptador D-Link DUB-E100": {"en": "Connect the D-Link DUB-E100 adapter", "de": "D-Link DUB-E100-Adapter anschließen"},
    "al puerto USB de la unidad MIB2": {"en": "to the MIB2 unit USB port", "de": "an den USB-Anschluss der MIB2-Einheit"},
    "La unidad MIB2 generalmente tiene": {"en": "The MIB2 unit usually has", "de": "Die MIB2-Einheit hat normalerweise"},
    "una dirección IP estática": {"en": "a static IP address", "de": "eine statische IP-Adresse"},
    "Verificar que se puede hacer ping": {"en": "Verify that you can ping", "de": "Überprüfen Sie, dass Sie pingen können"},
    "a la unidad MIB2 antes de continuar": {"en": "the MIB2 unit before continuing", "de": "die MIB2-Einheit, bevor Sie fortfahren"},
    "Conectar por Telnet": {"en": "Connect via Telnet", "de": "Über Telnet verbinden"},
    "El servicio Telnet": {"en": "The Telnet service", "de": "Der Telnet-Dienst"},
    "puerto 23": {"en": "port 23", "de": "Port 23"},
    "puede estar activo pero protegido": {"en": "may be active but protected", "de": "kann aktiv, aber geschützt sein"},
    "Iniciar Sesión como Root": {"en": "Log in as Root", "de": "Als Root anmelden"},
    
    # Categorías
    "Sistema": {"en": "System", "de": "System"},
    "Red": {"en": "Network", "de": "Netzwerk"},
    "Adaptaciones": {"en": "Adaptations", "de": "Anpassungen"},
    "Skins": {"en": "Skins", "de": "Skins"},
    "Archivos": {"en": "Files", "de": "Dateien"},
    "Peligroso": {"en": "Dangerous", "de": "Gefährlich"},
}

def translate_text(text, target_lang):
    """Traduce un texto usando el diccionario de palabras"""
    result = text
    
    # Ordenar por longitud descendente para evitar reemplazos parciales
    sorted_phrases = sorted(WORD_TRANSLATIONS.keys(), key=len, reverse=True)
    
    for phrase in sorted_phrases:
        if phrase in result:
            translation = WORD_TRANSLATIONS[phrase].get(target_lang, phrase)
            result = result.replace(phrase, translation)
    
    return result

def translate_dict(es_data, target_lang):
    """Traduce recursivamente un diccionario"""
    result = {}
    for key, value in es_data.items():
        if isinstance(value, dict):
            result[key] = translate_dict(value, target_lang)
        elif isinstance(value, str):
            # Si empieza con alerts., mantener
            if value.startswith('alerts.'):
                result[key] = value
            else:
                result[key] = translate_text(value, target_lang)
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
