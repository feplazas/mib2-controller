#!/usr/bin/env python3
"""
Agregar TODAS las claves de traducción faltantes para:
- onboarding
- toolbox
- fec
- telnet
"""

import json
import os

LOCALES_DIR = "/home/ubuntu/mib2_controller/locales"

TRANSLATIONS = {
    "onboarding": {
        "es": {
            "step1_title": "Conectar Adaptador USB",
            "step1_desc": "Conecta tu adaptador USB-Ethernet al dispositivo Android usando un cable OTG con alimentación externa.",
            "step1_detail1": "Usa un cable OTG con alimentación externa (5V)",
            "step1_detail2": "Conecta el adaptador USB-Ethernet al cable OTG",
            "step1_detail3": "Espera a que el LED del adaptador se encienda",
            "step1_detail4": "La app detectará automáticamente el dispositivo",
            "step2_title": "Verificar Compatibilidad",
            "step2_desc": "La app detectará automáticamente el chipset y mostrará si es compatible para spoofing MIB2.",
            "step2_detail1": "Ve a la pestaña 'Estado USB' para ver información del dispositivo",
            "step2_detail2": "Verifica el badge de compatibilidad:",
            "step2_detail3": "✅ Verde = Confirmado compatible",
            "step2_detail4": "⚠️ Amarillo = Experimental (probablemente funciona)",
            "step2_detail5": "❌ Rojo = Incompatible",
            "step2_detail6": "Solo chipsets ASIX permiten spoofing",
            "step3_title": "Ejecutar Spoofing",
            "step3_desc": "Usa Auto Spoof para modificar automáticamente el VID/PID del adaptador a valores compatibles con MIB2.",
            "step3_detail1": "Ve a la pestaña 'Auto Spoof'",
            "step3_detail2": "Presiona el botón 'Ejecutar Spoofing Automático'",
            "step3_detail3": "La app creará un backup automático antes de modificar",
            "step3_detail4": "Espera a que termine el proceso (30-60 segundos)",
            "step3_detail5": "NO desconectes el adaptador durante el proceso",
            "step4_title": "Verificar Resultado",
            "step4_desc": "Después del spoofing, verifica que el VID/PID se modificó correctamente y prueba la conexión con MIB2.",
            "step4_detail1": "Verifica que el nuevo VID/PID sea 0x2001:0x3C05",
            "step4_detail2": "Desconecta y reconecta el adaptador",
            "step4_detail3": "Conecta el adaptador al puerto USB del MIB2",
            "step4_detail4": "Verifica que el MIB2 reconozca el adaptador",
            "step4_detail5": "Si falla, restaura desde backup en la pestaña 'Backups'",
            "start": "¡Comenzar!",
            "next": "Siguiente",
            "previous": "Anterior",
            "skip": "Saltar Tutorial"
        },
        "en": {
            "step1_title": "Connect USB Adapter",
            "step1_desc": "Connect your USB-Ethernet adapter to the Android device using an OTG cable with external power.",
            "step1_detail1": "Use an OTG cable with external power (5V)",
            "step1_detail2": "Connect the USB-Ethernet adapter to the OTG cable",
            "step1_detail3": "Wait for the adapter LED to turn on",
            "step1_detail4": "The app will automatically detect the device",
            "step2_title": "Verify Compatibility",
            "step2_desc": "The app will automatically detect the chipset and show if it's compatible for MIB2 spoofing.",
            "step2_detail1": "Go to 'USB Status' tab to see device information",
            "step2_detail2": "Check the compatibility badge:",
            "step2_detail3": "✅ Green = Confirmed compatible",
            "step2_detail4": "⚠️ Yellow = Experimental (probably works)",
            "step2_detail5": "❌ Red = Incompatible",
            "step2_detail6": "Only ASIX chipsets allow spoofing",
            "step3_title": "Execute Spoofing",
            "step3_desc": "Use Auto Spoof to automatically modify the adapter's VID/PID to MIB2 compatible values.",
            "step3_detail1": "Go to 'Auto Spoof' tab",
            "step3_detail2": "Press the 'Execute Automatic Spoofing' button",
            "step3_detail3": "The app will create an automatic backup before modifying",
            "step3_detail4": "Wait for the process to finish (30-60 seconds)",
            "step3_detail5": "DO NOT disconnect the adapter during the process",
            "step4_title": "Verify Result",
            "step4_desc": "After spoofing, verify that the VID/PID was modified correctly and test the connection with MIB2.",
            "step4_detail1": "Verify the new VID/PID is 0x2001:0x3C05",
            "step4_detail2": "Disconnect and reconnect the adapter",
            "step4_detail3": "Connect the adapter to the MIB2 USB port",
            "step4_detail4": "Verify that MIB2 recognizes the adapter",
            "step4_detail5": "If it fails, restore from backup in the 'Backups' tab",
            "start": "Let's Go!",
            "next": "Next",
            "previous": "Previous",
            "skip": "Skip Tutorial"
        },
        "de": {
            "step1_title": "USB-Adapter anschließen",
            "step1_desc": "Verbinden Sie Ihren USB-Ethernet-Adapter mit dem Android-Gerät über ein OTG-Kabel mit externer Stromversorgung.",
            "step1_detail1": "Verwenden Sie ein OTG-Kabel mit externer Stromversorgung (5V)",
            "step1_detail2": "Verbinden Sie den USB-Ethernet-Adapter mit dem OTG-Kabel",
            "step1_detail3": "Warten Sie, bis die LED des Adapters leuchtet",
            "step1_detail4": "Die App erkennt das Gerät automatisch",
            "step2_title": "Kompatibilität prüfen",
            "step2_desc": "Die App erkennt automatisch den Chipsatz und zeigt an, ob er für MIB2-Spoofing kompatibel ist.",
            "step2_detail1": "Gehen Sie zur Registerkarte 'USB-Status', um Geräteinformationen anzuzeigen",
            "step2_detail2": "Überprüfen Sie das Kompatibilitäts-Badge:",
            "step2_detail3": "✅ Grün = Bestätigt kompatibel",
            "step2_detail4": "⚠️ Gelb = Experimentell (funktioniert wahrscheinlich)",
            "step2_detail5": "❌ Rot = Inkompatibel",
            "step2_detail6": "Nur ASIX-Chipsätze erlauben Spoofing",
            "step3_title": "Spoofing ausführen",
            "step3_desc": "Verwenden Sie Auto Spoof, um die VID/PID des Adapters automatisch auf MIB2-kompatible Werte zu ändern.",
            "step3_detail1": "Gehen Sie zur Registerkarte 'Auto Spoof'",
            "step3_detail2": "Drücken Sie die Schaltfläche 'Automatisches Spoofing ausführen'",
            "step3_detail3": "Die App erstellt vor der Änderung automatisch ein Backup",
            "step3_detail4": "Warten Sie, bis der Vorgang abgeschlossen ist (30-60 Sekunden)",
            "step3_detail5": "Trennen Sie den Adapter NICHT während des Vorgangs",
            "step4_title": "Ergebnis überprüfen",
            "step4_desc": "Überprüfen Sie nach dem Spoofing, ob die VID/PID korrekt geändert wurde, und testen Sie die Verbindung mit MIB2.",
            "step4_detail1": "Überprüfen Sie, ob die neue VID/PID 0x2001:0x3C05 ist",
            "step4_detail2": "Trennen und verbinden Sie den Adapter erneut",
            "step4_detail3": "Verbinden Sie den Adapter mit dem USB-Port des MIB2",
            "step4_detail4": "Überprüfen Sie, ob das MIB2 den Adapter erkennt",
            "step4_detail5": "Bei Fehlschlag, stellen Sie aus dem Backup in der Registerkarte 'Backups' wieder her",
            "start": "Los geht's!",
            "next": "Weiter",
            "previous": "Zurück",
            "skip": "Tutorial überspringen"
        }
    },
    "toolbox": {
        "es": {
            "step1_title": "Conectar Adaptador USB-Ethernet",
            "step1_desc": "Conectar el adaptador D-Link DUB-E100 al puerto USB de la unidad MIB2. Conectar el cable Ethernet desde el adaptador al dispositivo Android (vía adaptador USB-C a Ethernet) o a un router WiFi.",
            "step1_warning1": "Asegurarse de usar el adaptador D-Link DUB-E100 específicamente",
            "step1_warning2": "El chipset ASIX AX88772 es reconocido nativamente por el firmware MIB2",
            "step2_title": "Configurar Red",
            "step2_desc": "La unidad MIB2 generalmente tiene una dirección IP estática preasignada en la subred 192.168.1.x (frecuentemente 192.168.1.4 para el host). Configurar el dispositivo con una IP estática en el mismo rango (ej. 192.168.1.10).",
            "step3_title": "Verificar Conectividad",
            "step3_desc": "Verificar que se puede hacer ping a la unidad MIB2 antes de intentar conectar por Telnet.",
            "step4_title": "Conectar por Telnet",
            "step4_desc": "El servicio Telnet (puerto 23) puede estar activo pero protegido o inactivo por defecto. En versiones de firmware antiguas o específicas de Technisat ZR (Zentralrechner), este puerto puede estar abierto.",
            "step4_warning1": "Si el puerto Telnet está cerrado, no se puede activar mediante codificación VCDS",
            "step4_warning2": "En ese caso, el último recurso es el acceso directo al almacenamiento no volátil (eMMC Direct Access) mediante soldadura",
            "step5_title": "Iniciar Sesión como Root",
            "step5_desc": "Una vez establecida la sesión Telnet, se obtiene acceso a la shell de comandos de QNX (ksh).",
            "step6_title": "Verificar Sistema de Archivos",
            "step6_desc": "Desde aquí, las restricciones de la interfaz gráfica (HMI) son irrelevantes. Se puede montar manualmente la tarjeta SD y ejecutar scripts de shell directamente.",
            "step7_title": "Descargar MIB2 Toolbox",
            "step7_desc": "Descargar el MIB2 STD2 Toolbox desde el repositorio oficial de GitHub y copiarlo a una tarjeta SD.",
            "step7_warning1": "Asegurarse de descargar la versión correcta para MIB2 STD2 (no MIB2 High)",
            "step7_warning2": "Verificar la integridad del archivo descargado",
            "step8_title": "Ejecutar Script de Instalación",
            "step8_desc": "Este método 'inyecta' el instalador del MIB STD2 Toolbox sorteando la validación de firmas digitales del gestor de actualizaciones SWDL.",
            "step8_warning1": "Este método sortea la validación de firmware digital del gestor de actualizaciones SWDL",
            "step8_warning2": "Estamos ejecutando el script manualmente con privilegios root",
            "step9_title": "Aplicar Parcheo del Sistema",
            "step9_desc": "Una vez instalado el Toolbox, ejecutar la función de parcheo desde el menú verde (GEM - Green Engineering Menu) accesible tras la instalación.",
            "step9_warning1": "Este parcheo modifica el binario del sistema para alterar la rutina de verificación de firmas",
            "step9_warning2": "Una vez parcheado, el sistema se instruye para consultar la ExceptionList.txt",
            "step10_title": "Verificar Instalación",
            "step10_desc": "Verificar que el Toolbox se instaló correctamente y está accesible desde el sistema.",
            "step11_title": "Reiniciar Sistema",
            "step11_desc": "Reiniciar la unidad MIB2 para que los cambios surtan efecto.",
            "step11_warning1": "Después del reinicio, el Toolbox debería estar accesible desde el menú del sistema",
            "step11_warning2": "El menú verde (GEM) estará disponible para funciones avanzadas",
            "emmc_title": "Método Alternativo: Acceso Directo eMMC (Avanzado)",
            "emmc_desc": "Si el puerto Telnet está cerrado y no se puede activar mediante codificación VCDS, el último recurso es el acceso directo al almacenamiento no volátil.",
            "emmc_step1": "Extracción física de la unidad MIB2 del vehículo",
            "emmc_step2": "Desmontaje del chasis y soldadura de un lector SD modificado",
            "emmc_step3": "Acceso directo a los pines del chip eMMC (Embedded Multi-Media Controller)",
            "emmc_step4": "Modificación del archivo shadow (contraseñas) o inyección directa de archivos parcheados",
            "emmc_step5": "Re-escritura de la imagen en el chip",
            "emmc_warning1": "Este método es destructivo potencialmente y requiere habilidades avanzadas de microsoldadura",
            "emmc_warning2": "Ofrece control total sobre la unidad, permitiendo incluso revivir unidades 'briqueadas'",
            "emmc_warning3": "NO recomendado para usuarios sin experiencia en electrónica",
            "emmc_warning4": "Puede anular la garantía y dañar permanentemente la unidad",
            "emmc_technical_note": "Al volcar la imagen de la memoria eMMC en un PC, se puede modificar el archivo shadow o inyectar directamente los archivos parcheados.",
            "diag_system_info": "Información del Sistema",
            "diag_system_info_desc": "Muestra información del sistema operativo QNX",
            "diag_firmware_version": "Versión del Firmware",
            "diag_firmware_version_desc": "Muestra la versión del firmware instalado",
            "diag_processes": "Procesos en Ejecución",
            "diag_processes_desc": "Lista todos los procesos en ejecución",
            "diag_disk_space": "Espacio en Disco",
            "diag_disk_space_desc": "Muestra el espacio disponible en los sistemas de archivos",
            "diag_network": "Dispositivos de Red",
            "diag_network_desc": "Muestra la configuración de las interfaces de red",
            "diag_services": "Servicios Activos",
            "diag_services_desc": "Muestra los puertos en escucha (Telnet, FTP, SSH, etc.)",
            "diag_hardware": "Información de Hardware",
            "diag_hardware_desc": "Muestra información detallada del hardware y procesos"
        },
        "en": {
            "step1_title": "Connect USB-Ethernet Adapter",
            "step1_desc": "Connect the D-Link DUB-E100 adapter to the MIB2 unit's USB port. Connect the Ethernet cable from the adapter to the Android device (via USB-C to Ethernet adapter) or to a WiFi router.",
            "step1_warning1": "Make sure to use the D-Link DUB-E100 adapter specifically",
            "step1_warning2": "The ASIX AX88772 chipset is natively recognized by MIB2 firmware",
            "step2_title": "Configure Network",
            "step2_desc": "The MIB2 unit generally has a pre-assigned static IP address in the 192.168.1.x subnet (frequently 192.168.1.4 for the host). Configure the device with a static IP in the same range (e.g., 192.168.1.10).",
            "step3_title": "Verify Connectivity",
            "step3_desc": "Verify that you can ping the MIB2 unit before attempting to connect via Telnet.",
            "step4_title": "Connect via Telnet",
            "step4_desc": "The Telnet service (port 23) may be active but protected or inactive by default. In older firmware versions or specific Technisat ZR (Zentralrechner), this port may be open.",
            "step4_warning1": "If the Telnet port is closed, it cannot be activated via VCDS coding",
            "step4_warning2": "In that case, the last resort is direct access to non-volatile storage (eMMC Direct Access) via soldering",
            "step5_title": "Login as Root",
            "step5_desc": "Once the Telnet session is established, you get access to the QNX command shell (ksh).",
            "step6_title": "Verify File System",
            "step6_desc": "From here, GUI (HMI) restrictions are irrelevant. You can manually mount the SD card and execute shell scripts directly.",
            "step7_title": "Download MIB2 Toolbox",
            "step7_desc": "Download the MIB2 STD2 Toolbox from the official GitHub repository and copy it to an SD card.",
            "step7_warning1": "Make sure to download the correct version for MIB2 STD2 (not MIB2 High)",
            "step7_warning2": "Verify the integrity of the downloaded file",
            "step8_title": "Run Installation Script",
            "step8_desc": "This method 'injects' the MIB STD2 Toolbox installer bypassing the SWDL update manager's digital signature validation.",
            "step8_warning1": "This method bypasses the SWDL update manager's digital firmware validation",
            "step8_warning2": "We are running the script manually with root privileges",
            "step9_title": "Apply System Patch",
            "step9_desc": "Once the Toolbox is installed, run the patching function from the green menu (GEM - Green Engineering Menu) accessible after installation.",
            "step9_warning1": "This patch modifies the system binary to alter the signature verification routine",
            "step9_warning2": "Once patched, the system is instructed to query the ExceptionList.txt",
            "step10_title": "Verify Installation",
            "step10_desc": "Verify that the Toolbox was installed correctly and is accessible from the system.",
            "step11_title": "Restart System",
            "step11_desc": "Restart the MIB2 unit for the changes to take effect.",
            "step11_warning1": "After restart, the Toolbox should be accessible from the system menu",
            "step11_warning2": "The green menu (GEM) will be available for advanced functions",
            "emmc_title": "Alternative Method: Direct eMMC Access (Advanced)",
            "emmc_desc": "If the Telnet port is closed and cannot be activated via VCDS coding, the last resort is direct access to non-volatile storage.",
            "emmc_step1": "Physical extraction of the MIB2 unit from the vehicle",
            "emmc_step2": "Chassis disassembly and soldering of a modified SD reader",
            "emmc_step3": "Direct access to eMMC chip pins (Embedded Multi-Media Controller)",
            "emmc_step4": "Modification of the shadow file (passwords) or direct injection of patched files",
            "emmc_step5": "Re-writing the image to the chip",
            "emmc_warning1": "This method is potentially destructive and requires advanced micro-soldering skills",
            "emmc_warning2": "Offers total control over the unit, even allowing revival of 'bricked' units",
            "emmc_warning3": "NOT recommended for users without electronics experience",
            "emmc_warning4": "May void warranty and permanently damage the unit",
            "emmc_technical_note": "By dumping the eMMC memory image to a PC, you can modify the shadow file or directly inject patched files.",
            "diag_system_info": "System Information",
            "diag_system_info_desc": "Shows QNX operating system information",
            "diag_firmware_version": "Firmware Version",
            "diag_firmware_version_desc": "Shows the installed firmware version",
            "diag_processes": "Running Processes",
            "diag_processes_desc": "Lists all running processes",
            "diag_disk_space": "Disk Space",
            "diag_disk_space_desc": "Shows available space in file systems",
            "diag_network": "Network Devices",
            "diag_network_desc": "Shows network interface configuration",
            "diag_services": "Active Services",
            "diag_services_desc": "Shows listening ports (Telnet, FTP, SSH, etc.)",
            "diag_hardware": "Hardware Information",
            "diag_hardware_desc": "Shows detailed hardware and process information"
        },
        "de": {
            "step1_title": "USB-Ethernet-Adapter anschließen",
            "step1_desc": "Verbinden Sie den D-Link DUB-E100-Adapter mit dem USB-Port der MIB2-Einheit. Verbinden Sie das Ethernet-Kabel vom Adapter zum Android-Gerät (über USB-C zu Ethernet-Adapter) oder zu einem WiFi-Router.",
            "step1_warning1": "Stellen Sie sicher, dass Sie speziell den D-Link DUB-E100-Adapter verwenden",
            "step1_warning2": "Der ASIX AX88772-Chipsatz wird von der MIB2-Firmware nativ erkannt",
            "step2_title": "Netzwerk konfigurieren",
            "step2_desc": "Die MIB2-Einheit hat in der Regel eine voreingestellte statische IP-Adresse im Subnetz 192.168.1.x (häufig 192.168.1.4 für den Host). Konfigurieren Sie das Gerät mit einer statischen IP im gleichen Bereich (z.B. 192.168.1.10).",
            "step3_title": "Konnektivität überprüfen",
            "step3_desc": "Überprüfen Sie, ob Sie die MIB2-Einheit pingen können, bevor Sie versuchen, sich über Telnet zu verbinden.",
            "step4_title": "Über Telnet verbinden",
            "step4_desc": "Der Telnet-Dienst (Port 23) kann aktiv, aber standardmäßig geschützt oder inaktiv sein. Bei älteren Firmware-Versionen oder spezifischen Technisat ZR (Zentralrechner) kann dieser Port offen sein.",
            "step4_warning1": "Wenn der Telnet-Port geschlossen ist, kann er nicht über VCDS-Codierung aktiviert werden",
            "step4_warning2": "In diesem Fall ist der letzte Ausweg der direkte Zugriff auf den nichtflüchtigen Speicher (eMMC Direct Access) durch Löten",
            "step5_title": "Als Root anmelden",
            "step5_desc": "Sobald die Telnet-Sitzung hergestellt ist, erhalten Sie Zugriff auf die QNX-Befehlsshell (ksh).",
            "step6_title": "Dateisystem überprüfen",
            "step6_desc": "Von hier aus sind GUI (HMI)-Einschränkungen irrelevant. Sie können die SD-Karte manuell mounten und Shell-Skripte direkt ausführen.",
            "step7_title": "MIB2 Toolbox herunterladen",
            "step7_desc": "Laden Sie die MIB2 STD2 Toolbox vom offiziellen GitHub-Repository herunter und kopieren Sie sie auf eine SD-Karte.",
            "step7_warning1": "Stellen Sie sicher, dass Sie die richtige Version für MIB2 STD2 herunterladen (nicht MIB2 High)",
            "step7_warning2": "Überprüfen Sie die Integrität der heruntergeladenen Datei",
            "step8_title": "Installationsskript ausführen",
            "step8_desc": "Diese Methode 'injiziert' den MIB STD2 Toolbox-Installer unter Umgehung der digitalen Signaturvalidierung des SWDL-Update-Managers.",
            "step8_warning1": "Diese Methode umgeht die digitale Firmware-Validierung des SWDL-Update-Managers",
            "step8_warning2": "Wir führen das Skript manuell mit Root-Rechten aus",
            "step9_title": "System-Patch anwenden",
            "step9_desc": "Sobald die Toolbox installiert ist, führen Sie die Patch-Funktion aus dem grünen Menü (GEM - Green Engineering Menu) aus, das nach der Installation zugänglich ist.",
            "step9_warning1": "Dieser Patch modifiziert die System-Binärdatei, um die Signaturverifizierungsroutine zu ändern",
            "step9_warning2": "Nach dem Patchen wird das System angewiesen, die ExceptionList.txt abzufragen",
            "step10_title": "Installation überprüfen",
            "step10_desc": "Überprüfen Sie, ob die Toolbox korrekt installiert wurde und vom System aus zugänglich ist.",
            "step11_title": "System neu starten",
            "step11_desc": "Starten Sie die MIB2-Einheit neu, damit die Änderungen wirksam werden.",
            "step11_warning1": "Nach dem Neustart sollte die Toolbox über das Systemmenü zugänglich sein",
            "step11_warning2": "Das grüne Menü (GEM) wird für erweiterte Funktionen verfügbar sein",
            "emmc_title": "Alternative Methode: Direkter eMMC-Zugriff (Fortgeschritten)",
            "emmc_desc": "Wenn der Telnet-Port geschlossen ist und nicht über VCDS-Codierung aktiviert werden kann, ist der letzte Ausweg der direkte Zugriff auf den nichtflüchtigen Speicher.",
            "emmc_step1": "Physische Entnahme der MIB2-Einheit aus dem Fahrzeug",
            "emmc_step2": "Gehäusedemontage und Löten eines modifizierten SD-Lesers",
            "emmc_step3": "Direkter Zugriff auf eMMC-Chip-Pins (Embedded Multi-Media Controller)",
            "emmc_step4": "Änderung der Shadow-Datei (Passwörter) oder direkte Injektion von gepatchten Dateien",
            "emmc_step5": "Zurückschreiben des Images auf den Chip",
            "emmc_warning1": "Diese Methode ist potenziell destruktiv und erfordert fortgeschrittene Mikrolöt-Fähigkeiten",
            "emmc_warning2": "Bietet vollständige Kontrolle über die Einheit, ermöglicht sogar die Wiederbelebung von 'gebrickten' Einheiten",
            "emmc_warning3": "NICHT empfohlen für Benutzer ohne Elektronik-Erfahrung",
            "emmc_warning4": "Kann die Garantie ungültig machen und die Einheit dauerhaft beschädigen",
            "emmc_technical_note": "Durch Dumpen des eMMC-Speicherabbilds auf einen PC können Sie die Shadow-Datei ändern oder gepatchte Dateien direkt injizieren.",
            "diag_system_info": "Systeminformationen",
            "diag_system_info_desc": "Zeigt QNX-Betriebssysteminformationen",
            "diag_firmware_version": "Firmware-Version",
            "diag_firmware_version_desc": "Zeigt die installierte Firmware-Version",
            "diag_processes": "Laufende Prozesse",
            "diag_processes_desc": "Listet alle laufenden Prozesse auf",
            "diag_disk_space": "Speicherplatz",
            "diag_disk_space_desc": "Zeigt verfügbaren Speicherplatz in Dateisystemen",
            "diag_network": "Netzwerkgeräte",
            "diag_network_desc": "Zeigt die Konfiguration der Netzwerkschnittstellen",
            "diag_services": "Aktive Dienste",
            "diag_services_desc": "Zeigt lauschende Ports (Telnet, FTP, SSH, etc.)",
            "diag_hardware": "Hardware-Informationen",
            "diag_hardware_desc": "Zeigt detaillierte Hardware- und Prozessinformationen"
        }
    },
    "fec": {
        "es": {
            "injection_title": "Proceso de Inyección de Códigos FEC",
            "step1_title": "Generar Códigos",
            "step1_desc": "Utilizar el generador de FEC basado en VIN y VCRN, o usar códigos predefinidos.",
            "step2_title": "Crear ExceptionList.txt",
            "step2_desc": "Generar el archivo ExceptionList.txt con los códigos FEC deseados.",
            "step3_title": "Instalar MIB2 Toolbox",
            "step3_desc": "Asegurarse de que el MIB2 STD2 Toolbox esté instalado en la unidad.",
            "step4_title": "Aplicar Parcheo",
            "step4_desc": "Ejecutar la función 'Patch tsd.mibstd2.system.swap' desde el menú verde (GEM) del Toolbox.",
            "step5_title": "Inyectar Códigos",
            "step5_desc": "Una vez parcheado el sistema, consultar la ExceptionList.txt generada. Los códigos serán aceptados como 'Legal' independientemente de la firma criptográfica.",
            "warning1": "Este método sortea la validación de firmware digital de VW AG",
            "warning2": "Solo funciona en unidades 1-SD que carecen de las rutinas de validación necesarias",
            "warning3": "El parcheo modifica el binario del sistema (tsd.mibstd2.system.swap)",
            "warning4": "Realizar backup antes de aplicar cualquier modificación",
            "technical_note": "El MIB STD2 Toolbox automatiza el proceso de 'parcheo'. En lugar de intentar crackear la clave privada de VW (computacionalmente inviable), el Toolbox modifica el binario del sistema para alterar la rutina de verificación de firmas."
        },
        "en": {
            "injection_title": "FEC Code Injection Process",
            "step1_title": "Generate Codes",
            "step1_desc": "Use the FEC generator based on VIN and VCRN, or use predefined codes.",
            "step2_title": "Create ExceptionList.txt",
            "step2_desc": "Generate the ExceptionList.txt file with the desired FEC codes.",
            "step3_title": "Install MIB2 Toolbox",
            "step3_desc": "Make sure the MIB2 STD2 Toolbox is installed on the unit.",
            "step4_title": "Apply Patch",
            "step4_desc": "Run the 'Patch tsd.mibstd2.system.swap' function from the Toolbox green menu (GEM).",
            "step5_title": "Inject Codes",
            "step5_desc": "Once the system is patched, query the generated ExceptionList.txt. Codes will be accepted as 'Legal' regardless of cryptographic signature.",
            "warning1": "This method bypasses VW AG's digital firmware validation",
            "warning2": "Only works on 1-SD units that lack the necessary validation routines",
            "warning3": "Patching modifies the system binary (tsd.mibstd2.system.swap)",
            "warning4": "Create backup before applying any modification",
            "technical_note": "The MIB STD2 Toolbox automates the 'patching' process. Instead of trying to crack VW's private key (computationally infeasible), the Toolbox modifies the system binary to alter the signature verification routine."
        },
        "de": {
            "injection_title": "FEC-Code-Injektionsprozess",
            "step1_title": "Codes generieren",
            "step1_desc": "Verwenden Sie den FEC-Generator basierend auf VIN und VCRN, oder verwenden Sie vordefinierte Codes.",
            "step2_title": "ExceptionList.txt erstellen",
            "step2_desc": "Generieren Sie die ExceptionList.txt-Datei mit den gewünschten FEC-Codes.",
            "step3_title": "MIB2 Toolbox installieren",
            "step3_desc": "Stellen Sie sicher, dass die MIB2 STD2 Toolbox auf der Einheit installiert ist.",
            "step4_title": "Patch anwenden",
            "step4_desc": "Führen Sie die Funktion 'Patch tsd.mibstd2.system.swap' aus dem grünen Toolbox-Menü (GEM) aus.",
            "step5_title": "Codes injizieren",
            "step5_desc": "Sobald das System gepatcht ist, fragen Sie die generierte ExceptionList.txt ab. Codes werden unabhängig von der kryptografischen Signatur als 'Legal' akzeptiert.",
            "warning1": "Diese Methode umgeht die digitale Firmware-Validierung von VW AG",
            "warning2": "Funktioniert nur auf 1-SD-Einheiten, denen die notwendigen Validierungsroutinen fehlen",
            "warning3": "Das Patchen modifiziert die System-Binärdatei (tsd.mibstd2.system.swap)",
            "warning4": "Erstellen Sie vor jeder Änderung ein Backup",
            "technical_note": "Die MIB STD2 Toolbox automatisiert den 'Patching'-Prozess. Anstatt zu versuchen, den privaten Schlüssel von VW zu knacken (rechnerisch nicht machbar), modifiziert die Toolbox die System-Binärdatei, um die Signaturverifizierungsroutine zu ändern."
        }
    },
    "telnet": {
        "es": {
            "connection_closed": "Conexión cerrada",
            "not_connected": "No conectado",
            "send_error": "Error al enviar comando"
        },
        "en": {
            "connection_closed": "Connection closed",
            "not_connected": "Not connected",
            "send_error": "Error sending command"
        },
        "de": {
            "connection_closed": "Verbindung geschlossen",
            "not_connected": "Nicht verbunden",
            "send_error": "Fehler beim Senden des Befehls"
        }
    }
}

def deep_merge(base: dict, updates: dict) -> dict:
    """Merge updates into base recursively"""
    result = base.copy()
    for key, value in updates.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result

def update_locale_file(lang: str):
    """Update a locale file with new translations"""
    filepath = os.path.join(LOCALES_DIR, f"{lang}.json")
    
    # Read existing file
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Add new translations
    for section, translations in TRANSLATIONS.items():
        if lang in translations:
            if section not in data:
                data[section] = {}
            data[section] = deep_merge(data[section], translations[lang])
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Updated {filepath}")

def main():
    for lang in ['es', 'en', 'de']:
        update_locale_file(lang)
    print("\n✅ All remaining translations added!")

if __name__ == "__main__":
    main()
