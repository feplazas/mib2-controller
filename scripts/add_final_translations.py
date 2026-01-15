#!/usr/bin/env python3
"""
Agregar las últimas claves de traducción faltantes
"""

import json
import os

LOCALES_DIR = "/home/ubuntu/mib2_controller/locales"

TRANSLATIONS = {
    "commands": {
        "es": {
            "quick_commands": "Comandos Rápidos"
        },
        "en": {
            "quick_commands": "Quick Commands"
        },
        "de": {
            "quick_commands": "Schnellbefehle"
        }
    },
    "recovery": {
        "es": {
            "size": "Tamaño"
        },
        "en": {
            "size": "Size"
        },
        "de": {
            "size": "Größe"
        }
    },
    "usb": {
        "es": {
            "test_eeprom_complete": "Test EEPROM Completado",
            "size": "Tamaño",
            "status": "Estado",
            "corrupt": "CORRUPTA (todos los bytes son 0xFF)",
            "ok": "OK (datos válidos)",
            "detected_type": "Tipo Detectado",
            "modifiable": "Modificable",
            "can_be_modified": "Este adaptador PUEDE ser modificado de forma segura mediante spoofing.",
            "cannot_be_modified": "Este adaptador NO puede ser modificado. El spoofing está BLOQUEADO para prevenir bricking."
        },
        "en": {
            "test_eeprom_complete": "EEPROM Test Complete",
            "size": "Size",
            "status": "Status",
            "corrupt": "CORRUPT (all bytes are 0xFF)",
            "ok": "OK (valid data)",
            "detected_type": "Detected Type",
            "modifiable": "Modifiable",
            "can_be_modified": "This adapter CAN be safely modified via spoofing.",
            "cannot_be_modified": "This adapter CANNOT be modified. Spoofing is BLOCKED to prevent bricking."
        },
        "de": {
            "test_eeprom_complete": "EEPROM-Test abgeschlossen",
            "size": "Größe",
            "status": "Status",
            "corrupt": "KORRUPT (alle Bytes sind 0xFF)",
            "ok": "OK (gültige Daten)",
            "detected_type": "Erkannter Typ",
            "modifiable": "Modifizierbar",
            "can_be_modified": "Dieser Adapter KANN sicher per Spoofing modifiziert werden.",
            "cannot_be_modified": "Dieser Adapter kann NICHT modifiziert werden. Spoofing ist BLOCKIERT, um Bricking zu verhindern."
        }
    },
    "common": {
        "es": {
            "yes": "SÍ",
            "no": "NO"
        },
        "en": {
            "yes": "YES",
            "no": "NO"
        },
        "de": {
            "yes": "JA",
            "no": "NEIN"
        }
    },
    "success": {
        "es": {
            "spoofing_success": "¡Spoofing Exitoso!",
            "vid_pid_modified": "El VID/PID se modificó correctamente",
            "device_info": "Información del Dispositivo",
            "device": "Dispositivo",
            "chipset": "Chipset",
            "date": "Fecha",
            "before_original": "❌ Antes (Original)",
            "after_modified": "✅ Después (Modificado)",
            "next_steps": "📝 Próximos Pasos",
            "step1": "1. Desconecta y reconecta el adaptador",
            "step2": "2. Conecta al puerto USB del MIB2",
            "step3": "3. Verifica que el MIB2 lo reconozca"
        },
        "en": {
            "spoofing_success": "Spoofing Successful!",
            "vid_pid_modified": "VID/PID was modified correctly",
            "device_info": "Device Information",
            "device": "Device",
            "chipset": "Chipset",
            "date": "Date",
            "before_original": "❌ Before (Original)",
            "after_modified": "✅ After (Modified)",
            "next_steps": "📝 Next Steps",
            "step1": "1. Disconnect and reconnect the adapter",
            "step2": "2. Connect to the MIB2 USB port",
            "step3": "3. Verify that MIB2 recognizes it"
        },
        "de": {
            "spoofing_success": "Spoofing erfolgreich!",
            "vid_pid_modified": "VID/PID wurde korrekt geändert",
            "device_info": "Geräteinformationen",
            "device": "Gerät",
            "chipset": "Chipsatz",
            "date": "Datum",
            "before_original": "❌ Vorher (Original)",
            "after_modified": "✅ Nachher (Geändert)",
            "next_steps": "📝 Nächste Schritte",
            "step1": "1. Adapter trennen und wieder verbinden",
            "step2": "2. Mit dem USB-Port des MIB2 verbinden",
            "step3": "3. Überprüfen, ob das MIB2 ihn erkennt"
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
    print("\n✅ Final translations added!")

if __name__ == "__main__":
    main()
