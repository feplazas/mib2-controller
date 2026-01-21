# Google Play Compliance & Legal Justification Dossier
## MIB2 Controller (Android)

**Document version:** 1.0  
**Date:** January 21, 2026  
**Author / Contact:** Felipe Plazas (Attorney-at-law)  
**Support contact:** feplazas@gmail.com  
**App package name:** space.manus.mib2controller.t20260110134809  
**App version / build:** 1.0.0 (versionCode 6)  

---

## 1) Executive summary

**MIB2 Controller** is a specialized, owner-use Android application that connects **locally** (via a physical USB-to-Ethernet adapter) to **Volkswagen Group MIB2 STD2 Technisat/Preh infotainment units** in order to:

- perform **diagnostics** and troubleshooting (connectivity checks, logs, configuration inspection),
- enable **owner-authorized maintenance and configuration actions** on a device the owner physically controls, and
- support **interoperability** between the owner's hardware (USB-Ethernet adapters) and the infotainment unit.

The app is **not** designed or marketed for malware, remote intrusion, credential theft, network scanning, or attacks against third parties. Its functionality is transparent, user-initiated, and limited to an environment that presupposes **physical access and owner authorization**.

This dossier explains the app's real functionality, its safety boundaries, and why its use case is consistent with legitimate owner maintenance, repair, and interoperability principles (including relevant U.S. DMCA exemptions and interoperability provisions), while recognizing that platform review is a policy decision and not a court determination.

---

## 2) Scope and environment

### 2.1 Target device
- In-vehicle infotainment head units: **MIB2 STD2 Technisat/Preh** (Volkswagen Group platforms).
- The app targets **infotainment / HMI functions** and related configuration/logging surfaces.
- The app is **not** intended for engine ECU tuning, emissions control manipulation, safety-critical braking/steering systems, or vehicle immobilizer programming.

### 2.2 Connectivity model (local, physical access)
- Connectivity requires a **USB-to-Ethernet adapter** plugged into the infotainment unit.
- The Android phone connects to that adapter; communication happens over a **local link / local subnet** created by the physical connection.
- The workflow presupposes **physical access** to the vehicle and the unit.

### 2.3 Intended users
- Vehicle owners / lawful possessors
- Authorized technicians acting on behalf of the owner (where applicable)
- Enthusiasts performing lawful diagnostic and configuration actions on their own equipment

---

## 3) What the app actually does (full disclosure)

The app provides a guided interface to perform owner-authorized, local actions such as:

### 3.1 Local connectivity and diagnostics
- Detects adapter presence and link status
- Performs local reachability checks (e.g., ping / connection tests)
- Collects and displays **diagnostic logs** and system state information exposed by the unit

### 3.2 Local console/session access for diagnostics and configuration
- Establishes a **local session** to the unit (e.g., via Telnet on the local link when the unit exposes such a service)
- Executes **user-initiated commands** for diagnostics, state inspection, and configuration management

> The app does not silently execute actions; users explicitly initiate each diagnostic/configuration step.

### 3.3 USB-Ethernet adapter interoperability ("identifier emulation / spoofing")
Some MIB2 units accept only certain USB-Ethernet adapters (or adapter identifiers) for local networking. To allow owners to use compatible hardware they already possess, the app supports **identifier emulation** for specific adapters in order to:

- achieve **interoperability** between owner hardware and the infotainment unit,
- avoid unnecessary e-waste and forced hardware replacement, and
- enable legitimate diagnostics and maintenance when the unit uses restrictive adapter recognition.

This is implemented as an interoperability measure limited to the owner's local device and local link.

### 3.4 FEC (Feature Enable Code) management (owner-side configuration support)
The app includes functionality related to FEC handling in the infotainment domain, intended for lawful owner maintenance scenarios such as:

- restoring functionality after unit replacement/repair,
- re-applying owner-authorized configuration states,
- validating and managing feature enablement artifacts tied to the head unit configuration.

**Important framing:** The app is not presented as a "piracy" or "paid-feature bypass" tool. It is a configuration/maintenance aid for owners dealing with real-world service and repair events. The user remains responsible for ensuring they have lawful entitlement to any enabled feature in their jurisdiction and contractual context.

---

## 4) Safety boundaries and non-goals

### 4.1 Not a general hacking tool
The app is **not** a general-purpose network scanner or exploitation toolkit. It does not provide features such as:

- scanning random IP ranges, Wi-Fi networks, or external targets,
- credential harvesting,
- exploiting remote vulnerabilities on third-party systems,
- botnet, C2, stealth persistence, or hidden background execution.

### 4.2 No remote intrusion capability by design
- The app is designed for **local link** operation with physical access.
- It does not include workflows for remote access over the public internet to third-party targets.

