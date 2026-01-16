# Instrucciones para Habilitar GitHub Pages

## Política de Privacidad en Español, Inglés y Alemán

Los archivos de política de privacidad han sido creados y pusheados al repositorio en la carpeta `docs/`:

- `docs/index.html` - Página principal con selector de idioma y auto-redirección
- `docs/privacy-policy-es.html` - Política de privacidad en español
- `docs/privacy-policy-en.html` - Política de privacidad en inglés
- `docs/privacy-policy-de.html` - Política de privacidad en alemán

## Pasos para Habilitar GitHub Pages

1. **Ve a la configuración del repositorio:**
   https://github.com/feplazas/mib2-controller/settings/pages

2. **En la sección "Build and deployment":**
   - **Source:** Selecciona "Deploy from a branch"
   - **Branch:** Selecciona `main`
   - **Folder:** Selecciona `/docs`
   - Haz clic en **Save**

3. **Espera 1-2 minutos** para que GitHub Pages se despliegue.

4. **Verifica las URLs:**
   - **Página principal:** https://feplazas.github.io/mib2-controller/
   - **Español:** https://feplazas.github.io/mib2-controller/privacy-policy-es.html
   - **Inglés:** https://feplazas.github.io/mib2-controller/privacy-policy-en.html
   - **Alemán:** https://feplazas.github.io/mib2-controller/privacy-policy-de.html

## Características de la Política de Privacidad

### Auto-Redirección por Idioma del Navegador
La página principal (`index.html`) detecta automáticamente el idioma del navegador del usuario y redirige a la versión correspondiente:
- Navegador en español → `privacy-policy-es.html`
- Navegador en alemán → `privacy-policy-de.html`
- Otros idiomas → `privacy-policy-en.html` (inglés por defecto)

### Selector de Idioma
Todas las páginas incluyen un selector de idioma en la parte superior para cambiar fácilmente entre español, inglés y alemán.

### Diseño Responsive
Las páginas están optimizadas para dispositivos móviles y de escritorio con diseño responsive.

### Contenido Completo
Cada versión incluye 13 secciones completas:
1. Información General
2. Datos que NO Recopilamos
3. Funcionamiento Local de la Aplicación
4. Permisos de Android
5. Almacenamiento Local de Datos
6. Comunicaciones de Red
7. Servicios de Terceros
8. Seguridad de Datos
9. Privacidad de Niños
10. Cambios a esta Política de Privacidad
11. Sus Derechos de Privacidad
12. Cumplimiento con GDPR y CCPA
13. Contacto

## URL para Google Play Store

Una vez habilitado GitHub Pages, usa esta URL en el formulario de Play Store:

**URL de Política de Privacidad:**
```
https://feplazas.github.io/mib2-controller/
```

La página principal detectará automáticamente el idioma del usuario y mostrará la versión correcta.

## Verificación

Para verificar que GitHub Pages está funcionando correctamente:

1. Abre https://feplazas.github.io/mib2-controller/ en tu navegador
2. Verifica que se redirija automáticamente a la versión en tu idioma
3. Prueba el selector de idioma en la parte superior
4. Verifica que todas las secciones se muestren correctamente

## Solución de Problemas

### Error 404 - Página no encontrada
- Espera 2-3 minutos después de habilitar GitHub Pages
- Verifica que la rama `main` tenga los archivos en la carpeta `docs/`
- Asegúrate de haber seleccionado `/docs` como carpeta de origen

### Contenido no actualizado
- GitHub Pages puede tardar hasta 10 minutos en actualizar el contenido
- Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)
- Prueba en modo incógnito

### Estilos no se aplican
- Verifica que los archivos HTML tengan el CSS embebido correctamente
- Revisa la consola del navegador (F12) para errores

---

**Última actualización:** 16 de enero de 2026  
**Autor:** Manus AI para Felipe Plazas
