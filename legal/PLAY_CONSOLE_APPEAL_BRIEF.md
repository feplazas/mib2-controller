# Play Console Appeal Brief
## MIB2 Controller - Compliance Summary

**App:** MIB2 Controller  
**Package:** com.feplazas.mib2controller  
**Version:** 1.0.0 (build 6)  
**Date:** January 21, 2026  

---

## What This App Does

MIB2 Controller is a **specialized diagnostic tool** for vehicle owners to perform maintenance and troubleshooting on their **Volkswagen Group MIB2 infotainment units** via a **local USB-Ethernet connection**.

**Key characteristics:**
- ✅ **Local operation only** - requires physical USB adapter plugged into the vehicle
- ✅ **Owner-use tool** - designed for lawful vehicle owners performing diagnostics
- ✅ **Transparent functionality** - all actions are user-initiated and clearly labeled
- ✅ **No data collection** - no personal data collected or transmitted
- ✅ **No remote access** - cannot be used to attack third-party systems

---

## Why It's Legitimate

### 1. Physical Access Required
The app **cannot function** without:
- Physical access to the vehicle
- A USB-Ethernet adapter physically connected to the infotainment unit
- An OTG cable connecting the Android phone to the adapter

This is **not** a remote hacking tool - it's a diagnostic interface for equipment the user physically controls.

### 2. Legal Framework (U.S. Context)
The app's functionality aligns with:

**DMCA §1201 Exemptions (37 C.F.R. § 201.40(b)(8)):**
> "Computer programs that operate motorized land vehicles, for purposes of diagnosis, repair, or lawful modification of vehicle functions, where circumvention is a necessary step undertaken by the authorized owner of the vehicle."

**DMCA §1201(f) - Interoperability:**
> Permits circumvention for the purpose of achieving interoperability of an independently created program with other programs.

### 3. Comparable Apps on Play Store
Similar diagnostic tools are already available:
- OBD-II diagnostic apps (Torque, Car Scanner, etc.)
- Router configuration apps (requiring local network access)
- Network diagnostic tools (ping, traceroute, port scanners for local networks)

MIB2 Controller is **more restrictive** than these apps because it only works with a specific embedded system (MIB2 units) via physical connection.

---

## What It Does NOT Do

❌ **Not a general hacking tool** - no features for scanning external networks or exploiting vulnerabilities  
❌ **Not malware** - no stealth behavior, no hidden features, no background execution  
❌ **Not for theft** - cannot steal services, credentials, or paid features without lawful authorization  
❌ **Not for safety systems** - limited to infotainment functions, not engine/braking/emissions  
❌ **Not for remote intrusion** - requires physical access to the vehicle  

---

## Safety Measures

1. **Target restriction:** Purpose-built for MIB2 infotainment units only
2. **Physical access:** Requires USB adapter physically connected to vehicle
3. **User-initiated:** All actions explicitly triggered by user, no silent operations
4. **Transparent UI:** Clear labels and warnings about what each function does
5. **No data collection:** No personal data collected or transmitted to external servers
6. **Clear disclaimers:** In-app warnings about authorized use only and warranty implications

---

## Permissions Justification

| Permission | Purpose | Why Necessary |
|---|---|---|
| `USB_PERMISSION` | Detect USB-Ethernet adapters | Core functionality - cannot work without USB access |
| `POST_NOTIFICATIONS` | Connection status alerts | User convenience - notify when adapter connects/disconnects |
| `INTERNET` (implicit) | Local TCP/IP over USB | Required for Telnet communication with MIB2 unit (local link only) |
| `usb.host` (feature) | USB Host capability | Declared as optional - allows installation on devices without USB Host |

**No sensitive permissions requested:**
- ❌ No location tracking
- ❌ No camera/microphone
- ❌ No contacts or calendar access
- ❌ No SMS or phone access
- ❌ No external storage access (beyond app-private storage)

---

## Data Safety Declaration

**Data collection:** NONE  
**Data sharing:** NONE (unless user manually exports logs via Android share sheet)  
**Data security:**
- All diagnostic data stored in app-private storage (Android sandbox)
- No cloud sync or remote transmission
- User can clear all data via in-app button
- No third-party analytics or tracking SDKs

**Privacy Policy:** https://feplazas.github.io/mib2-controller/privacy-policy.html

