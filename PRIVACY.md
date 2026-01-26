# Privacy Policy - MIB2 USB Controller

**Last Updated:** January 26, 2026  
**Version:** 3.1  
**Developer:** Felipe Plazas  
**Contact:** feplazas@gmail.com  
**Website:** https://github.com/feplazas/mib2-controller

---

## 1. Introduction

**MIB2 USB Controller** (hereinafter, "the Application") is a specialized technical tool designed to enable communication, diagnostics, and modification of MIB2 Standard 2 infotainment units from Volkswagen Group through USB-Ethernet and Telnet connections. This privacy policy comprehensively describes how the Application handles, processes, and protects user information.

This policy applies to all versions of MIB2 USB Controller distributed through Google Play Store. By installing and using the Application, the user accepts the terms established in this privacy policy.

**Fundamental Commitment:** MIB2 USB Controller is designed under the principle of **privacy by design**. The Application **DOES NOT collect, store, or transmit personally identifiable user data to external servers**. All functionality operates exclusively on the user's device and local network.

---

## 2. Information We DO NOT Collect

To ensure maximum transparency, we clarify what types of information the Application **DOES NOT collect, process, or transmit**:

| Type of Information | Status |
|---------------------|--------|
| Personal identification data (name, ID, etc.) | ❌ NOT collected |
| Contact information (email, phone, address) | ❌ NOT collected |
| Location data (GPS, approximate location) | ❌ NOT collected |
| Contacts and phone book | ❌ NOT accessed |
| Personal multimedia files (photos, videos) | ❌ NOT accessed |
| Financial information (cards, bank accounts) | ❌ NOT collected |
| Authentication credentials (passwords, tokens) | ❌ NOT stored externally |
| Device identifiers (IMEI, Android ID) | ❌ NOT collected |
| Vehicle information (VIN, license plate) | ❌ NOT transmitted externally |
| Web browsing history | ❌ NOT collected |
| List of installed applications | ❌ NOT collected |
| Biometric data | ❌ NOT collected |

**Third-party services NOT used:** The Application does not integrate any analytics services (Google Analytics, Firebase Analytics), advertising (AdMob), behavior tracking, or social networks. There are no third-party SDKs that could collect data in the background.

---

## 3. Data Processed Locally

The Application stores exclusively technical configuration data in the private storage of the user's Android device. This data **never leaves the device**.

### 3.1 Connection Configuration

To enable quick reconnection to previously used MIB2 units, the Application stores locally:

- MIB2 unit IP address (example: 192.168.1.100)
- Telnet port (default 23)
- Recent connection history (last 10 IP addresses)
- Timestamp of last successful connection

**Purpose:** Facilitate reconnection without requiring the user to manually re-enter the IP address in each session.

**Location:** App private storage (`/data/data/[bundle_id]/shared_prefs/`)

### 3.2 USB Hardware Information

When a USB-Ethernet adapter is connected, the Application detects and stores locally:

- Vendor ID (VID) and Product ID (PID) of the USB adapter
- Detected EEPROM type (modifiable EEPROM vs non-modifiable eFuse)
- IP address and subnet mask of the adapter
- Compatibility verification result

**Purpose:** Prevent spoofing operations on adapters with eFuse that could result in permanent hardware damage (bricking).

**Location:** App private storage

### 3.3 Security Backups

Before performing critical EEPROM modification operations, the Application creates local backups:

- Original EEPROM content of the USB adapter
- MD5 and SHA256 checksums for integrity verification
- Backup metadata (date, time, device information)
- Log of operations performed

**Purpose:** Allow restoration of the adapter to its original state in case of problems.

**Location:** App private storage (`/data/data/[bundle_id]/files/backups/`)

**Encryption:** All backups are automatically encrypted with AES-256 using keys stored in hardware-backed secure storage (Android Keystore) on compatible devices.

**Retention:** Backups are kept indefinitely until the user manually deletes them or uninstalls the Application.

### 3.4 User Preferences

The Application stores interface preferences locally:

- Visual theme (light, dark)
- Selected language (Spanish, English, German)
- Security confirmation status
- Expert mode PIN (stored encrypted in Secure Storage)

**Purpose:** Improve user experience by maintaining consistency between sessions.

### 3.5 Diagnostic Logs

To facilitate troubleshooting, the Application maintains temporary technical logs:

- Telnet connection logs (last 100 lines)
- USB operation logs
- Error logs for debugging

**Retention:** Logs are automatically rotated, keeping only the last 7 days of activity. The user can delete them manually at any time from the Diagnostics screen.

