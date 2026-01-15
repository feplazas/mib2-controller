#!/usr/bin/env python3
"""
Traduce automáticamente las claves de español a inglés y alemán
Usa traducciones predefinidas para términos técnicos y contexto de MIB2
"""
import json
from pathlib import Path

PROJECT_ROOT = Path('/home/ubuntu/mib2_controller')
LOCALES_DIR = PROJECT_ROOT / 'locales'

# Diccionario de traducciones técnicas específicas de MIB2
TECHNICAL_TERMS = {
    'MIB2': {'en': 'MIB2', 'de': 'MIB2'},
    'Toolbox': {'en': 'Toolbox', 'de': 'Toolbox'},
    'USB': {'en': 'USB', 'de': 'USB'},
    'Telnet': {'en': 'Telnet', 'de': 'Telnet'},
    'FEC': {'en': 'FEC', 'de': 'FEC'},
    'EEPROM': {'en': 'EEPROM', 'de': 'EEPROM'},
    'QNX': {'en': 'QNX', 'de': 'QNX'},
    'Auto-Spoof': {'en': 'Auto-Spoof', 'de': 'Auto-Spoof'},
    'STD2': {'en': 'STD2', 'de': 'STD2'},
}

# Traducciones comunes
COMMON_TRANSLATIONS = {
    # Acciones
    'Conectar': {'en': 'Connect', 'de': 'Verbinden'},
    'Desconectar': {'en': 'Disconnect', 'de': 'Trennen'},
    'Escanear': {'en': 'Scan', 'de': 'Scannen'},
    'Guardar': {'en': 'Save', 'de': 'Speichern'},
    'Cancelar': {'en': 'Cancel', 'de': 'Abbrechen'},
    'Aceptar': {'en': 'Accept', 'de': 'Akzeptieren'},
    'Continuar': {'en': 'Continue', 'de': 'Fortsetzen'},
    'Sí': {'en': 'Yes', 'de': 'Ja'},
    'No': {'en': 'No', 'de': 'Nein'},
    'Cerrar': {'en': 'Close', 'de': 'Schließen'},
    'Abrir': {'en': 'Open', 'de': 'Öffnen'},
    'Exportar': {'en': 'Export', 'de': 'Exportieren'},
    'Importar': {'en': 'Import', 'de': 'Importieren'},
    'Eliminar': {'en': 'Delete', 'de': 'Löschen'},
    'Editar': {'en': 'Edit', 'de': 'Bearbeiten'},
    'Crear': {'en': 'Create', 'de': 'Erstellen'},
    'Actualizar': {'en': 'Update', 'de': 'Aktualisieren'},
    'Verificar': {'en': 'Verify', 'de': 'Überprüfen'},
    'Instalar': {'en': 'Install', 'de': 'Installieren'},
    'Desinstalar': {'en': 'Uninstall', 'de': 'Deinstallieren'},
    'Reiniciar': {'en': 'Restart', 'de': 'Neu starten'},
    'Detener': {'en': 'Stop', 'de': 'Stoppen'},
    'Iniciar': {'en': 'Start', 'de': 'Starten'},
    'Buscar': {'en': 'Search', 'de': 'Suchen'},
    'Filtrar': {'en': 'Filter', 'de': 'Filtern'},
    'Ordenar': {'en': 'Sort', 'de': 'Sortieren'},
    'Compartir': {'en': 'Share', 'de': 'Teilen'},
    'Copiar': {'en': 'Copy', 'de': 'Kopieren'},
    'Pegar': {'en': 'Paste', 'de': 'Einfügen'},
    
    # Estados
    'Activo': {'en': 'Active', 'de': 'Aktiv'},
    'Inactivo': {'en': 'Inactive', 'de': 'Inaktiv'},
    'Conectado': {'en': 'Connected', 'de': 'Verbunden'},
    'Desconectado': {'en': 'Disconnected', 'de': 'Getrennt'},
    'Cargando': {'en': 'Loading', 'de': 'Laden'},
    'Completado': {'en': 'Completed', 'de': 'Abgeschlossen'},
    'Fallido': {'en': 'Failed', 'de': 'Fehlgeschlagen'},
    'En progreso': {'en': 'In progress', 'de': 'In Bearbeitung'},
    'Disponible': {'en': 'Available', 'de': 'Verfügbar'},
    'No disponible': {'en': 'Not available', 'de': 'Nicht verfügbar'},
    
    # Mensajes
    'Error': {'en': 'Error', 'de': 'Fehler'},
    'Éxito': {'en': 'Success', 'de': 'Erfolg'},
    'Advertencia': {'en': 'Warning', 'de': 'Warnung'},
    'Información': {'en': 'Information', 'de': 'Information'},
    'Confirmación': {'en': 'Confirmation', 'de': 'Bestätigung'},
    
    # UI
    'Configuración': {'en': 'Settings', 'de': 'Einstellungen'},
    'Opciones': {'en': 'Options', 'de': 'Optionen'},
    'Ayuda': {'en': 'Help', 'de': 'Hilfe'},
    'Acerca de': {'en': 'About', 'de': 'Über'},
    'Versión': {'en': 'Version', 'de': 'Version'},
    'Idioma': {'en': 'Language', 'de': 'Sprache'},
    'Tema': {'en': 'Theme', 'de': 'Thema'},
    'Notificaciones': {'en': 'Notifications', 'de': 'Benachrichtigungen'},
    'Permisos': {'en': 'Permissions', 'de': 'Berechtigungen'},
    'Seguridad': {'en': 'Security', 'de': 'Sicherheit'},
    'Privacidad': {'en': 'Privacy', 'de': 'Datenschutz'},
    'Respaldo': {'en': 'Backup', 'de': 'Sicherung'},
    'Restaurar': {'en': 'Restore', 'de': 'Wiederherstellen'},
    'Diagnóstico': {'en': 'Diagnostics', 'de': 'Diagnose'},
    'Registro': {'en': 'Log', 'de': 'Protokoll'},
    'Historial': {'en': 'History', 'de': 'Verlauf'},
    
    # Dispositivos
    'Dispositivo': {'en': 'Device', 'de': 'Gerät'},
    'Adaptador': {'en': 'Adapter', 'de': 'Adapter'},
    'Red': {'en': 'Network', 'de': 'Netzwerk'},
    'Conexión': {'en': 'Connection', 'de': 'Verbindung'},
    'Puerto': {'en': 'Port', 'de': 'Port'},
    'Dirección IP': {'en': 'IP Address', 'de': 'IP-Adresse'},
    'Usuario': {'en': 'User', 'de': 'Benutzer'},
    'Contraseña': {'en': 'Password', 'de': 'Passwort'},
}

