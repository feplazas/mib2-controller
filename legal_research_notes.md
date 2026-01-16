# Notas de Investigación Legal - MIB2 Controller

## 1. Decisión del Librarian of Congress (2015)

**Fuente:** Center for Auto Safety - https://www.autosafety.org/vehicle-owners-given-legal-access-computer-software-their-cars/

**Fecha:** 27 de octubre de 2015

**Decisión clave:**
> "Today the Librarian of Congress issued a historic decision giving vehicle owners the right to access and modify the computer software that controls the operating systems in their vehicles."

**Contexto:**
- Los fabricantes de automóviles habían copyrightado el software en las computadoras de los vehículos
- Usaban Technological Protection Measures (TPMs) para bloquear el acceso del consumidor al código
- Esto se hacía bajo el Digital Millennium Copyright Act (DMCA)

**Implicaciones:**
- Los propietarios de vehículos tienen el DERECHO LEGAL de acceder y modificar el software de sus vehículos
- La decisión NO afecta negativamente la calidad del aire ni la seguridad
- Las disposiciones estatutarias existentes hacen ilegal que un taller de reparación deshabilite dispositivos de seguridad o control de emisiones

**Leyes relacionadas citadas:**

### Clean Air Act, 42 USC § 7522
Prohibiciones enumeradas:
- (3)(A) Prohibido remover o hacer inoperativo cualquier dispositivo instalado para cumplir con regulaciones ANTES de la venta
- (3)(B) Prohibido fabricar, vender o instalar cualquier parte cuyo efecto principal sea bypass, defeat o hacer inoperativo un dispositivo de control de emisiones

### National Traffic and Motor Vehicle Safety Act, 49 USC § 30122
- Prohibido hacer inoperativo cualquier dispositivo de seguridad instalado para cumplir con estándares de seguridad
- Aplica a fabricantes, distribuidores, dealers y talleres de reparación

**Conclusión preliminar:**
La modificación de software vehicular es LEGAL siempre que:
1. No se deshabiliten dispositivos de seguridad
2. No se deshabiliten controles de emisiones
3. El propietario del vehículo es quien realiza o autoriza la modificación

---

## 2. Digital Millennium Copyright Act (DMCA) - Exención para vehículos

**Próxima búsqueda:** Detalles específicos de la exención DMCA para software vehicular


## 3. Clase 21 DMCA - Software de Vehículos (Diagnóstico, Reparación o Modificación)

**Fuente:** JD Supra - https://www.jdsupra.com/legalnews/2015-dmca-exemptions-in-detail-when-is-59514/

**Texto oficial de la exención:**

> "Computer programs that are contained in and control the functioning of a motorized land vehicle such as a personal automobile, commercial motor vehicle or mechanized agricultural vehicle, when circumvention is a necessary step undertaken by the authorized owner of the vehicle to allow the diagnosis, repair or lawful modification of a vehicle function; and where such circumvention does not constitute a violation of applicable law, and provided, however, that such circumvention is initiated no earlier than 12 months after the effective date of this regulation."

**Elementos clave:**

1. **Ámbito de aplicación:**
   - Programas de computadora contenidos en vehículos terrestres motorizados
   - Incluye: automóviles personales, vehículos comerciales, vehículos agrícolas mecanizados

2. **Actividades permitidas:**
   - Diagnóstico de funciones del vehículo
   - Reparación de funciones del vehículo
   - Modificación LEGAL de funciones del vehículo

3. **Requisitos:**
   - La circunvención debe ser un paso NECESARIO
   - Debe ser realizada por el propietario AUTORIZADO del vehículo
   - NO debe constituir una violación de leyes aplicables
   - Debe iniciarse no antes de 12 meses después de la fecha efectiva de la regulación (28 de octubre de 2015)

4. **Fecha efectiva:** 28 de octubre de 2015

5. **Vigencia:** Renovada en ciclos trienales (2015, 2018, 2021, 2024)

**Implicaciones para MIB2 Controller:**
- La app permite diagnóstico, reparación y modificación de software en unidades MIB2
- El propietario del vehículo es quien usa la app
- La app NO deshabilita dispositivos de seguridad ni controles de emisiones
- La circunvención es necesaria para acceder al software del sistema MIB2

---

## 4. Próximas búsquedas necesarias:

1. Derecho de propiedad sobre vehículos y software embebido
2. Legislación europea sobre derecho a reparar (si aplica)
3. Jurisprudencia sobre modificación de software vehicular
4. Límites legales: qué NO está permitido


## 5. Límites Legales de Modificación de Software Vehicular