**Important:** Logs are NOT automatically transmitted. If the user wishes to share them for technical support, they must export them manually.

---

## 4. Required Android Permissions

The Application requests the following Android system permissions with specific technical justification:

### 4.1 USB Host (`android.hardware.usb.host`)

**Type:** Required feature (device must support USB OTG)

**Justification:** Direct communication with USB-Ethernet adapters for:

- Automatic detection of ASIX adapters (AX88772/A/B)
- EEPROM reading and writing via USB control transfers
- Memory type verification (EEPROM vs eFuse)
- Creation of encrypted backups before modifications

**Scope:** Only specific USB-Ethernet adapters are accessed. Other connected USB devices (keyboards, mice, external storage) are NOT accessed.

### 4.2 Internet (`android.permission.INTERNET`)

**Type:** Normal permission (automatically granted)

**Justification:** Telnet communication with MIB2 units through local network:

- Establish TCP connections on port 23 with MIB2 units
- Send shell commands for diagnostics and configuration
- File transfer between device and MIB2 unit

**Scope:** Connections are limited exclusively to devices on the user's local network (range 192.168.x.x, 10.x.x.x, 172.16-31.x.x). NO connections are made to external servers.

**Important:** Despite the permission name, the Application DOES NOT access the Internet. It only communicates with devices on the user's local network through the USB-Ethernet adapter.

### 4.3 Network State (`android.permission.ACCESS_NETWORK_STATE`)

**Type:** Normal permission (automatically granted)

**Justification:** Automatic detection of network configuration:

- Detect IP address and subnet mask of the USB-Ethernet adapter
- Calculate scan range to detect MIB2 units
- Validate connectivity before critical operations

**Scope:** Only local network information is queried. User's mobile network, WiFi information, or network-based location are NOT accessed.

---

## 5. Data Security

The Application implements the following security measures:

### 5.1 Local Encryption

- **EEPROM Backups:** Encrypted with AES-256-GCM
- **Expert Mode PIN:** Stored in Android Keystore (hardware-backed on compatible devices)
- **Sensitive Preferences:** Encrypted using EncryptedSharedPreferences

### 5.2 Secure Communication

- **Telnet:** Communication occurs exclusively on private local network (192.168.x.x)
- **USB:** Direct communication without intermediaries
- **No External Servers:** No data is transmitted outside the local network

### 5.3 Access Protection

- **Expert Mode:** Critical operations require PIN authentication
- **Confirmation Dialogs:** Destructive operations require explicit confirmation
- **eFuse Protection:** Automatic detection prevents operations on non-modifiable adapters

---

## 6. User Rights

Users have the following rights regarding their data:

### 6.1 Access

Users can view all stored data through the Application interface:
- Connection settings in Settings
- Backups in EEPROM Backups section
- Logs in Diagnostics section

### 6.2 Deletion

Users can delete their data at any time:
- **Individual Backups:** Delete from EEPROM Backups section
- **All Data:** Uninstall the Application (automatically deletes all private storage)
- **Logs:** Clear from Diagnostics section

### 6.3 Portability

Users can export their data:
- **Backups:** Export to device external storage
- **Logs:** Export for technical support

### 6.4 Rectification

Users can modify their preferences at any time through the Settings section.

---

## 7. Children's Privacy

MIB2 USB Controller is NOT designed for use by children under 13 years of age. The Application:

- Does not collect personal information from any user
- Does not contain advertising or in-app purchases
- Does not include social features or user-generated content
- Is designed exclusively for adult vehicle owners

---

## 8. Policy Changes

We reserve the right to update this privacy policy. Changes will be notified through:

- Update of the "Last Updated" date at the beginning of this document
- Notification within the Application (for significant changes)
- Publication in the GitHub repository

We recommend periodically reviewing this policy.

---

## 9. Contact

For questions, concerns, or requests related to this privacy policy:

- **Email:** feplazas@gmail.com
- **GitHub Issues:** https://github.com/feplazas/mib2-controller/issues

---

# Legal Analysis: Legality of MIB2 USB Controller

## 10. Executive Summary

MIB2 USB Controller is a **legal diagnostic and configuration tool** that operates within established legal frameworks. This section provides comprehensive legal analysis demonstrating the application's compliance with applicable laws and regulations.

---

## 11. Legal Framework Analysis

### 11.1 Property Rights - Right to Repair

**Legal Principle:** Vehicle owners have the legal right to modify, repair, and configure equipment they own.

**Applicable Precedents:**

