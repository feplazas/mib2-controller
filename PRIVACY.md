# Privacy Policy for MIB2 Controller

**Last updated:** January 20, 2026

## Introduction

MIB2 Controller ("we", "our", or "the app") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our mobile application.

## Information We Collect

### Information We DO NOT Collect

MIB2 Controller is designed with privacy in mind. We **DO NOT** collect, store, transmit, or share any of the following:

- Personal information (name, email, phone number, etc.)
- Device identifiers (IMEI, MAC address, advertising ID, etc.)
- Location data
- Usage analytics or telemetry
- Crash reports
- Any data about your vehicle or MIB2 unit
- USB device information beyond local detection
- Network traffic or connection logs

### Information Stored Locally

The app stores the following information **only on your device** and never transmits it:

- Telnet connection settings (IP address, port, credentials)
- USB adapter backup files (EEPROM dumps)
- Custom spoofing profiles
- FEC codes you enter
- App preferences (language, theme, sound settings)

All locally stored data is:
- Encrypted when sensitive (backups, credentials)
- Stored in your device's private app directory
- Never transmitted over the internet
- Deleted when you uninstall the app

## Permissions

The app requests the following Android permissions:

| Permission | Purpose | Required |
|------------|---------|----------|
| `USB_HOST` | Access USB devices for spoofing | Yes |
| `INTERNET` | Connect to MIB2 unit via Telnet | Yes |
| `WRITE_EXTERNAL_STORAGE` | Save backup files | Optional |
| `READ_EXTERNAL_STORAGE` | Load backup files | Optional |
| `POST_NOTIFICATIONS` | Show operation status notifications | Optional |

## Third-Party Services

MIB2 Controller does **NOT** use any third-party services, including:

- No analytics (Google Analytics, Firebase, etc.)
- No crash reporting (Crashlytics, Sentry, etc.)
- No advertising networks
- No social media SDKs
- No cloud storage services

## Data Security

- All sensitive data (backups, credentials) is encrypted using industry-standard AES-256 encryption
- Encryption keys are stored in Android's secure KeyStore
- No data is transmitted to external servers
- All operations are performed locally on your device

## Your Rights

Since we don't collect any personal data, there is no data to:
- Request access to
- Request deletion of
- Request portability of
- Opt out of

However, you can always:
- Clear app data from Android Settings
- Uninstall the app to remove all local data
- Manually delete backup files from your device storage

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by:
- Posting the new Privacy Policy in the app
- Updating the "Last updated" date at the top of this document

## Contact

If you have questions about this Privacy Policy, please contact us at:
- GitHub: https://github.com/[your-username]/mib2-controller/issues

## Compliance

This app complies with:
- Google Play Store policies
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- Android privacy best practices

## Children's Privacy

MIB2 Controller is not intended for use by children under the age of 13. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.

## Open Source

MIB2 Controller is open source software. You can review the source code to verify our privacy claims at:
https://github.com/[your-username]/mib2-controller

---

**Summary:** MIB2 Controller is a privacy-focused app that operates entirely offline. We collect zero personal data, use zero third-party services, and store all data locally on your device with encryption.
