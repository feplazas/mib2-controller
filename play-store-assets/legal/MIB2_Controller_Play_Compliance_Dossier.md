# Google Play Compliance & Legal Position Dossier (Owner-Authorized Vehicle Infotainment Tool)

**App name:** MIB2 Controller (Android)

**Target hardware:** Volkswagen Group MIB2 STD2 infotainment units (Technisat / Preh variants)

**Prepared by:** Felipe Plazas (Attorney-at-Law)

**Date:** 16 January 2026

---

## 1) Executive summary

MIB2 Controller is an Android application intended for **lawful, owner-authorized, local** access to a **user-owned** vehicle infotainment unit (MIB2 STD2) for diagnostic, maintenance, and configuration tasks. The app requires **physical access** to the vehicle environment and a direct connection path (e.g., USB-to-Ethernet adapter and local networking) and is not designed for remote intrusion, mass scanning, or targeting third-party devices.

This dossier explains:

- What the app does (and does not do), in plain language
- The owner-authorization model and physical-access requirement
- Safety and transparency controls intended to reduce misuse
- The legal rationale commonly used to support owner access and interoperability in embedded vehicle software contexts
- How reviewers can test the app in a controlled manner

**Important note:** This document is a compliance clarification and legal position statement. It does not claim guaranteed acceptance by Google Play, and it does not constitute legal advice for third parties.

---

## 2) Product scope and intended users

### 2.1 Intended users

- Vehicle owners (or persons with explicit authorization from the owner) who seek to diagnose, maintain, or configure their own MIB2 STD2 infotainment unit.
- Repair professionals acting with the owner’s authorization, in owner-controlled conditions.

### 2.2 Intended scope

- The app is focused on **infotainment** (MIB2 STD2). It is not marketed as an ECU tuning tool and is not designed to modify engine control, emissions control, or safety-critical systems.
- The app is used locally and requires physical presence and owner control of the target device.

---

## 3) What the app does (truthful and specific)

MIB2 Controller provides an owner with a guided workflow to:

1. **Establish local connectivity** to a MIB2 STD2 unit via a direct connection path (commonly USB-to-Ethernet adapters and local network configuration).
2. **Access local services on the infotainment unit** (including interactive console access such as Telnet where present on the unit/firmware) to run commands initiated by the user.
3. **Adapter identifier emulation (“spoofing”) for interoperability** with certain USB-to-Ethernet adapter chipsets, to enable connectivity in cases where the infotainment unit only recognizes a subset of adapters.
4. **Owner-managed feature enablement workflows** (including handling of FEC-style feature codes/tokens) to configure infotainment capabilities on hardware that already contains the relevant software features but has restricted activation paths.
5. **Troubleshooting utilities** such as log access, system status checks, and guided repair/maintenance steps.

All actions are initiated by the user through the UI, and the app is designed to be transparent about what it is doing.

### 3.1 Built-in interface and legitimate access path

- The app relies on interfaces and services that are **present on the infotainment unit** (for example, local network services such as Telnet where enabled/available on that unit/firmware), rather than exploiting unrelated third-party systems.
- The app does not claim to be an OEM tool and is not marketed as a universal exploit kit. It is a targeted owner-use workflow for a specific infotainment platform.

### 3.2 Safety-critical exclusions

- The app is not intended to modify engine control, emissions control, braking, steering, airbag logic, or other safety-critical subsystems.
- The app’s scope is infotainment configuration and diagnostics in an owner-controlled context.

---

## 4) What the app does NOT do

To avoid misunderstanding, the app is **not** designed to:

- Perform remote exploitation, scanning, or intrusion across the internet
- Target third-party devices without authorization
- Hide behavior (no cloaking, no stealth actions that differ from disclosed functionality)
- Install malware, spyware, or remote-control payloads
- Collect credentials, payment information, or unrelated sensitive personal data
- Execute background “silent” actions without user initiation

---

## 5) Owner authorization and physical access model

### 5.1 Owner authorization principle

The app is intended to be used only when the user:

- Owns the vehicle / infotainment unit, or
- Has explicit authorization from the owner (e.g., repair or maintenance context)

### 5.2 Physical access requirement

- The app is designed for a scenario in which the user is physically present with the vehicle/infotainment unit and uses a direct, local connection path.
- The app does not provide a general-purpose remote access platform for devices the user does not control.

### 5.3 User-visible warnings and consent

The app is expected to present:

- Clear warnings that the target device must be user-owned or used with owner permission
- Warnings that misuse (e.g., unauthorized access, stolen devices) is prohibited
- Confirmation dialogs before executing potentially impactful operations

---

## 6) Interoperability rationale for adapter identifier emulation ("spoofing")

Certain embedded systems restrict connectivity to known peripherals or identifiers. In an owner-use setting, adapter identifier emulation is described as an **interoperability and compatibility** measure that enables local access between the user's Android device and the user's own infotainment unit.

### 6.1 Owner property and compatibility rationale

When a consumer lawfully owns a vehicle and its infotainment unit, the owner has a legitimate interest in maintaining, repairing, and configuring that property. Adapter identifier emulation is presented here as a compatibility technique that helps the owner use reasonable, readily available hardware to access their own device locally, especially when the original or vendor-preferred adapters are scarce, discontinued, or impractical.

### 6.2 Safety and misuse boundaries

- The capability is limited to the app's local owner workflow (physical access, direct connection path).
- It is not positioned as a technique to evade network security, attack remote targets, or access third-party systems.
- The app is not a generic scanning or exploitation toolkit.

### 6.3 Practical objectives

- Enable a standard connectivity path on owner-owned hardware
- Reduce dependence on scarce/discontinued adapters
- Allow diagnostic and maintenance access in a controlled, local environment

---

