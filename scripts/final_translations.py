#!/usr/bin/env python3
"""
Agregar las últimas claves de traducción faltantes
"""

import json
import os

LOCALES_DIR = "/home/ubuntu/mib2_controller/locales"

# Traducciones finales a agregar
TRANSLATIONS = {
    "usb": {
        "es": {
            "detected_devices": "Dispositivos Detectados",
            "device": "Dispositivo"
        },
        "en": {
            "detected_devices": "Detected Devices",
            "device": "Device"
        },
        "de": {
            "detected_devices": "Erkannte Geräte",
            "device": "Gerät"
        }
    },
    "settings": {
        "es": {
            "copy_debug_info": "Copiar Info de Debug",
            "app_info": "Información de la App",
            "version": "Versión",
            "created_by_label": "Creada por",
            "platform": "Plataforma",
            "compatible_with": "Compatible con"
        },
        "en": {
            "copy_debug_info": "Copy Debug Info",
            "app_info": "App Information",
            "version": "Version",
            "created_by_label": "Created by",
            "platform": "Platform",
            "compatible_with": "Compatible with"
        },
        "de": {
            "copy_debug_info": "Debug-Info kopieren",
            "app_info": "App-Informationen",
            "version": "Version",
            "created_by_label": "Erstellt von",
            "platform": "Plattform",
            "compatible_with": "Kompatibel mit"
        }
    },
    "home": {
        "es": {
            "tools": "Herramientas",
            "tools_subtitle": "Utilidades avanzadas para MIB2",
            "fec_title": "Generador FEC",
            "fec_desc": "Generar códigos FEC personalizados",
            "toolbox_title": "MIB2 Toolbox",
            "toolbox_desc": "Asistente de instalación",
            "spoof_title": "USB Spoofing",
            "spoof_desc": "Modificar adaptadores ASIX",
            "usb_title": "Estado USB",
            "usb_desc": "Información del adaptador conectado",
            "telnet_title": "Terminal Telnet",
            "telnet_desc": "Consola interactiva MIB2"
        },
        "en": {
            "tools": "Tools",
            "tools_subtitle": "Advanced utilities for MIB2",
            "fec_title": "FEC Generator",
            "fec_desc": "Generate custom FEC codes",
            "toolbox_title": "MIB2 Toolbox",
            "toolbox_desc": "Installation wizard",
            "spoof_title": "USB Spoofing",
            "spoof_desc": "Modify ASIX adapters",
            "usb_title": "USB Status",
            "usb_desc": "Connected adapter information",
            "telnet_title": "Telnet Terminal",
            "telnet_desc": "MIB2 interactive console"
        },
        "de": {
            "tools": "Werkzeuge",
            "tools_subtitle": "Erweiterte Dienstprogramme für MIB2",
            "fec_title": "FEC-Generator",
            "fec_desc": "Benutzerdefinierte FEC-Codes generieren",
            "toolbox_title": "MIB2 Toolbox",
            "toolbox_desc": "Installationsassistent",
            "spoof_title": "USB-Spoofing",
            "spoof_desc": "ASIX-Adapter modifizieren",
            "usb_title": "USB-Status",
            "usb_desc": "Informationen zum angeschlossenen Adapter",
            "telnet_title": "Telnet-Terminal",
            "telnet_desc": "MIB2-Interaktive Konsole"
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
    print("All final translations added!")

if __name__ == "__main__":
    main()
