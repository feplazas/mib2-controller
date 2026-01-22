# Google Play Console Publication Guide
## MIB2 Controller - Complete Step-by-Step Instructions

**Document version:** 1.0  
**Date:** January 21, 2026  
**Estimated time:** 60-90 minutes  
**Prerequisites:** Google Play Console account approved ($25 USD one-time fee paid)

---

## Table of Contents

1. [Create New Application](#step-1-create-new-application)
2. [Upload AAB to Internal Testing](#step-2-upload-aab-to-internal-testing)
3. [Configure Store Listing](#step-3-configure-store-listing)
4. [Configure Data Safety](#step-4-configure-data-safety)
5. [Complete Content Rating](#step-5-complete-content-rating)
6. [Set Up Pricing & Distribution](#step-6-set-up-pricing--distribution)
7. [Review and Publish](#step-7-review-and-publish)

---

## STEP 1: Create New Application

### 1.1 Access Play Console
1. Go to https://play.google.com/console
2. Sign in with your Google account
3. Click **"Create app"** button (top right)

### 1.2 Fill Basic Information

**App details:**
- **App name:** `MIB2 Controller`
- **Default language:** `English (United States) – en-US`
- **App or game:** Select `App`
- **Free or paid:** Select `Free`

**Declarations (checkboxes):**
- ✅ I confirm this app complies with Google Play's Developer Program Policies
- ✅ I confirm this app complies with US export laws

Click **"Create app"**

### 1.3 Initial Setup Tasks

You'll see a dashboard with several tasks. We'll complete them in this order:

1. ✅ Set up your app (already done)
2. 🔲 App access
3. 🔲 Ads
4. 🔲 Content rating
5. 🔲 Target audience
6. 🔲 News apps
7. 🔲 Data safety
8. 🔲 Government apps
9. 🔲 Store listing
10. 🔲 Main store listing

---

## STEP 2: Upload AAB to Internal Testing

**Why start with Internal Testing:** This allows you to verify the AAB works before submitting for production review.

### 2.1 Navigate to Testing Section
1. In left sidebar: **Testing** → **Internal testing**
2. Click **"Create new release"**

### 2.2 Upload AAB
1. Under "App bundles", click **"Upload"**
2. Select the AAB file downloaded from EAS Build:
   - **File name:** `build-a11a6f86-a4f8-4e47-ac37-63abf0eae622.aab`
   - **Version code:** 6 (automatically detected)
   - **Version name:** 1.0.0 (automatically detected)

**Wait for upload to complete** (may take 2-5 minutes)

### 2.3 Release Notes
Under "Release notes", add:

**Language:** English (United States) – en-US

**Release notes:**
```
Initial release of MIB2 Controller

Features:
• Local MIB2 infotainment diagnostics via USB-Ethernet
• Telnet terminal for diagnostic commands
• USB adapter interoperability support (VID/PID spoofing)
• EEPROM backup and restore
• FEC code generator integration
• Complete MIB2 Toolbox installation guide
• Multi-language support (English, Spanish)

Requirements:
• USB-Ethernet adapter (ASIX AX88772A/B or D-Link DUB-E100)
• OTG cable
• MIB2 STD2 Technisat/Preh infotainment unit
```

### 2.4 Review and Save
1. Click **"Review release"**
2. Review the summary
3. Click **"Start rollout to Internal testing"**

**Note:** Internal testing doesn't require full review. You can add testers via email to test the app before production submission.

---

## STEP 3: Configure Store Listing

### 3.1 Navigate to Store Listing
1. In left sidebar: **Grow** → **Store presence** → **Main store listing**

### 3.2 App Details

**App name:**
```
MIB2 Controller
```

**Short description** (80 characters max):
```
Diagnostic tool for VW/Audi MIB2 infotainment via USB-Ethernet connection
```

**Full description** (4000 characters max):
```
MIB2 Controller is a specialized diagnostic and configuration tool for Volkswagen Group MIB2 STD2 Technisat/Preh infotainment units. Designed for vehicle owners and authorized technicians, this app enables local diagnostics, troubleshooting, and maintenance via a physical USB-Ethernet connection.

KEY FEATURES

🔌 Local Connectivity Diagnostics
• Detect USB-Ethernet adapter presence and link status
• Perform network reachability checks (ping, connection tests)
• Real-time connection monitoring with status notifications

🖥️ Telnet Terminal
• Execute diagnostic commands on the MIB2 unit
• Access system logs and configuration files
• Troubleshoot connectivity and software issues
• Command history and quick command shortcuts

🔧 USB Adapter Interoperability
• Enable compatible USB-Ethernet adapters to work with MIB2 units
• Automatic VID/PID spoofing for ASIX AX88772A/B and D-Link DUB-E100
• Create safety backups before modifications (MD5/SHA256 verification)
• Restore bricked adapters from backup files

📋 Complete Installation Guide
• Step-by-step instructions for MIB2 Toolbox setup
• Prerequisites checklist and connection verification
• Troubleshooting tips for common issues
• Visual diagrams and command examples

🔐 EEPROM Backup & Restore
• Create safety backups of USB adapter configuration
• Integrity verification with MD5 and SHA256 checksums
• Restore corrupted or bricked adapters
• Secure local storage (no cloud sync)

🎯 FEC Code Generator
• Integration with external FEC generator (vwcoding.ru)
• Enable CarPlay and Android Auto on compatible units
• Support for custom feature activation codes
• VIN/VCRN-based code generation

📱 User-Friendly Interface
• Dark mode optimized for in-vehicle use
• Tab-based navigation (Home, USB, Tools, Actions, Config)
• Contextual help and FAQ section
• Multi-language support (English, Spanish)

REQUIREMENTS

Hardware:
• USB-Ethernet adapter (ASIX AX88772A/B or D-Link DUB-E100 recommended)
• USB OTG cable
• Android device with USB Host support
• MIB2 STD2 Technisat/Preh infotainment unit (Volkswagen Group vehicles)

Software:
• MIB2 Toolbox files on SD card (not included)
• Android 8.0 or higher

COMPATIBLE VEHICLES

This app is designed for Volkswagen Group vehicles with MIB2 STD2 Technisat/Preh infotainment units, typically found in:
• Volkswagen (Golf, Passat, Tiguan, Polo, etc.) - 2016-2019
• Audi (A3, A4, A5, Q2, Q3, etc.) - 2016-2019
• SEAT (Leon, Ibiza, Ateca, etc.) - 2016-2019
• Skoda (Octavia, Superb, Kodiaq, etc.) - 2016-2019

Note: MIB2 High units and MIB3 units are NOT supported.

SAFETY & LEGAL

⚠️ IMPORTANT WARNINGS:
• Physical access to the vehicle is required
• Only use on vehicles you own or are authorized to service
• Creating backups before any modification is strongly recommended
• Modifications may void vehicle warranty
• User is responsible for lawful use and compliance with local regulations
• This app does not modify safety-critical systems (engine, braking, emissions)

PRIVACY & DATA

✅ No personal data collection
✅ No advertising or tracking
✅ All diagnostic data stored locally
✅ No internet connection required (except for FEC generator link)
✅ User-controlled log exports

SUPPORT

For questions, troubleshooting, or feature requests:
• Email: feplazas@gmail.com
• GitHub: https://github.com/feplazas/mib2-controller
• In-app FAQ: Settings → Help

DISCLAIMER

This app is an independent diagnostic tool and is not affiliated with, endorsed by, or sponsored by Volkswagen AG, Audi AG, SEAT S.A., Skoda Auto, or any of their subsidiaries. All trademarks are property of their respective owners.

The app is provided "as is" without warranty. The developer is not responsible for any damage to vehicles, infotainment units, or USB adapters resulting from use of this app. Users assume all risks associated with modifications to their vehicles.
```

### 3.3 Graphics Assets

**App icon** (512 x 512 px):
- Upload: `play-store-assets/icon-512.png`

**Feature graphic** (1024 x 500 px):
- Upload: `play-store-assets/feature-graphic.png`

**Phone screenshots** (minimum 2, maximum 8):

Upload in this order:
1. `play-store-assets/01-home-screen.png` - Home screen with connection status
2. `play-store-assets/02-auto-spoofing.png` - Automatic spoofing configuration
3. `play-store-assets/03-telnet-terminal.png` - Telnet terminal interface
4. `play-store-assets/04-fec-generator.png` - FEC code generator
5. `play-store-assets/05-installation-guide.png` - Installation guide
6. `play-store-assets/06-eeprom-backups.png` - EEPROM backups
7. `play-store-assets/07-recovery.png` - Recovery tools
8. `play-store-assets/08-settings.png` - Settings and FAQ

**Screenshot captions** (optional, but recommended):

For each screenshot, add a caption (40 characters max):
1. "Connect to MIB2 via USB-Ethernet"
2. "Enable adapter compatibility"
3. "Execute diagnostic commands"
4. "Generate feature activation codes"
5. "Step-by-step installation guide"
6. "Create safety backups"
7. "Restore bricked adapters"
8. "Built-in help and FAQ"

### 3.4 Categorization

**App category:**
- Select: `Tools`

**Tags** (up to 5):
- `Automotive`
- `Diagnostics`
- `VW`
- `Audi`
- `Infotainment`

### 3.5 Contact Details

**Email:**
```
feplazas@gmail.com
```

**Phone:** (optional - leave blank)

**Website:**
```
https://github.com/feplazas/mib2-controller
```

**Privacy policy URL:**
```
https://feplazas.github.io/mib2-controller/privacy-policy.html
```

### 3.6 Save
Click **"Save"** at the bottom of the page.

---

## STEP 4: Configure Data Safety

### 4.1 Navigate to Data Safety
1. In left sidebar: **Policy** → **App content** → **Data safety**
2. Click **"Start"**

### 4.2 Data Collection and Security

**Question 1: Does your app collect or share any of the required user data types?**
- Select: **No**

**Question 2: Is all of the user data collected by your app encrypted in transit?**
- Select: **Yes** (even though we don't collect data, Android enforces HTTPS for any network communication)

**Question 3: Do you provide a way for users to request that their data is deleted?**
- Select: **No** (not applicable - we don't collect data)

Click **"Next"**

### 4.3 Data Types (Verification)

You should see a summary page stating:
> "You've indicated that your app doesn't collect any user data."

Review and confirm this is correct.

Click **"Next"**

### 4.4 Privacy Policy

**Privacy policy URL:**
```
https://feplazas.github.io/mib2-controller/privacy-policy.html
```

Click **"Next"**

### 4.5 Review and Submit

Review the summary:
- ✅ No data collected
- ✅ No data shared
- ✅ Data encrypted in transit
- ✅ Privacy policy provided

Click **"Submit"**

**Expected result:** You'll see a green checkmark next to "Data safety" in the dashboard.

---

## STEP 5: Complete Content Rating

### 5.1 Navigate to Content Rating
1. In left sidebar: **Policy** → **App content** → **Content rating**
2. Click **"Start questionnaire"**

### 5.2 Select Rating Authority
- Select: **IARC questionnaire** (International Age Rating Coalition)

Click **"Start"**

### 5.3 App Information

**Email address:**
```
feplazas@gmail.com
```

**Category:**
- Select: `Utility, Productivity, Communication, or Other`

Click **"Next"**

### 5.4 Content Questionnaire

Answer the following questions:

**Violence:**
- Does your app contain realistic violence? **No**
- Does your app contain fantasy violence? **No**
- Does your app depict blood or gore? **No**

**Sexual Content:**
- Does your app contain sexual content or nudity? **No**
- Does your app contain sexually suggestive content? **No**

**Language:**
- Does your app contain profanity or crude humor? **No**

**Controlled Substances:**
- Does your app reference or depict alcohol, tobacco, or drugs? **No**

**Gambling:**
- Does your app contain simulated gambling? **No**
- Does your app allow users to purchase digital goods with real money? **No**

**User Interaction:**
- Does your app allow users to interact with each other? **No**
- Does your app share user-provided information with third parties? **No**
- Does your app allow users to share their location with other users? **No**

**Miscellaneous:**
- Does your app contain ads? **No**

Click **"Next"**

### 5.5 Review and Submit

Review your answers and click **"Submit"**

**Expected rating:** 
- ESRB: Everyone
- PEGI: PEGI 3
- USK: All ages
- ClassInd: L (Livre)
- Generic: 3+

Click **"Apply rating"**

---

## STEP 6: Set Up Pricing & Distribution

### 6.1 Navigate to Pricing & Distribution
1. In left sidebar: **Grow** → **Store presence** → **Pricing & distribution**

### 6.2 Countries/Regions

**Available in:**
- Click **"Add countries/regions"**
- Select **"All countries"** (or select specific regions)

**Recommended regions for MIB2 Controller:**
- ✅ Europe (Germany, Austria, Switzerland, UK, France, Spain, Italy, Netherlands, Belgium, Poland, Czech Republic)
- ✅ North America (United States, Canada, Mexico)
- ✅ Latin America (Brazil, Argentina, Chile, Colombia)
- ✅ Asia-Pacific (Australia, New Zealand)

**Note:** Avoid regions where Volkswagen Group vehicles are rare to reduce support burden.

### 6.3 Pricing

**Pricing:**
- Select: **Free**

**In-app purchases:**
- Select: **No** (this app doesn't contain in-app purchases)

### 6.4 Ads

**Contains ads:**
- Select: **No**

### 6.5 Program Opt-In

**Google Play for Education:**
- Leave unchecked (not applicable)

**Families:**
- Leave unchecked (not a family-friendly app - requires technical knowledge)

### 6.6 App Access

**Special access:**
- Does your app require any special access? **No**

### 6.7 Government Apps

**Is this a government app?**
- Select: **No**

### 6.8 News Apps

**Is this a news app?**
- Select: **No**

### 6.9 Target Audience

**Target age groups:**
- Select: **18 and over** (requires technical knowledge and vehicle ownership)

**Appeal to children:**
- Does your app appeal to children? **No**

### 6.10 Save
Click **"Save"** at the bottom of the page.

---

## STEP 7: Review and Publish

### 7.1 Check Dashboard Completion

Go to the main dashboard and verify all tasks are complete:

1. ✅ Set up your app
2. ✅ App access
3. ✅ Ads
4. ✅ Content rating
5. ✅ Target audience
6. ✅ News apps
7. ✅ Data safety
8. ✅ Government apps
9. ✅ Store listing
10. ✅ Main store listing

### 7.2 Promote Internal Testing to Production

1. Go to **Testing** → **Internal testing**
2. Find your release (version 1.0.0, build 6)
3. Click **"Promote release"**
4. Select **"Production"**

### 7.3 Production Release Configuration

**Release name:** (optional)
```
1.0.0 - Initial Release
```

**Release notes:** (copy from Internal Testing or update)
```
Initial release of MIB2 Controller

Features:
• Local MIB2 infotainment diagnostics via USB-Ethernet
• Telnet terminal for diagnostic commands
• USB adapter interoperability support (VID/PID spoofing)
• EEPROM backup and restore
• FEC code generator integration
• Complete MIB2 Toolbox installation guide
• Multi-language support (English, Spanish)

Requirements:
• USB-Ethernet adapter (ASIX AX88772A/B or D-Link DUB-E100)
• OTG cable
• MIB2 STD2 Technisat/Preh infotainment unit
```

**Rollout percentage:**
- Select: **100%** (full rollout)

### 7.4 Review Release

Click **"Review release"**

You'll see a summary page with:
- App bundle: build-a11a6f86...aab (version 1.0.0, build 6)
- Release notes in English
- Rollout: 100%

### 7.5 Submit for Review

**Important:** Before clicking "Start rollout to Production", review this checklist:

- ✅ All dashboard tasks completed
- ✅ Store listing text and images uploaded
- ✅ Data safety configured (no data collection)
- ✅ Content rating obtained (Everyone/PEGI 3)
- ✅ Pricing set to Free
- ✅ Target countries selected
- ✅ Privacy policy URL provided
- ✅ AAB uploaded and verified

**If everything is correct:**

1. Click **"Start rollout to Production"**
2. Confirm the action in the dialog

**Expected result:**
- Status changes to **"Pending publication"**
- You'll receive an email confirmation
- Review typically takes 1-7 days (average: 2-3 days)

---

## STEP 8: Post-Submission Monitoring

### 8.1 Check Review Status

1. Go to **Publishing overview** in the left sidebar
2. Monitor the status:
   - 🟡 **Pending publication** - Waiting for review
   - 🟢 **Published** - Live on Play Store
   - 🔴 **Rejected** - See rejection reason and appeal

### 8.2 If Rejected

If your app is rejected, you'll receive an email with the rejection reason. Common reasons:

**Reason 1: "Circumvention of security measures"**
- **Action:** Submit appeal using `legal/PLAY_CONSOLE_APPEAL_BRIEF.md`
- **Location:** Policy → App content → Policy status → Appeal

**Reason 2: "Dangerous products"**
- **Action:** Clarify that the app is for owner-use diagnostics with physical access
- **Reference:** DMCA exemptions in appeal brief

**Reason 3: "Deceptive behavior"**
- **Action:** Verify store listing accurately describes functionality
- **Update:** Add more explicit warnings about physical access requirement

### 8.3 Appeal Process

1. Go to **Policy** → **App content** → **Policy status**
2. Click **"Appeal"** next to the rejection reason
3. Upload `legal/PLAY_CONSOLE_APPEAL_BRIEF.md` as supporting documentation
4. In the appeal text field, write:

```
Dear Google Play Review Team,

I am appealing the rejection of MIB2 Controller (com.feplazas.mib2controller) on the grounds that this app is a legitimate owner-use diagnostic tool for vehicle infotainment systems, not a hacking or circumvention tool.

Key points:

1. PHYSICAL ACCESS REQUIRED: The app cannot function without a USB-Ethernet adapter physically connected to the vehicle's infotainment unit. It is not a remote intrusion tool.

2. LEGAL FRAMEWORK: The app's functionality aligns with U.S. DMCA §1201 exemptions for vehicle software diagnosis and repair (37 C.F.R. § 201.40(b)(8)) and interoperability provisions (DMCA §1201(f)).

3. COMPARABLE APPS: Similar diagnostic tools are already available on Play Store (OBD-II apps like Torque, Car Scanner). MIB2 Controller is more restrictive as it only works with specific infotainment units via physical connection.

4. NO MALICIOUS BEHAVIOR: The app does not scan external networks, steal credentials, or facilitate unauthorized access to third-party systems. All actions are user-initiated and transparent.

5. NO DATA COLLECTION: The app collects no personal data and includes no tracking or advertising.

I have attached a detailed compliance brief (PLAY_CONSOLE_APPEAL_BRIEF.md) that explains the app's functionality, legal rationale, and safety boundaries. A full compliance dossier is also available upon request.

Please review the attached documentation and reconsider this decision. I am happy to provide additional information or make any necessary clarifications.

Thank you for your time and consideration.

Best regards,
Felipe Plazas
feplazas@gmail.com
```

5. Attach `legal/PLAY_CONSOLE_APPEAL_BRIEF.md`
6. Click **"Submit appeal"**

**Expected response time:** 1-3 business days

---

## STEP 9: Post-Publication Actions

### 9.1 Monitor Reviews and Ratings

1. Go to **Ratings and reviews** in the left sidebar
2. Respond to user reviews within 24-48 hours
3. Use prepared response templates for common issues

### 9.2 Track Installations

1. Go to **Statistics** → **Installs**
2. Monitor daily/weekly install trends
3. Track uninstall rate and user retention

### 9.3 Update Release Schedule

Plan regular updates:
- **Bug fixes:** As needed (within 1-2 weeks of reports)
- **Feature updates:** Every 2-3 months
- **Security updates:** Immediately if vulnerabilities discovered

---

## Troubleshooting Common Issues

### Issue 1: AAB Upload Fails

**Error:** "Upload failed" or "Invalid bundle"

**Solutions:**
1. Verify AAB file is not corrupted (re-download from EAS Build)
2. Check file size (should be ~50-100 MB)
3. Ensure version code is higher than any previous uploads
4. Try uploading from a different browser

### Issue 2: Store Listing Images Rejected

**Error:** "Image does not meet requirements"

**Solutions:**
1. Verify dimensions exactly match requirements (512x512, 1024x500, 945x2048)
2. Ensure PNG format (not WebP or JPEG)
3. Check file size is under 1 MB per image
4. Remove any transparency from feature graphic

### Issue 3: Content Rating Questionnaire Locked

**Error:** "Cannot modify content rating"

**Solution:**
1. Content rating can only be changed by re-submitting the questionnaire
2. Contact Play Console support if you need to update after publication

### Issue 4: Privacy Policy URL Not Accessible

**Error:** "Privacy policy URL is not accessible"

**Solutions:**
1. Verify URL is publicly accessible (not behind login)
2. Ensure HTTPS (not HTTP)
3. Check that the page loads correctly in an incognito browser
4. Verify no robots.txt blocking

---

## Appendix A: Pre-Submission Checklist

Print this checklist and verify each item before submitting:

### App Bundle
- [ ] AAB file downloaded from EAS Build (build a11a6f86)
- [ ] Version code: 6
- [ ] Version name: 1.0.0
- [ ] File size: ~50-100 MB
- [ ] Uploaded to Internal Testing first

### Store Listing
- [ ] App name: "MIB2 Controller"
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] App icon uploaded (512x512 PNG)
- [ ] Feature graphic uploaded (1024x500 PNG)
- [ ] 8 screenshots uploaded (945x2048 PNG)
- [ ] Category: Tools
- [ ] Email: feplazas@gmail.com
- [ ] Privacy policy URL: https://feplazas.github.io/mib2-controller/privacy-policy.html

### Data Safety
- [ ] No data collection declared
- [ ] Data encrypted in transit: Yes
- [ ] Privacy policy URL provided
- [ ] Submitted and approved

### Content Rating
- [ ] IARC questionnaire completed
- [ ] All questions answered "No"
- [ ] Rating received: Everyone/PEGI 3
- [ ] Applied to app

### Pricing & Distribution
- [ ] Pricing: Free
- [ ] Countries selected (Europe, North America, Latin America)
- [ ] Ads: No
- [ ] In-app purchases: No
- [ ] Target audience: 18+

### Legal Documentation
- [ ] Privacy policy published and accessible
- [ ] Compliance dossier prepared (legal/GOOGLE_PLAY_COMPLIANCE_DOSSIER.md)
- [ ] Appeal brief prepared (legal/PLAY_CONSOLE_APPEAL_BRIEF.md)
- [ ] Terms of use included in app (Settings → Help)

---

## Appendix B: Important URLs

**Play Console:**
- Dashboard: https://play.google.com/console
- App overview: https://play.google.com/console/u/0/developers/[YOUR_DEV_ID]/app/[APP_ID]/app-dashboard

**Documentation:**
- Store listing: `/play-store-assets/store-listing.md`
- Data safety guide: `/play-store-assets/DATA_SAFETY_GUIDE.md`
- Compliance dossier: `/legal/GOOGLE_PLAY_COMPLIANCE_DOSSIER.md`
- Appeal brief: `/legal/PLAY_CONSOLE_APPEAL_BRIEF.md`

**Assets:**
- Icon (512x512): `/play-store-assets/icon-512.png`
- Feature graphic (1024x500): `/play-store-assets/feature-graphic.png`
- Screenshots: `/play-store-assets/01-home-screen.png` through `08-settings.png`

**Build:**
- EAS Build: https://expo.dev/accounts/feplazas/projects/mib2_controller/builds/a11a6f86-a4f8-4e47-ac37-63abf0eae622
- Version: 1.0.0 (build 6)
- Package: com.feplazas.mib2controller

---

## Appendix C: Timeline Expectations

**Day 0 (Today):**
- Create app in Play Console
- Upload AAB to Internal Testing
- Configure Store Listing
- Configure Data Safety
- Complete Content Rating
- Set up Pricing & Distribution
- Submit for Production review

**Day 1-3:**
- Google reviews app
- May request additional information
- May approve or reject

**If Approved:**
- App goes live within 1-2 hours
- Appears in search within 24 hours
- Indexed by Google within 48 hours

**If Rejected:**
- Submit appeal with documentation
- Wait 1-3 business days for appeal review
- May require multiple appeal rounds

**Post-Publication:**
- Monitor reviews daily for first week
- Respond to user feedback
- Track crash reports and bugs
- Plan first update (1-2 months)

---

**Document prepared by:** Felipe Plazas  
**Contact:** feplazas@gmail.com  
**Date:** January 21, 2026  
**Version:** 1.0 (Final)
