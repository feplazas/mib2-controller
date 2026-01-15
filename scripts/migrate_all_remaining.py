import json
import re

# Cargar archivos de traducción
with open('locales/es.json', 'r') as f:
    es = json.load(f)
with open('locales/en.json', 'r') as f:
    en = json.load(f)
with open('locales/de.json', 'r') as f:
    de = json.load(f)

# Traducciones para profiles-service.ts
profiles_es = {
    'dub_e100_b1_notes': 'Versión alternativa del DUB-E100, también compatible con MIB2.',
    'tplink_ue300_notes': 'Adaptador Gigabit común. Requiere spoofing para MIB2.',
    'tplink_ue200_notes': 'Adaptador Fast Ethernet de TP-Link. Requiere spoofing.',
    'tplink_wl_notes': 'Adaptador ASIX común. Ideal para spoofing a D-Link DUB-E100.',
    'asix_generic_notes': 'Chipset ASIX genérico. Compatible con spoofing.',
    'asix_generic_a_notes': 'Chipset ASIX genérico (versión A). Compatible con spoofing.',
    'realtek_rtl8153_notes': 'Chipset Realtek Gigabit común. Requiere spoofing.',
    'microchip_lan9512_notes': 'Chipset Microchip común en Raspberry Pi. NO compatible con spoofing.',
    'microchip_lan7800_notes': 'Chipset Microchip Gigabit USB 3.0. NO compatible con spoofing.',
    'davicom_dm9601_notes': 'Chipset Davicom económico. NO compatible con spoofing.',
    'error_invalid_json': 'JSON inválido: faltan campos requeridos',
    'error_import_failed': 'No se pudo importar el perfil: JSON inválido',
    'error_verification_failed': 'Verificación falló: valores escritos no coinciden',
    'error_apply_failed': 'No se pudo aplicar el perfil',
    'realtek_not_compatible': 'Chipsets Realtek NO son compatibles con spoofing en Android. Requieren drivers kernel de Linux/Windows y herramientas específicas (PG Tool). Considera conseguir un adaptador ASIX.',
    'microchip_not_compatible': 'Chipsets Microchip NO soportan modificación de VID/PID. Solo chipsets ASIX AX88772/A/B son compatibles.',
    'broadcom_not_compatible': 'Chipsets Broadcom NO soportan modificación de VID/PID. Solo chipsets ASIX AX88772/A/B son compatibles.',
    'davicom_not_compatible': 'Chipsets Davicom NO soportan modificación de VID/PID. Solo chipsets ASIX AX88772/A/B son compatibles.',
    'only_asix_compatible': 'Solo chipsets ASIX AX88772/A/B soportan spoofing de EEPROM para MIB2.',
    'unknown': 'Desconocido',
    'default_description': 'Configuración por defecto',
    'cannot_delete_only_profile': 'No puedes eliminar el único perfil',
}

profiles_en = {
    'dub_e100_b1_notes': 'Alternative version of DUB-E100, also compatible with MIB2.',
    'tplink_ue300_notes': 'Common Gigabit adapter. Requires spoofing for MIB2.',
    'tplink_ue200_notes': 'TP-Link Fast Ethernet adapter. Requires spoofing.',
    'tplink_wl_notes': 'Common ASIX adapter. Ideal for spoofing to D-Link DUB-E100.',
    'asix_generic_notes': 'Generic ASIX chipset. Compatible with spoofing.',
    'asix_generic_a_notes': 'Generic ASIX chipset (version A). Compatible with spoofing.',
    'realtek_rtl8153_notes': 'Common Realtek Gigabit chipset. Requires spoofing.',
    'microchip_lan9512_notes': 'Common Microchip chipset in Raspberry Pi. NOT compatible with spoofing.',
    'microchip_lan7800_notes': 'Microchip Gigabit USB 3.0 chipset. NOT compatible with spoofing.',
    'davicom_dm9601_notes': 'Budget Davicom chipset. NOT compatible with spoofing.',
    'error_invalid_json': 'Invalid JSON: missing required fields',
    'error_import_failed': 'Could not import profile: Invalid JSON',
    'error_verification_failed': 'Verification failed: written values do not match',
    'error_apply_failed': 'Could not apply profile',
    'realtek_not_compatible': 'Realtek chipsets are NOT compatible with spoofing on Android. They require Linux/Windows kernel drivers and specific tools (PG Tool). Consider getting an ASIX adapter.',
    'microchip_not_compatible': 'Microchip chipsets do NOT support VID/PID modification. Only ASIX AX88772/A/B chipsets are compatible.',
    'broadcom_not_compatible': 'Broadcom chipsets do NOT support VID/PID modification. Only ASIX AX88772/A/B chipsets are compatible.',
    'davicom_not_compatible': 'Davicom chipsets do NOT support VID/PID modification. Only ASIX AX88772/A/B chipsets are compatible.',
    'only_asix_compatible': 'Only ASIX AX88772/A/B chipsets support EEPROM spoofing for MIB2.',
    'unknown': 'Unknown',
    'default_description': 'Default configuration',
    'cannot_delete_only_profile': 'You cannot delete the only profile',
}

