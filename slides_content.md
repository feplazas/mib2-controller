# MIB2 Controller - Google Play Review Presentation

---

## Slide 1: MIB2 Controller enables legitimate automotive repair through specialized diagnostic access

**MIB2 Controller** is a professional Android application designed exclusively for authorized diagnostic, repair, and interoperability purposes on MIB2 STD2 Technisat Preh infotainment units.

**Target Users:**
- Authorized automotive technicians performing warranty/post-warranty repairs
- Vehicle owners exercising their legal right to repair their own property
- Security researchers conducting good-faith security analysis

**Key Principle:** The application operates under DMCA Section 1201 exemptions (37 C.F.R. § 201.40) for vehicle diagnosis, repair, and interoperability—identical legal framework used by professional OBD-II diagnostic tools.

**Developer:** Felipe Plazas (feplazas@gmail.com)  
**Package:** com.feplazas.mib2controller  
**Version:** 1.0.0

---

## Slide 2: Four core features address critical repair and diagnostic needs

**1. Auto-Spoof (CarPlay/Android Auto Activation)**
Restores factory CarPlay and Android Auto functionality on compatible MIB2 units through authorized configuration changes. Essential for repair shops restoring vehicle functionality after hardware replacement or software updates.

**2. FEC Code Management**
Reads and modifies Feature Enable Codes (FEC) to configure unit capabilities according to vehicle specifications. Allows technicians to match unit configuration to vehicle's original equipment or customer requirements.

**3. Telnet Diagnostic Access**
Establishes secure Telnet connections for advanced troubleshooting, log analysis, and system diagnostics. Equivalent to professional diagnostic tools used in automotive repair facilities.

**4. Backup & Restore**
Creates complete configuration backups before modifications and restores them when needed. Critical safety feature preventing permanent damage during repair procedures.

---

## Slide 3: Specialized hardware requirements limit access to legitimate users

**Required Equipment (Total Cost: $235-565 USD):**

**MIB2 STD2 Technisat Preh Unit** ($200-500)
- Firmware T480 required
- Found in VW/Audi/SEAT/Škoda vehicles (2016-2019)
- Only available to vehicle owners or automotive parts suppliers

**USB-Ethernet Adapter** ($15-30)
- ASIX AX88772/AX88178 or Realtek RTL8152 chipset
- Standard networking hardware (TP-Link UE300, UGREEN, Anker)

**USB OTG Cable with External Power** ($10-20)
- 5V external power required for stable MIB2 communication
- Prevents device battery drain during diagnostic sessions

**Android Device with USB OTG Support** (user-provided)
- Android 8.0+ required
- Standard consumer devices (Samsung, Google Pixel, OnePlus)

**Why This Matters:** The hardware barrier ensures only vehicle owners, professional technicians, or researchers with legitimate access to MIB2 units can use the application—preventing casual misuse.

---

## Slide 4: All network communication is local and transparent with zero data collection

**Network Architecture:**
- **Exclusive communication:** Android device ↔ MIB2 unit via USB Ethernet (IP: 192.168.1.1)
- **No external servers contacted** at any time
- **No cloud services** or remote APIs used
- **All processing occurs locally** on the Android device

**Protocols Used:**
- TCP/IP over USB Ethernet (standard networking)
- Telnet (port 23) for diagnostic terminal access
- HTTP (port 80) for FEC code management
- Custom diagnostic protocol (port 5555) for device information

**Data Collection: ZERO**
- No user personal information collected
- No location data accessed
- No device identifiers transmitted
- No usage analytics or crash reports sent externally
- No advertising or tracking SDKs included

**Permissions Requested:**
- `INTERNET`: Required for TCP/IP communication via USB Ethernet (local only)
- `ACCESS_NETWORK_STATE`: Detect USB Ethernet connection status
- `WRITE_EXTERNAL_STORAGE`: Save backup files locally (Android 10 and below)

**No sensitive permissions requested:** Camera, Microphone, Location, Contacts, SMS, Phone, Calendar

---

## Slide 5: Legal compliance under DMCA exemptions for vehicle repair and interoperability

**Applicable Legal Exemptions:**

**37 C.F.R. § 201.40(b)(7) - Vehicle Diagnosis and Repair**
"Computer programs that are contained in and control the functioning of a motorized land vehicle... when circumvention is a necessary step undertaken by the authorized owner of the vehicle to allow the diagnosis, repair, or lawful modification of a vehicle function."

**37 C.F.R. § 201.40(b)(8) - Interoperability**
"Computer programs, where the circumvention is undertaken on a lawfully acquired device... for the sole purpose of enabling interoperability of such computer programs with other programs."

**37 C.F.R. § 201.40(b)(12) - Security Research**
"Computer programs, where the circumvention is undertaken on a lawfully acquired device... for the sole purpose of good-faith security research."

