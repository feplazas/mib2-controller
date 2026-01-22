# Data Safety - Guía Paso a Paso para Play Console

## Introducción

Esta guía te llevará paso a paso por el formulario de **Data Safety** en Google Play Console. Cada pregunta incluye la respuesta exacta que debes seleccionar para MIB2 Controller.

**Tiempo estimado**: 10-15 minutos

---

## Paso 1: Acceder a Data Safety

1. Ve a **Play Console** → https://play.google.com/console
2. Selecciona tu aplicación **MIB2 Controller**
3. En el menú lateral, ve a **App content** → **Data safety**
4. Click en **Start**

---

## Paso 2: Recopilación y Compartición de Datos

### Pregunta 1: "Does your app collect or share any of the required user data types?"

**Respuesta**: ❌ **No**

**Explicación**: MIB2 Controller NO recopila ni comparte ningún tipo de dato del usuario. La app funciona completamente offline y solo interactúa con dispositivos USB locales.

Click en **Next**.

---

## Paso 3: Prácticas de Seguridad

### Pregunta 2: "Is all of the user data collected by your app encrypted in transit?"

**Respuesta**: ✅ **Yes**

**Explicación**: Aunque la app no recopila datos, debes responder "Yes" porque cualquier comunicación de red (si la hubiera) usa protocolos seguros.

### Pregunta 3: "Do you provide a way for users to request that their data is deleted?"

**Respuesta**: ❌ **No**

**Explicación**: Como no recopilamos datos, no hay datos que eliminar.

Click en **Next**.

---

## Paso 4: Política de Privacidad

### Pregunta 4: "Privacy policy"

**URL de la Política de Privacidad**:
```
https://feplazas.github.io/mib2-controller-privacy/
```

**Instrucciones**:
1. Copia y pega la URL exacta en el campo
2. Click en **Save**

**Nota**: Esta URL ya está publicada y accesible públicamente en GitHub Pages.

---

## Paso 5: Revisión Final

Verás un resumen de tus respuestas:

```
Data collection and security
├── Does your app collect or share user data? → No
├── Is data encrypted in transit? → Yes
├── Can users request data deletion? → No
└── Privacy policy → https://feplazas.github.io/mib2-controller-privacy/
```

**Instrucciones**:
1. Revisa que todas las respuestas sean correctas
2. Click en **Submit**

---

## Paso 6: Vista Previa para Usuarios

Después de enviar, los usuarios verán esto en Play Store:

### Data safety

**No data collected**

The developer says this app doesn't collect or share user data.

[Learn more about how developers declare collection](https://support.google.com/googleplay/android-developer/answer/10787469)

---

## Errores Comunes a Evitar

### ❌ Error 1: Seleccionar "Yes" en la primera pregunta

**Problema**: Si seleccionas "Yes", tendrás que especificar qué tipos de datos recopilas, lo cual es incorrecto para MIB2 Controller.

**Solución**: Asegúrate de seleccionar **"No"** en la pregunta de recopilación de datos.

### ❌ Error 2: URL de Privacy Policy incorrecta

**Problema**: Si la URL no es accesible públicamente, Play Console rechazará el formulario.

**Solución**: Usa exactamente esta URL: `https://feplazas.github.io/mib2-controller-privacy/`

### ❌ Error 3: No completar Data Safety antes de enviar para revisión

**Problema**: No podrás enviar la app para revisión sin completar Data Safety.

**Solución**: Completa Data Safety antes de subir el AAB.

---

## Verificación Final

Antes de continuar, verifica que:

- ✅ Data Safety muestra estado **"Completed"** en Play Console
- ✅ La vista previa muestra **"No data collected"**
- ✅ La URL de Privacy Policy es accesible en un navegador
- ✅ No hay errores o advertencias en la sección

---

## Próximo Paso

Una vez completado Data Safety, continúa con **Content Rating** siguiendo la guía `CONTENT_RATING_STEP_BY_STEP.md`.

---

## Soporte

Si encuentras algún problema:

1. **Verifica la URL de Privacy Policy**: Abre https://feplazas.github.io/mib2-controller-privacy/ en tu navegador
2. **Revisa las respuestas**: Asegúrate de haber seleccionado exactamente las respuestas indicadas
3. **Contacta a Felipe Plazas**: feplazas@gmail.com
