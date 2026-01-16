# Respuestas Predefinidas para Revisores de Google Play

**App:** MIB2 Controller (Android)  
**Preparado por:** Felipe Plazas (Abogado)  
**Fecha:** 16 de enero de 2026  
**Versión:** 1.0

---

## Propósito de Este Documento

Este documento proporciona respuestas predefinidas, claras y fundamentadas para las preguntas más comunes que los revisores de Google Play podrían hacer durante el proceso de revisión de MIB2 Controller. Todas las respuestas están basadas en el dossier legal completo y están diseñadas para ser copiadas y pegadas directamente en comunicaciones con Google Play.

---

## Tabla de Contenidos

1. [Preguntas sobre Funcionalidad y Propósito](#1-preguntas-sobre-funcionalidad-y-propósito)
2. [Preguntas sobre Autorización y Acceso](#2-preguntas-sobre-autorización-y-acceso)
3. [Preguntas sobre "Spoofing" y Emulación](#3-preguntas-sobre-spoofing-y-emulación)
4. [Preguntas sobre Habilitación de Características (FEC)](#4-preguntas-sobre-habilitación-de-características-fec)
5. [Preguntas sobre Seguridad y Privacidad](#5-preguntas-sobre-seguridad-y-privacidad)
6. [Preguntas sobre Políticas de Google Play](#6-preguntas-sobre-políticas-de-google-play)
7. [Preguntas sobre Marco Legal](#7-preguntas-sobre-marco-legal)
8. [Preguntas sobre Pruebas y Demostración](#8-preguntas-sobre-pruebas-y-demostración)

---

## 1. Preguntas sobre Funcionalidad y Propósito

### Q1.1: ¿Qué hace exactamente esta aplicación?

**Respuesta (Inglés):**

> MIB2 Controller is a local, owner-authorized diagnostic and configuration tool for Volkswagen Group MIB2 STD2 infotainment units (Technisat/Preh variants). The app provides vehicle owners with guided workflows to:
>
> 1. Establish local connectivity to their own MIB2 STD2 unit via a direct connection path (USB-to-Ethernet adapter and local network)
> 2. Access local services on the infotainment unit (such as Telnet where present on the unit/firmware) to run user-initiated diagnostic commands
> 3. Enable adapter identifier emulation for interoperability with USB-to-Ethernet chipsets
> 4. Manage owner-controlled feature enablement workflows (FEC-style tokens) for infotainment capabilities
> 5. Access troubleshooting utilities such as logs, system status checks, and guided maintenance steps
>
> The app is focused exclusively on infotainment system diagnostics and configuration. It is NOT designed to modify engine control, emissions control, braking, steering, airbag logic, or other safety-critical subsystems. All actions are user-initiated and transparent in the UI.

**Respuesta (Español):**

> MIB2 Controller es una herramienta local de diagnóstico y configuración autorizada por el propietario para unidades de infotainment MIB2 STD2 del Grupo Volkswagen (variantes Technisat/Preh). La aplicación proporciona a los propietarios de vehículos flujos de trabajo guiados para:
>
> 1. Establecer conectividad local a su propia unidad MIB2 STD2 a través de una ruta de conexión directa (adaptador USB a Ethernet y red local)
> 2. Acceder a servicios locales en la unidad de infotainment (como Telnet cuando está presente en la unidad/firmware) para ejecutar comandos de diagnóstico iniciados por el usuario
> 3. Habilitar emulación de identificador de adaptador para interoperabilidad con chipsets USB a Ethernet
> 4. Gestionar flujos de trabajo de habilitación de características controlados por el propietario (tokens estilo FEC) para capacidades de infotainment
> 5. Acceder a utilidades de solución de problemas como registros, verificaciones de estado del sistema y pasos de mantenimiento guiados
>
> La aplicación se centra exclusivamente en diagnóstico y configuración del sistema de infotainment. NO está diseñada para modificar el control del motor, control de emisiones, frenado, dirección, lógica de airbag u otros subsistemas críticos de seguridad. Todas las acciones son iniciadas por el usuario y transparentes en la interfaz de usuario.

---

### Q1.2: ¿Por qué necesitan los usuarios esta aplicación?

**Respuesta (Inglés):**

> Vehicle owners need this app for legitimate diagnostic, maintenance, and configuration purposes:
>
> - **Diagnosis:** Identify connectivity issues, read system logs, check firmware versions, and troubleshoot infotainment problems without requiring expensive dealership visits.
> - **Maintenance:** Perform routine maintenance tasks such as clearing caches, resetting configurations, and verifying system integrity.
> - **Configuration:** Customize infotainment settings, enable features already present in the hardware but restricted by activation paths, and optimize the user experience.
> - **Interoperability:** Use readily available USB-to-Ethernet adapters (when original/vendor-preferred adapters are scarce, discontinued, or impractical) to establish local connectivity with their own infotainment unit.
>
> The app empowers vehicle owners to exercise their property rights over their own infotainment hardware, reduces dependence on dealership monopolies, and promotes competition in the vehicle maintenance and repair market.

**Respuesta (Español):**

> Los propietarios de vehículos necesitan esta aplicación para propósitos legítimos de diagnóstico, mantenimiento y configuración:
>
> - **Diagnóstico:** Identificar problemas de conectividad, leer registros del sistema, verificar versiones de firmware y solucionar problemas de infotainment sin requerir costosas visitas al concesionario.
> - **Mantenimiento:** Realizar tareas de mantenimiento rutinarias como limpiar cachés, restablecer configuraciones y verificar la integridad del sistema.
> - **Configuración:** Personalizar ajustes de infotainment, habilitar características ya presentes en el hardware pero restringidas por rutas de activación, y optimizar la experiencia del usuario.
> - **Interoperabilidad:** Usar adaptadores USB a Ethernet fácilmente disponibles (cuando los adaptadores originales/preferidos por el proveedor son escasos, descontinuados o poco prácticos) para establecer conectividad local con su propia unidad de infotainment.
>
> La aplicación empodera a los propietarios de vehículos para ejercer sus derechos de propiedad sobre su propio hardware de infotainment, reduce la dependencia de monopolios de concesionarios y promueve la competencia en el mercado de mantenimiento y reparación de vehículos.

---

## 2. Preguntas sobre Autorización y Acceso

### Q2.1: ¿Cómo garantizan que solo los propietarios autorizados usen la aplicación?

**Respuesta (Inglés):**

> The app implements a multi-layered owner-authorization model:
>
> 1. **Physical access requirement:** The app requires the user to be physically present with the vehicle/infotainment unit and use a direct, local connection path (USB-to-Ethernet adapter plugged into the vehicle's USB port). Remote access across the internet is not supported.
>
> 2. **User-visible warnings:** The app displays clear warnings during onboarding and before potentially impactful operations, stating that:
>    - The target device must be user-owned or used with explicit owner permission
>    - Misuse (unauthorized access, stolen devices) is prohibited and may violate laws
>    - The user is responsible for their actions and compliance with applicable laws
>
> 3. **Confirmation dialogs:** Before executing operations that could modify system configurations, the app requires explicit user confirmation through dialog prompts.
>
> 4. **No remote exploitation features:** The app does not provide mass scanning, remote intrusion, or generalized hacking capabilities. It is a targeted owner-use workflow for a specific infotainment platform.
>
> 5. **Terms of Use enforcement:** The app's Terms of Use explicitly prohibit unauthorized access, theft, fraud, and infringement. The developer reserves the right to suspend service/support and report misuse where required by law.
>
> These safeguards ensure that the app is used only in owner-authorized, local, and controlled scenarios.

**Respuesta (Español):**

> La aplicación implementa un modelo de autorización del propietario de múltiples capas:
>
> 1. **Requisito de acceso físico:** La aplicación requiere que el usuario esté físicamente presente con el vehículo/unidad de infotainment y use una ruta de conexión directa y local (adaptador USB a Ethernet conectado al puerto USB del vehículo). No se admite acceso remoto a través de Internet.
>
> 2. **Advertencias visibles para el usuario:** La aplicación muestra advertencias claras durante la incorporación y antes de operaciones potencialmente impactantes, indicando que:
>    - El dispositivo objetivo debe ser propiedad del usuario o utilizarse con permiso explícito del propietario
>    - El uso indebido (acceso no autorizado, dispositivos robados) está prohibido y puede violar leyes
>    - El usuario es responsable de sus acciones y del cumplimiento de las leyes aplicables
>
> 3. **Diálogos de confirmación:** Antes de ejecutar operaciones que podrían modificar configuraciones del sistema, la aplicación requiere confirmación explícita del usuario a través de diálogos de aviso.
>
> 4. **Sin características de explotación remota:** La aplicación no proporciona escaneo masivo, intrusión remota o capacidades de hacking generalizado. Es un flujo de trabajo dirigido de uso del propietario para una plataforma de infotainment específica.
>
> 5. **Aplicación de Términos de Uso:** Los Términos de Uso de la aplicación prohíben explícitamente el acceso no autorizado, robo, fraude e infracción. El desarrollador se reserva el derecho de suspender el servicio/soporte e informar el uso indebido cuando lo requiera la ley.
>
> Estas salvaguardas aseguran que la aplicación se use solo en escenarios autorizados por el propietario, locales y controlados.

---

### Q2.2: ¿Puede esta aplicación usarse para acceder a dispositivos de terceros sin autorización?

**Respuesta (Inglés):**

> No. The app is specifically designed to prevent unauthorized access to third-party devices:
>
> 1. **Physical access requirement:** The app requires a direct, local connection via USB-to-Ethernet adapter plugged into the vehicle's USB port. This physical requirement makes it impractical to target remote or third-party devices.
>
> 2. **No mass scanning features:** The app does not include network scanning tools to discover or target arbitrary devices on external networks.
>
> 3. **Targeted platform:** The app is designed for a specific infotainment platform (MIB2 STD2 Technisat/Preh) and relies on interfaces and services that are present on that platform. It is not a general-purpose exploitation toolkit.
>
> 4. **User warnings and Terms of Use:** The app explicitly warns users that unauthorized access is prohibited and may violate laws. The Terms of Use prohibit using the app to access third-party devices without authorization.
>
> 5. **No stealth or cloaking behavior:** All actions are user-initiated and transparent in the UI. The app does not hide its behavior or execute background actions without user knowledge.
>
> The app's design, safeguards, and legal terms ensure that it is used only for owner-authorized, local access to the user's own infotainment hardware.

**Respuesta (Español):**

> No. La aplicación está específicamente diseñada para prevenir el acceso no autorizado a dispositivos de terceros:
>
> 1. **Requisito de acceso físico:** La aplicación requiere una conexión directa y local a través de un adaptador USB a Ethernet conectado al puerto USB del vehículo. Este requisito físico hace que sea poco práctico dirigirse a dispositivos remotos o de terceros.
>
> 2. **Sin características de escaneo masivo:** La aplicación no incluye herramientas de escaneo de red para descubrir o dirigirse a dispositivos arbitrarios en redes externas.
>
> 3. **Plataforma dirigida:** La aplicación está diseñada para una plataforma de infotainment específica (MIB2 STD2 Technisat/Preh) y se basa en interfaces y servicios que están presentes en esa plataforma. No es un kit de explotación de propósito general.
>
> 4. **Advertencias de usuario y Términos de Uso:** La aplicación advierte explícitamente a los usuarios que el acceso no autorizado está prohibido y puede violar leyes. Los Términos de Uso prohíben usar la aplicación para acceder a dispositivos de terceros sin autorización.
>
> 5. **Sin comportamiento sigiloso o de encubrimiento:** Todas las acciones son iniciadas por el usuario y transparentes en la interfaz de usuario. La aplicación no oculta su comportamiento ni ejecuta acciones en segundo plano sin el conocimiento del usuario.
>
> El diseño, las salvaguardas y los términos legales de la aplicación aseguran que se use solo para acceso local autorizado por el propietario al propio hardware de infotainment del usuario.

---

## 3. Preguntas sobre "Spoofing" y Emulación

### Q3.1: ¿Por qué la aplicación incluye funcionalidad de "spoofing" de identificadores de adaptador?

**Respuesta (Inglés):**

> Adapter identifier emulation (often called "spoofing") is implemented as a **compatibility and interoperability measure** to enable local connectivity between the user's Android device and the user's own infotainment hardware.
>
> **Context:** Certain embedded systems (including MIB2 STD2 units) restrict connectivity to known peripherals or specific hardware identifiers. When original or vendor-preferred USB-to-Ethernet adapters are scarce, discontinued, or impractical, vehicle owners face barriers to accessing their own infotainment unit for legitimate diagnostic and maintenance purposes.
>
> **Purpose:** Adapter identifier emulation helps the vehicle owner use readily available, standard USB-to-Ethernet adapters to establish a local connection with their own infotainment hardware. This is analogous to using a generic printer driver to enable compatibility with a printer that only officially supports proprietary drivers.
>
> **Scope and limitations:**
> - The capability is limited to the app's local owner workflow (physical access, direct connection path)
> - It is NOT positioned as a technique to evade network security, attack remote targets, or access third-party systems
> - The app is not a generic scanning or exploitation toolkit
>
> **Legal rationale:** In U.S. law, 17 U.S.C. 1201(f) addresses circumvention for the purpose of achieving interoperability of independently created computer programs with other programs, under specific conditions. In an owner-use scenario, interoperability is a core rationale for enabling a standard communication path between the user's device and their own infotainment unit.
>
> This feature promotes owner property rights, reduces dependence on scarce/discontinued adapters, and enables diagnostic and maintenance access in a controlled, local environment.

**Respuesta (Español):**

> La emulación de identificador de adaptador (a menudo llamada "spoofing") se implementa como una **medida de compatibilidad e interoperabilidad** para habilitar la conectividad local entre el dispositivo Android del usuario y el propio hardware de infotainment del usuario.
>
> **Contexto:** Ciertos sistemas embebidos (incluidas las unidades MIB2 STD2) restringen la conectividad a periféricos conocidos o identificadores de hardware específicos. Cuando los adaptadores USB a Ethernet originales o preferidos por el proveedor son escasos, descontinuados o poco prácticos, los propietarios de vehículos enfrentan barreras para acceder a su propia unidad de infotainment para propósitos legítimos de diagnóstico y mantenimiento.
>
> **Propósito:** La emulación de identificador de adaptador ayuda al propietario del vehículo a usar adaptadores USB a Ethernet estándar y fácilmente disponibles para establecer una conexión local con su propio hardware de infotainment. Esto es análogo a usar un controlador de impresora genérico para habilitar la compatibilidad con una impresora que solo admite oficialmente controladores propietarios.
>
> **Alcance y limitaciones:**
> - La capacidad se limita al flujo de trabajo local del propietario de la aplicación (acceso físico, ruta de conexión directa)
> - NO se posiciona como una técnica para evadir la seguridad de la red, atacar objetivos remotos o acceder a sistemas de terceros
> - La aplicación no es un kit de escaneo o explotación genérico
>
> **Justificación legal:** En la ley de EE. UU., 17 U.S.C. 1201(f) aborda la elusión con el propósito de lograr la interoperabilidad de programas de computadora creados independientemente con otros programas, bajo condiciones específicas. En un escenario de uso del propietario, la interoperabilidad es una justificación central para habilitar una ruta de comunicación estándar entre el dispositivo del usuario y su propia unidad de infotainment.
>
> Esta característica promueve los derechos de propiedad del propietario, reduce la dependencia de adaptadores escasos/descontinuados y habilita el acceso de diagnóstico y mantenimiento en un entorno controlado y local.

---

### Q3.2: ¿Puede esta funcionalidad usarse para actividades maliciosas?

**Respuesta (Inglés):**

> The adapter identifier emulation feature is designed with strict limitations to prevent misuse:
>
> 1. **Local-only scope:** The feature operates only in the context of a direct, local connection between the user's Android device and the user's own infotainment unit. It does not enable remote access or targeting of third-party devices.
>
> 2. **Physical access requirement:** The user must be physically present with the vehicle and connect via a USB-to-Ethernet adapter plugged into the vehicle's USB port. This physical barrier makes it impractical to use the feature for remote or mass-scale attacks.
>
> 3. **Targeted platform:** The feature is designed specifically for MIB2 STD2 infotainment units and relies on interfaces that are present on that platform. It is not a general-purpose tool for evading network security or attacking arbitrary devices.
>
> 4. **User warnings and Terms of Use:** The app explicitly warns users that misuse is prohibited and may violate laws. The Terms of Use prohibit using the app for unauthorized access, theft, fraud, or infringement.
>
> 5. **No stealth behavior:** All actions are user-initiated and transparent in the UI. The app does not hide its behavior or execute background actions without user knowledge.
>
> While any tool can theoretically be misused, the app's design, safeguards, and legal terms are specifically intended to limit the feature to legitimate owner-use scenarios for interoperability and compatibility purposes. The developer takes misuse seriously and reserves the right to suspend service/support and report violations where required by law.

**Respuesta (Español):**

> La característica de emulación de identificador de adaptador está diseñada con limitaciones estrictas para prevenir el uso indebido:
>
> 1. **Alcance solo local:** La característica opera solo en el contexto de una conexión directa y local entre el dispositivo Android del usuario y la propia unidad de infotainment del usuario. No habilita el acceso remoto ni la orientación a dispositivos de terceros.
>
> 2. **Requisito de acceso físico:** El usuario debe estar físicamente presente con el vehículo y conectarse a través de un adaptador USB a Ethernet conectado al puerto USB del vehículo. Esta barrera física hace que sea poco práctico usar la característica para ataques remotos o a gran escala.
>
> 3. **Plataforma dirigida:** La característica está diseñada específicamente para unidades de infotainment MIB2 STD2 y se basa en interfaces que están presentes en esa plataforma. No es una herramienta de propósito general para evadir la seguridad de la red o atacar dispositivos arbitrarios.
>
> 4. **Advertencias de usuario y Términos de Uso:** La aplicación advierte explícitamente a los usuarios que el uso indebido está prohibido y puede violar leyes. Los Términos de Uso prohíben usar la aplicación para acceso no autorizado, robo, fraude o infracción.
>
> 5. **Sin comportamiento sigiloso:** Todas las acciones son iniciadas por el usuario y transparentes en la interfaz de usuario. La aplicación no oculta su comportamiento ni ejecuta acciones en segundo plano sin el conocimiento del usuario.
>
> Si bien cualquier herramienta puede teóricamente ser mal utilizada, el diseño, las salvaguardas y los términos legales de la aplicación están específicamente destinados a limitar la característica a escenarios legítimos de uso del propietario para propósitos de interoperabilidad y compatibilidad. El desarrollador toma en serio el uso indebido y se reserva el derecho de suspender el servicio/soporte e informar violaciones cuando lo requiera la ley.

---

## 4. Preguntas sobre Habilitación de Características (FEC)

### Q4.1: ¿Qué son los "FEC-style tokens" y por qué la aplicación los genera?

**Respuesta (Inglés):**

> FEC (Feature Enable Code) tokens are configuration codes used by certain infotainment systems to activate features that are already present in the hardware and software but have restricted activation paths.
>
> **Context:** Many modern vehicles ship with infotainment hardware that contains software features (such as navigation, advanced audio settings, or connectivity options) that are disabled by default. Manufacturers use FEC tokens as a licensing/activation mechanism to control which features are accessible to the end user.
>
> **Purpose of FEC generation in MIB2 Controller:**
> - **Owner-managed configuration:** The app enables vehicle owners to generate and apply FEC tokens to configure infotainment capabilities on their own hardware. This is analogous to entering a product key to activate software features on a computer the user owns.
> - **Local device workflow:** The app operates locally on the user's own infotainment unit. It does not act as a subscription service client or a general-purpose piracy utility.
> - **No distribution of copyrighted content:** The app does not distribute copyrighted media, maps, or paid subscription services. It only enables configuration of features already present in the hardware.
>
> **Legal framing:**
> - The app's Terms of Use prohibit using the app to violate third-party rights, licensing terms, or applicable laws.
> - FEC generation is presented as owner-managed configuration of infotainment capabilities on owner-owned hardware, not as a subscription circumvention or piracy tool.
>
> This feature empowers vehicle owners to exercise their property rights over their own infotainment hardware and customize their user experience.

**Respuesta (Español):**

> Los tokens FEC (Feature Enable Code) son códigos de configuración utilizados por ciertos sistemas de infotainment para activar características que ya están presentes en el hardware y software pero tienen rutas de activación restringidas.
>
> **Contexto:** Muchos vehículos modernos se envían con hardware de infotainment que contiene características de software (como navegación, configuraciones de audio avanzadas u opciones de conectividad) que están deshabilitadas de forma predeterminada. Los fabricantes usan tokens FEC como un mecanismo de licencia/activación para controlar qué características son accesibles para el usuario final.
>
> **Propósito de la generación de FEC en MIB2 Controller:**
> - **Configuración gestionada por el propietario:** La aplicación permite a los propietarios de vehículos generar y aplicar tokens FEC para configurar capacidades de infotainment en su propio hardware. Esto es análogo a ingresar una clave de producto para activar características de software en una computadora que el usuario posee.
> - **Flujo de trabajo de dispositivo local:** La aplicación opera localmente en la propia unidad de infotainment del usuario. No actúa como cliente de servicio de suscripción o utilidad de piratería de propósito general.
> - **Sin distribución de contenido con derechos de autor:** La aplicación no distribuye medios con derechos de autor, mapas o servicios de suscripción pagados. Solo habilita la configuración de características ya presentes en el hardware.
>
> **Marco legal:**
> - Los Términos de Uso de la aplicación prohíben usar la aplicación para violar derechos de terceros, términos de licencia o leyes aplicables.
> - La generación de FEC se presenta como configuración gestionada por el propietario de capacidades de infotainment en hardware propiedad del propietario, no como una herramienta de elusión de suscripción o piratería.
>
> Esta característica empodera a los propietarios de vehículos para ejercer sus derechos de propiedad sobre su propio hardware de infotainment y personalizar su experiencia de usuario.

---

## 5. Preguntas sobre Seguridad y Privacidad

### Q5.1: ¿Qué datos recopila la aplicación?

**Respuesta (Inglés):**

> MIB2 Controller is designed to operate locally with minimal data collection:
>
> **Data NOT collected:**
> - Personal information (name, email, phone number, address)
> - Payment information or financial data
> - Location data or GPS coordinates
> - Advertising identifiers or tracking cookies
> - Diagnostic data transmitted off-device by default
>
> **Data that may be accessed locally (user-initiated):**
> - Infotainment system logs (for diagnostic purposes, displayed in the app UI)
> - System status information (firmware version, connectivity status, etc.)
> - Configuration settings (user preferences, enabled features)
>
> **Data sharing (user-initiated only):**
> - If the user chooses to export or share diagnostic logs (e.g., to support), this is explicitly initiated by the user through the app's UI.
> - The app does not transmit diagnostic data off-device by default.
>
> **Permissions requested:**
> - The app requests only the permissions necessary for its connectivity and troubleshooting features (e.g., network access, USB access).
> - A detailed permission-by-permission justification is available upon request.
>
> The app's privacy policy is published at [GitHub Pages URL] and complies with GDPR, CCPA, and Google Play's data safety requirements.

**Respuesta (Español):**

> MIB2 Controller está diseñado para operar localmente con recopilación mínima de datos:
>
> **Datos NO recopilados:**
> - Información personal (nombre, correo electrónico, número de teléfono, dirección)
> - Información de pago o datos financieros
> - Datos de ubicación o coordenadas GPS
> - Identificadores de publicidad o cookies de seguimiento
> - Datos de diagnóstico transmitidos fuera del dispositivo de forma predeterminada
>
> **Datos que pueden accederse localmente (iniciado por el usuario):**
> - Registros del sistema de infotainment (para propósitos de diagnóstico, mostrados en la interfaz de usuario de la aplicación)
> - Información de estado del sistema (versión de firmware, estado de conectividad, etc.)
> - Configuraciones (preferencias del usuario, características habilitadas)
>
> **Compartir datos (solo iniciado por el usuario):**
> - Si el usuario elige exportar o compartir registros de diagnóstico (por ejemplo, con soporte), esto es explícitamente iniciado por el usuario a través de la interfaz de usuario de la aplicación.
> - La aplicación no transmite datos de diagnóstico fuera del dispositivo de forma predeterminada.
>
> **Permisos solicitados:**
> - La aplicación solicita solo los permisos necesarios para sus características de conectividad y solución de problemas (por ejemplo, acceso a red, acceso USB).
> - Una justificación detallada permiso por permiso está disponible bajo solicitud.
>
> La política de privacidad de la aplicación está publicada en [URL de GitHub Pages] y cumple con GDPR, CCPA y los requisitos de seguridad de datos de Google Play.

---

### Q5.2: ¿Puede esta aplicación usarse para instalar malware o spyware?

**Respuesta (Inglés):**

> No. The app is not designed to install malware, spyware, or remote-control payloads:
>
> 1. **Transparent user-initiated actions:** All operations are explicitly initiated by the user through the app's UI. The app does not execute background "silent" actions without user knowledge.
>
> 2. **No code injection or payload delivery:** The app does not inject arbitrary code into the infotainment unit or deliver executable payloads. It interacts with the infotainment unit through existing interfaces and services (such as Telnet where present on the unit/firmware).
>
> 3. **No credential harvesting:** The app does not collect credentials, payment information, or unrelated sensitive personal data.
>
> 4. **No remote control features:** The app does not establish persistent remote-control channels or backdoors. All connectivity is local and user-initiated.
>
> 5. **Open disclosure of functionality:** The app's functionality is clearly disclosed in the app description, user interface, and legal documentation. There is no cloaking or deceptive behavior.
>
> The app is a diagnostic and configuration tool for owner-authorized use, not a malware distribution platform.

**Respuesta (Español):**

> No. La aplicación no está diseñada para instalar malware, spyware o cargas útiles de control remoto:
>
> 1. **Acciones transparentes iniciadas por el usuario:** Todas las operaciones son explícitamente iniciadas por el usuario a través de la interfaz de usuario de la aplicación. La aplicación no ejecuta acciones "silenciosas" en segundo plano sin el conocimiento del usuario.
>
> 2. **Sin inyección de código o entrega de cargas útiles:** La aplicación no inyecta código arbitrario en la unidad de infotainment ni entrega cargas útiles ejecutables. Interactúa con la unidad de infotainment a través de interfaces y servicios existentes (como Telnet cuando está presente en la unidad/firmware).
>
> 3. **Sin recopilación de credenciales:** La aplicación no recopila credenciales, información de pago o datos personales sensibles no relacionados.
>
> 4. **Sin características de control remoto:** La aplicación no establece canales de control remoto persistentes o puertas traseras. Toda la conectividad es local e iniciada por el usuario.
>
> 5. **Divulgación abierta de funcionalidad:** La funcionalidad de la aplicación se divulga claramente en la descripción de la aplicación, la interfaz de usuario y la documentación legal. No hay encubrimiento o comportamiento engañoso.
>
> La aplicación es una herramienta de diagnóstico y configuración para uso autorizado por el propietario, no una plataforma de distribución de malware.

---

## 6. Preguntas sobre Políticas de Google Play

### Q6.1: ¿Cómo cumple esta aplicación con la política de "Device and Network Abuse"?

**Respuesta (Inglés):**

> MIB2 Controller is designed to comply with Google Play's Device and Network Abuse policy through multiple safeguards:
>
> **1. Owner-authorization model:**
> - The app is intended for owner-authorized use on user-owned infotainment hardware.
> - Clear warnings inform users that the target device must be user-owned or used with explicit owner permission.
> - The Terms of Use prohibit unauthorized access to third-party devices.
>
> **2. Physical access requirement:**
> - The app requires the user to be physically present with the vehicle and use a direct, local connection path (USB-to-Ethernet adapter).
> - Remote access across the internet is not supported.
>
> **3. No mass scanning or remote exploitation:**
> - The app does not include network scanning tools to discover or target arbitrary devices on external networks.
> - The app is not designed for remote intrusion, mass scanning, or generalized hacking.
>
> **4. Transparency and user control:**
> - All actions are user-initiated and transparent in the UI.
> - The app avoids background stealth behavior.
> - Confirmation dialogs are presented before potentially impactful operations.
>
> **5. No cloaking or deceptive behavior:**
> - The app's functionality is clearly disclosed in the app description, user interface, and legal documentation.
> - The app does not hide its behavior or execute actions that differ from disclosed functionality.
>
> The app is a targeted owner-use diagnostic and configuration tool with substantial legitimate uses in maintenance and interoperability, not a device or network abuse platform.

**Respuesta (Español):**

> MIB2 Controller está diseñado para cumplir con la política de "Device and Network Abuse" de Google Play a través de múltiples salvaguardas:
>
> **1. Modelo de autorización del propietario:**
> - La aplicación está destinada al uso autorizado por el propietario en hardware de infotainment propiedad del usuario.
> - Advertencias claras informan a los usuarios que el dispositivo objetivo debe ser propiedad del usuario o utilizarse con permiso explícito del propietario.
> - Los Términos de Uso prohíben el acceso no autorizado a dispositivos de terceros.
>
> **2. Requisito de acceso físico:**
> - La aplicación requiere que el usuario esté físicamente presente con el vehículo y use una ruta de conexión directa y local (adaptador USB a Ethernet).
> - No se admite acceso remoto a través de Internet.
>
> **3. Sin escaneo masivo o explotación remota:**
> - La aplicación no incluye herramientas de escaneo de red para descubrir o dirigirse a dispositivos arbitrarios en redes externas.
> - La aplicación no está diseñada para intrusión remota, escaneo masivo o hacking generalizado.
>
> **4. Transparencia y control del usuario:**
> - Todas las acciones son iniciadas por el usuario y transparentes en la interfaz de usuario.
> - La aplicación evita el comportamiento sigiloso en segundo plano.
> - Se presentan diálogos de confirmación antes de operaciones potencialmente impactantes.
>
> **5. Sin encubrimiento o comportamiento engañoso:**
> - La funcionalidad de la aplicación se divulga claramente en la descripción de la aplicación, la interfaz de usuario y la documentación legal.
> - La aplicación no oculta su comportamiento ni ejecuta acciones que difieran de la funcionalidad divulgada.
>
> La aplicación es una herramienta dirigida de diagnóstico y configuración de uso del propietario con usos legítimos sustanciales en mantenimiento e interoperabilidad, no una plataforma de abuso de dispositivos o redes.

---

## 7. Preguntas sobre Marco Legal

### Q7.1: ¿Cuál es la base legal para esta aplicación?

**Respuesta (Inglés):**

> The legal rationale for MIB2 Controller is grounded in U.S. law and established principles of owner property rights and interoperability:
>
> **1. DMCA Section 1201 and triennial exemptions:**
> - U.S. law (17 U.S.C. 1201) contains prohibitions related to circumvention of technological protection measures, but the Librarian of Congress issues exemptions on a triennial basis (codified in 37 C.F.R. 201.40).
> - A key policy theme in vehicle-related exemptions is permitting circumvention when necessary for diagnosis, repair, or lawful modification by owners (subject to conditions and limitations).
> - The most recent exemptions (2024 cycle) continue to recognize vehicle owners' rights to access their vehicles' software for non-infringing uses.
>
> **2. Interoperability principle (17 U.S.C. 1201(f)):**
> - This provision addresses circumvention for the purpose of achieving interoperability of independently created computer programs with other programs, under specific conditions.
> - In an owner-use scenario, interoperability is a core rationale for enabling a standard communication path between the user's device and their own infotainment unit.
>
> **3. Owner property rights:**
> - When a consumer lawfully owns a vehicle and its infotainment unit, the owner has a legitimate interest in maintaining, repairing, and configuring that property.
> - The Librarian of Congress's 2015 decision implicitly recognizes that vehicle owners have sufficient rights over embedded software to justify access for diagnosis, repair, and lawful modification purposes.
>
> **4. Limitations and compliance:**
> - The app's intended scope is infotainment (not safety-critical or emissions-related systems).
> - The app's Terms of Use prohibit using the app to violate third-party rights, licensing terms, or applicable laws.
> - Exemptions do not automatically override other laws, contractual terms, or platform policies.
>
> A detailed legal analysis is available in the compliance dossier provided with this submission.

**Respuesta (Español):**

> La justificación legal para MIB2 Controller se basa en la ley de EE. UU. y principios establecidos de derechos de propiedad del propietario e interoperabilidad:
>
> **1. DMCA Sección 1201 y exenciones trienales:**
> - La ley de EE. UU. (17 U.S.C. 1201) contiene prohibiciones relacionadas con la elusión de medidas de protección tecnológica, pero el Bibliotecario del Congreso emite exenciones de forma trienal (codificadas en 37 C.F.R. 201.40).
> - Un tema de política clave en las exenciones relacionadas con vehículos es permitir la elusión cuando sea necesaria para diagnóstico, reparación o modificación legal por parte de los propietarios (sujeto a condiciones y limitaciones).
> - Las exenciones más recientes (ciclo 2024) continúan reconociendo los derechos de los propietarios de vehículos para acceder al software de sus vehículos para usos no infractores.
>
> **2. Principio de interoperabilidad (17 U.S.C. 1201(f)):**
> - Esta disposición aborda la elusión con el propósito de lograr la interoperabilidad de programas de computadora creados independientemente con otros programas, bajo condiciones específicas.
> - En un escenario de uso del propietario, la interoperabilidad es una justificación central para habilitar una ruta de comunicación estándar entre el dispositivo del usuario y su propia unidad de infotainment.
>
> **3. Derechos de propiedad del propietario:**
> - Cuando un consumidor posee legalmente un vehículo y su unidad de infotainment, el propietario tiene un interés legítimo en mantener, reparar y configurar esa propiedad.
> - La decisión del Bibliotecario del Congreso de 2015 reconoce implícitamente que los propietarios de vehículos tienen derechos suficientes sobre el software embebido para justificar el acceso para propósitos de diagnóstico, reparación y modificación legal.
>
> **4. Limitaciones y cumplimiento:**
> - El alcance previsto de la aplicación es infotainment (no sistemas críticos de seguridad o relacionados con emisiones).
> - Los Términos de Uso de la aplicación prohíben usar la aplicación para violar derechos de terceros, términos de licencia o leyes aplicables.
> - Las exenciones no anulan automáticamente otras leyes, términos contractuales o políticas de plataforma.
>
> Un análisis legal detallado está disponible en el dossier de cumplimiento proporcionado con esta presentación.

---

## 8. Preguntas sobre Pruebas y Demostración

### Q8.1: ¿Cómo pueden los revisores probar la aplicación de manera segura?

**Respuesta (Inglés):**

> Reviewers can evaluate MIB2 Controller safely and accurately using the following methods:
>
> **Method 1: UI Review (No hardware required)**
> 1. Install the app from the testing track
> 2. Open the app and review the onboarding disclosures and warnings
> 3. Navigate through the app's UI to observe the workflow, user prompts, and confirmation dialogs
> 4. Verify that all actions are user-initiated and transparent
>
> **Method 2: Demo Mode (If provided)**
> - Use any built-in demo mode to view the UI, log workflows, and warnings without connecting to real hardware
>
> **Method 3: Hardware Testing (Controlled environment)**
> - If hardware testing is performed:
>   - Ensure physical access to a MIB2 STD2 unit in a controlled environment
>   - Connect via the supported local connection method (USB-to-Ethernet adapter)
>   - Verify the app performs only user-initiated local actions and does not scan or target external networks
>
> **Additional evidence available upon request:**
> - Short video demonstration of the physical-connection requirement and local-only scope
> - Permission-by-permission justification sheet
> - Terms of Use / EULA copy
> - Complete compliance dossier (legal analysis)
>
> We are committed to full transparency and cooperation with the review process.

**Respuesta (Español):**

> Los revisores pueden evaluar MIB2 Controller de manera segura y precisa utilizando los siguientes métodos:
>
> **Método 1: Revisión de interfaz de usuario (No se requiere hardware)**
> 1. Instalar la aplicación desde la pista de prueba
> 2. Abrir la aplicación y revisar las divulgaciones y advertencias de incorporación
> 3. Navegar a través de la interfaz de usuario de la aplicación para observar el flujo de trabajo, avisos del usuario y diálogos de confirmación
> 4. Verificar que todas las acciones sean iniciadas por el usuario y transparentes
>
> **Método 2: Modo de demostración (Si se proporciona)**
> - Usar cualquier modo de demostración integrado para ver la interfaz de usuario, flujos de trabajo de registro y advertencias sin conectarse a hardware real
>
> **Método 3: Prueba de hardware (Entorno controlado)**
> - Si se realiza una prueba de hardware:
>   - Asegurar el acceso físico a una unidad MIB2 STD2 en un entorno controlado
>   - Conectar a través del método de conexión local compatible (adaptador USB a Ethernet)
>   - Verificar que la aplicación realice solo acciones locales iniciadas por el usuario y no escanee ni se dirija a redes externas
>
> **Evidencia adicional disponible bajo solicitud:**
> - Demostración en video corta del requisito de conexión física y alcance solo local
> - Hoja de justificación permiso por permiso
> - Copia de Términos de Uso / EULA
> - Dossier de cumplimiento completo (análisis legal)
>
> Estamos comprometidos con la transparencia total y la cooperación con el proceso de revisión.

---

## Resumen de Contacto

Para preguntas adicionales, solicitudes de aclaración o evidencia adicional:

- **Correo electrónico de soporte:** (agregar su dirección de soporte)
- **Sitio web/página de privacidad:** (agregar su URL)
- **Dossier legal completo:** Disponible en `play-store-assets/legal/`

---

## Descargo de Responsabilidad

Este documento se proporciona con fines de aclaración de cumplimiento y expresa la posición legal y el alcance del producto del desarrollador. No garantiza la aprobación por Google Play y no constituye asesoramiento legal para terceros.

---

**Fecha de creación:** 16 de enero de 2026  
**Versión:** 1.0  
**Preparado por:** Felipe Plazas (Abogado)
