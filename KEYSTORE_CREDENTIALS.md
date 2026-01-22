# Keystore Credentials - MIB2 Controller

## Información del Keystore

**Keystore ID**: evIXv6BtNF (almacenado en Expo EAS)  
**Application ID**: com.feplazas.mib2controller  
**Type**: JKS  
**Key Alias**: 61e29d404139ad73fda35addca80badf

## Fingerprints

**MD5 Fingerprint**:  
```
6E:2C:36:94:FF:65:03:60:DD:D5:0B:B3:3F:BA:3E:98
```

**SHA1 Fingerprint**:  
```
10:14:D2:28:8B:6C:17:05:87:A0:E2:93:61:9A:D0:46:95:6D:82:DA
```

**SHA256 Fingerprint**:  
```
23:71:26:8F:00:51:FF:A8:11:C5:08:AF:DA:B3:0D:C7:CB:E9:D4:CC:FE:41:0B:AC:56:44:85:69:B0:65:0A:3B
```

## Cómo descargar el keystore

Para descargar el archivo `.jks` y las contraseñas, ejecuta:

```bash
npx eas-cli credentials -p android
```

Luego selecciona:
1. **Build profile**: production
2. **Keystore**: Manage everything needed to build your project
3. **Download existing keystore**

Esto descargará:
- `keystore.jks` - El archivo del keystore
- Las contraseñas del keystore y key alias (mostradas en terminal)

## Uso en otras apps

Para usar este keystore en otras aplicaciones:

1. Descarga el keystore siguiendo los pasos anteriores
2. Copia el archivo `keystore.jks` a tu proyecto
3. Crea un archivo `keystore.properties` con:
   ```properties
   storeFile=keystore.jks
   storePassword=[password from EAS CLI]
   keyAlias=61e29d404139ad73fda35addca80badf
   keyPassword=[password from EAS CLI]
   ```
4. Configura tu `build.gradle` para usar estas credenciales

## Nota de seguridad

⚠️ **IMPORTANTE**: Este keystore es crítico para firmar tus aplicaciones. Si lo pierdes o se compromete:
- No podrás actualizar apps existentes en Play Store
- Tendrás que crear un nuevo keystore y publicar como nueva app

Mantén el keystore y las contraseñas en un lugar seguro (ej: password manager, vault).
