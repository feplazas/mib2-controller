# MIB2 Controller v3.0.0

**Aplicación Android full stack** para comunicación, diagnóstico y modificación de unidades **MIB2 STD2 Technisat/Preh** con firmware T480. Incluye automatización de spoofing de adaptadores USB-Ethernet ASIX para sortear la lista blanca de dispositivos.

---

## 🚀 Características Principales

### 1. Comunicación Telnet con MIB2
- **Conexión automática** mediante Telnet sobre Ethernet
- **Detección automática** de unidades MIB2 en red local
- **Ejecución remota** de comandos shell

### 2. Biblioteca de Procedimientos VCDS
- **40+ comandos predefinidos** específicos para firmware T480
- **Traducciones técnicas** alemán-español

### 3. Generador de Códigos FEC
- **Generación automática** de códigos Feature Enable Codes
- **Códigos predefinidos**: CarPlay, Android Auto, Performance Monitor

### 4. **SPOOFING DE ADAPTADORES ASIX (NUEVO)**
- **Reprogramación nativa desde Android** de adaptadores ASIX AX88772
- **Modificación de EEPROM** para cambiar VID/PID
- **Emulación de D-Link DUB-E100** para sortear lista blanca de MIB2
- **USB control transfers** nativos sin requerir root

---

## 📋 Requisitos

- **Dispositivo Android** con Android 12+ y soporte USB Host (OTG)
- **Adaptador USB-Ethernet** ASIX AX88772A/B o D-Link DUB-E100
- **Unidad MIB2 STD2** Technisat/Preh con firmware T480

---

## ⚠️ Advertencias de Seguridad

### Spoofing de Adaptadores

#### Riesgo de "Bricking"
La reprogramación de EEPROM puede **inutilizar permanentemente** el adaptador si:
- Se desconecta durante el proceso
- El chipset tiene eFuse (AX88772C)
- Se interrumpe la alimentación

#### Chipsets Compatibles
- ✅ **AX88772A**: Compatible
- ✅ **AX88772B**: Compatible
- ❌ **AX88772C**: **NO COMPATIBLE** (eFuse interno)

---

**Versión**: 3.0.0  
**Última actualización**: Enero 2026
