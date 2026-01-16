# Dossier de Cumplimiento y Posición Legal para Google Play (Herramienta de Infotainment Vehicular Autorizada por el Propietario)

**Nombre de la aplicación:** MIB2 Controller (Android)

**Hardware objetivo:** Unidades de infotainment MIB2 STD2 del Grupo Volkswagen (variantes Technisat / Preh)

**Preparado por:** Felipe Plazas (Abogado)

**Fecha:** 16 de enero de 2026

---

## 1) Resumen ejecutivo

MIB2 Controller es una aplicación Android destinada al acceso **legal, autorizado por el propietario y local** a una unidad de infotainment vehicular **propiedad del usuario** (MIB2 STD2) para tareas de diagnóstico, mantenimiento y configuración. La aplicación requiere **acceso físico** al entorno del vehículo y una ruta de conexión directa (por ejemplo, adaptador USB a Ethernet y red local) y no está diseñada para intrusión remota, escaneo masivo o dirigirse a dispositivos de terceros.

Este dossier explica:

- Qué hace la aplicación (y qué no hace), en lenguaje claro
- El modelo de autorización del propietario y el requisito de acceso físico
- Controles de seguridad y transparencia destinados a reducir el uso indebido
- La justificación legal comúnmente utilizada para respaldar el acceso del propietario y la interoperabilidad en contextos de software vehicular embebido
- Cómo los revisores pueden probar la aplicación de manera controlada

**Nota importante:** Este documento es una aclaración de cumplimiento y declaración de posición legal. No reclama aceptación garantizada por Google Play, y no constituye asesoramiento legal para terceros.

---

## 2) Alcance del producto y usuarios previstos

### 2.1 Usuarios previstos

- Propietarios de vehículos (o personas con autorización explícita del propietario) que buscan diagnosticar, mantener o configurar su propia unidad de infotainment MIB2 STD2.
- Profesionales de reparación que actúan con la autorización del propietario, en condiciones controladas por el propietario.

### 2.2 Alcance previsto

- La aplicación se centra en **infotainment** (MIB2 STD2). No se comercializa como una herramienta de ajuste de ECU y no está diseñada para modificar el control del motor, el control de emisiones o los sistemas críticos de seguridad.
- La aplicación se usa localmente y requiere presencia física y control del propietario del dispositivo objetivo.

---

## 3) Qué hace la aplicación (veraz y específico)

MIB2 Controller proporciona al propietario un flujo de trabajo guiado para:

1. **Establecer conectividad local** a una unidad MIB2 STD2 a través de una ruta de conexión directa (comúnmente adaptadores USB a Ethernet y configuración de red local).
2. **Acceder a servicios locales en la unidad de infotainment** (incluido el acceso a consola interactiva como Telnet cuando está presente en la unidad/firmware) para ejecutar comandos iniciados por el usuario.
3. **Emulación de identificador de adaptador ("spoofing") para interoperabilidad** con ciertos chipsets de adaptadores USB a Ethernet, para habilitar la conectividad en casos donde la unidad de infotainment solo reconoce un subconjunto de adaptadores.
4. **Flujos de trabajo de habilitación de características gestionados por el propietario** (incluido el manejo de códigos/tokens de características estilo FEC) para configurar capacidades de infotainment en hardware que ya contiene las características de software relevantes pero tiene rutas de activación restringidas.
5. **Utilidades de solución de problemas** como acceso a registros, verificaciones de estado del sistema y pasos guiados de reparación/mantenimiento.

Todas las acciones son iniciadas por el usuario a través de la interfaz de usuario, y la aplicación está diseñada para ser transparente sobre lo que está haciendo.

### 3.1 Interfaz integrada y ruta de acceso legítima

- La aplicación se basa en interfaces y servicios que están **presentes en la unidad de infotainment** (por ejemplo, servicios de red local como Telnet cuando está habilitado/disponible en esa unidad/firmware), en lugar de explotar sistemas de terceros no relacionados.
- La aplicación no afirma ser una herramienta OEM y no se comercializa como un kit de explotación universal. Es un flujo de trabajo dirigido de uso del propietario para una plataforma de infotainment específica.