**What the App Does NOT Do:**
- ❌ Facilitate copyright infringement or piracy
- ❌ Bypass DRM for entertainment content access
- ❌ Enable unauthorized distribution of copyrighted media
- ❌ Modify or extract entertainment content files
- ❌ Provide access to subscription services without payment

**What the App ONLY Does:**
- ✅ Modify configuration parameters for legitimate repair
- ✅ Enable diagnostic access for troubleshooting
- ✅ Restore factory functionality (CarPlay/Android Auto)
- ✅ Create backups for maintenance safety
- ✅ Read system information for diagnostic purposes

**Legal Precedent:** Identical legal framework as professional automotive diagnostic tools (OBD-II scanners, dealer diagnostic software) widely available on Google Play Store.

---

## Slide 6: Testing without hardware is possible through UI review and code analysis

**Challenge for Reviewers:**
MIB2 Controller requires specialized automotive hardware (MIB2 unit) that may not be readily available to Google Play reviewers.

**Alternative Verification Methods:**

**1. UI/UX Review (No Hardware Required)**
- Install app on any Android device
- Navigate through welcome tutorial (4 screens)
- Verify all UI elements are functional and professional
- Confirm app displays appropriate "Disconnected" status without hardware
- Verify app does not crash or freeze when hardware is unavailable
- Check that error messages are user-friendly and informative

**2. APK Analysis (Standard Android Tools)**
- **APK Analyzer (Android Studio):** Verify permissions, resources, code structure
- **jadx (Java Decompiler):** Review decompiled source code for suspicious behavior
- **Wireshark (Network Analysis):** Capture traffic to confirm no external connections
- **ADB Logcat:** Monitor app logs during operation for unexpected behavior

**3. Demo Mode APK (Available Upon Request)**
- Simulates MIB2 unit responses with realistic mock data
- Allows reviewers to navigate all app features without hardware
- Displays authentic device information and diagnostic logs
- Contact: feplazas@gmail.com

**4. Video Demonstration (Available Upon Request)**
- Complete hardware setup and connection procedure
- All app features demonstrated with real MIB2 unit
- Real-time interaction showing legitimate diagnostic use
- Private YouTube link provided to reviewers

**5. Remote Testing Assistance**
- Live video call (Google Meet/Zoom) with developer demonstrating app
- Remote access to test device with hardware connected (TeamViewer/AnyDesk)
- Custom test build with additional logging for reviewer verification
- Schedule: feplazas@gmail.com (24-48 hour response time)

**Expected Findings from APK Analysis:**
- ✅ Only essential permissions requested (no Camera, Location, Contacts, SMS)
- ✅ No obfuscated or encrypted payloads beyond standard ProGuard
- ✅ Standard network protocols (TCP/IP, Telnet, HTTP)
- ✅ No external API calls to unknown servers
- ✅ All data processing occurs locally on device
- ✅ No advertising or tracking SDKs included

---

## Slide 7: Comprehensive documentation ensures transparency and user safety

**In-App Documentation:**
- **Welcome Tutorial:** 4-screen step-by-step setup guide with hardware requirements
- **Contextual Help:** Explanatory text on each screen describing functionality
- **Error Messages:** Clear troubleshooting tips for common connection issues
- **FAQ Section:** Accessible from Settings menu with hardware compatibility info

**External Documentation:**
- **Privacy Policy:** https://feplazas.github.io/mib2-controller-privacy/
  - Clearly states zero data collection
  - Explains app purpose and legal compliance
  - Updated January 2026