profiles_de = {
    'dub_e100_b1_notes': 'Alternative Version des DUB-E100, auch kompatibel mit MIB2.',
    'tplink_ue300_notes': 'Gängiger Gigabit-Adapter. Erfordert Spoofing für MIB2.',
    'tplink_ue200_notes': 'TP-Link Fast Ethernet Adapter. Erfordert Spoofing.',
    'tplink_wl_notes': 'Gängiger ASIX-Adapter. Ideal für Spoofing zu D-Link DUB-E100.',
    'asix_generic_notes': 'Generischer ASIX-Chipsatz. Kompatibel mit Spoofing.',
    'asix_generic_a_notes': 'Generischer ASIX-Chipsatz (Version A). Kompatibel mit Spoofing.',
    'realtek_rtl8153_notes': 'Gängiger Realtek Gigabit-Chipsatz. Erfordert Spoofing.',
    'microchip_lan9512_notes': 'Gängiger Microchip-Chipsatz im Raspberry Pi. NICHT kompatibel mit Spoofing.',
    'microchip_lan7800_notes': 'Microchip Gigabit USB 3.0 Chipsatz. NICHT kompatibel mit Spoofing.',
    'davicom_dm9601_notes': 'Günstiger Davicom-Chipsatz. NICHT kompatibel mit Spoofing.',
    'error_invalid_json': 'Ungültiges JSON: Erforderliche Felder fehlen',
    'error_import_failed': 'Profil konnte nicht importiert werden: Ungültiges JSON',
    'error_verification_failed': 'Überprüfung fehlgeschlagen: Geschriebene Werte stimmen nicht überein',
    'error_apply_failed': 'Profil konnte nicht angewendet werden',
    'realtek_not_compatible': 'Realtek-Chipsätze sind NICHT kompatibel mit Spoofing auf Android. Sie erfordern Linux/Windows-Kernel-Treiber und spezielle Tools (PG Tool). Erwägen Sie einen ASIX-Adapter.',
    'microchip_not_compatible': 'Microchip-Chipsätze unterstützen KEINE VID/PID-Modifikation. Nur ASIX AX88772/A/B Chipsätze sind kompatibel.',
    'broadcom_not_compatible': 'Broadcom-Chipsätze unterstützen KEINE VID/PID-Modifikation. Nur ASIX AX88772/A/B Chipsätze sind kompatibel.',
    'davicom_not_compatible': 'Davicom-Chipsätze unterstützen KEINE VID/PID-Modifikation. Nur ASIX AX88772/A/B Chipsätze sind kompatibel.',
    'only_asix_compatible': 'Nur ASIX AX88772/A/B Chipsätze unterstützen EEPROM-Spoofing für MIB2.',
    'unknown': 'Unbekannt',
    'default_description': 'Standardkonfiguration',
    'cannot_delete_only_profile': 'Sie können das einzige Profil nicht löschen',
}

# Traducciones para otros archivos
other_es = {
    'config_export_title': 'Exportar Configuración MIB2',
    'error_decrypt_failed': 'Descifrado falló - clave incorrecta o datos corruptos',
    'error_pin_min_digits': 'PIN debe tener al menos 4 dígitos',
    'toolbox_not_installed': 'MIB2 Toolbox no está instalado. Se recomienda instalarlo para acceso completo.',
    'toolbox_visit_forums': 'Visita foros especializados para obtener la última versión del Toolbox.',
}

other_en = {
    'config_export_title': 'Export MIB2 Configuration',
    'error_decrypt_failed': 'Decryption failed - incorrect key or corrupt data',
    'error_pin_min_digits': 'PIN must have at least 4 digits',
    'toolbox_not_installed': 'MIB2 Toolbox is not installed. It is recommended to install it for full access.',
    'toolbox_visit_forums': 'Visit specialized forums to get the latest Toolbox version.',
}

other_de = {
    'config_export_title': 'MIB2-Konfiguration exportieren',
    'error_decrypt_failed': 'Entschlüsselung fehlgeschlagen - falscher Schlüssel oder beschädigte Daten',
    'error_pin_min_digits': 'PIN muss mindestens 4 Ziffern haben',
    'toolbox_not_installed': 'MIB2 Toolbox ist nicht installiert. Es wird empfohlen, sie für vollen Zugriff zu installieren.',
    'toolbox_visit_forums': 'Besuchen Sie spezialisierte Foren, um die neueste Toolbox-Version zu erhalten.',
}

