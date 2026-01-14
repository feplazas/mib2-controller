#!/usr/bin/env python3
"""
Script para analizar todos los Alert.alert en el proyecto y extraer textos únicos
"""
import re
import json
from pathlib import Path
from collections import defaultdict

def extract_alerts(file_path):
    """Extrae todos los Alert.alert de un archivo"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Patrón para Alert.alert con 2 argumentos (título, mensaje)
    pattern = r"Alert\.alert\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)"
    matches = re.findall(pattern, content)
    
    # Patrón para Alert.alert con template strings
    pattern_template = r"Alert\.alert\(\s*['\"]([^'\"]+)['\"]\s*,\s*`([^`]+)`\s*\)"
    matches_template = re.findall(pattern_template, content)
    
    return matches + matches_template

def main():
    project_root = Path('/home/ubuntu/mib2_controller')
    app_dir = project_root / 'app'
    
    all_alerts = []
    unique_titles = set()
    unique_messages = set()
    
    # Buscar todos los archivos .tsx
    for tsx_file in app_dir.rglob('*.tsx'):
        alerts = extract_alerts(tsx_file)
        for title, message in alerts:
            all_alerts.append({
                'file': str(tsx_file.relative_to(project_root)),
                'title': title,
                'message': message
            })
            unique_titles.add(title)
            unique_messages.add(message)
    
    print(f"Total Alert.alert encontrados: {len(all_alerts)}")
    print(f"Títulos únicos: {len(unique_titles)}")
    print(f"Mensajes únicos: {len(unique_messages)}")
    print()
    
    # Agrupar por título
    by_title = defaultdict(list)
    for alert in all_alerts:
        by_title[alert['title']].append(alert['message'])
    
    print("=== TÍTULOS ÚNICOS ===")
    for title in sorted(unique_titles):
        print(f"  - {title}")
    
    print("\n=== MENSAJES ÚNICOS ===")
    for message in sorted(unique_messages):
        # Truncar mensajes largos
        display = message[:80] + '...' if len(message) > 80 else message
        print(f"  - {display}")
    
    # Guardar análisis completo
    output = {
        'total': len(all_alerts),
        'unique_titles': sorted(list(unique_titles)),
        'unique_messages': sorted(list(unique_messages)),
        'by_title': {k: list(set(v)) for k, v in by_title.items()},
        'all_alerts': all_alerts
    }
    
    output_file = project_root / 'scripts' / 'alerts_analysis.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Análisis guardado en: {output_file}")

if __name__ == '__main__':
    main()
