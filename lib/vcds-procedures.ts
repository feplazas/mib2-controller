/**
 * Biblioteca de Procedimientos VCDS para MIB2
 * Basado en el documento técnico MIB2Acceso.pdf
 * 
 * Incluye traducciones técnicas alemán-español y procedimientos específicos
 * para modificaciones en la plataforma MQB (SEAT León Cupra 290 5F)
 */

export type VCDSModule = '03-Bremselektronik' | '32-Quersperre' | '5F-Informationselektronik' | '17-Schalttafeleinsatz';
export type RiskLevel = 'safe' | 'moderate' | 'high' | 'critical';
export type ProcedureCategory = 'performance' | 'safety' | 'aesthetics' | 'functionality';

export interface VCDSAdaptation {
  channel: string;
  channelGerman: string;
  currentValue?: string;
  newValue: string;
  description: string;
}

export interface VCDSProcedure {
  id: string;
  name: string;
  nameGerman: string;
  category: ProcedureCategory;
  riskLevel: RiskLevel;
  module: VCDSModule;
  moduleCode: string;
  loginCode: string | string[];
  adaptations: VCDSAdaptation[];
  warnings?: string[];
  recommendations?: string[];
  requiresReboot?: boolean;
  rebootInstructions?: string;
  technicalNotes?: string;
  expertModeOnly?: boolean;
}

/**
 * Glosario Técnico Alemán-Español (VCDS)
 */
export const VCDS_GLOSSARY: Record<string, string> = {
  // Módulos
  'Steuergerät': 'Unidad de Control (ECU/Module)',
  'Bremselektronik': 'Electrónica de Frenos (ABS/ESC)',
  'Quersperre': 'Bloqueo Transversal (Diferencial VAQ)',
  'Informationselektronik': 'Electrónica de Información (Multimedia)',
  'Schalttafeleinsatz': 'Inserto del Panel de Instrumentos (Cuadro)',
  
  // Adaptaciones
  'Anpassung': 'Adaptación (Función 10)',
  'Zugriffsberechtigung': 'Autorización de Acceso / Login de Seguridad (Función 16)',
  'Codierung': 'Codificación (Función 07 - Long Coding)',
  
  // Canales específicos
  'Erweiterte elektronische Differenzialsperre': 'Bloqueo diferencial electrónico extendido (XDS+)',
  'Akustikmaßnahme, Verspannungslogik': 'Medidas acústicas, lógica de tensión (VAQ)',
  'Bremsassistent': 'Asistente de Freno',
  'Displaydarstellung': 'Representación de pantalla',
  'Tubevaerriante': 'Variante de tubo',
  'Entwicklermodus': 'Modo Desarrollador',
  
  // Valores
  'Standard': 'Estándar',
  'Mittel': 'Medio',
  'Schwach': 'Débil',
  'Stark': 'Fuerte',
  'Erhöhte Traktion': 'Tracción Aumentada',
  'Früh': 'Temprano',
  'Auf aktiv': 'Activado',
  'Databus Infotainment': 'Bus de datos Infotainment',
  'Komfort': 'Confort',
  
  // Otros
  'Freischaltung': 'Desbloqueo / Activación',
  'Verbau': 'Instalación / Montaje (Indica si un componente está instalado)',
  'Leuchte': 'Lámpara / Canal de Iluminación',
  'Lasttyp': 'Tipo de Carga (Perfil eléctrico: LED, Halógeno, Xenón)',
  'Lichtfunktion': 'Función de Luz (Disparador lógico: Freno, Giro, Parking)',
  'Dimmwert': 'Valor de Atenuación (PWM: 0-100 o 127)',
};

/**
 * Procedimientos VCDS Predefinidos
 */
