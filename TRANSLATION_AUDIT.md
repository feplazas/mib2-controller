# Auditoría de Traducciones - MIB2 Controller
# Fecha: 18 Enero 2026

## Textos Hardcodeados Encontrados

### En Componentes TSX

1. **auto-spoof.tsx** (línea 650)
   - `"Magic Value:"` → Necesita traducción

2. **diag.tsx** (línea 186)
   - `"Total"` → Necesita traducción

3. **recovery.tsx** (línea 253)
   - `"Checksum:"` → Necesita traducción

4. **settings.tsx** (líneas 790, 800, 812, 830)
   - `"Device ID:"` → Necesita traducción
   - `"Chipset:"` → Necesita traducción
   - `"Serial:"` → Necesita traducción
   - `"Magic Value:"` → Necesita traducción
   - `"Felipe Plazas"` → Nombre propio, no traducir
   - `"Android"` → Nombre propio, no traducir

### En Servicios TypeScript

#### lib/adapter-database.ts
- `'Target adapter not found in database'` → Necesita traducción

#### lib/backup-service.ts
- `'backup_not_found'` → YA ESTÁ COMO KEY (OK)
- `'vid_write_failed'` → Necesita traducción
- `'pid_write_failed'` → Necesita traducción
- `'invalid_backup_format'` → Necesita traducción

#### lib/encryption-service.ts
- `'common.error_decrypt_failed'` → YA ESTÁ COMO KEY (OK)
- `'No se pudo eliminar la clave de cifrado'` → HARDCODED EN ESPAÑOL
- `'No se pudo rotar la clave de cifrado'` → HARDCODED EN ESPAÑOL

#### lib/profiles-service.ts
- `'No se pudo guardar el perfil personalizado'` → HARDCODED EN ESPAÑOL
- `'Perfil no encontrado'` → HARDCODED EN ESPAÑOL
- `'No se pudo actualizar el perfil'` → HARDCODED EN ESPAÑOL
- `'No se pudo eliminar el perfil'` → HARDCODED EN ESPAÑOL
- `'profiles.error_invalid_json'` → YA ESTÁ COMO KEY (OK)
- `'profiles.error_import_failed'` → YA ESTÁ COMO KEY (OK)
- `'profiles.error_verification_failed'` → YA ESTÁ COMO KEY (OK)
- `'profiles.error_apply_failed'` → YA ESTÁ COMO KEY (OK)

#### lib/usb-service.ts
- `'USB operations only available on Android'` → Necesita traducción
- `'No device connected'` → Necesita traducción
- `'EEPROM detection only available on Android'` → Necesita traducción
- `'Dry-run only available on Android'` → Necesita traducción
- `'Checksum verification only available on Android'` → Necesita traducción
- `'Safe Test Mode only available on Android'` → Necesita traducción
- `'Device not found'` → Necesita traducción

#### lib/_core/api.ts
- `"Unknown error occurred"` → Necesita traducción

## Resumen

### Crítico (Errores hardcodeados en español)
- 6 mensajes de error en `encryption-service.ts` y `profiles-service.ts`

### Alto (Errores en inglés sin traducción)
- 8 mensajes de error en `usb-service.ts`
- 1 mensaje de error en `adapter-database.ts`
- 1 mensaje de error en `api.ts`

### Medio (Labels de UI sin traducción)
- 7 labels en componentes TSX (Magic Value, Total, Checksum, Device ID, Chipset, Serial)

### Bajo (Ya están como keys)
- Varios mensajes ya usan keys de traducción correctamente

## Acción Requerida

1. Agregar keys faltantes a es.json, en.json, de.json
2. Reemplazar textos hardcodeados por llamadas a t()
3. Verificar que todos los Alert.alert usen traducciones
