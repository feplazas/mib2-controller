#!/usr/bin/env python3
"""
Script para generar claves de traducción en ES/EN/DE a partir del análisis de Alert.alert
"""
import json
import re
from pathlib import Path

def text_to_key(text):
    """Convierte texto español a clave snake_case"""
    # Eliminar emojis y caracteres especiales
    text = re.sub(r'[✅❌💾\n${}()]', '', text)
    # Convertir a minúsculas
    text = text.lower()
    # Reemplazar espacios y caracteres especiales por guiones bajos
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', '_', text)
    # Truncar a 50 caracteres
    text = text[:50]
    # Eliminar guiones bajos al inicio y final
    text = text.strip('_')
    return text

def translate_to_english(spanish_text):
    """Traducciones manuales ES -> EN"""
    translations = {
        'Error': 'Error',
        'Éxito': 'Success',
        'No Conectado': 'Not Connected',
        'Sin Resultados': 'No Results',
        'Sin Códigos': 'No Codes',
        'Sin Comando': 'No Command',
        'Código Inválido': 'Invalid Code',
        'Código Duplicado': 'Duplicate Code',
        'PIN Inválido': 'Invalid PIN',
        'PIN Incorrecto': 'Incorrect PIN',
        'PIN Restablecido': 'PIN Reset',
        'Modo Experto Activado': 'Expert Mode Enabled',
        'Modo Experto Desactivado': 'Expert Mode Disabled',
        'Múltiples Dispositivos': 'Multiple Devices',
        'Escaneo Completo': 'Scan Complete',
        'Inyectando': 'Injecting',
        '✅ Éxito': 'Success',
        '✅ Copiado': 'Copied',
        '✅ Desconectado': 'Disconnected',
        '✅ Logs Exportados': 'Logs Exported',
        '❌ Error': 'Error',
        '💾 Creando Backup': 'Creating Backup',
        
        # Mensajes
        'No hay dispositivo USB conectado': 'No USB device connected',
        'No hay dispositivo USB detectado': 'No USB device detected',
        'Debes conectarte a la unidad MIB2 primero': 'You must connect to the MIB2 unit first',
        'Debes estar conectado por Telnet para ver los backups': 'You must be connected via Telnet to view backups',
        'El dispositivo USB se desconectó correctamente.': 'USB device disconnected successfully.',
        'El dispositivo USB se desconectó. Por favor reconecta y vuelve a intentar.': 'USB device disconnected. Please reconnect and try again.',
        'Configuración guardada correctamente': 'Settings saved successfully',
        'No se pudo guardar la configuración': 'Could not save settings',
        'El PIN debe tener al menos 4 dígitos': 'PIN must be at least 4 digits',
        'Los PINs no coinciden': 'PINs do not match',
        'Los nuevos PINs no coinciden': 'New PINs do not match',
        'PIN configurado correctamente': 'PIN configured successfully',
        'PIN cambiado correctamente': 'PIN changed successfully',
        'El PIN ingresado no es válido': 'The entered PIN is not valid',
        'El PIN actual es incorrecto': 'Current PIN is incorrect',
        'El PIN ha sido eliminado': 'PIN has been removed',
        'Ingresa tu PIN de seguridad': 'Enter your security PIN',
        'Los PINs deben tener al menos 4 dígitos': 'PINs must be at least 4 digits',
        'Ahora tienes acceso a comandos avanzados': 'You now have access to advanced commands',
        'Los comandos avanzados están ahora ocultos': 'Advanced commands are now hidden',
        'Historial eliminado': 'History cleared',
        'No se encontraron unidades MIB2 en la red': 'No MIB2 units found on the network',
        'No se encontraron unidades MIB2 en las IPs comunes': 'No MIB2 units found on common IPs',
        'Error al escanear la red': 'Error scanning network',
        'No se pudo conectar a la unidad MIB2': 'Could not connect to MIB2 unit',
        'Información de debug copiada al portapapeles': 'Debug information copied to clipboard',
        'Este paso no tiene un comando asociado': 'This step has no associated command',
        'Error al ejecutar comando': 'Error executing command',
        'No se pudieron cargar los backups': 'Could not load backups',
        'No se pudo generar el script de instalación': 'Could not generate installation script',
        'Creando backup del binario crítico antes de continuar...': 'Creating backup of critical binary before continuing...',
        'Error inesperado al crear backup. Operación cancelada.': 'Unexpected error creating backup. Operation cancelled.',
        'Backup eliminado': 'Backup deleted',
        'Error inesperado al eliminar backup': 'Unexpected error deleting backup',
        'No se pudo eliminar el backup': 'Could not delete backup',
        'Backup restaurado correctamente': 'Backup restored successfully',
        'Error inesperado al restaurar backup': 'Unexpected error restoring backup',
        'No se encontró la ruta del archivo de backup': 'Backup file path not found',
        'El archivo de backup no existe en el sistema': 'Backup file does not exist on the system',
        'La función de compartir no está disponible en este dispositivo': 'Share function is not available on this device',
        'No se pudo compartir el resultado': 'Could not share result',
        'El código FEC debe tener 8 dígitos hexadecimales.': 'FEC code must be 8 hexadecimal digits.',
        'Este código ya está en la lista.': 'This code is already in the list.',
        'Selecciona al menos un código FEC para generar la lista.': 'Select at least one FEC code to generate the list.',
        'No se pudo generar el archivo ExceptionList.txt': 'Could not generate ExceptionList.txt file',
        'Selecciona al menos un código FEC para generar el comando.': 'Select at least one FEC code to generate the command.',
        'Selecciona al menos un código FEC': 'Select at least one FEC code',
        'Códigos FEC enviados. La unidad se reiniciará.': 'FEC codes sent. Unit will reboot.',
        'No se pudo abrir el generador online': 'Could not open online generator',
    }
    return translations.get(spanish_text, spanish_text)