export const VCDS_PROCEDURES: VCDSProcedure[] = [
  // 1. Modificación XDS+ (Control de Bloqueo Diferencial Electrónico)
  {
    id: 'xds_control',
    name: 'Control XDS+ (Bloqueo Diferencial Electrónico)',
    nameGerman: 'XDS+ Steuerung (Erweiterte elektronische Differenzialsperre)',
    category: 'performance',
    riskLevel: 'high',
    module: '03-Bremselektronik',
    moduleCode: '03',
    loginCode: ['20103', '40168'],
    adaptations: [
      {
        channel: 'Extended Electronic Differential Lock',
        channelGerman: 'Erweiterte elektronische Differenzialsperre',
        currentValue: 'Standard',
        newValue: 'Standard',
        description: 'Configuración del comportamiento del XDS+. Standard es el valor recomendado.',
      },
    ],
    warnings: [
      '⚠️ ADVERTENCIA CRÍTICA: NO configurar en "Strong" (Stark)',
      'El modo "Strong" genera desgaste parasitario de frenos y estrés térmico sin beneficios tangibles',
      'Las temperaturas del disco pueden superar 600°C-700°C, llevando al líquido de frenos a su punto de ebullición (vapor lock)',
      'El desgaste se acelera exponencialmente; reportes técnicos sugieren que un juego de pastillas puede destruirse en una sola sesión de pista',
      'En vehículos con VAQ, esto genera un bucle de control conflictivo que reduce eficiencia',
    ],
    recommendations: [
      '✅ Configuración recomendada: "Standard" (Estándar)',
      'El XDS+ debe actuar solo como red de seguridad de último recurso, no como sistema de vectorización primario',
      'Para maximizar tracción, ajustar el VAQ a "Tracción Aumentada" en lugar de modificar XDS+',
    ],
    technicalNotes: 'El XDS+ emula un diferencial autoblocante mediante frenado selectivo. Al detectar que la rueda interior pierde tracción, aplica presión hidráulica a la pinza de freno de esa rueda, bloqueando solidariamente los semiejes y permitiendo que hasta el 100% del par disponible fluya hacia la rueda exterior.',
    expertModeOnly: true,
  },

  // 2. Optimización del Diferencial VAQ
  {
    id: 'vaq_optimization',
    name: 'Optimización del Diferencial VAQ (Tracción)',
    nameGerman: 'VAQ Optimierung (Vorderachsquersperre)',
    category: 'performance',
    riskLevel: 'moderate',
    module: '32-Quersperre',
    moduleCode: '32',
    loginCode: '20103',
    adaptations: [
      {
        channel: 'Acoustic Measures, Tension Logic',
        channelGerman: 'Akustikmaßnahme, Verspannungslogik',
        currentValue: 'Standard',
        newValue: 'Erhöhte Traktion',
        description: 'Ajuste para maximizar la tracción mecánica antes de la intervención electrónica.',
      },
    ],
    recommendations: [
      '✅ Configuración recomendada: "Erhöhte Traktion" (Tracción Aumentada)',
      'Permite un bloqueo más agresivo y rápido de los discos del embrague',
      'Sacrifica la suavidad acústica (pueden escucharse crujidos o arrastre de neumáticos en giros cerrados a baja velocidad) a cambio de mayor rendimiento',
      'El VAQ es mecánicamente superior y térmicamente eficiente comparado con el XDS+',
    ],
    technicalNotes: 'El VAQ (Vorderachsquersperre) es el diferencial de deslizamiento limitado electrohidráulico (tecnología Haldex V adaptada) situado entre la caja del diferencial y el semieje derecho. Es capaz de transferir par cuando la unidad de control detecta que la rueda interior pierde tracción.',
    expertModeOnly: false,
  },

  // 3. Asistente de Freno Temprano
  {
    id: 'brake_assistant',
    name: 'Asistente de Freno Temprano',
    nameGerman: 'Bremsassistent Früh',
    category: 'safety',
    riskLevel: 'safe',
    module: '03-Bremselektronik',
    moduleCode: '03',
    loginCode: ['20103', '40168'],
    adaptations: [
      {
        channel: 'Brake Assistant',
        channelGerman: 'Bremsassistent',
        currentValue: 'Standard',
        newValue: 'Früh',
        description: 'Activación temprana del asistente de frenado de emergencia.',
      },
    ],
    recommendations: [
      'Opcional: Activa el asistente de freno de manera más temprana',
      'Puede mejorar la respuesta en situaciones de frenado de emergencia',
    ],
    expertModeOnly: false,
  },

  // 4. Activación del Monitor Offroad (Sin Navegación)
  {
    id: 'offroad_monitor',
    name: 'Activación del Monitor Offroad (Sin Navegación)',
    nameGerman: 'Offroad Monitor Aktivierung (Ohne Navigation)',
    category: 'functionality',
    riskLevel: 'safe',
    module: '5F-Informationselektronik',
    moduleCode: '5F',
    loginCode: ['20103', 'S12345'],
    adaptations: [
      {
        channel: 'Car Function Adaptations Gen2 -> menu_display_compass',
        channelGerman: 'Car_Function_Adaptations_Gen2 -> menu_display_compass',
        newValue: 'Auf aktiv',
        description: 'Activar visualización de brújula en menú',
      },
      {
        channel: 'Car Function Adaptations Gen2 -> menu_display_compass_over_threshold_high',
        channelGerman: 'Car_Function_Adaptations_Gen2 -> menu_display_compass_over_threshold_high',
        newValue: 'Auf aktiv',
        description: 'Activar brújula sobre umbral alto',
      },
      {
        channel: 'Car Function List BAP Gen2 -> compass_0x15',
        channelGerman: 'Car_Function_List_BAP_Gen2 -> compass_0x15',
        newValue: 'Auf aktiv',
        description: 'Activar función de brújula',
      },
      {
        channel: 'Car Function List BAP Gen2 -> compass_0x15_msg_bus',
        channelGerman: 'Car_Function_List_BAP_Gen2 -> compass_0x15_msg_bus',
        newValue: 'Databus Infotainment',
        description: 'Configurar bus de mensajes (Databus Infotainment o Komfort)',
      },
    ],
    requiresReboot: true,
    rebootInstructions: 'Mantener botón Power presionado durante 10 segundos. El menú "Offroad" aparecerá en las opciones de "Car".',
    recommendations: [
      'Permite visualizar temperatura de fluidos y ángulo de dirección en la pantalla MIB2',
      'Útil para monitoreo en pista aunque no se tenga GPS',
    ],
    expertModeOnly: false,
  },

  // 5. Personalización del Cuadro Digital (Carbono/Cupra)
  {
    id: 'digital_cockpit_skin',
    name: 'Personalización del Cuadro Digital (Carbono/Cupra)',
    nameGerman: 'Digitales Cockpit Personalisierung (Carbono/Cupra)',
    category: 'aesthetics',
    riskLevel: 'safe',
    module: '17-Schalttafeleinsatz',
    moduleCode: '17',
    loginCode: ['20103', '25327'],
    adaptations: [
      {
        channel: 'Display Representation',
        channelGerman: 'Displaydarstellung',
        currentValue: 'Variante 1',
        newValue: 'Variante 2',
        description: 'Cambiar skin del cuadro digital. Variante 1: Estándar (Leon FR), Variante 2: Estilo carbono/puntos dorados (Cupra), Variante 3: Estilo Cupra específico (depende de versión SW).',
      },
    ],
    warnings: [
      'Cambiar y confirmar. Si el cuadro muestra error o se ve "roto", revertir al valor original inmediatamente',
      'No todos los firmwares soportan todas las variantes',
    ],
    recommendations: [
      'Para unidades 5F0 920 790 (sin letra o A): Variante 2 es la más compatible',
      'Activar el fondo de "fibra de carbono" o los acentos en color cobre mejora la integración estética con el resto del vehículo',
    ],
    expertModeOnly: false,
  },

  // 6. Developer Mode (Modo Desarrollador)
  {
    id: 'developer_mode',
    name: 'Developer Mode (Modo Desarrollador)',
    nameGerman: 'Entwicklermodus',
    category: 'functionality',
    riskLevel: 'moderate',
    module: '5F-Informationselektronik',
    moduleCode: '5F',
    loginCode: ['S12345', '20103'],
    adaptations: [
      {
        channel: 'Developer Mode',
        channelGerman: 'Entwicklermodus',
        newValue: 'Auf aktiv',
        description: 'Activar modo desarrollador para acceso a funciones avanzadas',
      },
    ],
    recommendations: [
      'Desbloquea funciones de diagnóstico y configuración avanzada',
      'Útil para pruebas y desarrollo de modificaciones',
    ],
    expertModeOnly: true,
  },
];