## 7) Feature enablement (FEC-style workflows) - compliance framing

The app includes workflows related to feature enablement codes/tokens for infotainment capabilities. This is framed as:

- Owner-managed configuration of infotainment features on owner-owned hardware
- A local device workflow; the app does not act as a subscription service client or a general-purpose piracy utility
- Not intended to distribute copyrighted media, maps, or paid subscription services

The app’s terms of use prohibit using the app to violate third-party rights, licensing terms, or applicable laws.

---

## 8) Privacy, data handling, and permissions

### 8.1 Data handling

- The app is intended to operate locally.
- If diagnostic logs are exported or shared, this is user-initiated.
- The app should not transmit diagnostic data off-device by default unless the user explicitly chooses to share it (e.g., to support).

### 8.2 Minimization

- The app requests only the permissions necessary for its connectivity and troubleshooting features.
- The app does not collect unrelated personal information for advertising or tracking.

(For Play review, provide a separate attachment listing each Android permission and its justification.)

---

## 9) Google Play policy alignment (how reviewers should interpret the app)

### 9.1 Device and network abuse / potentially harmful behavior

The app is intended for **owner-authorized** use on a **user-owned** embedded device (infotainment unit) and is not intended for unauthorized intrusion or generalized hacking.

Key limiting factors:

- **Owner authorization model** (owner/authorized repair use)
- **Physical access requirement** and local connection path
- **No mass scanning or remote exploitation features**
- **No cloaking or deceptive behavior**
- **User-initiated actions** with warnings and confirmations

### 9.2 Transparency and user control

- The app’s UI is designed to clearly disclose actions.
- The app avoids background stealth behavior.

---

## 10) Legal framework overview (U.S. context) - owner access and interoperability

This section is provided to explain why similar owner access tools are commonly defended in U.S. law discussions. It is not a claim that any particular use case is immune from all legal risk.

### 10.1 DMCA Section 1201 and triennial exemptions

U.S. law (17 U.S.C. 1201) contains prohibitions related to circumvention of technological protection measures, but the Librarian of Congress issues exemptions on a triennial basis. Current exemptions are codified in 37 C.F.R. 201.40.

A key policy theme in vehicle-related exemptions is permitting circumvention when necessary for **diagnosis, repair, or lawful modification** by owners (subject to conditions and limitations).

### 10.2 Interoperability principle

17 U.S.C. 1201(f) addresses circumvention for the purpose of achieving interoperability of independently created computer programs with other programs, under specific conditions.

In an owner-use scenario, interoperability is a core rationale for:

- Enabling a standard communication path between the user’s device and the infotainment unit
- Supporting maintenance and diagnostic access when vendor tooling is unavailable or impractical

### 10.3 Limitations

- Exemptions do not automatically override other laws, contractual terms, or platform policies.
- The app’s intended scope is infotainment and owner-authorized use.

### 10.4 Distribution and misuse considerations

Software distribution can raise additional legal questions beyond an end user's lawful act of access, and different jurisdictions treat those questions differently. The developer's position is that MIB2 Controller is a targeted owner-use diagnostic/configuration tool with substantial legitimate uses in maintenance and interoperability, and it is distributed with clear restrictions against unauthorized access, theft, fraud, and infringement.

This dossier is not a legal opinion letter for any specific jurisdiction; it is a compliance clarification intended to help reviewers understand the app's intended purpose, boundaries, and safeguards.

---

## 11) Responsible use statement (for store listing and in-app)

Users must agree that they will:

- Use the app only on devices/vehicles they own or have explicit authorization to service
- Not use the app to access third-party devices without authorization
- Not use the app for theft, fraud, or circumvention of subscription services
- Not use the app to modify safety-critical or emissions-related systems

The developer reserves the right to suspend service/support and report misuse where required by law.

---

## 12) Reviewer testing instructions (for Play Console)

To evaluate the app safely and accurately, reviewers can:

1. Install the app from the testing track.
2. Open the app and review the onboarding disclosures and warnings.
3. Use any built-in **demo mode** (if provided) to view the UI, log workflows, and warnings without connecting to real hardware.
4. If hardware testing is performed:
   - Ensure physical access to a MIB2 STD2 unit in a controlled environment.
   - Connect via the supported local connection method.
   - Verify the app performs only user-initiated local actions and does not scan or target external networks.
5. If additional evidence is needed, the developer can provide:
   - A short video demonstration of the physical-connection requirement and local-only scope
   - A permission-by-permission justification sheet
   - Terms of Use / EULA copy

---

## 13) Contact and escalation

For compliance questions, reviewer clarification, or additional evidence requests:

- **Support email:** (add your support address)
- **Website/privacy page:** (add your URL)

---

## 14) Disclaimer

This document is provided for compliance clarification purposes and expresses the developer’s legal position and product scope. It does not guarantee approval by Google Play and does not constitute legal advice to third parties.

---

## Appendix A) Short statement to paste into Play Console (English)

> **Compliance clarification:** MIB2 Controller is a local, owner-authorized diagnostic and configuration tool for Volkswagen Group MIB2 STD2 infotainment units (Technisat/Preh). It requires physical access to the vehicle environment and a direct local connection path (e.g., USB-to-Ethernet adapter). The app is not intended for remote intrusion, mass scanning, or targeting third-party devices or networks. Actions are user-initiated and transparent in the UI. Adapter identifier emulation is implemented as a compatibility/interoperability measure for connecting the user's phone to the user's own infotainment hardware in a controlled local setting. Feature-enable workflows (FEC-style tokens) are presented as owner-managed configuration of infotainment capabilities on owner-owned hardware; the app is not a subscription circumvention or piracy utility, and the Terms of Use prohibit unauthorized access, theft, fraud, and infringement.