| Jurisdiction | Legal Framework | Application |
|--------------|-----------------|-------------|
| United States | Magnuson-Moss Warranty Act (15 U.S.C. §§ 2301-2312) | Manufacturers cannot void warranties solely due to aftermarket modifications unless the modification caused the defect |
| United States | DMCA Section 1201 Exemptions (2021) | Explicitly permits circumvention for vehicle repair and modification by owner |
| European Union | Directive 1999/44/EC (Consumer Sales) | Consumer rights to repair and modify purchased goods |
| European Union | Right to Repair Regulations (2021/341) | Mandates access to repair information and tools |
| Germany | BGB §§ 433-453 (Sales Law) | Buyer acquires full ownership rights including modification |

**Application to MIB2 USB Controller:**

The Application enables vehicle owners to configure their own MIB2 infotainment units. This falls squarely within the owner's property rights:

1. **Ownership Transfer:** When a vehicle is purchased, the buyer acquires full ownership of all components, including the infotainment unit.

2. **Configuration vs. Circumvention:** The Application performs configuration changes (enabling features, adjusting parameters) rather than circumventing access controls. The Telnet interface is an intentional diagnostic port provided by the manufacturer.

3. **No DRM Circumvention:** MIB2 units do not employ Digital Rights Management (DRM) systems. The Application does not bypass copy protection or access controls protecting copyrighted content.

### 11.2 Computer Fraud and Unauthorized Access Laws

**Relevant Statutes:**

| Jurisdiction | Statute | Key Provision |
|--------------|---------|---------------|
| United States | Computer Fraud and Abuse Act (18 U.S.C. § 1030) | Prohibits unauthorized access to protected computers |
| European Union | Directive 2013/40/EU | Criminalizes illegal access to information systems |
| Germany | StGB § 202a (Data Espionage) | Prohibits unauthorized access to specially protected data |

**Why MIB2 USB Controller Does NOT Violate These Laws:**

1. **Authorization Through Ownership:**
   - The vehicle owner has implicit authorization to access their own property
   - The MIB2 unit is not a "protected computer" under CFAA (not used in interstate commerce as a computer)
   - Access is performed through legitimate diagnostic interfaces (Telnet on port 23)

2. **No "Hacking" or Exploitation:**
   - The Application uses documented protocols (Telnet, USB)
   - No vulnerabilities are exploited
   - No security measures are bypassed
   - The diagnostic interface is intentionally provided by the manufacturer

3. **Local Network Only:**
   - All communication occurs on the user's private local network
   - No remote access to third-party systems
   - No data exfiltration or transmission to external servers

### 11.3 Telecommunications and Radio Regulations

**Relevant Frameworks:**

| Jurisdiction | Regulation | Scope |
|--------------|------------|-------|
| United States | FCC Part 15 | Unintentional radiators and computing devices |
| European Union | RED Directive 2014/53/EU | Radio equipment compliance |
| Germany | FTEG (Funkanlagengesetz) | Radio equipment law |

**Compliance Analysis:**

1. **No Radio Transmission Modification:**
   - MIB2 USB Controller does not modify radio transmission parameters
   - WiFi, Bluetooth, and cellular configurations are not altered
   - The Application operates on wired connections only (USB, Ethernet)

2. **USB-Ethernet Adapters:**
   - The Application modifies VID/PID identifiers for compatibility purposes
   - This does not affect radio emissions or electromagnetic compatibility
   - Adapters remain compliant with their original certifications

### 11.4 Automotive Safety Regulations

**Relevant Standards:**

| Jurisdiction | Regulation | Scope |
|--------------|------------|-------|
| United States | FMVSS (49 CFR Part 571) | Federal Motor Vehicle Safety Standards |
| European Union | UNECE Regulations | Vehicle safety and emissions |
| Germany | StVZO | Road Traffic Licensing Regulations |

**Safety Compliance:**

1. **No Safety-Critical Modifications:**
   - MIB2 USB Controller does not modify:
     - Braking systems
     - Steering systems
     - Airbag systems
     - Engine control units (ECU)
     - Emissions control systems

2. **Infotainment Isolation:**
   - MIB2 Standard 2 units are isolated from safety-critical vehicle systems
   - The CAN gateway prevents unauthorized access to critical vehicle networks
   - Modifications are limited to entertainment and convenience features

3. **Feature Enablement:**
   - The Application enables features that are:
     - Already present in the hardware
     - Disabled only for market segmentation purposes
     - Not related to vehicle safety or emissions

### 11.5 Intellectual Property Considerations

**Analysis:**