---

## Specific Features Explained

### USB Adapter Interoperability ("Spoofing")
**What it does:** Modifies USB adapter identifiers (VID/PID) to achieve compatibility with MIB2 units that only recognize specific adapters.

**Why it's legitimate:**
- Enables use of owner's existing hardware (avoids e-waste)
- Interoperability measure under DMCA §1201(f)
- Limited to local device, not third-party systems
- Analogous to printer drivers enabling third-party printers

**Safety:** Requires physical adapter connection, creates backup before modification, includes integrity verification (MD5/SHA256).

### Telnet Terminal
**What it does:** Provides a local console interface to execute diagnostic commands on the MIB2 unit.

**Why it's legitimate:**
- Telnet service is exposed by the MIB2 unit itself (not exploited)
- Commands are user-initiated and visible
- Limited to local link (192.168.1.x subnet created by USB adapter)
- Analogous to SSH clients for server administration

**Safety:** No credential harvesting, no remote access, requires physical connection.

### FEC Code Generator
**What it does:** Links to external generator (vwcoding.ru) for creating Feature Enable Codes to activate CarPlay/Android Auto.

**Why it's legitimate:**
- Does not bypass DRM or steal paid services
- Used for lawful owner configuration (e.g., after unit replacement/repair)
- User responsible for lawful entitlement in their jurisdiction
- Analogous to license key management tools

**Safety:** No automatic code generation, no "cracking", user must provide VIN/VCRN manually.

---

## Response to Potential Concerns

### "This looks like a hacking tool"
**Response:** It's a specialized diagnostic tool for a specific embedded system (MIB2 infotainment) that requires physical access. It does not include generalized hacking features like network scanning, vulnerability exploitation, or credential theft. It's analogous to OBD-II diagnostic apps, which are widely available on Play Store.

### "The 'spoofing' feature circumvents security"
**Response:** This is an interoperability measure to enable owner hardware to work with the infotainment unit, not a security bypass for third-party systems. It's limited to the local USB adapter the user physically controls. This is consistent with DMCA §1201(f) interoperability provisions and is analogous to enabling third-party peripherals to work with computers.

### "This could be used for illegal purposes"
**Response:** Any diagnostic tool can be misused, but that doesn't make the tool itself illegal. The app includes clear terms of use prohibiting unlawful circumvention, safety system tampering, and unauthorized access. Users are responsible for lawful use, just as with OBD-II tools, network diagnostic apps, or router configuration apps.

---

## Reviewer Testing Instructions

To verify the app's legitimate functionality:

1. **Install the app** and navigate through all screens
2. **Check Settings → Help** to review the FAQ and terms of use
3. **Observe the Home screen** - note that it displays "No USB Device" without hardware
4. **Review the Installation Guide** - note the physical setup requirements
5. **Check Android permissions** - verify only USB and Notifications are requested
6. **Monitor network activity** (Android Developer Options) - verify no external internet communication

**Without hardware, the app cannot perform any diagnostic actions** - this demonstrates that physical access is required.

---

## Supporting Documentation

**Full compliance dossier:** Available in app repository at `legal/GOOGLE_PLAY_COMPLIANCE_DOSSIER.md`

**Privacy Policy:** https://feplazas.github.io/mib2-controller/privacy-policy.html

**Source code:** Private GitHub repository - access available upon request for review

**Build integrity:**
- EAS Build ID: a11a6f86-a4f8-4e47-ac37-63abf0eae622
- Git commit: d250b43b216c1c7313fd37e508c37abfe7d8aa92
- No dynamic code loading or hidden features

---

## Conclusion

MIB2 Controller is a legitimate owner-use diagnostic tool that operates locally on user-owned equipment with physical access. It does not facilitate unauthorized access to third-party systems, does not include malware or stealth behaviors, and is transparent about its functionality.

The app's use case is consistent with recognized legal principles for vehicle software diagnosis and repair (DMCA exemptions) and interoperability (DMCA §1201(f)). It is comparable to other diagnostic tools already available on Google Play, but more restrictive in scope.

We respectfully request review of this appeal and approval for publication on Google Play Store.

---

**Contact:** feplazas@gmail.com  
**Date:** January 21, 2026  
**Document version:** 1.0
