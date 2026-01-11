/**
 * Asistente de Instalación del MIB2 STD2 Toolbox
 * Basado en el documento técnico MIB2Acceso.pdf
 */

export interface InstallationStep {
  step: number;
  title: string;
  description: string;
  command?: string;
  expectedOutput?: string;
  warnings?: string[];
  isOptional?: boolean;
}

/**
 * Pasos para instalación del Toolbox vía Telnet (D-Link)
 */
export const TOOLBOX_INSTALLATION_STEPS: InstallationStep[] = [
  {
    step: 1,
    title: "Conectar Adaptador USB-Ethernet",
    description: "Conectar el adaptador D-Link DUB-E100 al puerto USB de la unidad MIB2. Conectar el cable Ethernet desde el adaptador al dispositivo Android (vía adaptador USB-C a Ethernet) o a un router WiFi.",
    warnings: [
      "Asegurarse de usar el adaptador D-Link DUB-E100 específicamente",
      "El chipset ASIX AX88772 es reconocido nativamente por el firmware MIB2",
    ],
  },
  {
    step: 2,
    title: "Configurar Red",
    description: "La unidad MIB2 generalmente tiene una dirección IP estática preasignada en la subred 192.168.1.x (frecuentemente 192.168.1.4 para el host). Configurar el dispositivo con una IP estática en el mismo rango (ej. 192.168.1.10).",
    command: `# En el dispositivo Android/PC:
# Configurar IP estática: 192.168.1.10
# Máscara de subred: 255.255.255.0
# Gateway: 192.168.1.1`,
  },
  {
    step: 3,
    title: "Verificar Conectividad",
    description: "Verificar que se puede hacer ping a la unidad MIB2 antes de intentar conectar por Telnet.",
    command: "ping 192.168.1.4",
    expectedOutput: "64 bytes from 192.168.1.4: icmp_seq=1 ttl=64 time=1.23 ms",
  },
  {
    step: 4,
    title: "Conectar por Telnet",
    description: "El servicio Telnet (puerto 23) puede estar activo pero protegido o inactivo por defecto. En versiones de firmware antiguas o específicas de Technisat ZR (Zentralrechner), este puerto puede estar abierto, permitiendo una conexión remota desde una laptop configurada con una IP estática en el mismo rango.",
    command: "telnet 192.168.1.4 23",
    expectedOutput: `Connected to 192.168.1.4
QNX Neutrino (localhost) (pts/0)

login: `,
    warnings: [
      "Si el puerto Telnet está cerrado, no se puede activar mediante codificación VCDS",
      "En ese caso, el último recurso es el acceso directo al almacenamiento no volátil (eMMC Direct Access) mediante soldadura",
    ],
  },
  {
    step: 5,
    title: "Iniciar Sesión como Root",
    description: "Una vez establecida la sesión Telnet, se obtiene acceso a la shell de comandos de QNX (ksh).",
    command: `login: root
password: root`,
    expectedOutput: "# ",
  },
  {
    step: 6,
    title: "Verificar Sistema de Archivos",
    description: "Desde aquí, las restricciones de la interfaz gráfica (HMI) son irrelevantes. Se puede montar manualmente la tarjeta SD (que el sistema reconoce como un dispositivo de almacenamiento masivo en /media/mp000 o similar) y ejecutar scripts de shell (install.sh) directamente.",
    command: `# Verificar montaje de la tarjeta SD
ls -la /media/mp000

# Verificar sistema de archivos
df -h`,
    expectedOutput: `/dev/hd0t177  /media/mp000  vfat`,
  },
  {
    step: 7,
    title: "Descargar MIB2 Toolbox",
    description: "Descargar el MIB2 STD2 Toolbox desde el repositorio oficial de GitHub y copiarlo a una tarjeta SD.",
    command: `# En tu PC:
# Descargar desde: https://github.com/olli991/mib-std2-pq-zr-toolbox
# Copiar el archivo install.sh a la raíz de la tarjeta SD`,
    warnings: [
      "Asegurarse de descargar la versión correcta para MIB2 STD2 (no MIB2 High)",
      "Verificar la integridad del archivo descargado",
    ],
  },
  {
    step: 8,
    title: "Ejecutar Script de Instalación",
    description: 'Este método "inyecta" el instalador del MIB STD2 Toolbox sorteando la validación de firmas digitales del gestor de actualizaciones SWDL, ya que estamos ejecutando el script de instalación manualmente con privilegios de root, en lugar de pedirle al sistema que "actualice" el firmware.',
    command: `# Navegar a la tarjeta SD
cd /media/mp000

# Dar permisos de ejecución
chmod +x install.sh

# Ejecutar instalación
./install.sh`,
    expectedOutput: "MIB2 Toolbox installed successfully",
    warnings: [
      "Este método sortea la validación de firmware digital del gestor de actualizaciones SWDL",
      "Estamos ejecutando el script manualmente con privilegios root",
    ],
  },
  {
    step: 9,
    title: "Aplicar Parcheo del Sistema",
    description: "Una vez instalado el Toolbox, ejecutar la función de parcheo desde el menú verde (GEM - Green Engineering Menu) accesible tras la instalación.",
    command: `# Desde el menú verde (GEM) del Toolbox:
# Seleccionar: "Patch tsd.mibstd2.system.swap"`,
    warnings: [
      "Este parcheo modifica el binario del sistema para alterar la rutina de verificación de firmas",
      "Una vez parcheado, el sistema se instruye para consultar la ExceptionList.txt",
    ],
  },
  {
    step: 10,
    title: "Verificar Instalación",
    description: "Verificar que el Toolbox se instaló correctamente y está accesible desde el sistema.",
    command: `# Verificar archivos del Toolbox
ls -la /net/mmx/mnt/app/eso/hmi/lsd/jars/

# Buscar archivos relacionados con el Toolbox
find /net/mmx -name "*toolbox*" -o -name "*mib*"`,
    expectedOutput: "Archivos del Toolbox visibles en el directorio",
  },
  {
    step: 11,
    title: "Reiniciar Sistema",
    description: "Reiniciar la unidad MIB2 para que los cambios surtan efecto.",
    command: "reboot",
    warnings: [
      "Después del reinicio, el Toolbox debería estar accesible desde el menú del sistema",
      "El menú verde (GEM) estará disponible para funciones avanzadas",
    ],
  },
];