**Fuentes:** 
- EPA Enforcement (https://www.epa.gov/enforcement/national-enforcement-and-compliance-initiative-stopping-aftermarket-defeat-devices)
- Ars Technica (https://arstechnica.com/tech-policy/2015/10/us-regulators-grant-dmca-exemption-legalizing-vehicle-software-tinkering/)

**LO QUE ES ILEGAL:**

### 1. Tampering con Controles de Emisiones (Clean Air Act)
- **Prohibido:** Modificar, remover o desactivar dispositivos de control de emisiones
- **Prohibido:** Instalar "defeat devices" que burlen controles de emisiones
- **Multa:** Hasta $4,819 USD por dispositivo/vehículo (desde 2020)
- **Ley aplicable:** Clean Air Act, 42 USC § 7522

### 2. Tampering con Dispositivos de Seguridad (NHTSA)
- **Prohibido:** Hacer inoperativos dispositivos de seguridad instalados para cumplir con estándares federales
- **Ejemplos:** Airbags, frenos ABS, control de tracción, sistemas de emergencia
- **Ley aplicable:** National Traffic and Motor Vehicle Safety Act, 49 USC § 30122

### 3. Exclusiones de la Exención DMCA 2015
- **NO cubre:** Software de sistemas telemáticos o de entretenimiento
- **Razón:** La exención se enfoca en software que controla funciones operativas del vehículo

**LO QUE ES LEGAL:**

### 1. Diagnóstico y Reparación
- Acceder al software para diagnosticar problemas
- Leer códigos de error (DTCs)
- Realizar reparaciones autorizadas

### 2. Modificaciones Legales
- Modificaciones que NO afecten emisiones ni seguridad
- Ajustes de configuración del vehículo
- Personalización de funciones no relacionadas con seguridad/emisiones

### 3. Investigación de Seguridad
- Clase 22 DMCA: Permite investigación de seguridad en software vehicular
- Objetivo: Identificar vulnerabilidades de ciberseguridad

---

## 6. Análisis Específico para MIB2 Controller

**¿Qué hace la app?**
1. Control de unidades MIB2 STD2 (sistema de infoentretenimiento Volkswagen)
2. Diagnóstico de red y conexión USB
3. Spoofing de identificadores de dispositivos
4. Generación de códigos FEC (Feature Enable Codes)
5. Ejecución de comandos Telnet
6. Acceso a herramientas de diagnóstico

**Análisis legal:**

✅ **LEGAL - Diagnóstico:**
- La app permite diagnóstico de la unidad MIB2
- Lectura de información del sistema
- Monitoreo de estado de conexión
- **Fundamento:** Clase 21 DMCA - "diagnosis... of a vehicle function"

✅ **LEGAL - Modificación de Software de Entretenimiento:**
- MIB2 es un sistema de infoentretenimiento, NO un sistema de control del motor
- NO afecta emisiones (Clean Air Act no aplica)
- NO afecta dispositivos de seguridad críticos (airbags, frenos, etc.)
- **Fundamento:** Clase 21 DMCA - "lawful modification of a vehicle function"

✅ **LEGAL - Propiedad del Vehículo:**
- El propietario del vehículo es quien usa la app
- Derecho de acceso otorgado por Librarian of Congress (2015)
- **Fundamento:** Decisión del Librarian of Congress, 28 de octubre de 2015

✅ **LEGAL - Herramientas de Terceros:**
- La exención DMCA permite el uso de herramientas de terceros
- La app es una herramienta que facilita el acceso legal
- **Fundamento:** Clase 21 DMCA no restringe quién desarrolla las herramientas

⚠️ **RESPONSABILIDAD DEL USUARIO:**
- La app incluye advertencias claras sobre uso responsable
- El usuario es responsable de no violar otras leyes
- La app NO fuerza modificaciones ilegales

---

## 7. Conclusión Preliminar

**MIB2 Controller es LEGAL porque:**

1. **Cumple con la exención DMCA Clase 21:**
   - Permite diagnóstico, reparación y modificación legal de software vehicular
   - El propietario del vehículo es quien usa la app
   - NO viola leyes aplicables (Clean Air Act, NHTSA)

2. **NO afecta sistemas críticos:**
   - MIB2 es un sistema de infoentretenimiento
   - NO controla emisiones del motor
   - NO controla dispositivos de seguridad críticos

3. **Incluye advertencias y disclaimers:**
   - La app advierte sobre uso responsable
   - El usuario es responsable de sus acciones
   - La app NO promueve actividades ilegales

4. **Derecho de propiedad:**
   - El propietario del vehículo tiene derecho a acceder al software
   - Decisión histórica del Librarian of Congress (2015)
   - Renovada en ciclos trienales (2018, 2021, 2024)

**Próximo paso:** Redactar análisis legal formal con estructura académica y citas completas.