- **Testing Instructions:** Comprehensive 12-section document for reviewers (this presentation's companion PDF)
- **Hardware Compatibility List:** Detailed specifications for USB adapters and MIB2 units
- **Troubleshooting Guide:** Common issues and solutions for connection problems

**User Support:**
- **Email:** feplazas@gmail.com
- **Response Time:** 24-48 hours
- **Languages:** English, Spanish
- **Support Scope:** Technical issues, feature requests, hardware compatibility questions

**Legal Disclaimers:**
- Users are responsible for compliance with local laws and regulations
- Developer assumes no liability for misuse or unauthorized modifications
- App intended exclusively for legitimate diagnostic and repair purposes
- Warnings displayed before potentially irreversible operations (FEC code changes)

---

## Slide 8: Google Play policy compliance across all critical areas

**✅ Device and Network Abuse Policy Compliance:**
- Does NOT interfere with other apps or Android system
- Does NOT display unauthorized ads or notifications
- Does NOT collect data without user consent
- Does NOT modify system settings without permission
- Does NOT execute remote code or download executable code
- DOES clearly disclose its purpose as a diagnostic tool
- DOES request only necessary permissions with clear justification
- DOES operate transparently with full user awareness

**✅ Deceptive Behavior Policy Compliance:**
- App name accurately describes functionality ("MIB2 Controller")
- Store listing provides detailed, accurate feature descriptions
- Screenshots show actual app interface (not mockups or concept designs)
- No misleading claims or false promises about capabilities
- No hidden functionality or undisclosed features
- No impersonation of other apps, brands, or official automotive software
- All features clearly explained in app documentation

**✅ Malicious Behavior Policy Compliance:**
- No malware, spyware, trojans, or malicious code
- No code obfuscation beyond standard ProGuard (industry standard)
- No unauthorized access to device resources
- No exploitation of security vulnerabilities
- All network traffic is legitimate diagnostic communication
- No command-and-control (C2) behavior
- No data exfiltration to external servers
- No unauthorized remote access capabilities

**✅ User Data Policy Compliance:**
- App does NOT collect personal information
- App does NOT collect sensitive information
- App does NOT transmit data to external servers
- Data Safety form accurately reflects "No data collected"
- Privacy Policy clearly states zero data collection
- No third-party data sharing (because no data is collected)

**Comparison to Similar Apps on Google Play:**
Professional automotive diagnostic tools with similar functionality are already available on Google Play Store (OBD-II scanners, ECU tuning apps, diagnostic readers). MIB2 Controller follows the same legal framework and technical approach as these established applications.

---

## Slide 9: Misuse prevention through hardware requirements and reversible operations

**How Hardware Requirements Prevent Misuse:**

**1. Specialized Equipment Barrier**
- MIB2 units cost $200-500 and are only available to vehicle owners or automotive parts suppliers
- Units require 12V power supply (automotive battery or bench power supply)
- USB-Ethernet adapter with specific chipsets required (not all adapters work)
- OTG cable with external power necessary for stable communication

**2. Technical Knowledge Requirement**
- Users must understand automotive networking (Ethernet over USB)
- FEC code modifications require knowledge of vehicle specifications
- Telnet access requires command-line proficiency
- Backup/restore procedures require understanding of configuration management

**3. Limited Scope of Functionality**
- App ONLY communicates with MIB2 units (IP: 192.168.1.1)
- Cannot be used for general hacking or network penetration
- Cannot access other vehicle systems (engine, brakes, airbags)
- Cannot modify entertainment content or media files

**Built-in Safety Features:**

**Automatic Backup Before Changes**
- App prompts users to create backup before any FEC code modifications
- Backups stored locally with timestamp and description
- One-tap restore functionality to revert changes

**Confirmation Dialogs for Irreversible Operations**
- Warning messages before potentially dangerous operations
- Clear explanation of consequences (e.g., "This will modify CarPlay settings")
- "Are you sure?" confirmation required

**Read-Only Mode for Beginners**
- Device information and diagnostics accessible without modification permissions
- Users can explore app functionality safely before making changes
- Telnet access defaults to read-only commands

**Audit Trail**
- All operations logged with timestamp
- Log accessible from Settings → View Logs
- Helps users track what changes were made and when

**Why This Matters:**
The combination of hardware requirements, technical knowledge barriers, and built-in safety features ensures the app is used responsibly by its intended audience (technicians, vehicle owners, researchers) rather than casual users or bad actors.

---

## Slide 10: Developer commitment to transparency and ongoing compliance

**Open Communication with Google Play:**
- Complete source code available for review upon request (GitHub repository)
- Build instructions provided for reproducible builds
- Documentation of all network communications and protocols
- Explanation of any cryptographic operations (none currently used)
- Willingness to implement additional safeguards if requested

**Responsive Support:**
- Developer email: feplazas@gmail.com
- Response time: 24-48 hours for all inquiries
- Languages: English, Spanish
- Availability for live demonstrations or remote testing sessions

**Commitment to Policy Updates:**
- Will promptly address any policy concerns raised by Google
- Will update app to comply with new Google Play policies
- Will provide additional documentation or verification as needed
- Will implement additional warnings or safety features if requested

**Post-Launch Monitoring:**
- Developer will monitor user reviews for misuse reports
- Will respond to user questions about legal compliance
- Will update documentation based on user feedback
- Will release updates to address any discovered issues

**Precedent and Context:**
Similar automotive diagnostic applications are already available on Google Play Store with millions of downloads (e.g., Torque Pro, Car Scanner ELM OBD2, OBD Auto Doctor). MIB2 Controller follows the same legal framework, technical approach, and safety standards as these established applications.

**Request for Approval:**
We respectfully request Google Play approval for MIB2 Controller based on:
- ✅ Clear legal compliance under DMCA exemptions
- ✅ Transparent functionality with zero data collection
- ✅ Hardware requirements preventing casual misuse
- ✅ Comprehensive documentation and user support
- ✅ Full compliance with all Google Play policies
- ✅ Developer commitment to ongoing transparency and cooperation

**Thank you for your thorough review. We are available to answer any questions or provide additional information.**

**Contact:** Felipe Plazas | feplazas@gmail.com | Package: com.feplazas.mib2controller
