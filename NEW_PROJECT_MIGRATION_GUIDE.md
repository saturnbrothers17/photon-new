# 🚀 New Supabase Project Migration Guide

## ✅ **Step 1: Data Export Complete**
Your current data has been exported to: `supabase-export-1754718949057.json`

**Exported Data:**
- ✅ 1 Auth User (jp7@photon)
- ✅ 1 User Profile (JP7 Teacher)
- ✅ 1 Test Result
- ✅ 5 Study Materials
- ❌ 0 Tests (table might not exist in old project)

## 🆕 **Step 2: Create New Supabase Project**

### 2.1 Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Click **"New project"**

### 2.2 Project Settings
- **Organization**: Select your organization
- **Name**: `photon-coaching-new` (or your preferred name)
- **Database Password**: Create a strong password (save it!)
- **Region**: Choose closest to your users
- **Pricing Plan**: Free (you can upgrade later)

### 2.3 Wait for Project Creation
- This takes 2-3 minutes
- You'll see a progress indicator

### 2.4 Get New Project Credentials
Once created, go to **Settings** → **API**:
- **Project URL**: `https://[your-new-project-id].supabase.co`
- **Anon Key**: `eyJ...` (public key)
- **Service Role Key**: `eyJ...` (secret key)

## 🔧 **Step 3: Update Environment Variables**

### 3.1 Backup Current .env.local
```bash
cp .env.local .env.local.backup
```

### 3.2 Update .env.local with New Credentials
Replace these three lines in your `.env.local`:

```env
# OLD PROJECT (backup these)
# NEXT_PUBLIC_SUPABASE_URL=https://decoyxbkcibyngpsrwdr.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NEW PROJECT (replace with your new values)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_NEW_SERVICE_ROLE_KEY
```

**⚠️ Important**: Keep all other environment variables the same (Google Drive, API keys, etc.)

## 📥 **Step 4: Import Data to New Project**

Run the import script:
```bash
node import-to-new-project.js
```

**Expected Output:**
```
📥 Importing data to new Supabase project...
📄 Using export file: supabase-export-1754718949057.json

1️⃣ Setting up database schema...
2️⃣ Importing auth users...
   ✅ Created jp7@photon
3️⃣ Importing user profiles...
   ✅ Imported profile: JP7 Teacher
4️⃣ Importing study materials...
   ✅ Imported material: [material names]
5️⃣ Importing test results...
   ✅ Imported test result for: [student name]
6️⃣ Adding new teachers...
   ✅ Created Shiv Prakash Yadav successfully!
   ✅ Created Mahavir Kesari successfully!
   ✅ Created AK Mishra successfully!
7️⃣ Verifying import...

🎉 MIGRATION SUCCESSFUL!
```

## ✅ **Step 5: Verify Migration**

### 5.1 Check New Project Dashboard
1. Go to your new Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. You should see 4 users:
   - jp7@photon
   - sp8@photon.edu
   - mk6@photon.edu
   - ak5@photon.edu

### 5.2 Test User Creation
```bash
node test-new-project.js
```

### 5.3 Test Application
1. Start your application: `npm run dev`
2. Try logging in with teacher credentials
3. Verify teacher dashboard works
4. Check if data is accessible

## 🔑 **Step 6: Login Credentials**

After migration, teachers can login with:

| Teacher | Email | Password | Notes |
|---------|-------|----------|-------|
| JP7 Teacher | jp7@photon | `temp-password-123` | Needs password reset |
| Shiv Prakash Yadav | sp8@photon.edu | `sp8@photon` | New password |
| Mahavir Kesari | mk6@photon.edu | `mk6@photon` | New password |
| AK Mishra | ak5@photon.edu | `ak5@photon` | New password |

**⚠️ Important**: JP7 Teacher will need to reset their password since we couldn't migrate the original password hash.

## 🔧 **Step 7: Post-Migration Tasks**

### 7.1 Password Resets
- JP7 Teacher should reset password via your app's forgot password feature
- New teachers can use their assigned passwords initially

### 3.2 Test All Features
- [ ] Teacher login
- [ ] Student registration (test if user creation now works!)
- [ ] Test creation and management
- [ ] Study materials access
- [ ] Google Drive integration
- [ ] All API endpoints

### 7.3 Update Documentation
- Update any documentation with new project ID
- Update team members about new credentials
- Consider updating project name in code comments

## 🚨 **Rollback Plan (If Needed)**

If something goes wrong, you can rollback:

1. **Restore old environment**:
   ```bash
   cp .env.local.backup .env.local
   ```

2. **Your old project is still intact** - nothing was deleted

3. **Export file is saved** - you can retry migration anytime

## 🎯 **Success Criteria**

Migration is successful when:
- ✅ 4 teachers can login
- ✅ All existing data is accessible
- ✅ New user creation works (test this!)
- ✅ All application features work
- ✅ No errors in application logs

## 📞 **Support**

If you encounter issues:
1. Check the import script output for errors
2. Verify environment variables are correct
3. Test user creation in new project dashboard
4. Contact me for troubleshooting

---

**Ready to proceed?** Start with Step 2: Create New Supabase Project!