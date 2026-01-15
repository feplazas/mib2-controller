# Cómo Habilitar GitHub Pages para la Política de Privacidad

## Paso 1: Acceder a la Configuración del Repositorio

1. Ve a tu repositorio en GitHub: https://github.com/feplazas/mib2-controller
2. Haz clic en **Settings** (Configuración) en la barra superior
3. En el menú lateral izquierdo, busca y haz clic en **Pages**

## Paso 2: Configurar GitHub Pages

En la sección **GitHub Pages**, configura lo siguiente:

### Source (Fuente)
- **Branch:** Selecciona `main` en el menú desplegable
- **Folder:** Selecciona `/ (root)` 
- Haz clic en **Save** (Guardar)

![Configuración de GitHub Pages](https://docs.github.com/assets/cb-47267/mw-1440/images/help/pages/select-branch-and-folder.webp)

## Paso 3: Esperar el Despliegue

GitHub Pages tardará aproximadamente **1-2 minutos** en desplegar tu sitio.

Verás un mensaje como:
```
✅ Your site is live at https://feplazas.github.io/mib2-controller/
```

## Paso 4: Verificar la Política de Privacidad

Una vez desplegado, tu política de privacidad estará disponible en:

```
https://feplazas.github.io/mib2-controller/privacy-policy.html
```

**Prueba el enlace** para asegurarte de que funciona correctamente.

## Paso 5: Usar la URL en Google Play Store

Cuando subas tu app a Google Play Console:

1. Ve a **Store presence** → **Privacy policy**
2. Ingresa la URL: `https://feplazas.github.io/mib2-controller/privacy-policy.html`
3. Guarda los cambios

---

## Solución de Problemas

### El sitio no se despliega después de 5 minutos

1. Ve a **Settings** → **Pages**
2. Verifica que **Source** esté configurado en `main` y `/ (root)`
3. Ve a **Actions** en la barra superior del repositorio
4. Busca el workflow "pages build and deployment"
5. Si hay errores, haz clic para ver los detalles

### Error 404 al acceder a la URL

1. Asegúrate de que el archivo `privacy-policy.html` esté en la raíz del repositorio (no en una carpeta)
2. Verifica que el commit se haya pusheado correctamente: `git log --oneline -1`
3. Espera 2-3 minutos más y recarga la página

### El sitio muestra contenido antiguo

GitHub Pages usa caché. Para forzar actualización:
1. Abre la URL en modo incógnito/privado
2. O presiona `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac) para recargar sin caché

---

## Verificación Final

✅ **Checklist:**
- [ ] GitHub Pages habilitado en Settings → Pages
- [ ] Source configurado: `main` branch, `/ (root)` folder
- [ ] Sitio desplegado (mensaje verde en Settings → Pages)
- [ ] URL accesible: https://feplazas.github.io/mib2-controller/privacy-policy.html
- [ ] Política de privacidad se muestra correctamente
- [ ] URL agregada a Google Play Console

---

## Capturas de Pantalla de Referencia

### 1. Ubicación de Settings → Pages
```
Repositorio → Settings (pestaña superior) → Pages (menú lateral izquierdo)
```

### 2. Configuración Correcta
```
Build and deployment
├── Source: Deploy from a branch
├── Branch: main
└── Folder: / (root)
[Save]
```

### 3. Confirmación de Despliegue
```
✅ Your site is published at https://feplazas.github.io/mib2-controller/
```

---

**Tiempo estimado:** 5 minutos  
**Dificultad:** Fácil  
**Costo:** Gratis (GitHub Pages es gratuito para repositorios públicos)
