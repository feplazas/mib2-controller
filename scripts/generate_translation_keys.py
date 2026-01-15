#!/usr/bin/env python3
"""
Genera claves de traducción organizadas para todos los strings hardcodeados
"""
import json
import re
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path('/home/ubuntu/mib2_controller')
HARDCODED_FILE = PROJECT_ROOT / 'scripts' / 'hardcoded_strings.json'
LOCALES_DIR = PROJECT_ROOT / 'locales'

def normalize_key(text):
    """Convierte texto a clave válida"""
    # Remover caracteres especiales
    key = re.sub(r'[¿¡?!.,;:()\-]', '', text.lower())
    # Reemplazar espacios por guiones bajos
    key = re.sub(r'\s+', '_', key)
    # Remover acentos
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n'
    }
    for old, new in replacements.items():
        key = key.replace(old, new)
    # Limitar longitud
    if len(key) > 50:
        key = key[:50]
    return key

def categorize_by_file(file_path):
    """Determina la categoría basada en el archivo"""
    if 'settings' in file_path:
        return 'settings'
    elif 'toolbox' in file_path:
        return 'toolbox'
    elif 'auto-spoof' in file_path or 'usb' in file_path:
        return 'usb'
    elif 'fec' in file_path:
        return 'fec'
    elif 'commands' in file_path or 'macros' in file_path:
        return 'commands'
    elif 'recovery' in file_path or 'backup' in file_path:
        return 'recovery'
    elif 'diag' in file_path:
        return 'diag'
    elif 'index.tsx' in file_path:
        return 'home'
    else:
        return 'common'

def is_common_text(text):
    """Detecta si es un texto común reutilizable"""
    common_words = [
        'conectar', 'desconectar', 'escanear', 'guardar', 'cancelar',
        'aceptar', 'continuar', 'sí', 'no', 'error', 'éxito', 'advertencia',
        'información', 'cargando', 'completado', 'fallido', 'activo', 'inactivo'
    ]
    return any(word in text.lower() for word in common_words)

def main():
    # Cargar strings hardcodeados
    with open(HARDCODED_FILE, 'r', encoding='utf-8') as f:
        hardcoded_data = json.load(f)
    
    # Organizar por categoría
    translations = defaultdict(dict)
    key_counter = defaultdict(int)
    
    for file_path, strings in hardcoded_data.items():
        category = categorize_by_file(file_path)
        
        for item in strings:
            text = item['text']
            
            # Determinar si es común
            if is_common_text(text):
                category = 'common'
            
            # Generar clave única
            base_key = normalize_key(text)
            key = base_key
            counter = key_counter[f"{category}.{base_key}"]
            if counter > 0:
                key = f"{base_key}_{counter}"
            key_counter[f"{category}.{base_key}"] += 1
            
            full_key = f"{category}.{key}"
            translations[category][key] = text
    
    # Cargar locales existentes
    es_file = LOCALES_DIR / 'es.json'
    en_file = LOCALES_DIR / 'en.json'
    de_file = LOCALES_DIR / 'de.json'
    
    existing_es = {}
    if es_file.exists():
        with open(es_file, 'r', encoding='utf-8') as f:
            existing_es = json.load(f)
    
    # Merge con existentes
    for category, strings in translations.items():
        if category not in existing_es:
            existing_es[category] = {}
        existing_es[category].update(strings)
    
    # Guardar español (ya tenemos las traducciones)
    with open(es_file, 'w', encoding='utf-8') as f:
        json.dump(existing_es, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Claves de traducción generadas:")
    for category, strings in translations.items():
        print(f"   - {category}: {len(strings)} claves")
    
    print(f"\n📝 Archivos actualizados:")
    print(f"   - {es_file}")
    print(f"\n⚠️  NOTA: Necesitas traducir manualmente a inglés y alemán")
    print(f"   - Edita {en_file} y {de_file}")

if __name__ == '__main__':
    main()