### 4.3 Clear user intent and transparency
- The UI is explicit about the action being performed.
- Actions are user-triggered, not "silent".
- The app's store listing and documentation describe the purpose and limits.

---

## 5) Abuse prevention measures (policy-oriented)

To minimize misuse potential and to align with Google Play safety expectations, the app is built around the following constraints and practices:

1. **Physical access presumption:** the app is intended to be used only when the user has physical control of the vehicle and the MIB2 unit.
2. **Target restriction:** the app's functions are purpose-built for MIB2 STD2 infotainment units, not generic devices.
3. **No stealth behavior:** no hidden background operations, no cloaking, no misleading UI/description.
4. **No dynamic behavior swapping:** no post-review "feature swap" via hidden payloads; behavior is consistent with what is disclosed.
5. **User-driven logs:** diagnostics/log exports occur only when the user requests them.

---

## 6) Permissions and data handling

### 6.1 Permissions principle
The app requests only the minimum permissions necessary for local connectivity diagnostics and the features described.

**Detailed permission table:**

| Permission | Required? | Purpose | User disclosure location |
|---|---:|---|---|
| `android.permission.USB_PERMISSION` | Yes | Required to detect and communicate with USB-Ethernet adapters connected via OTG cable | In-app FAQ, store listing |
| `android.hardware.usb.host` (feature) | No (optional) | Declares USB Host capability; marked as `android:required="false"` to allow installation on devices without USB Host support | AndroidManifest.xml |
| `POST_NOTIFICATIONS` | Yes | Required for Android 13+ to display connection status notifications and diagnostic alerts | In-app settings, Android system prompt |
| `INTERNET` | Implicit | Required for local TCP/IP communication with MIB2 unit over USB-Ethernet adapter (no external internet access) | Privacy policy |

**Additional technical details:**
- **USB device filter:** The app uses a generic `<usb-device />` filter to accept any USB device, allowing users to select their specific adapter from a system dialog. This is necessary because different manufacturers use different VID/PID combinations.
- **Intent filter:** Registers for `android.hardware.usb.action.USB_DEVICE_ATTACHED` to detect when a USB adapter is connected.
- **No location tracking:** The app does not request or use location permissions.
- **No camera/microphone:** Audio permission declared by expo-audio plugin is not used in production code.

### 6.2 Data collection
Default posture:
- No advertising SDK tracking
- No covert data collection
- No transmission of personal data off-device unless the user explicitly exports/shares logs

**What logs may contain:**
- Device model and Android version (for compatibility diagnostics)
- Timestamps of connection attempts
- MIB2 unit identifiers (VIN, VCRN) - only if user manually enters them for FEC generation
- USB adapter VID/PID values
- Network diagnostic output (ping times, IP addresses on local link)

**User control:**
- All logs are stored locally in app-private storage
- Users can manually export logs via "Share" button (standard Android share sheet)
- Users can clear all logs via in-app "Clear Data" button
- Logs do not contain passwords, payment information, or personal identifiable information beyond what the user explicitly enters

**Privacy Policy URL:**
https://feplazas.github.io/mib2-controller/privacy-policy.html

---

## 7) Legal rationale (high-level; not legal advice)

> This section provides context for why owner-authorized local access to embedded automotive software for diagnostics/repair/interoperability is commonly recognized as legitimate in principle. It is not legal advice, and platform policy decisions are independent.

### 7.1 DMCA §1201 – exemptions for vehicle software (U.S. context)
U.S. law includes a general prohibition on circumventing technological measures controlling access to copyrighted works, but also provides for **triennial exemptions** adopted by the Librarian of Congress and codified in regulation (37 C.F.R. § 201.40). These exemptions have historically included categories covering **diagnosis, repair, and lawful modification** of software in motorized land vehicles, with limits and conditions.

**Key point:** The existence of exemptions reflects a recognized public policy interest in allowing owners and lawful technicians to diagnose and repair embedded software-dependent products, including vehicles, under certain conditions.

**Relevant exemption (2024-2027 cycle):**
- **37 C.F.R. § 201.40(b)(8):** Computer programs that operate motorized land vehicles, for purposes of diagnosis, repair, or lawful modification of vehicle functions, where circumvention is a necessary step undertaken by the authorized owner of the vehicle or the owner's authorized agent.

### 7.2 Interoperability principles (U.S. context)
DMCA §1201(f) recognizes that certain acts of circumvention may be permissible for the purpose of identifying and analyzing elements necessary to achieve **interoperability** of an independently created program with other programs, within its statutory conditions.

In this context, adapter identifier emulation is framed as an **interoperability measure** enabling owner hardware to function with a locally controlled embedded system for diagnostic/maintenance purposes, rather than as a tool for remote intrusion.

