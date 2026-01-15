#!/usr/bin/env python3
"""
Script para agregar todas las claves de traducción faltantes en EN y DE
"""
import json

# Nuevas claves de traducción necesarias
new_keys = {
    "common": {
        "cancel": {"es": "Cancelar", "en": "Cancel", "de": "Abbrechen"},
        "continue": {"es": "Continuar", "en": "Continue", "de": "Fortfahren"},
        "close": {"es": "Cerrar", "en": "Close", "de": "Schließen"},
        "share": {"es": "Compartir", "en": "Share", "de": "Teilen"},
        "error": {"es": "Error", "en": "Error", "de": "Fehler"},
        "understood": {"es": "Entendido", "en": "Understood", "de": "Verstanden"},
    },
    "toolbox": {
        "title": {"es": "Instalación del Toolbox", "en": "Toolbox Installation", "de": "Toolbox-Installation"},
        "subtitle": {"es": "Guía paso a paso para instalar el MIB2 STD2 Toolbox", "en": "Step-by-step guide to install MIB2 STD2 Toolbox", "de": "Schritt-für-Schritt-Anleitung zur Installation des MIB2 STD2 Toolbox"},
        "critical_warning": {"es": "ADVERTENCIA CRÍTICA", "en": "CRITICAL WARNING", "de": "KRITISCHE WARNUNG"},
        "warning_text_1": {"es": "La instalación del MIB2 Toolbox modifica archivos del sistema QNX. Un error puede BRICKEAR la unidad MIB2 (valor: miles de dólares).", "en": "MIB2 Toolbox installation modifies QNX system files. An error can BRICK the MIB2 unit (worth: thousands of dollars).", "de": "Die MIB2 Toolbox-Installation ändert QNX-Systemdateien. Ein Fehler kann das MIB2-Gerät BRICKEN (Wert: Tausende Euro)."},
        "warning_text_2": {"es": "El parcheo de tsd.mibstd2.system.swap altera la rutina de verificación de firmas digitales. No interrumpas el proceso una vez iniciado.", "en": "Patching tsd.mibstd2.system.swap alters the digital signature verification routine. Do not interrupt the process once started.", "de": "Das Patchen von tsd.mibstd2.system.swap ändert die digitale Signaturprüfung. Unterbrechen Sie den Vorgang nicht, sobald er gestartet wurde."},
        "warning_text_3": {"es": "Si algo falla, la única forma de recuperar la unidad es mediante acceso directo a la memoria eMMC (soldadura).", "en": "If something fails, the only way to recover the unit is through direct access to eMMC memory (soldering).", "de": "Wenn etwas fehlschlägt, ist die einzige Möglichkeit zur Wiederherstellung der direkte Zugriff auf den eMMC-Speicher (Löten)."},
        "prerequisites_status": {"es": "Estado de Prerequisitos", "en": "Prerequisites Status", "de": "Voraussetzungen Status"},
        "telnet_connection": {"es": "Conexión Telnet", "en": "Telnet Connection", "de": "Telnet-Verbindung"},
        "active": {"es": "Activa", "en": "Active", "de": "Aktiv"},
        "inactive": {"es": "Inactiva", "en": "Inactive", "de": "Inaktiv"},
        "usb_adapter": {"es": "Adaptador USB", "en": "USB Adapter", "de": "USB-Adapter"},
        "complete_prerequisites": {"es": "Completa los prerequisitos antes de instalar", "en": "Complete prerequisites before installing", "de": "Erfüllen Sie die Voraussetzungen vor der Installation"},
        "diagnostics": {"es": "Diagnósticos", "en": "Diagnostics", "de": "Diagnose"},
        "backups": {"es": "Backups", "en": "Backups", "de": "Backups"},
        "emmc_method": {"es": "Método eMMC", "en": "eMMC Method", "de": "eMMC-Methode"},
        "installation_steps": {"es": "Pasos de Instalación", "en": "Installation Steps", "de": "Installationsschritte"},
        "back_to_list": {"es": "Volver a la lista", "en": "Back to list", "de": "Zurück zur Liste"},
        "executing": {"es": "Ejecutando...", "en": "Executing...", "de": "Wird ausgeführt..."},
        "execute_step": {"es": "Ejecutar Paso", "en": "Execute Step", "de": "Schritt ausführen"},
        "steps": {"es": "Pasos", "en": "Steps", "de": "Schritte"},
        "diagnostic_commands": {"es": "Comandos de Diagnóstico", "en": "Diagnostic Commands", "de": "Diagnose-Befehle"},
        "restore_backup_title": {"es": "⚠️ Restaurar Backup", "en": "⚠️ Restore Backup", "de": "⚠️ Backup wiederherstellen"},
        "restore_backup_message": {"es": "¿Estás seguro de que deseas restaurar este backup?\n\nArchivo: {filename}\nFecha: {date}\nTamaño: {size} KB\n\nEsto sobrescribirá el archivo actual.", "en": "Are you sure you want to restore this backup?\n\nFile: {filename}\nDate: {date}\nSize: {size} KB\n\nThis will overwrite the current file.", "de": "Möchten Sie dieses Backup wirklich wiederherstellen?\n\nDatei: {filename}\nDatum: {date}\nGröße: {size} KB\n\nDies überschreibt die aktuelle Datei."},
        "restore": {"es": "Restaurar", "en": "Restore", "de": "Wiederherstellen"},
        "restore_error": {"es": "No se pudo restaurar el backup", "en": "Could not restore backup", "de": "Backup konnte nicht wiederhergestellt werden"},
        "delete_backup_title": {"es": "Eliminar Backup", "en": "Delete Backup", "de": "Backup löschen"},
        "delete_backup_message": {"es": "¿Estás seguro de que deseas eliminar este backup?\n\n{filename}\n{date}", "en": "Are you sure you want to delete this backup?\n\n{filename}\n{date}", "de": "Möchten Sie dieses Backup wirklich löschen?\n\n{filename}\n{date}"},
        "delete": {"es": "Eliminar", "en": "Delete", "de": "Löschen"},
        "script_generated": {"es": "Script Generado", "en": "Script Generated", "de": "Skript generiert"},
        "script_generated_message": {"es": "El script de instalación ha sido creado exitosamente.", "en": "The installation script has been created successfully.", "de": "Das Installationsskript wurde erfolgreich erstellt."},
        "verification_command": {"es": "Comando de Verificación", "en": "Verification Command", "de": "Verifizierungsbefehl"},
        "critical_step_1": {"es": "⚠️ PASO CRÍTICO - Confirmación 1/3", "en": "⚠️ CRITICAL STEP - Confirmation 1/3", "de": "⚠️ KRITISCHER SCHRITT - Bestätigung 1/3"},
        "critical_step_1_message": {"es": "Este paso modifica el binario del sistema tsd.mibstd2.system.swap.\n\nEsto altera la rutina de verificación de firmas digitales.\n\n¿Continuar?", "en": "This step modifies the system binary tsd.mibstd2.system.swap.\n\nThis alters the digital signature verification routine.\n\nContinue?", "de": "Dieser Schritt ändert die Systembinärdatei tsd.mibstd2.system.swap.\n\nDies ändert die digitale Signaturprüfung.\n\nFortfahren?"},
        "critical_step_2": {"es": "⚠️ PASO CRÍTICO - Confirmación 2/3", "en": "⚠️ CRITICAL STEP - Confirmation 2/3", "de": "⚠️ KRITISCHER SCHRITT - Bestätigung 2/3"},
        "critical_step_2_message": {"es": "Un error durante este proceso puede BRICKEAR la unidad MIB2.\n\nLa única forma de recuperarla sería mediante soldadura directa a la memoria eMMC.\n\n¿Estás seguro?", "en": "An error during this process can BRICK the MIB2 unit.\n\nThe only way to recover it would be through direct soldering to eMMC memory.\n\nAre you sure?", "de": "Ein Fehler während dieses Vorgangs kann das MIB2-Gerät BRICKEN.\n\nDie einzige Möglichkeit zur Wiederherstellung wäre direktes Löten am eMMC-Speicher.\n\nSind Sie sicher?"},
        "im_sure": {"es": "Estoy Seguro", "en": "I'm Sure", "de": "Ich bin sicher"},
        "critical_step_3": {"es": "⚠️ CONFIRMACIÓN FINAL - 3/3", "en": "⚠️ FINAL CONFIRMATION - 3/3", "de": "⚠️ ENDGÜLTIGE BESTÄTIGUNG - 3/3"},
        "critical_step_3_message": {"es": "Una vez iniciado el proceso, NO lo interrumpas.\n\nAsegúrate de que:\n• La batería del vehículo está cargada\n• No apagarás el contacto\n• La conexión Telnet es estable\n\n¿Ejecutar parcheo AHORA?", "en": "Once the process starts, DO NOT interrupt it.\n\nMake sure that:\n• The vehicle battery is charged\n• You won't turn off the ignition\n• The Telnet connection is stable\n\nExecute patching NOW?", "de": "Sobald der Vorgang gestartet ist, unterbrechen Sie ihn NICHT.\n\nStellen Sie sicher, dass:\n• Die Fahrzeugbatterie geladen ist\n• Sie die Zündung nicht ausschalten\n• Die Telnet-Verbindung stabil ist\n\nPatching JETZT ausführen?"},
        "execute": {"es": "EJECUTAR", "en": "EXECUTE", "de": "AUSFÜHREN"},
        "backup_created": {"es": "✅ Backup Creado", "en": "✅ Backup Created", "de": "✅ Backup erstellt"},
        "backup_created_message": {"es": "Backup guardado exitosamente:\n\nRuta: {path}\nTamaño: {size} KB\nChecksum: {checksum}...\n\nProcediendo con el parcheo...", "en": "Backup saved successfully:\n\nPath: {path}\nSize: {size} KB\nChecksum: {checksum}...\n\nProceeding with patching...", "de": "Backup erfolgreich gespeichert:\n\nPfad: {path}\nGröße: {size} KB\nPrüfsumme: {checksum}...\n\nFahre mit dem Patching fort..."},
        "backup_error": {"es": "❌ Error en Backup", "en": "❌ Backup Error", "de": "❌ Backup-Fehler"},
        "backup_error_message": {"es": "No se pudo crear el backup: {error}\n\n¿Deseas continuar sin backup? (NO RECOMENDADO)", "en": "Could not create backup: {error}\n\nDo you want to continue without backup? (NOT RECOMMENDED)", "de": "Backup konnte nicht erstellt werden: {error}\n\nMöchten Sie ohne Backup fortfahren? (NICHT EMPFOHLEN)"},
        "continue_without_backup": {"es": "Continuar Sin Backup", "en": "Continue Without Backup", "de": "Ohne Backup fortfahren"},
        "execute_step_confirm": {"es": "¿Ejecutar: {title}?", "en": "Execute: {title}?", "de": "Ausführen: {title}?"},
    },
    "recovery": {
        "title": {"es": "🛠️ Recuperación", "en": "🛠️ Recovery", "de": "🛠️ Wiederherstellung"},
        "subtitle": {"es": "Restaura adaptadores USB brickeados desde backups", "en": "Restore bricked USB adapters from backups", "de": "Stellen Sie gebrickte USB-Adapter aus Backups wieder her"},
        "bricked_detected": {"es": "Adaptador Brickeado Detectado", "en": "Bricked Adapter Detected", "de": "Gebrickter Adapter erkannt"},
        "adapter_connected": {"es": "Adaptador Conectado", "en": "Adapter Connected", "de": "Adapter verbunden"},
        "device_detected": {"es": "Dispositivo Detectado", "en": "Device Detected", "de": "Gerät erkannt"},
        "no_device": {"es": "Sin Dispositivo", "en": "No Device", "de": "Kein Gerät"},
        "bricked_desc": {"es": "El adaptador tiene VID/PID corrupto o incorrecto", "en": "The adapter has corrupt or incorrect VID/PID", "de": "Der Adapter hat eine beschädigte oder falsche VID/PID"},
        "adapter_ok": {"es": "El adaptador está funcionando correctamente", "en": "The adapter is working correctly", "de": "Der Adapter funktioniert korrekt"},
        "connect_to_verify": {"es": "Conecta el dispositivo para verificar estado", "en": "Connect the device to verify status", "de": "Verbinden Sie das Gerät, um den Status zu überprüfen"},
        "connect_adapter": {"es": "Conecta un adaptador USB con cable OTG", "en": "Connect a USB adapter with OTG cable", "de": "Verbinden Sie einen USB-Adapter mit OTG-Kabel"},
        "device": {"es": "Dispositivo", "en": "Device", "de": "Gerät"},
        "available_backups": {"es": "💾 Backups Disponibles", "en": "💾 Available Backups", "de": "💾 Verfügbare Backups"},
        "backup_location_title": {"es": "📂 Ubicación de Backups", "en": "📂 Backup Location", "de": "📂 Backup-Speicherort"},
        "backup_location_message": {"es": "Los backups se guardan en:\n\nAndroid/data/[app]/files/Download/mib2_backups/\n\nPara acceder:\n1. Abre \"Archivos\" o \"Mis Archivos\"\n2. Navega a: Android → data → [nombre_app]\n3. Entra en: files → Download → mib2_backups\n\nNota: En Android 11+ necesitas habilitar \"Mostrar archivos ocultos\" para ver la carpeta Android/data.", "en": "Backups are saved in:\n\nAndroid/data/[app]/files/Download/mib2_backups/\n\nTo access:\n1. Open \"Files\" or \"My Files\"\n2. Navigate to: Android → data → [app_name]\n3. Enter: files → Download → mib2_backups\n\nNote: On Android 11+ you need to enable \"Show hidden files\" to see the Android/data folder.", "de": "Backups werden gespeichert in:\n\nAndroid/data/[app]/files/Download/mib2_backups/\n\nZum Zugriff:\n1. Öffnen Sie \"Dateien\" oder \"Meine Dateien\"\n2. Navigieren Sie zu: Android → data → [app_name]\n3. Öffnen Sie: files → Download → mib2_backups\n\nHinweis: Ab Android 11+ müssen Sie \"Versteckte Dateien anzeigen\" aktivieren, um den Android/data-Ordner zu sehen."},
        "view_location": {"es": "Ver Ubicación", "en": "View Location", "de": "Speicherort anzeigen"},
        "no_backups": {"es": "No hay backups disponibles.", "en": "No backups available.", "de": "Keine Backups verfügbar."},
        "create_backup_first": {"es": "Crea un backup antes de modificar adaptadores.", "en": "Create a backup before modifying adapters.", "de": "Erstellen Sie ein Backup, bevor Sie Adapter ändern."},
        "restore_eeprom_title": {"es": "⚠️ Restaurar EEPROM", "en": "⚠️ Restore EEPROM", "de": "⚠️ EEPROM wiederherstellen"},
        "restore_eeprom_message": {"es": "¿Estás seguro de que deseas restaurar este backup?\n\n💾 Backup: {name}\n📅 Fecha: {date}\n🔧 Chipset: {chipset}\n\nEsta operación sobrescribirá la EEPROM actual del adaptador.", "en": "Are you sure you want to restore this backup?\n\n💾 Backup: {name}\n📅 Date: {date}\n🔧 Chipset: {chipset}\n\nThis operation will overwrite the adapter's current EEPROM.", "de": "Möchten Sie dieses Backup wirklich wiederherstellen?\n\n💾 Backup: {name}\n📅 Datum: {date}\n🔧 Chipset: {chipset}\n\nDieser Vorgang überschreibt das aktuelle EEPROM des Adapters."},
        "restore": {"es": "Restaurar", "en": "Restore", "de": "Wiederherstellen"},
        "restore_success": {"es": "✅ Restauración Exitosa", "en": "✅ Restore Successful", "de": "✅ Wiederherstellung erfolgreich"},
        "restore_success_message": {"es": "La EEPROM se restauró correctamente desde el backup.\n\n📊 Bytes escritos: {size}\n🔒 Checksum: {checksum}...\n\nDesconecta y vuelve a conectar el adaptador para que los cambios surtan efecto.", "en": "EEPROM was successfully restored from backup.\n\n📊 Bytes written: {size}\n🔒 Checksum: {checksum}...\n\nDisconnect and reconnect the adapter for changes to take effect.", "de": "EEPROM wurde erfolgreich aus dem Backup wiederhergestellt.\n\n📊 Geschriebene Bytes: {size}\n🔒 Prüfsumme: {checksum}...\n\nTrennen Sie den Adapter und verbinden Sie ihn erneut, damit die Änderungen wirksam werden."},
        "restore_error": {"es": "❌ Error al Restaurar", "en": "❌ Restore Error", "de": "❌ Wiederherstellungsfehler"},
        "restore_error_message": {"es": "No se pudo restaurar la EEPROM desde el backup", "en": "Could not restore EEPROM from backup", "de": "EEPROM konnte nicht aus dem Backup wiederhergestellt werden"},
        "force_restore_title": {"es": "🚨 Modo de Recuperación Forzada", "en": "🚨 Forced Recovery Mode", "de": "🚨 Erzwungener Wiederherstellungsmodus"},
        "force_restore_message": {"es": "Este modo intenta restaurar la EEPROM sin validaciones de seguridad.\n\n⚠️ ADVERTENCIAS:\n• Puede dañar permanentemente el adaptador\n• No se verificará compatibilidad\n• No se creará backup previo\n\nUsa esta opción SOLO si el adaptador no responde a métodos normales.\n\n¿Deseas continuar?", "en": "This mode attempts to restore EEPROM without security validations.\n\n⚠️ WARNINGS:\n• May permanently damage the adapter\n• Compatibility will not be verified\n• No prior backup will be created\n\nUse this option ONLY if the adapter doesn't respond to normal methods.\n\nDo you want to continue?", "de": "Dieser Modus versucht, das EEPROM ohne Sicherheitsvalidierungen wiederherzustellen.\n\n⚠️ WARNUNGEN:\n• Kann den Adapter dauerhaft beschädigen\n• Kompatibilität wird nicht überprüft\n• Es wird kein vorheriges Backup erstellt\n\nVerwenden Sie diese Option NUR, wenn der Adapter nicht auf normale Methoden reagiert.\n\nMöchten Sie fortfahren?"},
        "force_restore": {"es": "Forzar Restauración", "en": "Force Restore", "de": "Wiederherstellung erzwingen"},
    },
    "fec": {
        "title": {"es": "Generador de Códigos FEC", "en": "FEC Code Generator", "de": "FEC-Code-Generator"},
        "subtitle": {"es": "Feature Enable Codes para activación de funciones SWaP", "en": "Feature Enable Codes for SWaP function activation", "de": "Feature Enable Codes zur Aktivierung von SWaP-Funktionen"},
        "open_generator": {"es": "Abrir Generador Online (vwcoding.ru)", "en": "Open Online Generator (vwcoding.ru)", "de": "Online-Generator öffnen (vwcoding.ru)"},
        "hide": {"es": "Ocultar", "en": "Hide", "de": "Ausblenden"},
        "show": {"es": "Mostrar", "en": "Show", "de": "Anzeigen"},
        "process_info": {"es": "Información del Proceso", "en": "Process Information", "de": "Prozessinformationen"},
        "warnings": {"es": "Advertencias", "en": "Warnings", "de": "Warnungen"},
        "technical_note": {"es": "Nota Técnica", "en": "Technical Note", "de": "Technischer Hinweis"},
        "vehicle_data": {"es": "Datos del Vehículo (Opcional)", "en": "Vehicle Data (Optional)", "de": "Fahrzeugdaten (Optional)"},
        "vehicle_data_desc": {"es": "Para generación de códigos personalizados basados en VIN/VCRN", "en": "For custom code generation based on VIN/VCRN", "de": "Für benutzerdefinierte Codegenerierung basierend auf VIN/VCRN"},
        "vin_label": {"es": "VIN (17 caracteres)", "en": "VIN (17 characters)", "de": "VIN (17 Zeichen)"},
        "vcrn_label": {"es": "VCRN (Número de Serie)", "en": "VCRN (Serial Number)", "de": "VCRN (Seriennummer)"},
        "vin_invalid": {"es": "VIN inválido (debe tener 17 caracteres alfanuméricos)", "en": "Invalid VIN (must have 17 alphanumeric characters)", "de": "Ungültige VIN (muss 17 alphanumerische Zeichen haben)"},
        "vcrn_invalid": {"es": "VCRN inválido (debe tener entre 8 y 20 caracteres)", "en": "Invalid VCRN (must have between 8 and 20 characters)", "de": "Ungültige VCRN (muss zwischen 8 und 20 Zeichen haben)"},
        "predefined_codes": {"es": "Códigos FEC Predefinidos", "en": "Predefined FEC Codes", "de": "Vordefinierte FEC-Codes"},
        "code": {"es": "Código", "en": "Code", "de": "Code"},
        "add_custom_code": {"es": "Agregar Código Personalizado", "en": "Add Custom Code", "de": "Benutzerdefinierten Code hinzufügen"},
        "add_code": {"es": "Agregar Código", "en": "Add Code", "de": "Code hinzufügen"},
        "selected_codes": {"es": "Códigos Seleccionados", "en": "Selected Codes", "de": "Ausgewählte Codes"},
        "remove": {"es": "Quitar", "en": "Remove", "de": "Entfernen"},
        "generate_exception_list": {"es": "Generar ExceptionList.txt", "en": "Generate ExceptionList.txt", "de": "ExceptionList.txt generieren"},
        "view_injection_command": {"es": "Ver Comando de Inyección", "en": "View Injection Command", "de": "Injektionsbefehl anzeigen"},
        "inject_via_telnet": {"es": "Inyectar vía Telnet", "en": "Inject via Telnet", "de": "Per Telnet injizieren"},
        "connect_telnet_first": {"es": "Conectar Telnet Primero", "en": "Connect Telnet First", "de": "Zuerst Telnet verbinden"},
        "injection_command": {"es": "Comando de Inyección", "en": "Injection Command", "de": "Injektionsbefehl"},
        "confirm_injection": {"es": "Confirmar Inyección", "en": "Confirm Injection", "de": "Injektion bestätigen"},
        "confirm_injection_message": {"es": "¿Inyectar {count} código(s) FEC vía Telnet?\n\nLa unidad se reiniciará automáticamente.", "en": "Inject {count} FEC code(s) via Telnet?\n\nThe unit will restart automatically.", "de": "{count} FEC-Code(s) per Telnet injizieren?\n\nDas Gerät wird automatisch neu gestartet."},
        "inject": {"es": "Inyectar", "en": "Inject", "de": "Injizieren"},
        "exception_list_generated": {"es": "ExceptionList Generada", "en": "ExceptionList Generated", "de": "ExceptionList generiert"},
        "exception_list_generated_message": {"es": "El archivo ExceptionList.txt ha sido creado exitosamente.", "en": "The ExceptionList.txt file has been created successfully.", "de": "Die Datei ExceptionList.txt wurde erfolgreich erstellt."},
    },
    "settings": {
        "title": {"es": "Configuración", "en": "Settings", "de": "Einstellungen"},
        "subtitle": {"es": "Ajusta los parámetros de la aplicación", "en": "Adjust application parameters", "de": "Anwendungsparameter anpassen"},
        "reset_values": {"es": "Restablecer Valores", "en": "Reset Values", "de": "Werte zurücksetzen"},
        "reset_values_confirm": {"es": "¿Restaurar la configuración a los valores por defecto?", "en": "Restore settings to default values?", "de": "Einstellungen auf Standardwerte zurücksetzen?"},
        "reset": {"es": "Restablecer", "en": "Reset", "de": "Zurücksetzen"},
        "pin_setup_error": {"es": "Error al configurar PIN", "en": "Error setting up PIN", "de": "Fehler beim Einrichten der PIN"},
        "setup_pin": {"es": "Configurar PIN", "en": "Setup PIN", "de": "PIN einrichten"},
        "setup_pin_required": {"es": "Primero debes configurar un PIN de seguridad para usar el Modo Experto", "en": "You must first set up a security PIN to use Expert Mode", "de": "Sie müssen zuerst eine Sicherheits-PIN einrichten, um den Expertenmodus zu verwenden"},
        "reset_pin": {"es": "Restablecer PIN", "en": "Reset PIN", "de": "PIN zurücksetzen"},
        "reset_pin_confirm": {"es": "¿Estás seguro? Esto desactivará el Modo Experto y eliminará el PIN configurado.", "en": "Are you sure? This will disable Expert Mode and remove the configured PIN.", "de": "Sind Sie sicher? Dies deaktiviert den Expertenmodus und entfernt die konfigurierte PIN."},
        "expert_mode": {"es": "Modo Experto", "en": "Expert Mode", "de": "Expertenmodus"},
        "expert_mode_desc": {"es": "Desbloquea comandos avanzados y peligrosos", "en": "Unlocks advanced and dangerous commands", "de": "Schaltet erweiterte und gefährliche Befehle frei"},
        "expert_mode_active": {"es": "MODO EXPERTO ACTIVO", "en": "EXPERT MODE ACTIVE", "de": "EXPERTENMODUS AKTIV"},
        "expert_mode_warning": {"es": "Tienes acceso a comandos que pueden dañar la unidad MIB2. Procede con extrema precaución.", "en": "You have access to commands that can damage the MIB2 unit. Proceed with extreme caution.", "de": "Sie haben Zugriff auf Befehle, die das MIB2-Gerät beschädigen können. Gehen Sie mit äußerster Vorsicht vor."},
        "change_pin": {"es": "Cambiar PIN", "en": "Change PIN", "de": "PIN ändern"},
        "setup_security_pin": {"es": "Configurar PIN de Seguridad", "en": "Setup Security PIN", "de": "Sicherheits-PIN einrichten"},
        "new_pin": {"es": "Nuevo PIN (mínimo 4 dígitos)", "en": "New PIN (minimum 4 digits)", "de": "Neue PIN (mindestens 4 Ziffern)"},
        "confirm_pin": {"es": "Confirmar PIN", "en": "Confirm PIN", "de": "PIN bestätigen"},
        "save_pin": {"es": "Guardar PIN", "en": "Save PIN", "de": "PIN speichern"},
        "enter_pin": {"es": "Ingresar PIN", "en": "Enter PIN", "de": "PIN eingeben"},
        "security_pin": {"es": "PIN de Seguridad", "en": "Security PIN", "de": "Sicherheits-PIN"},
        "activate": {"es": "Activar", "en": "Activate", "de": "Aktivieren"},
        "current_pin": {"es": "PIN Actual", "en": "Current PIN", "de": "Aktuelle PIN"},
        "confirm_new_pin": {"es": "Confirmar Nuevo PIN", "en": "Confirm New PIN", "de": "Neue PIN bestätigen"},
        "change": {"es": "Cambiar", "en": "Change", "de": "Ändern"},
        "connection_settings": {"es": "Configuración de Conexión", "en": "Connection Settings", "de": "Verbindungseinstellungen"},
        "ip_address": {"es": "Dirección IP", "en": "IP Address", "de": "IP-Adresse"},
        "ip_address_desc": {"es": "Dirección IP de la unidad MIB2 en la red local", "en": "IP address of the MIB2 unit on the local network", "de": "IP-Adresse des MIB2-Geräts im lokalen Netzwerk"},
        "port": {"es": "Puerto", "en": "Port", "de": "Port"},
        "port_desc": {"es": "Puerto Telnet (por defecto: 23)", "en": "Telnet port (default: 23)", "de": "Telnet-Port (Standard: 23)"},
        "username": {"es": "Usuario", "en": "Username", "de": "Benutzername"},
        "username_desc": {"es": "Usuario para autenticación Telnet", "en": "Username for Telnet authentication", "de": "Benutzername für Telnet-Authentifizierung"},
        "password": {"es": "Contraseña", "en": "Password", "de": "Passwort"},
        "password_desc": {"es": "Contraseña para autenticación Telnet", "en": "Password for Telnet authentication", "de": "Passwort für Telnet-Authentifizierung"},
        "save": {"es": "Guardar", "en": "Save", "de": "Speichern"},
        "data_management": {"es": "Gestión de Datos", "en": "Data Management", "de": "Datenverwaltung"},
        "clear_history": {"es": "Limpiar Historial", "en": "Clear History", "de": "Verlauf löschen"},
        "clear_history_confirm": {"es": "¿Eliminar todo el historial de comandos?", "en": "Delete all command history?", "de": "Gesamten Befehlsverlauf löschen?"},
        "clear": {"es": "Limpiar", "en": "Clear", "de": "Löschen"},
        "clear_command_history": {"es": "Limpiar Historial de Comandos", "en": "Clear Command History", "de": "Befehlsverlauf löschen"},
        "usb_debug_mode": {"es": "Modo Debug USB", "en": "USB Debug Mode", "de": "USB-Debug-Modus"},
        "connection_status": {"es": "Estado de Conexión", "en": "Connection Status", "de": "Verbindungsstatus"},
        "status": {"es": "Estado", "en": "Status", "de": "Status"},
        "devices_detected": {"es": "Dispositivos detectados", "en": "Devices detected", "de": "Erkannte Geräte"},
        "current_device": {"es": "Dispositivo Actual", "en": "Current Device", "de": "Aktuelles Gerät"},
        "technical_info": {"es": "Información Técnica", "en": "Technical Information", "de": "Technische Informationen"},
        "native_module": {"es": "Módulo Nativo", "en": "Native Module", "de": "Natives Modul"},
        "active": {"es": "ACTIVO", "en": "ACTIVE", "de": "AKTIV"},
    },
    "usb": {
        "status_connected": {"es": "Conectado", "en": "Connected", "de": "Verbunden"},
        "status_disconnected": {"es": "Desconectado", "en": "Disconnected", "de": "Getrennt"},
        "status_detected": {"es": "Detectado", "en": "Detected", "de": "Erkannt"},
        "chipset": {"es": "Chipset", "en": "Chipset", "de": "Chipsatz"},
        "manufacturer": {"es": "Fabricante", "en": "Manufacturer", "de": "Hersteller"},
        "product": {"es": "Producto", "en": "Product", "de": "Produkt"},
    },
}

def deep_merge(base, updates):
    """Merge updates into base dict recursively"""
    for key, value in updates.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            deep_merge(base[key], value)
        else:
            base[key] = value
    return base

def update_locale_file(filepath, lang):
    """Update a locale file with new translations"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Build updates for this language
    updates = {}
    for section, keys in new_keys.items():
        if section not in updates:
            updates[section] = {}
        for key, translations in keys.items():
            if lang in translations:
                updates[section][key] = translations[lang]
    
    # Merge updates
    deep_merge(data, updates)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Updated {filepath}")

# Update all locale files
update_locale_file('/home/ubuntu/mib2_controller/locales/es.json', 'es')
update_locale_file('/home/ubuntu/mib2_controller/locales/en.json', 'en')
update_locale_file('/home/ubuntu/mib2_controller/locales/de.json', 'de')

print("All translations updated!")