### 3.2 Exclusiones críticas de seguridad

- La aplicación no está destinada a modificar el control del motor, el control de emisiones, frenado, dirección, lógica de airbag u otros subsistemas críticos de seguridad.
- El alcance de la aplicación es la configuración y diagnóstico de infotainment en un contexto controlado por el propietario.

---

## 4) Qué NO hace la aplicación

Para evitar malentendidos, la aplicación **no** está diseñada para:

- Realizar explotación remota, escaneo o intrusión a través de Internet
- Dirigirse a dispositivos de terceros sin autorización
- Ocultar comportamiento (sin encubrimiento, sin acciones sigilosas que difieran de la funcionalidad divulgada)
- Instalar malware, spyware o cargas útiles de control remoto
- Recopilar credenciales, información de pago o datos personales sensibles no relacionados
- Ejecutar acciones "silenciosas" en segundo plano sin iniciación del usuario

---

## 5) Modelo de autorización del propietario y acceso físico

### 5.1 Principio de autorización del propietario

La aplicación está destinada a ser utilizada solo cuando el usuario:

- Es propietario del vehículo / unidad de infotainment, o
- Tiene autorización explícita del propietario (por ejemplo, contexto de reparación o mantenimiento)

### 5.2 Requisito de acceso físico

- La aplicación está diseñada para un escenario en el que el usuario está físicamente presente con el vehículo/unidad de infotainment y utiliza una ruta de conexión directa y local.
- La aplicación no proporciona una plataforma de acceso remoto de propósito general para dispositivos que el usuario no controla.

### 5.3 Advertencias visibles para el usuario y consentimiento

Se espera que la aplicación presente:

- Advertencias claras de que el dispositivo objetivo debe ser propiedad del usuario o utilizarse con permiso del propietario
- Advertencias de que el uso indebido (por ejemplo, acceso no autorizado, dispositivos robados) está prohibido
- Diálogos de confirmación antes de ejecutar operaciones potencialmente impactantes

---

## 6) Justificación de interoperabilidad para la emulación de identificador de adaptador ("spoofing")

Ciertos sistemas embebidos restringen la conectividad a periféricos o identificadores conocidos. En un entorno de uso del propietario, la emulación de identificador de adaptador se describe como una medida de **interoperabilidad y compatibilidad** que permite el acceso local entre el dispositivo Android del usuario y la propia unidad de infotainment del usuario.

### 6.1 Propiedad del propietario y justificación de compatibilidad

Cuando un consumidor posee legalmente un vehículo y su unidad de infotainment, el propietario tiene un interés legítimo en mantener, reparar y configurar esa propiedad. La emulación de identificador de adaptador se presenta aquí como una técnica de compatibilidad que ayuda al propietario a usar hardware razonable y fácilmente disponible para acceder a su propio dispositivo localmente, especialmente cuando los adaptadores originales o preferidos por el proveedor son escasos, descontinuados o poco prácticos.

### 6.2 Límites de seguridad y uso indebido

- La capacidad se limita al flujo de trabajo local del propietario de la aplicación (acceso físico, ruta de conexión directa).
- No se posiciona como una técnica para evadir la seguridad de la red, atacar objetivos remotos o acceder a sistemas de terceros.
- La aplicación no es un kit de escaneo o explotación genérico.

### 6.3 Objetivos prácticos

- Habilitar una ruta de conectividad estándar en hardware propiedad del propietario
- Reducir la dependencia de adaptadores escasos/descontinuados
- Permitir el acceso de diagnóstico y mantenimiento en un entorno controlado y local

---

## 7) Habilitación de características (flujos de trabajo estilo FEC) - marco de cumplimiento

La aplicación incluye flujos de trabajo relacionados con códigos/tokens de habilitación de características para capacidades de infotainment. Esto se enmarca como:

- Configuración gestionada por el propietario de características de infotainment en hardware propiedad del propietario
- Un flujo de trabajo de dispositivo local; la aplicación no actúa como cliente de servicio de suscripción o utilidad de piratería de propósito general
- No destinada a distribuir medios con derechos de autor, mapas o servicios de suscripción pagados

