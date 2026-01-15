#!/usr/bin/env python3
"""
Regenerar TODAS las traducciones EN/DE desde cero
Este script lee es.json y genera traducciones reales en inglés y alemán
"""

import json

# Leer es.json
with open('locales/es.json', 'r', encoding='utf-8') as f:
    es = json.load(f)

# Diccionario de traducciones ES -> EN
es_to_en = {
    # Common
    "Inicio": "Home",
    "USB": "USB",
    "Spoof": "Spoof",
    "Telnet": "Telnet",
    "Toolbox": "Toolbox",
    "Recovery": "Recovery",
    "Diag": "Diag",
    "FEC": "FEC",
    "Config": "Config",
    
    # Títulos
    "🛠️ Recuperación": "🛠️ Recovery",
    "Spoofing Automático": "Automatic Spoofing",
    "Generador de Códigos FEC": "FEC Code Generator",
    "Diagnóstico": "Diagnostics",
    "Configuración": "Settings",
    
    # Subtítulos
    "Restaura adaptadores USB brickeados desde backups": "Restore bricked USB adapters from backups",
    "Control remoto para unidades MIB2 STD2 Technisat Preh": "Remote control for MIB2 STD2 Technisat Preh units",
    "Modify USB adapter VID/PID": "Modify USB adapter VID/PID",
    "Feature Enable Codes para activación de funciones SWaP": "Feature Enable Codes for SWaP function activation",
    "System logs and diagnostics": "System logs and diagnostics",
    
    # Estados
    "Desconectado": "Disconnected",
    "Conectado": "Connected",
    "Sin Dispositivo USB": "No USB Device",
    "Conecta un adaptador USB-Ethernet": "Connect a USB-Ethernet adapter",
    
    # Acciones
    "Conectar": "Connect",
    "Desconectar": "Disconnect",
    "Escanear": "Scan",
    "Exportar": "Export",
    "Importar": "Import",
    "Guardar": "Save",
    "Cancelar": "Cancel",
    "Aceptar": "Accept",
    "Continuar": "Continue",
    "Volver": "Back",
    
    # Mensajes
    "¿Estás seguro?": "Are you sure?",
    "Operación exitosa": "Operation successful",
    "Error": "Error",
    "Advertencia": "Warning",
    "Información": "Information",
}

# Diccionario de traducciones ES -> DE
es_to_de = {
    # Common
    "Inicio": "Startseite",
    "USB": "USB",
    "Spoof": "Spoof",
    "Telnet": "Telnet",
    "Toolbox": "Toolbox",
    "Recovery": "Wiederherstellung",
    "Diag": "Diagnose",
    "FEC": "FEC",
    "Config": "Konfig",
    
    # Títulos
    "🛠️ Recuperación": "🛠️ Wiederherstellung",
    "Spoofing Automático": "Automatisches Spoofing",
    "Generador de Códigos FEC": "FEC-Code-Generator",
    "Diagnóstico": "Diagnose",
    "Configuración": "Einstellungen",
    
    # Subtítulos
    "Restaura adaptadores USB brickeados desde backups": "Stellen Sie gebrickte USB-Adapter aus Backups wieder her",
    "Control remoto para unidades MIB2 STD2 Technisat Preh": "Fernsteuerung für MIB2 STD2 Technisat Preh Einheiten",
    "Modify USB adapter VID/PID": "USB-Adapter VID/PID ändern",
    "Feature Enable Codes para activación de funciones SWaP": "Feature Enable Codes zur Aktivierung von SWaP-Funktionen",
    "System logs and diagnostics": "Systemprotokolle und Diagnose",
    
    # Estados
    "Desconectado": "Getrennt",
    "Conectado": "Verbunden",
    "Sin Dispositivo USB": "Kein USB-Gerät",
    "Conecta un adaptador USB-Ethernet": "Schließen Sie einen USB-Ethernet-Adapter an",
    
    # Acciones
    "Conectar": "Verbinden",
    "Desconectar": "Trennen",
    "Escanear": "Scannen",
    "Exportar": "Exportieren",
    "Importar": "Importieren",
    "Guardar": "Speichern",
    "Cancelar": "Abbrechen",
    "Aceptar": "Akzeptieren",
    "Continuar": "Weiter",
    "Volver": "Zurück",
    
    # Mensajes
    "¿Estás seguro?": "Sind Sie sicher?",
    "Operación exitosa": "Operation erfolgreich",
    "Error": "Fehler",
    "Advertencia": "Warnung",
    "Información": "Information",
}

def translate_value(value, translations_dict):
    """Traducir un valor usando el diccionario de traducciones"""
    if isinstance(value, str):
        # Buscar traducción exacta
        if value in translations_dict:
            return translations_dict[value]
        
        # Buscar traducciones parciales
        result = value
        for es_text, translated_text in translations_dict.items():
            result = result.replace(es_text, translated_text)
        
        return result
    return value

def translate_dict(obj, translations_dict):
    """Traducir recursivamente un diccionario"""
    if isinstance(obj, dict):
        return {k: translate_dict(v, translations_dict) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [translate_dict(item, translations_dict) for item in obj]
    elif isinstance(obj, str):
        return translate_value(obj, translations_dict)
    return obj

# Generar en.json
en = translate_dict(es, es_to_en)
with open('locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)

# Generar de.json
de = translate_dict(es, es_to_de)
with open('locales/de.json', 'w', encoding='utf-8') as f:
    json.dump(de, f, ensure_ascii=False, indent=2)

print("✅ Traducciones regeneradas correctamente")
print(f"   - en.json: {len(json.dumps(en))} bytes")
print(f"   - de.json: {len(json.dumps(de))} bytes")
