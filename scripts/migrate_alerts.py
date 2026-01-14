#!/usr/bin/env python3
"""
Script para migrar Alert.alert hardcodeados a showAlert() con claves de traducción
"""
import re
import json
from pathlib import Path

def text_to_key(text):
    """Convierte texto español a clave snake_case (mismo que generate_translations.py)"""
    text = re.sub(r'[✅❌💾\n${}()]', '', text)
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', '_', text)
    text = text[:50]
    text = text.strip('_')
    return text

def migrate_file(file_path, text_to_key_map):
    """Migra todos los Alert.alert de un archivo"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    replacements = 0
    
    # Patrón para Alert.alert('Título', 'Mensaje')
    pattern = r"Alert\.alert\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)"
    
    def replace_alert(match):
        nonlocal replacements
        title = match.group(1)
        message = match.group(2)
        
        # Buscar claves de traducción
        title_key = text_to_key_map.get(title)
        message_key = text_to_key_map.get(message)
        
        if title_key and message_key:
            replacements += 1
            return f"showAlert('{title_key}', '{message_key}')"
        elif title_key:
            # Solo título tiene traducción
            replacements += 1
            return f"showAlert('{title_key}', '{message}')"
        else:
            # No hay traducción, dejar como está
            return match.group(0)
    
    content = re.sub(pattern, replace_alert, content)
    
    # Agregar import si se hicieron reemplazos
    if replacements > 0 and 'from "@/lib/translated-alert"' not in content:
        # Buscar la última línea de imports
        import_lines = []
        other_lines = []
        in_imports = True
        
        for line in content.split('\n'):
            if in_imports and (line.startswith('import ') or line.startswith('from ') or line.strip() == ''):
                import_lines.append(line)
            else:
                in_imports = False
                other_lines.append(line)
        
        # Agregar nuevo import
        import_lines.append("import { showAlert } from '@/lib/translated-alert';")
        
        content = '\n'.join(import_lines) + '\n' + '\n'.join(other_lines)
    
    # Guardar solo si hubo cambios
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return replacements
    
    return 0

def main():
    project_root = Path('/home/ubuntu/mib2_controller')
    mapping_file = project_root / 'scripts' / 'text_to_key_mapping.json'
    
    with open(mapping_file, 'r', encoding='utf-8') as f:
        text_to_key_map = json.load(f)
    
    app_dir = project_root / 'app'
    total_replacements = 0
    files_modified = 0
    
    # Buscar todos los archivos .tsx
    for tsx_file in app_dir.rglob('*.tsx'):
        replacements = migrate_file(tsx_file, text_to_key_map)
        if replacements > 0:
            files_modified += 1
            total_replacements += replacements
            print(f"✅ {tsx_file.relative_to(project_root)}: {replacements} reemplazos")
    
    print(f"\n🎉 Migración completada:")
    print(f"   - Archivos modificados: {files_modified}")
    print(f"   - Total de reemplazos: {total_replacements}")

if __name__ == '__main__':
    main()