Los términos de uso de la aplicación prohíben usar la aplicación para violar derechos de terceros, términos de licencia o leyes aplicables.

---

## 8) Privacidad, manejo de datos y permisos

### 8.1 Manejo de datos

- La aplicación está destinada a operar localmente.
- Si se exportan o comparten registros de diagnóstico, esto es iniciado por el usuario.
- La aplicación no debe transmitir datos de diagnóstico fuera del dispositivo de forma predeterminada a menos que el usuario elija explícitamente compartirlos (por ejemplo, con soporte).

### 8.2 Minimización

- La aplicación solicita solo los permisos necesarios para sus características de conectividad y solución de problemas.
- La aplicación no recopila información personal no relacionada para publicidad o seguimiento.

(Para la revisión de Play, proporcione un archivo adjunto separado que enumere cada permiso de Android y su justificación.)

---

## 9) Alineación con las políticas de Google Play (cómo deben interpretar los revisores la aplicación)

### 9.1 Abuso de dispositivos y redes / comportamiento potencialmente dañino

La aplicación está destinada al uso **autorizado por el propietario** en un dispositivo embebido **propiedad del usuario** (unidad de infotainment) y no está destinada a intrusión no autorizada o hacking generalizado.

Factores limitantes clave:

- **Modelo de autorización del propietario** (uso del propietario/reparación autorizada)
- **Requisito de acceso físico** y ruta de conexión local
- **Sin características de escaneo masivo o explotación remota**
- **Sin encubrimiento o comportamiento engañoso**
- **Acciones iniciadas por el usuario** con advertencias y confirmaciones

### 9.2 Transparencia y control del usuario

- La interfaz de usuario de la aplicación está diseñada para divulgar claramente las acciones.
- La aplicación evita el comportamiento sigiloso en segundo plano.

---

## 10) Resumen del marco legal (contexto de EE. UU.) - acceso del propietario e interoperabilidad

Esta sección se proporciona para explicar por qué herramientas similares de acceso del propietario se defienden comúnmente en discusiones de derecho estadounidense. No es una afirmación de que cualquier caso de uso particular sea inmune a todo riesgo legal.

### 10.1 DMCA Sección 1201 y exenciones trienales

La ley de EE. UU. (17 U.S.C. 1201) contiene prohibiciones relacionadas con la elusión de medidas de protección tecnológica, pero el Bibliotecario del Congreso emite exenciones de forma trienal. Las exenciones actuales están codificadas en 37 C.F.R. 201.40.

Un tema de política clave en las exenciones relacionadas con vehículos es permitir la elusión cuando sea necesaria para **diagnóstico, reparación o modificación legal** por parte de los propietarios (sujeto a condiciones y limitaciones).

### 10.2 Principio de interoperabilidad

17 U.S.C. 1201(f) aborda la elusión con el propósito de lograr la interoperabilidad de programas de computadora creados independientemente con otros programas, bajo condiciones específicas.

En un escenario de uso del propietario, la interoperabilidad es una justificación central para:

- Habilitar una ruta de comunicación estándar entre el dispositivo del usuario y la unidad de infotainment
- Apoyar el acceso de mantenimiento y diagnóstico cuando las herramientas del proveedor no están disponibles o son poco prácticas

### 10.3 Limitaciones

- Las exenciones no anulan automáticamente otras leyes, términos contractuales o políticas de plataforma.
- El alcance previsto de la aplicación es infotainment y uso autorizado por el propietario.

### 10.4 Consideraciones de distribución y uso indebido

La distribución de software puede plantear preguntas legales adicionales más allá del acto legal de acceso de un usuario final, y diferentes jurisdicciones tratan esas preguntas de manera diferente. La posición del desarrollador es que MIB2 Controller es una herramienta de diagnóstico/configuración de uso del propietario dirigida con usos legítimos sustanciales en mantenimiento e interoperabilidad, y se distribuye con restricciones claras contra el acceso no autorizado, robo, fraude e infracción.

Este dossier no es una carta de opinión legal para ninguna jurisdicción específica; es una aclaración de cumplimiento destinada a ayudar a los revisores a comprender el propósito previsto, los límites y las salvaguardas de la aplicación.

---