# Traducciones para FEC codes
fec_es = {
    'carplay_name': 'Apple CarPlay',
    'carplay_desc': 'Habilita integración de Apple CarPlay en el sistema de infotainment',
    'android_auto_name': 'Android Auto',
    'android_auto_desc': 'Habilita integración de Android Auto en el sistema de infotainment',
    'mirrorlink_name': 'MirrorLink',
    'mirrorlink_desc': 'Habilita MirrorLink para dispositivos compatibles',
    'appconnect_name': 'App-Connect (Full-Link)',
    'appconnect_desc': 'Habilita todas las funciones de App-Connect',
    'perf_monitor_name': 'Performance Monitor',
    'perf_monitor_desc': 'Habilita el monitor de rendimiento en el cuadro digital',
    'maps_europe_name': 'Mapas Europa',
    'maps_europe_desc': 'Activa región de mapas Europa (EU)',
    'maps_northamerica_name': 'Mapas Norteamérica',
    'maps_northamerica_desc': 'Activa región de mapas Norteamérica (NAR)',
    'error_invalid_vin': 'VIN inválido. Debe tener 17 caracteres alfanuméricos.',
    'error_invalid_vcrn': 'VCRN inválido. Debe tener entre 8 y 20 caracteres.',
}

fec_en = {
    'carplay_name': 'Apple CarPlay',
    'carplay_desc': 'Enables Apple CarPlay integration in the infotainment system',
    'android_auto_name': 'Android Auto',
    'android_auto_desc': 'Enables Android Auto integration in the infotainment system',
    'mirrorlink_name': 'MirrorLink',
    'mirrorlink_desc': 'Enables MirrorLink for compatible devices',
    'appconnect_name': 'App-Connect (Full-Link)',
    'appconnect_desc': 'Enables all App-Connect features',
    'perf_monitor_name': 'Performance Monitor',
    'perf_monitor_desc': 'Enables performance monitor in digital cluster',
    'maps_europe_name': 'Europe Maps',
    'maps_europe_desc': 'Activates Europe map region (EU)',
    'maps_northamerica_name': 'North America Maps',
    'maps_northamerica_desc': 'Activates North America map region (NAR)',
    'error_invalid_vin': 'Invalid VIN. Must have 17 alphanumeric characters.',
    'error_invalid_vcrn': 'Invalid VCRN. Must have between 8 and 20 characters.',
}

fec_de = {
    'carplay_name': 'Apple CarPlay',
    'carplay_desc': 'Aktiviert Apple CarPlay-Integration im Infotainment-System',
    'android_auto_name': 'Android Auto',
    'android_auto_desc': 'Aktiviert Android Auto-Integration im Infotainment-System',
    'mirrorlink_name': 'MirrorLink',
    'mirrorlink_desc': 'Aktiviert MirrorLink für kompatible Geräte',
    'appconnect_name': 'App-Connect (Full-Link)',
    'appconnect_desc': 'Aktiviert alle App-Connect-Funktionen',
    'perf_monitor_name': 'Performance Monitor',
    'perf_monitor_desc': 'Aktiviert Leistungsmonitor im digitalen Kombiinstrument',
    'maps_europe_name': 'Europa-Karten',
    'maps_europe_desc': 'Aktiviert Europa-Kartenregion (EU)',
    'maps_northamerica_name': 'Nordamerika-Karten',
    'maps_northamerica_desc': 'Aktiviert Nordamerika-Kartenregion (NAR)',
    'error_invalid_vin': 'Ungültige VIN. Muss 17 alphanumerische Zeichen haben.',
    'error_invalid_vcrn': 'Ungültige VCRN. Muss zwischen 8 und 20 Zeichen haben.',
}

# Agregar secciones
if 'profiles' not in es:
    es['profiles'] = {}
if 'profiles' not in en:
    en['profiles'] = {}
if 'profiles' not in de:
    de['profiles'] = {}

es['profiles'].update(profiles_es)
en['profiles'].update(profiles_en)
de['profiles'].update(profiles_de)

if 'common' not in es:
    es['common'] = {}
if 'common' not in en:
    en['common'] = {}
if 'common' not in de:
    de['common'] = {}

es['common'].update(other_es)
en['common'].update(other_en)
de['common'].update(other_de)

if 'fec' not in es:
    es['fec'] = {}
if 'fec' not in en:
    en['fec'] = {}
if 'fec' not in de:
    de['fec'] = {}

es['fec'].update(fec_es)
en['fec'].update(fec_en)
de['fec'].update(fec_de)

# Guardar
with open('locales/es.json', 'w') as f:
    json.dump(es, f, ensure_ascii=False, indent=2)
with open('locales/en.json', 'w') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)
with open('locales/de.json', 'w') as f:
    json.dump(de, f, ensure_ascii=False, indent=2)

print(f"Traducciones agregadas:")
print(f"- profiles: {len(profiles_es)} claves")
print(f"- common: {len(other_es)} claves")
print(f"- fec: {len(fec_es)} claves")
