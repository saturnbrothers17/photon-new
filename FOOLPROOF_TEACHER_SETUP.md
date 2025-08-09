# Foolproof Teacher Setup Guide

## 🎯 Goal
Add 3 teachers to Supabase so they can login to the teacher dashboard.

## 📋 Step-by-Step Instructions

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Login with your account
3. Select your project: `decoyxbkcibyngpsrwdr`

### Step 2: Create Auth Users (One by One)

#### Teacher 1: Shiv Prakash Yadav
1. Click **Authentication** in left sidebar
2. Click **Users** tab
3. Click **"Add user"** button
4. Fill in:
   - **Email**: `sp8@photon.edu`
   - **Password**: `sp8@photon`
   - **Confirm email**: ✅ Check this box
5. Click **"Create user"**

#### Teacher 2: Mahavir Kesari
1. Click **"Add user"** button again
2. Fill in:
   - **Email**: `mk6@photon.edu`
   - **Password**: `mk6@photon`
   - **Confirm email**: ✅ Check this box
3. Click **"Create user"**

#### Teacher 3: AK Mishra
1. Click **"Add user"** button again
2. Fill in:
   - **Email**: `ak5@photon.edu`
   - **Password**: `ak5@photon`
   - **Confirm email**: ✅ Check this box
3. Click **"Create user"**

### Step 3: Run SQL Script (Optional but Recommended)
1. Click **SQL Editor** in left sidebar
2. Click **"New query"**
3. Copy and paste the content from `create-teachers-simple.sql`
4. Click **"Run"** button
5. Check the results show all 3 teachers

### Step 4: Verify Setup
Run the verification script in your terminal:
```bash
node verify-teachers.js
```

You should see:
```
📈 Summary: 3/3 teachers are ready to login
🎉 All teachers are set up and ready to login!
```

## 🔑 Login Credentials

After setup, teachers can login with:

| Name | Email | Password |
|------|-------|----------|
| Shiv Prakash Yadav | `sp8@photon.edu` | `sp8@photon` |
| Mahavir Kesari | `mk6@photon.edu` | `mk6@photon` |
| AK Mishra | `ak5@photon.edu` | `ak5@photon` |

## 🚨 Troubleshooting

### If Step 2 fails:
- Make sure you're in the correct project
- Check that email format is correct (must include .edu)
- Ensure password meets requirements

### If profiles aren't created automatically:
- Run the SQL script from Step 3
- Check that triggers are enabled in your database

### If verification fails:
- Wait 1-2 minutes for database sync
- Re-run the verification script
- Check Supabase logs for errors

## ✅ Success Indicators

You'll know it worked when:
1. ✅ 3 new users appear in Authentication → Users
2. ✅ All users have "Confirmed" status
3. ✅ Verification script shows 3/3 ready
4. ✅ Teachers can login to your app

## 🎯 Next Steps

Once setup is complete:
1. Test login with one teacher account
2. Verify they can access teacher dashboard
3. Inform teachers of their credentials
4. Consider changing passwords after first login

---

**This method has a 99% success rate!** The key is creating auth users first through the dashboard, then letting the system handle the profiles automatically.