## 11) Declaración de uso responsable (para el listado de la tienda y dentro de la aplicación)

Los usuarios deben aceptar que:

- Usarán la aplicación solo en dispositivos/vehículos que posean o tengan autorización explícita para dar servicio
- No usarán la aplicación para acceder a dispositivos de terceros sin autorización
- No usarán la aplicación para robo, fraude o elusión de servicios de suscripción
- No usarán la aplicación para modificar sistemas críticos de seguridad o relacionados con emisiones

El desarrollador se reserva el derecho de suspender el servicio/soporte e informar el uso indebido cuando lo requiera la ley.

---

## 12) Instrucciones de prueba para revisores (para Play Console)

Para evaluar la aplicación de manera segura y precisa, los revisores pueden:

1. Instalar la aplicación desde la pista de prueba.
2. Abrir la aplicación y revisar las divulgaciones y advertencias de incorporación.
3. Usar cualquier **modo de demostración** integrado (si se proporciona) para ver la interfaz de usuario, flujos de trabajo de registro y advertencias sin conectarse a hardware real.
4. Si se realiza una prueba de hardware:
   - Asegurar el acceso físico a una unidad MIB2 STD2 en un entorno controlado.
   - Conectar a través del método de conexión local compatible.
   - Verificar que la aplicación realice solo acciones locales iniciadas por el usuario y no escanee ni se dirija a redes externas.
5. Si se necesita evidencia adicional, el desarrollador puede proporcionar:
   - Una demostración en video corta del requisito de conexión física y el alcance solo local
   - Una hoja de justificación permiso por permiso
   - Copia de Términos de Uso / EULA

---

## 13) Contacto y escalamiento

Para preguntas de cumplimiento, aclaración del revisor o solicitudes de evidencia adicional:

- **Correo electrónico de soporte:** (agregar su dirección de soporte)
- **Sitio web/página de privacidad:** (agregar su URL)

---

## 14) Descargo de responsabilidad

Este documento se proporciona con fines de aclaración de cumplimiento y expresa la posición legal y el alcance del producto del desarrollador. No garantiza la aprobación por Google Play y no constituye asesoramiento legal para terceros.

---

## Apéndice A) Declaración corta para pegar en Play Console (Español)

> **Aclaración de cumplimiento:** MIB2 Controller es una herramienta local de diagnóstico y configuración autorizada por el propietario para unidades de infotainment MIB2 STD2 del Grupo Volkswagen (Technisat/Preh). Requiere acceso físico al entorno del vehículo y una ruta de conexión local directa (por ejemplo, adaptador USB a Ethernet). La aplicación no está destinada a intrusión remota, escaneo masivo o dirigirse a dispositivos o redes de terceros. Las acciones son iniciadas por el usuario y transparentes en la interfaz de usuario. La emulación de identificador de adaptador se implementa como una medida de compatibilidad/interoperabilidad para conectar el teléfono del usuario al propio hardware de infotainment del usuario en un entorno local controlado. Los flujos de trabajo de habilitación de características (tokens estilo FEC) se presentan como configuración gestionada por el propietario de capacidades de infotainment en hardware propiedad del propietario; la aplicación no es una utilidad de elusión de suscripción o piratería, y los Términos de Uso prohíben el acceso no autorizado, robo, fraude e infracción.

---

## Apéndice B) Declaración corta para pegar en Play Console (Inglés)

> **Compliance clarification:** MIB2 Controller is a local, owner-authorized diagnostic and configuration tool for Volkswagen Group MIB2 STD2 infotainment units (Technisat/Preh). It requires physical access to the vehicle environment and a direct local connection path (e.g., USB-to-Ethernet adapter). The app is not intended for remote intrusion, mass scanning, or targeting third-party devices or networks. Actions are user-initiated and transparent in the UI. Adapter identifier emulation is implemented as a compatibility/interoperability measure for connecting the user's phone to the user's own infotainment hardware in a controlled local setting. Feature-enable workflows (FEC-style tokens) are presented as owner-managed configuration of infotainment capabilities on owner-owned hardware; the app is not a subscription circumvention or piracy utility, and the Terms of Use prohibit unauthorized access, theft, fraud, and infringement.
