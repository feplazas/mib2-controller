# Cómo Alojar la Política de Privacidad

Google Play Store **requiere** que la política de privacidad esté alojada en una URL pública accesible. No puedes usar un archivo local.

---

## 📋 Opciones de Hosting (Gratuitas)

### ✅ **Opción 1: GitHub Pages (RECOMENDADO)**

**Ventajas:** Gratuito, fácil, control de versiones, HTTPS automático

**Pasos:**

1. **Crear repositorio público en GitHub**
   ```bash
   # Ejemplo: mib2-controller-privacy
   ```

2. **Subir PRIVACY_POLICY.md al repositorio**
   ```bash
   git init
   git add PRIVACY_POLICY.md
   git commit -m "Add privacy policy"
   git remote add origin https://github.com/TU_USUARIO/mib2-controller-privacy.git
   git push -u origin main
   ```

3. **Habilitar GitHub Pages**
   - Ve a Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

4. **URL resultante:**
   ```
   https://TU_USUARIO.github.io/mib2-controller-privacy/PRIVACY_POLICY
   ```

5. **Opcional: Convertir Markdown a HTML**
   - Renombra `PRIVACY_POLICY.md` a `index.html`
   - O usa un tema Jekyll automático

---

### ✅ **Opción 2: Google Sites**

**Ventajas:** Interfaz visual, sin código, HTTPS automático

**Pasos:**

1. Ve a https://sites.google.com
2. Crea un nuevo sitio
3. Copia y pega el contenido de `PRIVACY_POLICY.md`
4. Publica el sitio
5. Copia la URL pública

**URL resultante:**
```
https://sites.google.com/view/mib2-controller-privacy
```

---

### ✅ **Opción 3: Netlify Drop**

**Ventajas:** Drag & drop, HTTPS automático, sin registro

**Pasos:**

1. Ve a https://app.netlify.com/drop
2. Convierte `PRIVACY_POLICY.md` a HTML:
   ```bash
   # Usando pandoc (si está instalado)
   pandoc PRIVACY_POLICY.md -o index.html -s --metadata title="Privacy Policy"
   ```
3. Arrastra `index.html` a Netlify Drop
4. Copia la URL generada

**URL resultante:**
```
https://random-name-123456.netlify.app
```

---

### ✅ **Opción 4: Pastebin / GitHub Gist**

**Ventajas:** Rápido, sin configuración

**Pasos:**

1. **GitHub Gist:**
   - Ve a https://gist.github.com
   - Crea un nuevo Gist público
   - Pega el contenido de `PRIVACY_POLICY.md`
   - Copia la URL

2. **Pastebin:**
   - Ve a https://pastebin.com
   - Pega el contenido
   - Copia la URL

**URL resultante:**
```
https://gist.github.com/TU_USUARIO/abc123...
https://pastebin.com/abc123
```

---

## 🔗 Configurar URL en Play Console

Una vez que tengas la URL pública:

1. Ve a Google Play Console
2. Abre tu app
3. Ve a **Policy → App content**
4. En **Privacy policy**, pega la URL
5. Guarda los cambios

---

## ✅ Verificación

Antes de enviar a revisión, verifica:

- [ ] La URL es **pública** (no requiere login)
- [ ] La URL usa **HTTPS** (obligatorio)
- [ ] El contenido es **legible** (no código Markdown sin renderizar)
- [ ] La URL es **permanente** (no expira)
- [ ] El contenido coincide con `PRIVACY_POLICY.md`

---

## 📝 Contenido Actual

El archivo `PRIVACY_POLICY.md` en este proyecto contiene:

- Información de recopilación de datos (ninguna)
- Uso de permisos (USB, Network, Telnet)
- Transmisión de datos (solo API opcional de FEC)
- Derechos del usuario
- Información de contacto

**Tamaño:** ~3KB  
**Formato:** Markdown  
**Idioma:** Inglés (recomendado para alcance global)

---

## 🚀 Recomendación Final

**Usa GitHub Pages** si tienes cuenta de GitHub (gratuito, profesional, control de versiones).

**Usa Google Sites** si prefieres interfaz visual sin código.

**Tiempo estimado:** 5-10 minutos

---

**¡Importante!** Una vez alojada, **NO cambies la URL** después de publicar en Play Store, o tendrás que actualizar la app.
