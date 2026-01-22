# Content Rating (IARC) - Guía Paso a Paso para Play Console

## Introducción

Esta guía te llevará paso a paso por el cuestionario **IARC (International Age Rating Coalition)** en Google Play Console. Cada pregunta incluye la respuesta exacta que debes seleccionar para obtener la clasificación **"Everyone"** (apta para todas las edades).

**Tiempo estimado**: 15-20 minutos  
**Resultado esperado**: Everyone / PEGI 3 / USK 0

---

## Paso 1: Acceder a Content Rating

1. Ve a **Play Console** → https://play.google.com/console
2. Selecciona tu aplicación **MIB2 Controller**
3. En el menú lateral, ve a **App content** → **Content rating**
4. Click en **Start questionnaire**

---

## Paso 2: Información de Contacto

### Email address

**Respuesta**:
```
feplazas@gmail.com
```

### App category

**Pregunta**: "Which category best describes your app?"

**Respuesta**: ✅ **Utility, Productivity, Communication, or Other**

**Explicación**: MIB2 Controller es una herramienta de diagnóstico y utilidad para vehículos.

Click en **Next**.

---

## Paso 3: Violencia

### Pregunta 1: "Does your app contain any of the following?"

**Opciones**:
- ❌ Realistic violence
- ❌ Unrealistic or cartoon violence
- ❌ Depictions of violence towards realistic or cartoon characters
- ❌ Depictions of death or serious injury to realistic or cartoon characters
- ❌ Depictions of blood or gore

**Respuesta**: ❌ **None of the above**

**Explicación**: MIB2 Controller es una app técnica sin ningún contenido violento.

Click en **Next**.

---

## Paso 4: Contenido Sexual

### Pregunta 2: "Does your app contain any of the following?"

**Opciones**:
- ❌ Depictions of nudity or people in sexually suggestive poses
- ❌ Depictions of sexual acts or sexually suggestive content
- ❌ Sexual content involving minors
- ❌ Depictions of sexual violence

**Respuesta**: ❌ **None of the above**

**Explicación**: MIB2 Controller no contiene ningún contenido sexual.

Click en **Next**.

---

## Paso 5: Lenguaje Ofensivo

### Pregunta 3: "Does your app contain any of the following?"

**Opciones**:
- ❌ Profanity or crude humor
- ❌ References to illegal drugs, alcohol, or tobacco
- ❌ Mature or suggestive themes

**Respuesta**: ❌ **None of the above**

**Explicación**: MIB2 Controller usa lenguaje técnico profesional sin contenido ofensivo.

Click en **Next**.

---

## Paso 6: Drogas, Alcohol y Tabaco

### Pregunta 4: "Does your app contain any of the following?"

**Opciones**:
- ❌ References to or depictions of alcohol
- ❌ References to or depictions of tobacco
- ❌ References to or depictions of illegal drugs

**Respuesta**: ❌ **None of the above**

**Explicación**: MIB2 Controller no hace referencia a sustancias.

Click en **Next**.

---

## Paso 7: Contenido Generado por Usuarios

### Pregunta 5: "Can users interact with each other in your app?"

**Respuesta**: ❌ **No**

**Explicación**: MIB2 Controller no tiene funciones sociales ni de comunicación entre usuarios.

### Pregunta 6: "Can users share information with other users?"

**Respuesta**: ❌ **No**

**Explicación**: La app no permite compartir información entre usuarios.

### Pregunta 7: "Does your app include user-generated content?"

**Respuesta**: ❌ **No**

**Explicación**: Los usuarios no pueden crear ni compartir contenido dentro de la app.

Click en **Next**.

---

## Paso 8: Contenido Engañoso o Peligroso

### Pregunta 8: "Does your app contain any of the following?"

**Opciones**:
- ❌ Misleading or harmful content
- ❌ Promotion of illegal activities
- ❌ Depictions of gambling or simulated gambling
- ❌ Depictions of dangerous activities

**Respuesta**: ❌ **None of the above**

**Explicación**: MIB2 Controller es una herramienta legítima de diagnóstico vehicular. No promueve actividades ilegales ni peligrosas.

**Nota importante**: La app modifica VID/PID de adaptadores USB para compatibilidad técnica, lo cual es legal bajo las exenciones DMCA §1201 para reparación e interoperabilidad de vehículos propios.

Click en **Next**.

---

## Paso 9: Datos Sensibles

