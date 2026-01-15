#!/usr/bin/env python3
"""
Extrae todos los strings hardcodeados en español de los archivos TSX/TS
"""
import re
import json
from pathlib import Path
from collections import defaultdict

# Directorios a escanear
SCAN_DIRS = ['app', 'components', 'lib']
PROJECT_ROOT = Path('/home/ubuntu/mib2_controller')

# Patrones para detectar strings en español
PATTERNS = [
    # Strings en JSX: <Text>string</Text>, <Text ...>string</Text>
    r'<Text[^>]*>([^<{]+)</Text>',
    # Props de texto: text="string", title="string", label="string"
    r'(?:text|title|label|placeholder|description)=["\']([ \w\dáéíóúñÁÉÍÓÚÑ¡¿!?,.:;()\-]+)["\']',
    # Strings en objetos: { text: 'string' }
    r'(?:text|title|label|message|description):\s*["\']([^"\']+)["\']',
    # Alert.alert con strings
    r'Alert\.alert\(["\']([^"\']+)["\']',
    # showAlert con strings directos
    r'showAlert\(["\']([^"\']+)["\']',
]

def is_spanish_text(text):
    """Detecta si un texto está en español"""
    text = text.strip()
    if not text or len(text) < 3:
        return False
    
    # Palabras comunes en español
    spanish_words = [
        'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'al',
        'con', 'sin', 'por', 'para', 'en', 'es', 'está', 'son',
        'configuración', 'conexión', 'dispositivo', 'error', 'éxito',
        'conectar', 'desconectar', 'escanear', 'guardar', 'cancelar',
        'aceptar', 'continuar', 'sí', 'no', 'advertencia', 'información'
    ]
    
    # Caracteres españoles
    if any(c in text.lower() for c in 'áéíóúñ¿¡'):
        return True
    
    # Palabras españolas
    words = text.lower().split()
    if any(word in spanish_words for word in words):
        return True
    
    return False

def extract_strings_from_file(file_path):
    """Extrae strings hardcodeados de un archivo"""
    try:
        content = file_path.read_text(encoding='utf-8')
    except:
        return []
    
    found_strings = []
    
    for pattern in PATTERNS:
        matches = re.finditer(pattern, content, re.MULTILINE)
        for match in matches:
            text = match.group(1).strip()
            if is_spanish_text(text):
                line_num = content[:match.start()].count('\n') + 1
                found_strings.append({
                    'text': text,
                    'line': line_num,
                    'pattern': pattern[:30]
                })
    
    return found_strings

def main():
    all_strings = defaultdict(list)
    
    for dir_name in SCAN_DIRS:
        dir_path = PROJECT_ROOT / dir_name
        if not dir_path.exists():
            continue
        
        # Buscar archivos .tsx y .ts
        for file_path in dir_path.rglob('*.tsx'):
            relative_path = file_path.relative_to(PROJECT_ROOT)
            strings = extract_strings_from_file(file_path)
            if strings:
                all_strings[str(relative_path)] = strings
        
        for file_path in dir_path.rglob('*.ts'):
            if 'node_modules' in str(file_path):
                continue
            relative_path = file_path.relative_to(PROJECT_ROOT)
            strings = extract_strings_from_file(file_path)
            if strings:
                all_strings[str(relative_path)] = strings
    
    # Guardar resultados
    output_file = PROJECT_ROOT / 'scripts' / 'hardcoded_strings.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_strings, f, indent=2, ensure_ascii=False)
    
    # Resumen
    total_files = len(all_strings)
    total_strings = sum(len(strings) for strings in all_strings.values())
    
    print(f"✅ Análisis completado:")
    print(f"   - Archivos con strings hardcodeados: {total_files}")
    print(f"   - Total de strings encontrados: {total_strings}")
    print(f"   - Resultados guardados en: {output_file}")
    
    # Mostrar top 10 archivos con más strings
    print(f"\n📊 Top 10 archivos con más strings:")
    sorted_files = sorted(all_strings.items(), key=lambda x: len(x[1]), reverse=True)
    for file_path, strings in sorted_files[:10]:
        print(f"   - {file_path}: {len(strings)} strings")

if __name__ == '__main__':
    main()
