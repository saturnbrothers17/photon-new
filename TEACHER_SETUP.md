# Teacher Account Setup Guide

The API setup failed due to Supabase admin permissions. Here are the manual steps to create the missing teacher accounts:

## Method 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your PHOTON project

2. **Navigate to Authentication > Users**
   - Click on "Authentication" in the left sidebar
   - Click on "Users" tab

3. **Create each teacher account manually:**

   **Teacher 1: Shiv Prakash Yadav**
   - Click "Add user" 
   - Email: `sp8@photon`
   - Password: `photon123` (or your choice)
   - Email Confirm: ✅ (checked)
   - Click "Create user"

   **Teacher 2: Mahavir Kesari**
   - Click "Add user"
   - Email: `mk6@photon` 
   - Password: `photon123` (or your choice)
   - Email Confirm: ✅ (checked)
   - Click "Create user"

   **Teacher 3: AK Mishra**
   - Click "Add user"
   - Email: `ak5@photon`
   - Password: `photon123` (or your choice) 
   - Email Confirm: ✅ (checked)
   - Click "Create user"

## Method 2: SQL Commands (Alternative)

If you prefer SQL, run these commands in your Supabase SQL Editor:

```sql
-- Insert teacher accounts into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
-- You'll need to generate proper UUIDs and encrypted passwords
-- This is more complex, so Method 1 is recommended
```

## Test the Accounts

After creating the accounts, test them at:
`http://localhost:9002/faculty-portal`

**Login Credentials:**
- `sp8@photon` / `photon123` → Should show "Welcome, Shiv Prakash Yadav"
- `mk6@photon` / `photon123` → Should show "Welcome, Mahavir Kesari" 
- `ak5@photon` / `photon123` → Should show "Welcome, AK Mishra"
- `jp7@photon` / (existing password) → Should show "Welcome, Jai Prakash Mishra"

## Notes

- The personalized welcome headers are already implemented
- The name mapping is handled in `/api/teacher/profile`
- All dashboard functionality will work once the accounts are created
- You can change the passwords to anything you prefer

## Troubleshooting

If login still fails after creating accounts:
1. Check that Email Confirm is enabled for each user
2. Verify the email format matches exactly (e.g., `sp8@photon`)
3. Try logging out and back in
4. Clear browser cache if needed
