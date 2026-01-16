# Documentos Legales y de Cumplimiento para Google Play Store

Esta carpeta contiene los documentos legales necesarios para la revisión y aprobación de MIB2 Controller en Google Play Store.

---

## Contenido

### 1. Dossier de Cumplimiento (Inglés)
**Archivo:** `MIB2_Controller_Play_Compliance_Dossier.md`

Documento legal completo en inglés preparado por Felipe Plazas (Abogado) que explica:

- Alcance del producto y usuarios previstos
- Qué hace la aplicación (y qué NO hace)
- Modelo de autorización del propietario y acceso físico
- Justificación de interoperabilidad para emulación de identificadores
- Marco legal (DMCA, interoperabilidad, acceso del propietario)
- Alineación con políticas de Google Play
- Instrucciones de prueba para revisores
- Declaración de uso responsable

**Uso:** Adjuntar al formulario de apelación/revisión de Google Play Console cuando sea necesario.

---

### 2. Dossier de Cumplimiento (Español)
**Archivo:** `MIB2_Controller_Dossier_Cumplimiento_Play_ES.md`

Traducción completa al español del documento anterior, manteniendo la misma estructura, rigor legal y contenido.

**Uso:** Para documentación interna, comunicación con usuarios hispanohablantes, y referencia legal en jurisdicciones de habla hispana.

---

## Declaraciones Cortas para Play Console

Ambos documentos incluyen un **Apéndice A** con declaraciones cortas (en español e inglés) listas para copiar y pegar en el campo de "Aclaración de cumplimiento" de Google Play Console durante el proceso de revisión.

### Declaración en Español (Apéndice A)

> **Aclaración de cumplimiento:** MIB2 Controller es una herramienta local de diagnóstico y configuración autorizada por el propietario para unidades de infotainment MIB2 STD2 del Grupo Volkswagen (Technisat/Preh). Requiere acceso físico al entorno del vehículo y una ruta de conexión local directa (por ejemplo, adaptador USB a Ethernet). La aplicación no está destinada a intrusión remota, escaneo masivo o dirigirse a dispositivos o redes de terceros. Las acciones son iniciadas por el usuario y transparentes en la interfaz de usuario. La emulación de identificador de adaptador se implementa como una medida de compatibilidad/interoperabilidad para conectar el teléfono del usuario al propio hardware de infotainment del usuario en un entorno local controlado. Los flujos de trabajo de habilitación de características (tokens estilo FEC) se presentan como configuración gestionada por el propietario de capacidades de infotainment en hardware propiedad del propietario; la aplicación no es una utilidad de elusión de suscripción o piratería, y los Términos de Uso prohíben el acceso no autorizado, robo, fraude e infracción.

### Declaración en Inglés (Apéndice A)

> **Compliance clarification:** MIB2 Controller is a local, owner-authorized diagnostic and configuration tool for Volkswagen Group MIB2 STD2 infotainment units (Technisat/Preh). It requires physical access to the vehicle environment and a direct local connection path (e.g., USB-to-Ethernet adapter). The app is not intended for remote intrusion, mass scanning, or targeting third-party devices or networks. Actions are user-initiated and transparent in the UI. Adapter identifier emulation is implemented as a compatibility/interoperability measure for connecting the user's phone to the user's own infotainment hardware in a controlled local setting. Feature-enable workflows (FEC-style tokens) are presented as owner-managed configuration of infotainment capabilities on owner-owned hardware; the app is not a subscription circumvention or piracy utility, and the Terms of Use prohibit unauthorized access, theft, fraud, and infringement.

---

## Cuándo Usar Estos Documentos

### Escenario 1: Revisión Inicial de Google Play
- Subir el AAB/APK normalmente
- Si Google solicita aclaración sobre la funcionalidad de la app, adjuntar el dossier completo (inglés) como evidencia

### Escenario 2: Apelación de Rechazo
- Si la app es rechazada por "Device and Network Abuse" o "Potentially Harmful Behavior"
- Adjuntar el dossier completo (inglés) en el formulario de apelación
- Copiar la declaración corta del Apéndice A en el campo de texto de la apelación

### Escenario 3: Solicitud de Información Adicional
- Si los revisores solicitan más detalles sobre:
  - Modelo de autorización del propietario
  - Requisito de acceso físico
  - Justificación legal para emulación de identificadores
  - Flujos de trabajo de habilitación de características
- Proporcionar secciones específicas del dossier según la pregunta

### Escenario 4: Documentación Pública
- Publicar el dossier en el repositorio de GitHub para transparencia
- Incluir enlace en la descripción de la app en Play Store
- Usar como referencia en comunicaciones con usuarios y autoridades

---

## Contacto

Para preguntas sobre estos documentos legales:

- **Preparado por:** Felipe Plazas (Abogado)
- **Fecha:** 16 de enero de 2026
- **Soporte:** (agregar correo electrónico de soporte)

---

## Descargo de Responsabilidad

Estos documentos se proporcionan con fines de aclaración de cumplimiento y expresan la posición legal y el alcance del producto del desarrollador. No garantizan la aprobación por Google Play y no constituyen asesoramiento legal para terceros.
