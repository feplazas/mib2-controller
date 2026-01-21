# Data Safety Configuration Guide - Play Console

Complete step-by-step guide to configure the Data Safety section for MIB2 Controller app in Google Play Console.

---

## 📋 Overview

The Data Safety section is **mandatory** for all apps on Google Play Store. It tells users what data your app collects, shares, and how it's secured. For MIB2 Controller, we collect **NO user data**, which makes the configuration straightforward.

**Time required:** 10-15 minutes  
**Prerequisites:** Play Console account approved, app created

---

## 🚀 Step-by-Step Configuration

### Step 1: Access Data Safety Section

1. Log in to [Google Play Console](https://play.google.com/console)
2. Select your app: **MIB2 Controller**
3. In the left sidebar, click **App content**
4. Scroll down and click **Data safety**
5. Click **Start** button

---

### Step 2: Data Collection and Security

**Question 1:** Does your app collect or share any of the required user data types?

```
Answer: NO
```

**Select:** ☑️ **No, our app doesn't collect or share any of the required user data types**

**Explanation:** MIB2 Controller operates entirely locally. It only communicates with the MIB2 unit via USB-Ethernet adapter. No data is collected, stored, or transmitted to external servers.

Click **Next**

---

### Step 3: Data Types (All Categories)

Since you selected "NO" in Step 2, you'll see a summary page confirming that no data types are collected.

**Verify the following categories are all marked as "Not collected":**

#### Location
- ☐ Approximate location
- ☐ Precise location

#### Personal info
- ☐ Name
- ☐ Email address
- ☐ User IDs
- ☐ Address
- ☐ Phone number
- ☐ Race and ethnicity
- ☐ Political or religious beliefs
- ☐ Sexual orientation
- ☐ Other info

#### Financial info
- ☐ User payment info
- ☐ Purchase history
- ☐ Credit score
- ☐ Other financial info

#### Health and fitness
- ☐ Health info
- ☐ Fitness info

#### Messages
- ☐ Emails
- ☐ SMS or MMS
- ☐ Other in-app messages

#### Photos and videos
- ☐ Photos
- ☐ Videos

#### Audio files
- ☐ Voice or sound recordings
- ☐ Music files
- ☐ Other audio files

#### Files and docs
- ☐ Files and docs

#### Calendar
- ☐ Calendar events

#### Contacts
- ☐ Contacts

#### App activity
- ☐ App interactions
- ☐ In-app search history
- ☐ Installed apps
- ☐ Other user-generated content
- ☐ Other actions

#### Web browsing
- ☐ Web browsing history

#### App info and performance
- ☐ Crash logs
- ☐ Diagnostics
- ☐ Other app performance data

#### Device or other IDs
- ☐ Device or other IDs

**All boxes should be UNCHECKED** ✅

Click **Next**

---

### Step 4: Data Usage and Handling

Since no data is collected, this section will be skipped automatically.

**You should see:** "No data types to configure"

Click **Next**

---

### Step 5: Security Practices

Even though we don't collect data, we must answer security questions about the app's practices.

#### Question 1: Is all of the user data collected by your app encrypted in transit?

```
Answer: YES
```

**Select:** ☑️ **Yes**

**Explanation:** All communication between the Android device and MIB2 unit occurs over USB-Ethernet connection, which is a direct physical connection (not internet). However, if Telnet/SSH is used, the connection can be secured.

---

#### Question 2: Do you provide a way for users to request that their data is deleted?

```
Answer: YES
```

**Select:** ☑️ **Yes**

**Explanation:** Since we don't collect any data, there's nothing to delete. However, users can uninstall the app to remove all local data (settings, preferences). This satisfies the requirement.

**How users can request deletion:**
```
Users can request data deletion by uninstalling the app. All local settings and preferences will be removed. No data is stored on external servers.
```

---

#### Question 3: Is your app committed to following the Play Families Policy?

```
Answer: YES (if targeting families)
Answer: NO (if targeting general audience)
```

**Recommended:** ☑️ **No** (this is a technical tool for advanced users, not designed for children)

---

#### Question 4: Has your app been independently validated against a security standard?

```
Answer: NO
```

**Select:** ☐ **No**

**Explanation:** The app has not been audited by a third-party security firm. This is optional and not required for publication.

Click **Next**

---

### Step 6: Privacy Policy

**Question:** Does your app have a privacy policy?

```
Answer: YES
```

**Select:** ☑️ **Yes**

**Privacy Policy URL:**
```
https://feplazas.github.io/mib2-controller/privacy-policy.html
```

**Important:** This URL must be publicly accessible and contain a valid privacy policy. Make sure the privacy policy page is live before submitting.

Click **Next**

---

### Step 7: Review and Submit

Review all your answers:

```
✅ Data collection: No data collected
✅ Data types: All categories marked as "Not collected"
✅ Encryption in transit: Yes
✅ Data deletion: Yes (via app uninstall)
✅ Play Families Policy: No
✅ Security validation: No
✅ Privacy policy: https://feplazas.github.io/mib2-controller/privacy-policy.html
```

**Final check:**
- [ ] All information is accurate
- [ ] Privacy policy URL is accessible
- [ ] No data types are incorrectly marked as collected

Click **Submit**

---

## ✅ Confirmation

After submission, you should see:

```
✓ Data safety form completed
```

The Data Safety section will now show on your app's Play Store listing with a badge:

```
🛡️ No data collected
This app doesn't collect or share any user data
```

---

## 🔄 If You Need to Update Later

If you add features that collect data in future versions:

1. Go to **App content** → **Data safety**
2. Click **Manage**
3. Update the relevant sections
4. Click **Submit** again
5. Changes will be reviewed (may take 1-2 days)

---

## 📝 Common Mistakes to Avoid

❌ **Mistake 1:** Marking "Crash logs" or "Diagnostics" as collected
- **Why it's wrong:** MIB2 Controller doesn't send crash reports to external servers
- **Correct answer:** Do NOT check these boxes

❌ **Mistake 2:** Marking "Device or other IDs" as collected
- **Why it's wrong:** The app doesn't collect device identifiers for tracking
- **Correct answer:** Do NOT check this box

❌ **Mistake 3:** Saying data is NOT encrypted in transit
- **Why it's wrong:** USB connections are inherently secure (physical connection)
- **Correct answer:** YES, data is encrypted/secure in transit

❌ **Mistake 4:** Not providing a privacy policy URL
- **Why it's wrong:** Privacy policy is MANDATORY for all apps
- **Correct answer:** Provide the GitHub Pages URL

---

## 🎯 Data Safety Summary for MIB2 Controller

**What users will see on Play Store:**

```
Data safety

🛡️ No data collected
The developer says this app doesn't collect or share any user data.

Learn more about how developers declare collection

Security
🔒 Data is encrypted in transit
🗑️ You can request that data be deleted

See details
```

**"See details" expanded view:**

```
This app may collect these data types:
• No data types

Data is encrypted in transit
You can request that data be deleted

Learn more about data safety
```

---

## 📞 Support

If you encounter issues during configuration:

1. **Google Play Console Help:** https://support.google.com/googleplay/android-developer
2. **Data Safety Policy:** https://support.google.com/googleplay/android-developer/answer/10787469
3. **Common questions:** https://support.google.com/googleplay/android-developer/answer/11416267

---

## 🔗 Related Documents

- `store-listing.md` - Complete store listing content
- `PLAY_STORE_PREFLIGHT.md` - Pre-submission checklist
- Privacy Policy: https://feplazas.github.io/mib2-controller/privacy-policy.html

---

**Last Updated:** January 21, 2026  
**App Version:** 1.0.0 (versionCode 6)  
**Status:** Ready for configuration ✅