| IP Type | Applicability | Conclusion |
|---------|---------------|------------|
| Copyright | Software code | Application does not copy or distribute VW software |
| Patents | Technical methods | Application uses standard protocols (Telnet, USB) |
| Trade Secrets | Proprietary information | Application uses publicly documented interfaces |
| Trademarks | Brand names | Application does not infringe VW trademarks |

**Detailed Analysis:**

1. **No Software Copying:**
   - The Application does not extract, copy, or distribute Volkswagen software
   - Configuration changes are made to user-owned hardware
   - No firmware is downloaded, modified, or redistributed

2. **Standard Protocols:**
   - Telnet (RFC 854) is an open standard protocol
   - USB communication uses standard control transfers
   - No proprietary protocols are reverse-engineered

3. **Public Information:**
   - MIB2 diagnostic interfaces are documented in service manuals
   - FEC (Feature Enable Code) system is publicly known
   - Community knowledge is based on legitimate research

---

## 12. Comparative Legal Analysis

### 12.1 Similar Legal Products

The following table compares MIB2 USB Controller with similar legal products:

| Product | Function | Legal Status | Similarity |
|---------|----------|--------------|------------|
| OBD-II Scanners | Vehicle diagnostics | Legal worldwide | Uses standard diagnostic ports |
| VCDS/VAG-COM | VW/Audi diagnostics | Legal, widely used | Enables features, reads codes |
| Carly | BMW coding | Legal, on Play Store | Feature activation |
| BimmerCode | BMW coding | Legal, on Play Store | Feature activation |
| OBDeleven | VW/Audi coding | Legal, on Play Store | Feature activation |

**Key Observation:** Numerous applications performing similar functions are legally available on Google Play Store and Apple App Store. MIB2 USB Controller operates on the same legal principles.

### 12.2 Regulatory Acceptance

| Jurisdiction | Regulatory Position |
|--------------|---------------------|
| United States | FTC supports right to repair; DMCA exemptions granted |
| European Union | Right to Repair legislation actively promoted |
| Germany | Consumer rights to modify owned goods protected |
| Australia | Consumer guarantees include repair rights |

---

## 13. Disclaimer and Limitation of Liability

### 13.1 User Responsibility

Users of MIB2 USB Controller acknowledge and accept that:

1. **Ownership Requirement:** The Application should only be used on vehicles and equipment owned by the user or with explicit authorization from the owner.

2. **Warranty Considerations:** While modifications generally do not void warranties (Magnuson-Moss Act), users should understand their specific warranty terms.

3. **Technical Risk:** Incorrect use of the Application may result in:
   - Temporary malfunction of the infotainment unit
   - Need for dealer reset in rare cases
   - Potential adapter damage if eFuse warnings are ignored

4. **Legal Compliance:** Users are responsible for ensuring their use complies with local laws and regulations.

### 13.2 Developer Disclaimer

The developer (Felipe Plazas):

1. **Provides the Application "as is"** without warranties of any kind
2. **Is not responsible** for misuse of the Application
3. **Does not guarantee** compatibility with all MIB2 units or adapters
4. **Recommends** creating backups before any modifications
5. **Advises** users to consult local regulations if uncertain

---

## 14. Conclusion

MIB2 USB Controller is a **legal diagnostic and configuration tool** that:

✅ Respects user privacy (no data collection)  
✅ Operates within property rights frameworks  
✅ Does not circumvent DRM or copy protection  
✅ Does not modify safety-critical systems  
✅ Uses standard, documented protocols  
✅ Is comparable to other legal automotive tools  
✅ Complies with applicable laws and regulations  

The Application empowers vehicle owners to exercise their legitimate rights to configure and customize their own property.

---

## 15. References

1. Magnuson-Moss Warranty Act, 15 U.S.C. §§ 2301-2312
2. Digital Millennium Copyright Act, 17 U.S.C. § 1201
3. Computer Fraud and Abuse Act, 18 U.S.C. § 1030
4. EU Directive 1999/44/EC on Consumer Sales
5. EU Directive 2013/40/EU on Attacks Against Information Systems
6. German Civil Code (BGB) §§ 433-453
7. German Criminal Code (StGB) § 202a
8. FCC Part 15 Rules
9. EU Radio Equipment Directive 2014/53/EU
10. UNECE Vehicle Regulations
11. Library of Congress DMCA Exemptions (2021)

---

**Document Version:** 3.1  
**Effective Date:** January 26, 2026  
**Author:** Felipe Plazas  
**Contact:** feplazas@gmail.com