/**
 * Método alternativo: Acceso directo eMMC (solo informativo)
 */
export const EMMC_ACCESS_INFO = {
  title: "Método Alternativo: Acceso Directo eMMC (Avanzado)",
  description: "Si el puerto Telnet está cerrado y no se puede activar mediante codificación VCDS, el último recurso es el acceso directo al almacenamiento no volátil.",
  steps: [
    "Extracción física de la unidad MIB2 del vehículo",
    "Desmontaje del chasis y soldadura de un lector SD modificado",
    "Acceso directo a los pines del chip eMMC (Embedded Multi-Media Controller)",
    "Modificación del archivo shadow (contraseñas) o inyección directa de archivos parcheados",
    "Re-escritura de la imagen en el chip",
  ],
  warnings: [
    "⚠️ Este método es destructivo potencialmente y requiere habilidades avanzadas de microsoldadura",
    "⚠️ Ofrece control total sobre la unidad, permitiendo incluso revivir unidades 'briqueadas'",
    "⚠️ NO recomendado para usuarios sin experiencia en electrónica",
    "⚠️ Puede anular la garantía y dañar permanentemente la unidad",
  ],
  technicalNote: "Al volcar la imagen de la memoria eMMC en un PC (utilizando herramientas de bajo nivel en Linux), se puede modificar el archivo shadow (contraseñas) o inyectar directamente los archivos parcheados, para luego volver a escribir la imagen en el chip. Este método es destructivo potencialmente y requiere habilidades avanzadas de microsoldadura, pero ofrece control total sobre la unidad, permitiendo incluso revivir unidades 'briqueadas'.",
};

