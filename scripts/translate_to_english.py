#!/usr/bin/env python3
import json
import re

# Cargar es.json
with open('locales/es.json', 'r', encoding='utf-8') as f:
    es_data = json.load(f)

# Diccionario de traducciones manuales para términos técnicos y comunes
MANUAL_TRANSLATIONS = {
    # Common
    "Cancelar": "Cancel",
    "Confirmar": "Confirm",
    "Continuar": "Continue",
    "Atrás": "Back",
    "Siguiente": "Next",
    "Finalizar": "Finish",
    "Cerrar": "Close",
    "Guardar": "Save",
    "Eliminar": "Delete",
    "Editar": "Edit",
    "Cargando...": "Loading...",
    "Error": "Error",
    "Éxito": "Success",
    "Advertencia": "Warning",
    "SÍ": "YES",
    "NO": "NO",
    
    # Technical terms
    "Dispositivo": "Device",
    "dispositivo": "device",
    "conectado": "connected",
    "desconectado": "disconnected",
    "backup": "backup",
    "operación": "operation",
    "irreversible": "irreversible",
    "proceso": "process",
    "compatible": "compatible",
    "automático": "automatic",
    "verificación": "verification",
    "adaptador": "adapter",
    "escritura": "write",
    "lectura": "read",
    "protección": "protection",
    "manual": "manual",
    "confirmación": "confirmation",
    "validaciones": "validations",
    "completas": "complete",
    "triple": "triple",
    "ejecutar": "execute",
    "comandos": "commands",
    "rápidos": "quick",
    "éxitos": "successes",
    "nota": "note",
    "técnica": "technical",
    "datos": "data",
    "vehículo": "vehicle",
    "opcional": "optional",
    "generación": "generation",
    "códigos": "codes",
    "personalizados": "custom",
    "basados": "based",
    "número": "number",
    "serie": "serial",
    "inválido": "invalid",
    "debe": "must",
    "tener": "have",
    "caracteres": "characters",
    "alfanuméricos": "alphanumeric",
    "predefinidos": "predefined",
    "agregar": "add",
    "código": "code",
    "personalizado": "custom",
    "ver": "view",
    "comando": "command",
    "inyección": "injection",
    "duplicado": "duplicate",
    "conectar": "connect",
    "instrucciones": "instructions",
    "conexión": "connection",
    "puerto": "port",
    "unidad": "unit",
    "red": "network",
    "mismo": "same",
    "verifica": "verify",
    "habilitado": "enabled",
    "dirección": "address",
    "por defecto": "default",
    "presiona": "press",
    "establecer": "establish",
    "advertencia": "warning",
    "aplicación": "application",
    "permite": "allows",
    "directamente": "directly",
    "precaución": "caution",
    "solo": "only",
    "sabes": "know",
    "haciendo": "doing",
    "incorrectos": "incorrect",
    "pueden": "can",
    "dañar": "damage",
    "sistema": "system",
    "escanear": "scan",
    "forzar": "force",
    "restauración": "restore",
    "seguridad": "security",
    "configuración": "settings",
    "local": "local",
    "usuario": "user",
    "autenticación": "authentication",
    "contraseña": "password",
    "gestión": "management",
    "limpiar": "clear",
    "historial": "history",
    "estado": "status",
    "actual": "current",
    "información": "information",
    "módulo": "module",
    "nativo": "native",
    "copiar": "copy",
    "debug": "debug",
    "versión": "version",
    "creado": "created",
    "plataforma": "platform",
    "compatible con": "compatible with",
    
    # App specific
    "No hay dispositivo conectado": "No device connected",
    "Creando backup de seguridad": "Creating safety backup",
    "Esta operación es IRREVERSIBLE sin backup": "This operation is IRREVERSIBLE without backup",
    "NO desconectes el adaptador durante el proceso": "DO NOT disconnect the adapter during the process",
    "Solo funciona con ASIX AX88772A/B con EEPROM externa": "Only works with ASIX AX88772A/B with external EEPROM",
    "Dispositivos con eFuse NO son compatibles": "Devices with eFuse are NOT compatible",
    "Se creará un backup automático antes de escribir": "An automatic backup will be created before writing",
    "Forzar sin Verificación": "Force without Verification",
    "Omite la verificación post-escritura": "Skip post-write verification",
    "Úsalo solo si la verificación normal falla": "Use only if normal verification fails",
    "Después del spoofing, desconecta y reconecta el adaptador": "After spoofing, disconnect and reconnect the adapter",
    "Verifica si el adaptador tiene VID/PID": "Verify if the adapter has VID/PID",
    "Ejecuta spoofing con una sola confirmación": "Execute spoofing with single confirmation",
    "Conecta un adaptador compatible para continuar": "Connect a compatible adapter to continue",
    "Con triple confirmación y validaciones completas": "With triple confirmation and complete validations",
    "Sí, Continuar": "Yes, Continue",
    "SÍ, Ejecutar": "YES, Execute",
    "NO, Cancelar": "NO, Cancel",
    "Comandos Rápidos": "Quick Commands",
    "Nota Técnica": "Technical Note",
    "Datos del Vehículo (Opcional)": "Vehicle Data (Optional)",
    "Para generación de códigos personalizados basados en VIN/VCRN": "For custom code generation based on VIN/VCRN",
    "VCRN (Número de Serie)": "VCRN (Serial Number)",
    "VIN inválido (debe tener 17 caracteres alfanuméricos)": "Invalid VIN (must have 17 alphanumeric characters)",
    "VCRN inválido (debe tener entre 8 y 20 caracteres)": "Invalid VCRN (must have between 8 and 20 characters)",
    "Códigos FEC Predefinidos": "Predefined FEC Codes",
    "Agregar Código Personalizado": "Add Custom Code",
    "Agregar Código": "Add Code",
    "Ver Comando de Inyección": "View Injection Command",
    "Comando de Inyección": "Injection Command",
    "Desconectar": "Disconnect",
    "Conectar a MIB2": "Connect to MIB2",
    "Instrucciones de Conexión": "Connection Instructions",
}

def translate_text(text):
    """Translate Spanish text to English"""
    if not isinstance(text, str):
        return text
    
    # Direct match
    if text in MANUAL_TRANSLATIONS:
        return MANUAL_TRANSLATIONS[text]
    
    # Try case-insensitive match
    for es, en in MANUAL_TRANSLATIONS.items():
        if text.lower() == es.lower():
            return en
    
    # Replace known words
    result = text
    for es, en in sorted(MANUAL_TRANSLATIONS.items(), key=lambda x: -len(x[0])):
        result = result.replace(es, en)
    
    return result

def translate_dict(data):
    """Recursively translate dictionary"""
    if isinstance(data, dict):
        return {k: translate_dict(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [translate_dict(item) for item in data]
    elif isinstance(data, str):
        return translate_text(data)
    else:
        return data

# Translate
en_data = translate_dict(es_data)

# Save
with open('locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)

print("✅ en.json generated successfully")
