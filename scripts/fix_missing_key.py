#!/usr/bin/env python3
"""
Agregar clave faltante alerts.multiples_dispositivos
"""

import json
import os

LOCALES_DIR = "/home/ubuntu/mib2_controller/locales"

TRANSLATIONS = {
    "es": {
        "alerts": {
            "multiples_dispositivos": "Múltiples Dispositivos"
        }
    },
    "en": {
        "alerts": {
            "multiples_dispositivos": "Multiple Devices"
        }
    },
    "de": {
        "alerts": {
            "multiples_dispositivos": "Mehrere Geräte"
        }
    }
}

def deep_merge(base: dict, updates: dict) -> dict:
    result = base.copy()
    for key, value in updates.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result

def main():
    for lang in ['es', 'en', 'de']:
        filepath = os.path.join(LOCALES_DIR, f"{lang}.json")
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        data = deep_merge(data, TRANSLATIONS[lang])
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"Updated {filepath}")

if __name__ == "__main__":
    main()