/**
 * Comandos útiles para diagnóstico del sistema
 */
export const DIAGNOSTIC_COMMANDS = [
  {
    name: "Información del Sistema",
    command: "uname -a",
    description: "Muestra información del sistema operativo QNX",
  },
  {
    name: "Versión del Firmware",
    command: "cat /net/mmx/fs/sda0/VERSION",
    description: "Muestra la versión del firmware instalado",
  },
  {
    name: "Procesos en Ejecución",
    command: "ps aux",
    description: "Lista todos los procesos en ejecución",
  },
  {
    name: "Espacio en Disco",
    command: "df -h",
    description: "Muestra el espacio disponible en los sistemas de archivos",
  },
  {
    name: "Dispositivos de Red",
    command: "ifconfig -a",
    description: "Muestra la configuración de las interfaces de red",
  },
  {
    name: "Servicios Activos",
    command: "netstat -an | grep LISTEN",
    description: "Muestra los puertos en escucha (Telnet, FTP, SSH, etc.)",
  },
  {
    name: "Información de Hardware",
    command: "pidin info",
    description: "Muestra información detallada del hardware y procesos",
  },
];

/**
 * Generar script completo de instalación
 */
export function generateInstallationScript(): string {
  return `#!/bin/sh
# Script de Instalación del MIB2 STD2 Toolbox
# Generado por MIB2 Controller
# Fecha: ${new Date().toISOString()}

echo "=== Instalación del MIB2 STD2 Toolbox ==="
echo ""

# Verificar que estamos en root
if [ "$(whoami)" != "root" ]; then
    echo "ERROR: Este script debe ejecutarse como root"
    exit 1
fi

# Verificar montaje de la tarjeta SD
echo "Verificando tarjeta SD..."
if [ ! -d "/media/mp000" ]; then
    echo "ERROR: Tarjeta SD no montada en /media/mp000"
    exit 1
fi

# Verificar que el archivo install.sh del Toolbox existe
if [ ! -f "/media/mp000/install.sh" ]; then
    echo "ERROR: No se encontró install.sh en la tarjeta SD"
    echo "Descargar el Toolbox desde: https://github.com/olli991/mib-std2-pq-zr-toolbox"
    exit 1
fi

# Ejecutar instalación del Toolbox
echo "Ejecutando instalación del Toolbox..."
cd /media/mp000
chmod +x install.sh
./install.sh

# Verificar instalación
echo ""
echo "Verificando instalación..."
if [ -d "/net/mmx/mnt/app/eso/hmi/lsd/jars/" ]; then
    echo "✓ Toolbox instalado correctamente"
    echo ""
    echo "Próximos pasos:"
    echo "1. Reiniciar la unidad MIB2"
    echo "2. Acceder al menú verde (GEM) del Toolbox"
    echo "3. Ejecutar 'Patch tsd.mibstd2.system.swap'"
    echo "4. Crear ExceptionList.txt con los códigos FEC deseados"
else
    echo "✗ Error en la instalación"
    exit 1
fi

echo ""
echo "=== Instalación completada ==="
`;
}

/**
 * Validar que el Toolbox está instalado
 */
export function generateToolboxVerificationCommand(): string {
  return `# Verificar instalación del MIB2 Toolbox
echo "Verificando instalación del Toolbox..."

# Buscar archivos del Toolbox
if [ -d "/net/mmx/mnt/app/eso/hmi/lsd/jars/" ]; then
    echo "✓ Directorio del Toolbox encontrado"
    ls -la /net/mmx/mnt/app/eso/hmi/lsd/jars/ | grep -i toolbox
else
    echo "✗ Toolbox no instalado"
fi

# Verificar si el sistema está parcheado
if [ -f "/media/mp000/ExceptionList.txt" ]; then
    echo "✓ ExceptionList.txt encontrada"
    cat /media/mp000/ExceptionList.txt
else
    echo "ℹ ExceptionList.txt no encontrada (sistema no parcheado)"
fi
`;
}
