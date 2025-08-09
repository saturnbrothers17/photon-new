# Teacher Setup Instructions

## Overview
We need to add three teachers to the system so they can login to the teacher dashboard:

1. **Shiv Prakash Yadav** - Photon ID: `sp8@photon` - Password: `sp8@photon`
2. **Mahavir Kesari** - Photon ID: `mk6@photon` - Password: `mk6@photon`  
3. **AK Mishra** - Photon ID: `ak5@photon` - Password: `ak5@photon`

## Method 1: Manual Creation via Supabase Dashboard (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Login to your account
3. Select your project: `decoyxbkcibyngpsrwdr`

### Step 2: Create Auth Users
1. Navigate to **Authentication** → **Users** in the left sidebar
2. Click **"Add user"** button
3. Create each teacher with these details:

#### Teacher 1: Shiv Prakash Yadav
- **Email**: `sp8@photon.edu`
- **Password**: `sp8@photon`
- **Confirm email**: ✅ Yes
- **User Metadata** (optional):
  ```json
  {
    "name": "Shiv Prakash Yadav",
    "role": "teacher",
    "photon_id": "sp8@photon",
    "subject": "Mathematics",
    "department": "Science"
  }
  ```

#### Teacher 2: Mahavir Kesari
- **Email**: `mk6@photon.edu`
- **Password**: `mk6@photon`
- **Confirm email**: ✅ Yes
- **User Metadata** (optional):
  ```json
  {
    "name": "Mahavir Kesari",
    "role": "teacher",
    "photon_id": "mk6@photon",
    "subject": "Physics",
    "department": "Science"
  }
  ```

#### Teacher 3: AK Mishra
- **Email**: `ak5@photon.edu`
- **Password**: `ak5@photon`
- **Confirm email**: ✅ Yes
- **User Metadata** (optional):
  ```json
  {
    "name": "AK Mishra",
    "role": "teacher",
    "photon_id": "ak5@photon",
    "subject": "Chemistry",
    "department": "Science"
  }
  ```

### Step 3: Verify User Profiles
After creating the auth users, the system should automatically create user profiles. You can verify this by:

1. Go to **Table Editor** → **user_profiles**
2. Check that all three teachers appear with role = 'teacher'

## Method 2: Self-Registration (Alternative)

If you prefer, the teachers can register themselves:

1. Go to your application's signup page
2. Each teacher should register with:
   - **Email**: Their assigned email (sp8@photon.edu, mk6@photon.edu, ak5@photon.edu)
   - **Password**: Their photon ID (sp8@photon, mk6@photon, ak5@photon)
3. The system will automatically create their profiles with teacher role

## Login Credentials Summary

Once created, teachers can login to the teacher dashboard using:

| Teacher Name | Email | Password | Photon ID |
|--------------|-------|----------|-----------|
| Shiv Prakash Yadav | sp8@photon.edu | sp8@photon | sp8@photon |
| Mahavir Kesari | mk6@photon.edu | mk6@photon | mk6@photon |
| AK Mishra | ak5@photon.edu | ak5@photon | ak5@photon |

## Verification Script

After creating the users, you can run this verification script:

```bash
node verify-teachers.js
```

## Troubleshooting

### If profiles are not created automatically:
1. Check if the trigger `create_user_profile_trigger` is enabled
2. Run the SQL setup script: `supabase-auth-rls-setup.sql`
3. Manually create profiles using the SQL editor

### If login fails:
1. Verify email confirmation is enabled
2. Check that user_profiles table has the correct role ('teacher')
3. Ensure RLS policies allow teacher access

## Database Structure

The system uses:
- **auth.users**: Supabase authentication table
- **user_profiles**: Custom table with additional user information
- **Foreign key constraint**: user_profiles.id → auth.users.id

This ensures data integrity and proper authentication flow.