def translate_to_german(spanish_text):
    """Traducciones manuales ES -> DE"""
    translations = {
        'Error': 'Fehler',
        'Éxito': 'Erfolg',
        'No Conectado': 'Nicht Verbunden',
        'Sin Resultados': 'Keine Ergebnisse',
        'Sin Códigos': 'Keine Codes',
        'Sin Comando': 'Kein Befehl',
        'Código Inválido': 'Ungültiger Code',
        'Código Duplicado': 'Doppelter Code',
        'PIN Inválido': 'Ungültige PIN',
        'PIN Incorrecto': 'Falsche PIN',
        'PIN Restablecido': 'PIN Zurückgesetzt',
        'Modo Experto Activado': 'Expertenmodus Aktiviert',
        'Modo Experto Desactivado': 'Expertenmodus Deaktiviert',
        'Múltiples Dispositivos': 'Mehrere Geräte',
        'Escaneo Completo': 'Scan Abgeschlossen',
        'Inyectando': 'Wird Injiziert',
        '✅ Éxito': 'Erfolg',
        '✅ Copiado': 'Kopiert',
        '✅ Desconectado': 'Getrennt',
        '✅ Logs Exportados': 'Logs Exportiert',
        '❌ Error': 'Fehler',
        '💾 Creando Backup': 'Backup Wird Erstellt',
        
        # Mensajes
        'No hay dispositivo USB conectado': 'Kein USB-Gerät angeschlossen',
        'No hay dispositivo USB detectado': 'Kein USB-Gerät erkannt',
        'Debes conectarte a la unidad MIB2 primero': 'Sie müssen sich zuerst mit der MIB2-Einheit verbinden',
        'Debes estar conectado por Telnet para ver los backups': 'Sie müssen über Telnet verbunden sein, um Backups anzuzeigen',
        'El dispositivo USB se desconectó correctamente.': 'USB-Gerät erfolgreich getrennt.',
        'El dispositivo USB se desconectó. Por favor reconecta y vuelve a intentar.': 'USB-Gerät getrennt. Bitte erneut verbinden und wiederholen.',
        'Configuración guardada correctamente': 'Einstellungen erfolgreich gespeichert',
        'No se pudo guardar la configuración': 'Einstellungen konnten nicht gespeichert werden',
        'El PIN debe tener al menos 4 dígitos': 'PIN muss mindestens 4 Ziffern haben',
        'Los PINs no coinciden': 'PINs stimmen nicht überein',
        'Los nuevos PINs no coinciden': 'Neue PINs stimmen nicht überein',
        'PIN configurado correctamente': 'PIN erfolgreich konfiguriert',
        'PIN cambiado correctamente': 'PIN erfolgreich geändert',
        'El PIN ingresado no es válido': 'Die eingegebene PIN ist ungültig',
        'El PIN actual es incorrecto': 'Aktuelle PIN ist falsch',
        'El PIN ha sido eliminado': 'PIN wurde entfernt',
        'Ingresa tu PIN de seguridad': 'Geben Sie Ihre Sicherheits-PIN ein',
        'Los PINs deben tener al menos 4 dígitos': 'PINs müssen mindestens 4 Ziffern haben',
        'Ahora tienes acceso a comandos avanzados': 'Sie haben jetzt Zugriff auf erweiterte Befehle',
        'Los comandos avanzados están ahora ocultos': 'Erweiterte Befehle sind jetzt ausgeblendet',
        'Historial eliminado': 'Verlauf gelöscht',
        'No se encontraron unidades MIB2 en la red': 'Keine MIB2-Einheiten im Netzwerk gefunden',
        'No se encontraron unidades MIB2 en las IPs comunes': 'Keine MIB2-Einheiten auf gängigen IPs gefunden',
        'Error al escanear la red': 'Fehler beim Scannen des Netzwerks',
        'No se pudo conectar a la unidad MIB2': 'Verbindung zur MIB2-Einheit fehlgeschlagen',
        'Información de debug copiada al portapapeles': 'Debug-Informationen in Zwischenablage kopiert',
        'Este paso no tiene un comando asociado': 'Dieser Schritt hat keinen zugeordneten Befehl',
        'Error al ejecutar comando': 'Fehler beim Ausführen des Befehls',
        'No se pudieron cargar los backups': 'Backups konnten nicht geladen werden',
        'No se pudo generar el script de instalación': 'Installationsskript konnte nicht generiert werden',
        'Creando backup del binario crítico antes de continuar...': 'Backup der kritischen Binärdatei wird erstellt...',
        'Error inesperado al crear backup. Operación cancelada.': 'Unerwarteter Fehler beim Erstellen des Backups. Vorgang abgebrochen.',
        'Backup eliminado': 'Backup gelöscht',
        'Error inesperado al eliminar backup': 'Unerwarteter Fehler beim Löschen des Backups',
        'No se pudo eliminar el backup': 'Backup konnte nicht gelöscht werden',
        'Backup restaurado correctamente': 'Backup erfolgreich wiederhergestellt',
        'Error inesperado al restaurar backup': 'Unerwarteter Fehler beim Wiederherstellen des Backups',
        'No se encontró la ruta del archivo de backup': 'Backup-Dateipfad nicht gefunden',
        'El archivo de backup no existe en el sistema': 'Backup-Datei existiert nicht im System',
        'La función de compartir no está disponible en este dispositivo': 'Freigabefunktion ist auf diesem Gerät nicht verfügbar',
        'No se pudo compartir el resultado': 'Ergebnis konnte nicht geteilt werden',
        'El código FEC debe tener 8 dígitos hexadecimales.': 'FEC-Code muss 8 hexadezimale Ziffern haben.',
        'Este código ya está en la lista.': 'Dieser Code ist bereits in der Liste.',
        'Selecciona al menos un código FEC para generar la lista.': 'Wählen Sie mindestens einen FEC-Code aus, um die Liste zu generieren.',
        'No se pudo generar el archivo ExceptionList.txt': 'ExceptionList.txt-Datei konnte nicht generiert werden',
        'Selecciona al menos un código FEC para generar el comando.': 'Wählen Sie mindestens einen FEC-Code aus, um den Befehl zu generieren.',
        'Selecciona al menos un código FEC': 'Wählen Sie mindestens einen FEC-Code aus',
        'Códigos FEC enviados. La unidad se reiniciará.': 'FEC-Codes gesendet. Einheit wird neu gestartet.',
        'No se pudo abrir el generador online': 'Online-Generator konnte nicht geöffnet werden',
    }
    return translations.get(spanish_text, spanish_text)