### Pregunta 9: "Does your app access or collect sensitive user data?"

**Opciones**:
- ❌ Location data
- ❌ Personal information (name, email, phone number, etc.)
- ❌ Financial information
- ❌ Health information
- ❌ Contacts
- ❌ Photos or videos

**Respuesta**: ❌ **None of the above**

**Explicación**: MIB2 Controller NO accede ni recopila ningún dato sensible del usuario. Solo interactúa con dispositivos USB locales.

Click en **Next**.

---

## Paso 10: Compras y Anuncios

### Pregunta 10: "Does your app contain ads?"

**Respuesta**: ❌ **No**

**Explicación**: MIB2 Controller no muestra publicidad.

### Pregunta 11: "Does your app contain in-app purchases?"

**Respuesta**: ❌ **No**

**Explicación**: La app es completamente gratuita sin compras dentro de la aplicación.

Click en **Next**.

---

## Paso 11: Revisión y Envío

Verás un resumen de tus respuestas. Revisa que todas sean correctas:

```
Content Rating Questionnaire Summary
├── App category: Utility
├── Violence: None
├── Sexual content: None
├── Profanity: None
├── Drugs/Alcohol/Tobacco: None
├── User interaction: No
├── User-generated content: No
├── Misleading content: None
├── Sensitive data: None
├── Ads: No
└── In-app purchases: No
```

**Instrucciones**:
1. Revisa todas las respuestas
2. Click en **Submit**
3. Espera 1-2 minutos para que se procese

---

## Paso 12: Resultado de la Clasificación

Después de enviar, verás las clasificaciones obtenidas:

| Región | Clasificación | Descripción |
|--------|---------------|-------------|
| **Global** | Everyone | Apta para todas las edades |
| **Europa (PEGI)** | PEGI 3 | Apta para mayores de 3 años |
| **Alemania (USK)** | USK 0 | Sin restricción de edad |
| **Australia (ACB)** | G | General |
| **Brasil (ClassInd)** | L | Libre |
| **Corea del Sur (GRAC)** | All | Todas las edades |

**Nota**: Estas son las clasificaciones más bajas posibles, lo que maximiza la audiencia potencial de tu app.

---

## Errores Comunes a Evitar

### ❌ Error 1: Seleccionar "Yes" en contenido peligroso

**Problema**: Si marcas que la app contiene "dangerous activities", obtendrás una clasificación más alta (Teen/12+).

**Solución**: Selecciona **"None of the above"**. La modificación de VID/PID es una operación técnica legítima, no una actividad peligrosa.

### ❌ Error 2: Marcar que la app accede a datos sensibles

**Problema**: Si marcas que accedes a location, contacts, etc., tendrás que justificarlo en Data Safety.

**Solución**: Selecciona **"None of the above"**. MIB2 Controller NO accede a datos del usuario.

### ❌ Error 3: No completar Content Rating antes de enviar

**Problema**: No podrás publicar la app sin una clasificación de contenido válida.

**Solución**: Completa el cuestionario IARC antes de enviar para revisión.

---

## Verificación Final

Antes de continuar, verifica que:

- ✅ Content Rating muestra estado **"Completed"** en Play Console
- ✅ La clasificación obtenida es **"Everyone"** o equivalente
- ✅ Todas las regiones muestran clasificaciones apropiadas
- ✅ No hay errores o advertencias en la sección

---

## Certificado IARC

Google Play generará automáticamente un **Certificado IARC** que puedes descargar desde:

**Play Console** → **App content** → **Content rating** → **Download certificate**

Este certificado es válido para todas las tiendas de aplicaciones que usan el sistema IARC (Google Play, Microsoft Store, Nintendo eShop, etc.).

---

## Próximo Paso

Una vez completados **Data Safety** y **Content Rating**, puedes continuar con:

1. **Subir el AAB** a Play Console → Production → Create new release
2. **Completar Store Listing** con textos y screenshots
3. **Seleccionar países de distribución**
4. **Enviar para revisión**

Sigue la guía `PLAY_CONSOLE_PUBLICATION_GUIDE.md` para los pasos finales.

---

## Soporte

Si encuentras algún problema:

1. **Revisa las respuestas**: Asegúrate de haber seleccionado exactamente las opciones indicadas
2. **Verifica el certificado**: Descarga el certificado IARC para confirmar la clasificación
3. **Contacta a Felipe Plazas**: feplazas@gmail.com