### 7.3 Limits acknowledged
- DMCA exemptions are not blanket immunities; they do not override other applicable laws or contracts.
- Users must ensure lawful entitlement and authorized use in their jurisdiction.
- The app is limited to infotainment contexts and is not intended for emissions/safety-critical tampering.

---

## 8) Google Play policy alignment statement (plain English)

MIB2 Controller is an **owner-use** diagnostic and configuration tool operating over a **local physical connection** to a user-owned infotainment unit. It does not target third-party networks or devices, does not provide stealth malware behaviors, and is transparent about its function.

Where the app provides interoperability functionality (adapter identifier emulation) or owner configuration management (including FEC-related workflows), these are limited to the user's local device and intended for legitimate owner maintenance/repair contexts.

The app is not marketed as a hacking/circumvention product, does not include generalized scanning or exploitation features, and does not facilitate unauthorized access to third-party systems.

**Compliance with Google Play Policies:**

1. **Malicious Behavior Policy:** The app does not contain malware, spyware, or trojans. All functionality is transparent and user-initiated.

2. **Deceptive Behavior Policy:** The app accurately represents its functionality in the store listing. No misleading claims or hidden features.

3. **Device and Network Abuse Policy:** The app does not abuse network resources or interfere with other apps/devices. Communication is limited to the local USB-Ethernet link.

4. **User Data Policy:** The app collects no personal data. All diagnostic information is stored locally and under user control.

5. **Permissions Policy:** All requested permissions are necessary for core functionality and are disclosed to users.

---

## 9) Reviewer instructions (recommended for Play Console)

To help reviewers validate the legitimate local-owner workflow:

1. **Install** the app and open the Home screen.
2. Review the **Installation Guide** section to understand the physical setup requirements.
3. Navigate to **Settings** → **Help** to review the built-in FAQ explaining the app's purpose and limitations.
4. Without hardware connected:
   - Observe that the app displays "No USB Device" status
   - Navigate through all tabs (Home, USB, Tools, Actions, Config) to verify transparent UI
   - Check that no background network activity occurs (use Android Developer Options → Network activity)
5. Review the **FEC Code Generator** section:
   - Note that it links to external generator (vwcoding.ru)
   - Observe that VIN/VCRN input is optional and user-provided
   - Verify that no automatic code generation or "cracking" occurs
6. Check **Data Safety**:
   - Open Settings → App info → Permissions
   - Verify only USB and Notifications permissions are requested
   - Confirm no location, camera, contacts, or other sensitive permissions

**Key validation points:**
- ✅ All actions require explicit user interaction
- ✅ No scanning of external networks or devices
- ✅ No stealth/background execution
- ✅ Clear warnings about physical access requirement
- ✅ Transparent about adapter compatibility requirements

---

## 10) Terms of use / compliance commitments

The following terms are present in the app's Terms of Use (accessible via Settings → Help → Terms):

- **Authorized use only:** Only on vehicles/devices the user owns or is authorized to service.
- **No unlawful circumvention:** Prohibited to use the app to violate law, steal services, or bypass paid licensing entitlements without lawful authorization.
- **No safety/emissions tampering:** Prohibited to use the app to alter safety-critical systems or emissions controls.
- **Assumption of risk:** Owner acknowledges that configuration actions can alter infotainment behavior and may void warranties.
- **Jurisdictional compliance:** User responsible for local legal compliance and lawful entitlement to enabled features.
- **No warranty:** The app is provided "as is" without warranty of any kind.

---

## 11) Disclaimers

- This dossier is provided for compliance clarification and does not constitute legal advice.
- Google Play approval is a platform policy decision; this document explains why the app's intended use is legitimate owner maintenance/interoperability, but it cannot guarantee acceptance.
- Users must ensure lawful ownership/authorization and lawful entitlement to any features enabled.
- The developer is not affiliated with Volkswagen AG, Audi AG, SEAT S.A., Skoda Auto, or any of their subsidiaries.

---

## Appendix A — Permission & Data Table

| Permission | Required? | Purpose | User disclosure location | Sensitive? |
|---|---:|---|---|---:|
| `android.permission.USB_PERMISSION` | Yes | Detect and communicate with USB-Ethernet adapters via OTG | In-app FAQ, store listing | No |
| `android.hardware.usb.host` | No (optional feature) | Declares USB Host capability (not required for installation) | AndroidManifest.xml | No |
| `POST_NOTIFICATIONS` | Yes (Android 13+) | Display connection status notifications and diagnostic alerts | In-app settings, system prompt | No |
| `INTERNET` | Implicit | Local TCP/IP communication over USB-Ethernet (no external internet) | Privacy policy | No |

**Data types collected:** NONE