def main():
    project_root = Path('/home/ubuntu/mib2_controller')
    analysis_file = project_root / 'scripts' / 'alerts_analysis.json'
    
    with open(analysis_file, 'r', encoding='utf-8') as f:
        analysis = json.load(f)
    
    # Generar estructura de traducciones
    translations = {
        'es': {'alerts': {}},
        'en': {'alerts': {}},
        'de': {'alerts': {}}
    }
    
    # Procesar títulos
    for title in analysis['unique_titles']:
        key = text_to_key(title)
        translations['es']['alerts'][key] = title
        translations['en']['alerts'][key] = translate_to_english(title)
        translations['de']['alerts'][key] = translate_to_german(title)
    
    # Procesar mensajes
    for message in analysis['unique_messages']:
        key = text_to_key(message)
        translations['es']['alerts'][key] = message
        translations['en']['alerts'][key] = translate_to_english(message)
        translations['de']['alerts'][key] = translate_to_german(message)
    
    # Guardar traducciones
    for lang, content in translations.items():
        output_file = project_root / 'scripts' / f'alerts_translations_{lang}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(content, f, indent=2, ensure_ascii=False)
        print(f"✅ Traducciones {lang.upper()} guardadas en: {output_file}")
    
    # Generar mapeo de texto original -> clave
    text_to_key_map = {}
    for title in analysis['unique_titles']:
        text_to_key_map[title] = f"alerts.{text_to_key(title)}"
    for message in analysis['unique_messages']:
        text_to_key_map[message] = f"alerts.{text_to_key(message)}"
    
    mapping_file = project_root / 'scripts' / 'text_to_key_mapping.json'
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(text_to_key_map, f, indent=2, ensure_ascii=False)
    print(f"✅ Mapeo texto->clave guardado en: {mapping_file}")

if __name__ == '__main__':
    main()
