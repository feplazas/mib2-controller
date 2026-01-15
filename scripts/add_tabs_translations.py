#!/usr/bin/env python3
"""
Agregar claves de traducción faltantes para tabs y otras secciones
"""

import json
import os

LOCALES_DIR = "/home/ubuntu/mib2_controller/locales"

# Traducciones a agregar
TRANSLATIONS = {
    "tabs": {
        "es": {
            "home": "Inicio",
            "usb": "USB",
            "spoof": "Spoof",
            "telnet": "Telnet",
            "toolbox": "Toolbox",
            "recovery": "Recovery",
            "diag": "Diag",
            "fec": "FEC",
            "config": "Config"
        },
        "en": {
            "home": "Home",
            "usb": "USB",
            "spoof": "Spoof",
            "telnet": "Telnet",
            "toolbox": "Toolbox",
            "recovery": "Recovery",
            "diag": "Diag",
            "fec": "FEC",
            "config": "Config"
        },
        "de": {
            "home": "Start",
            "usb": "USB",
            "spoof": "Spoof",
            "telnet": "Telnet",
            "toolbox": "Toolbox",
            "recovery": "Recovery",
            "diag": "Diag",
            "fec": "FEC",
            "config": "Konfig"
        }
    },
    "commands": {
        "es": {
            "terminal_title": "Terminal Telnet",
            "connected": "Conectado",
            "disconnected": "Desconectado"
        },
        "en": {
            "terminal_title": "Telnet Terminal",
            "connected": "Connected",
            "disconnected": "Disconnected"
        },
        "de": {
            "terminal_title": "Telnet-Terminal",
            "connected": "Verbunden",
            "disconnected": "Getrennt"
        }
    },
    "settings": {
        "es": {
            "security_warning": "Advertencia de Seguridad",
            "security_warning_text": "Esta aplicación permite ejecutar comandos con privilegios root en la unidad MIB2. El uso incorrecto puede resultar en daños permanentes al sistema. Usa esta herramienta bajo tu propia responsabilidad.",
            "created_by": "Creada por Felipe Plazas",
            "for_mib2_units": "Para unidades MIB2 STD2 Technisat/Preh"
        },
        "en": {
            "security_warning": "Security Warning",
            "security_warning_text": "This application allows executing commands with root privileges on the MIB2 unit. Incorrect use may result in permanent system damage. Use this tool at your own risk.",
            "created_by": "Created by Felipe Plazas",
            "for_mib2_units": "For MIB2 STD2 Technisat/Preh units"
        },
        "de": {
            "security_warning": "Sicherheitswarnung",
            "security_warning_text": "Diese Anwendung ermöglicht die Ausführung von Befehlen mit Root-Rechten auf der MIB2-Einheit. Falsche Verwendung kann zu dauerhaften Systemschäden führen. Verwenden Sie dieses Tool auf eigene Gefahr.",
            "created_by": "Erstellt von Felipe Plazas",
            "for_mib2_units": "Für MIB2 STD2 Technisat/Preh Einheiten"
        }
    },
    "recovery": {
        "es": {
            "instructions_title": "Instrucciones de Recuperación",
            "instructions_text": "1. Conecta el adaptador brickeado con cable OTG\n2. Verifica que aparezca como \"Brickeado\" arriba\n3. Selecciona un backup compatible (mismo chipset)\n4. Toca \"Restaurar\" y confirma la operación\n5. Desconecta y reconecta el adaptador\n6. Verifica que el VID/PID se haya restaurado\n\nSi el método normal no funciona, usa \"Forzar\" como último recurso."
        },
        "en": {
            "instructions_title": "Recovery Instructions",
            "instructions_text": "1. Connect the bricked adapter with OTG cable\n2. Verify it appears as \"Bricked\" above\n3. Select a compatible backup (same chipset)\n4. Tap \"Restore\" and confirm the operation\n5. Disconnect and reconnect the adapter\n6. Verify the VID/PID has been restored\n\nIf the normal method doesn't work, use \"Force\" as a last resort."
        },
        "de": {
            "instructions_title": "Wiederherstellungsanleitung",
            "instructions_text": "1. Verbinden Sie den gebrickten Adapter mit OTG-Kabel\n2. Überprüfen Sie, ob er oben als \"Gebrickt\" angezeigt wird\n3. Wählen Sie ein kompatibles Backup (gleicher Chipset)\n4. Tippen Sie auf \"Wiederherstellen\" und bestätigen Sie\n5. Trennen und verbinden Sie den Adapter erneut\n6. Überprüfen Sie, ob VID/PID wiederhergestellt wurde\n\nWenn die normale Methode nicht funktioniert, verwenden Sie \"Erzwingen\" als letzten Ausweg."
        }
    },
    "toolbox": {
        "es": {
            "backup_management": "Gestión de Backups",
            "backups_auto_created": "Los backups se crean automáticamente antes de modificar archivos críticos del sistema MIB2.",
            "loading_backups": "Cargando backups...",
            "no_backups_available": "No hay backups disponibles"
        },
        "en": {
            "backup_management": "Backup Management",
            "backups_auto_created": "Backups are automatically created before modifying critical MIB2 system files.",
            "loading_backups": "Loading backups...",
            "no_backups_available": "No backups available"
        },
        "de": {
            "backup_management": "Backup-Verwaltung",
            "backups_auto_created": "Backups werden automatisch erstellt, bevor kritische MIB2-Systemdateien geändert werden.",
            "loading_backups": "Backups laden...",
            "no_backups_available": "Keine Backups verfügbar"
        }
    }
}

def deep_merge(base: dict, updates: dict) -> dict:
    """Merge updates into base recursively"""
    result = base.copy()
    for key, value in updates.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result

def update_locale_file(lang: str):
    """Update a locale file with new translations"""
    filepath = os.path.join(LOCALES_DIR, f"{lang}.json")
    
    # Read existing file
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Add new translations
    for section, translations in TRANSLATIONS.items():
        if lang in translations:
            if section not in data:
                data[section] = {}
            data[section] = deep_merge(data[section], translations[lang])
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Updated {filepath}")

def main():
    for lang in ['es', 'en', 'de']:
        update_locale_file(lang)
    print("All translations updated!")

if __name__ == "__main__":
    main()