**Data types shared:** NONE (unless user manually exports logs via share sheet)

**Data security:**
- All data stored in app-private storage (Android sandbox)
- No cloud sync or remote transmission
- User can clear all data via in-app button
- No encryption needed (no sensitive data collected)

---

## Appendix B — Feature list (store-friendly phrasing)

- **Local infotainment diagnostics:** Connectivity checks, network status, system logs
- **Guided troubleshooting:** Step-by-step installation guide for MIB2 Toolbox setup
- **Interoperability support:** Enable compatible USB-Ethernet adapters to work with MIB2 units
- **Owner configuration management:** Manage feature enablement for infotainment functions
- **Telnet terminal:** Execute diagnostic commands on the local MIB2 unit
- **EEPROM backup/restore:** Create safety backups of USB adapter configuration
- **FEC code generator:** Link to external generator for CarPlay/Android Auto activation codes
- **Multi-language support:** English and Spanish UI
- **Exportable diagnostic reports:** User-initiated log sharing for troubleshooting

---

## Appendix C — Change log & build integrity

**Version:** 1.0.0  
**Build number (versionCode):** 6  
**Package name:** space.manus.mib2controller.t20260110134809  
**Build date:** January 21, 2026  
**Git commit hash:** d250b43b216c1c7313fd37e508c37abfe7d8aa92  
**EAS Build ID:** a11a6f86-a4f8-4e47-ac37-63abf0eae622  

**Build integrity statement:**
- No dynamic code loading used to modify core functionality post-review
- No obfuscation beyond standard ProGuard/R8 optimization for Android
- No encrypted payloads or hidden features
- All functionality is present in the submitted AAB and can be verified by decompilation
- Source code available for review upon request (private GitHub repository)

**Dependencies:**
- Expo SDK 54 (React Native 0.81.5)
- No third-party analytics or tracking SDKs
- No advertising SDKs
- No crash reporting SDKs (local logging only)

**Code signing:**
- Signed with Expo managed keystore (Build Credentials u0sZn_81IL)
- SHA-256 fingerprint available upon request
- Consistent signing across all builds

---

## Appendix D — Response to potential rejection reasons

### If rejected for "Circumvention of security measures"

**Response:** The app does not circumvent security measures on third-party systems. It operates on a locally-owned infotainment unit with physical access. The adapter identifier emulation is an interoperability measure to allow owner hardware to function with the unit, similar to how printer drivers enable third-party printers to work with computers. This is consistent with DMCA §1201(f) interoperability principles and §1201 exemptions for vehicle software diagnosis and repair.

### If rejected for "Hacking or security testing tools"

**Response:** The app is not a general-purpose hacking tool. It is a specialized diagnostic tool for a specific embedded system (MIB2 infotainment units) that the user physically owns. It does not include features for scanning external networks, exploiting vulnerabilities, or attacking third-party systems. All functionality requires physical access to the vehicle and explicit user initiation. This is analogous to OBD-II diagnostic apps, which are widely available on Google Play.

### If rejected for "Dangerous products"

**Response:** The app does not facilitate illegal activities. It is designed for lawful owner maintenance and repair of infotainment systems, which is recognized as legitimate under U.S. DMCA exemptions for vehicle software. The app includes clear warnings about authorized use only, disclaimers about warranty implications, and prohibitions on safety-critical system tampering. Users are responsible for ensuring lawful entitlement in their jurisdiction.

### If rejected for "Intellectual property infringement"

**Response:** The app does not infringe on Volkswagen Group intellectual property. It is an independent diagnostic tool that interoperates with publicly-documented network protocols (Telnet, TCP/IP). The app does not include any Volkswagen proprietary software, firmware, or copyrighted content. It is analogous to third-party diagnostic tools for other automotive systems, which are lawful under interoperability and repair principles.

---

## Appendix E — Supporting documentation

**Available upon request:**

1. **Detailed technical architecture document** explaining the USB-Ethernet communication flow
2. **Network traffic analysis** showing that no external internet communication occurs
3. **Source code review** (private GitHub repository access)
4. **Video demonstration** of the app's functionality with hardware setup
5. **Legal opinion letter** from attorney regarding DMCA exemption applicability (if needed)
6. **User testimonials** from automotive enthusiast communities (if needed)

**Public documentation:**

- Privacy Policy: https://feplazas.github.io/mib2-controller/privacy-policy.html
- GitHub Repository: https://github.com/feplazas/mib2-controller
- Installation Guide: Included in-app (Settings → Installation Guide)

---

**Document prepared by:** Felipe Plazas (Attorney-at-law)  
**Contact:** feplazas@gmail.com  
**Date:** January 21, 2026  
**Version:** 1.0 (Final)