/**
 * Obtener procedimiento por ID
 */
export function getProcedureById(id: string): VCDSProcedure | undefined {
  return VCDS_PROCEDURES.find(p => p.id === id);
}

/**
 * Filtrar procedimientos por categoría
 */
export function getProceduresByCategory(category: ProcedureCategory): VCDSProcedure[] {
  return VCDS_PROCEDURES.filter(p => p.category === category);
}

/**
 * Filtrar procedimientos por nivel de riesgo
 */
export function getProceduresByRiskLevel(riskLevel: RiskLevel): VCDSProcedure[] {
  return VCDS_PROCEDURES.filter(p => p.riskLevel === riskLevel);
}

/**
 * Filtrar procedimientos que requieren modo experto
 */
export function getExpertProcedures(): VCDSProcedure[] {
  return VCDS_PROCEDURES.filter(p => p.expertModeOnly);
}

/**
 * Generar comando VCDS para ejecutar adaptación
 */
export function generateVCDSCommand(procedure: VCDSProcedure, adaptationIndex: number = 0): string {
  const adaptation = procedure.adaptations[adaptationIndex];
  const loginCode = Array.isArray(procedure.loginCode) ? procedure.loginCode[0] : procedure.loginCode;
  
  return `# Procedimiento: ${procedure.name}
# Módulo: ${procedure.moduleCode}-${procedure.module}
# Login: ${loginCode}
# Canal: ${adaptation.channelGerman}
# Valor: ${adaptation.newValue}

# Comando para ejecutar vía VCDS/OBDeleven:
# 1. Seleccionar módulo ${procedure.moduleCode}
# 2. Ingresar código de seguridad: ${loginCode}
# 3. Buscar canal: ${adaptation.channelGerman}
# 4. Cambiar valor a: ${adaptation.newValue}
# 5. Guardar cambios
${procedure.requiresReboot ? `# 6. ${procedure.rebootInstructions}` : ''}
`;
}

/**
 * Tabla de referencia rápida para modificaciones MQB (VCDS)
 */
export interface QuickReferenceEntry {
  function: string;
  module: string;
  loginCode: string;
  channel: string;
  value: string;
}

export const QUICK_REFERENCE_TABLE: QuickReferenceEntry[] = [
  {
    function: 'XDS+ (Control)',
    module: '03-Bremselektronik',
    loginCode: '20103 / 40168',
    channel: 'Erweiterte elektronische Differenzialsperre',
    value: 'Standard (Recomendado)',
  },
  {
    function: 'VAQ (Tracción)',
    module: '32-Quersperre',
    loginCode: '20103',
    channel: 'Akustikmaßnahme, Verspannungslogik',
    value: 'Erhöhte Traktion',
  },
  {
    function: 'Asistente Freno',
    module: '03-Bremselektronik',
    loginCode: '20103 / 40168',
    channel: 'Bremsassistent',
    value: 'Früh (Temprano) - Opcional',
  },
  {
    function: 'Offroad Menu',
    module: '5F-Info. Elek.',
    loginCode: '20103',
    channel: 'Car_Function_Adaptations_Gen2 -> compass',
    value: 'Auf aktiv',
  },
  {
    function: 'Skin Carbono',
    module: '17-Schalttafeleinsatz',
    loginCode: '20103 / 25327',
    channel: 'Displaydarstellung / Tubevaerriante',
    value: 'Variante 2 o 3',
  },
  {
    function: 'Developer Mode',
    module: '5F-Info. Elek.',
    loginCode: 'S12345 / 20103',
    channel: 'Entwicklermodus',
    value: 'Auf aktiv',
  },
];