def translate_text(text, target_lang):
    """Traduce un texto usando el diccionario predefinido"""
    # Buscar en términos técnicos
    for term, translations in TECHNICAL_TERMS.items():
        if term in text:
            return text  # Mantener términos técnicos sin cambios
    
    # Buscar traducción exacta
    if text in COMMON_TRANSLATIONS:
        return COMMON_TRANSLATIONS[text][target_lang]
    
    # Buscar traducción parcial (palabras clave)
    for es_text, translations in COMMON_TRANSLATIONS.items():
        if es_text.lower() in text.lower():
            # Reemplazar la palabra clave
            translated = text.replace(es_text, translations[target_lang])
            return translated
    
    # Si no hay traducción, devolver texto original con nota
    return f"[TODO: {text}]"

def translate_nested_dict(data, target_lang):
    """Traduce recursivamente un diccionario anidado"""
    result = {}
    for key, value in data.items():
        if isinstance(value, dict):
            result[key] = translate_nested_dict(value, target_lang)
        elif isinstance(value, str):
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
    en_data = translate_nested_dict(es_data, 'en')
    en_file = LOCALES_DIR / 'en.json'
    with open(en_file, 'w', encoding='utf-8') as f:
        json.dump(en_data, f, indent=2, ensure_ascii=False)
    
    # Traducir a alemán
    de_data = translate_nested_dict(es_data, 'de')
    de_file = LOCALES_DIR / 'de.json'
    with open(de_file, 'w', encoding='utf-8') as f:
        json.dump(de_data, f, indent=2, ensure_ascii=False)
    
    # Contar traducciones pendientes
    en_todos = str(en_data).count('[TODO:')
    de_todos = str(de_data).count('[TODO:')
    
    print(f"✅ Traducciones generadas:")
    print(f"   - Inglés: {en_file}")
    print(f"   - Alemán: {de_file}")
    print(f"\n⚠️  Traducciones pendientes:")
    print(f"   - Inglés: {en_todos} textos marcados con [TODO:]")
    print(f"   - Alemán: {de_todos} textos marcados con [TODO:]")
    
    if en_todos > 0 or de_todos > 0:
        print(f"\n📝 Revisa los archivos y completa las traducciones marcadas con [TODO:]")

if __name__ == '__main__':
    main()
