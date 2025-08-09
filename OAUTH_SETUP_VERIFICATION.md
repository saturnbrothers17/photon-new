# 🔐 OAuth Setup Verification Guide

## ✅ **What You've Already Done:**
- Added yourself as a test user in Google Cloud Console
- This should resolve the "Access blocked" error

## 🔧 **Additional Setup Required:**

### **1. Verify Redirect URI in Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project **"photon-ex431"**
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID: `276948450907-hn1j8mi3tp1nd6l5k7ojpmmf31ptghf0.apps.googleusercontent.com`
5. In **"Authorized redirect URIs"**, make sure you have:
   ```
   http://localhost:9002/auth/callback
   ```
6. If it's not there, click **"ADD URI"** and add it
7. Click **"SAVE"**

### **2. Verify OAuth Consent Screen**

1. Go to **APIs & Services** → **OAuth consent screen**
2. Make sure **User Type** is set to **"External"** (since you added test users)
3. In **Test users** section, verify you have:
   ```
   anitamishravns1973@gmail.com
   ```
4. Make sure **Publishing status** shows **"Testing"** (this is correct for now)

### **3. Required Scopes**

Make sure these scopes are configured:
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/drive.metadata.readonly`

## 🚀 **Test the Connection:**

1. Start your development server: `npm run dev`
2. Go to: `http://localhost:9002/teacher-dashboard`
3. In the **"Connection Status"** section, click **"Test OAuth"**
4. You should be redirected to Google's consent screen
5. Sign in with: `anitamishravns1973@gmail.com`
6. Grant permissions
7. You should be redirected back to your app

## 🎯 **Expected Flow:**

```
Your App → Google OAuth → Consent Screen → Grant Permission → Redirect Back → Success!
```

## ❌ **If You Still Get Errors:**

### **"redirect_uri_mismatch"**
- Double-check the redirect URI in Google Cloud Console
- Make sure it's exactly: `http://localhost:9002/auth/callback`

### **"access_denied"**
- Make sure you're signed in with the test user email
- Check that the email is added in Test users section

### **"invalid_client"**
- Verify the Client ID and Client Secret in your `.env.local`
- Make sure there are no extra spaces or characters

## 🔍 **Debug Information:**

Your current configuration:
- **Client ID**: `276948450907-hn1j8mi3tp1nd6l5k7ojpmmf31ptghf0.apps.googleusercontent.com`
- **Redirect URI**: `http://localhost:9002/auth/callback`
- **Test User**: `anitamishravns1973@gmail.com`
- **Project**: `photon-ex431`

## ✅ **Once Working:**

After successful OAuth connection, you'll be able to:
1. ✅ Automatically upload tests to organized folders
2. ✅ Create structured backups
3. ✅ Sync all data to Google Drive
4. ✅ Get browser notifications for uploads
5. ✅ Monitor storage usage and folder structure

The complete auto-sync system will be fully functional! 🎉