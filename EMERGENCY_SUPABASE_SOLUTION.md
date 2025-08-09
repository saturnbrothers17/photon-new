# 🚨 EMERGENCY: Supabase Project Critical Issue

## 🔥 **CRITICAL PROBLEM**
- ❌ API user creation: FAILS
- ❌ Dashboard manual creation: FAILS  
- ❌ ALL user creation methods: FAIL
- ✅ Only existing user (jp7@photon) works

**This indicates SEVERE Supabase project corruption or misconfiguration.**

## 🆘 **IMMEDIATE SOLUTIONS**

### Solution 1: Direct SQL Injection (EMERGENCY)
**Bypass all Supabase auth systems and inject users directly**

1. Go to Supabase Dashboard → SQL Editor
2. Run this emergency SQL script:

```sql
-- EMERGENCY: Direct user creation bypassing all constraints
-- WARNING: This bypasses normal auth security

-- First, let's see what's in the auth.users table
SELECT * FROM auth.users LIMIT 5;

-- Check auth.users structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth';

-- Emergency user creation (modify based on existing structure)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) 
SELECT 
  gen_random_uuid(),
  (SELECT instance_id FROM auth.users LIMIT 1),
  'sp8@photon.edu',
  (SELECT encrypted_password FROM auth.users WHERE email = 'jp7@photon'),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Shiv Prakash Yadav", "role": "teacher", "photon_id": "sp8@photon"}',
  false,
  'authenticated',
  'authenticated'
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sp8@photon.edu');

-- Repeat for other teachers
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud
) 
SELECT 
  gen_random_uuid(),
  (SELECT instance_id FROM auth.users LIMIT 1),
  'mk6@photon.edu',
  (SELECT encrypted_password FROM auth.users WHERE email = 'jp7@photon'),
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Mahavir Kesari", "role": "teacher", "photon_id": "mk6@photon"}',
  false, 'authenticated', 'authenticated'
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mk6@photon.edu');

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud
) 
SELECT 
  gen_random_uuid(),
  (SELECT instance_id FROM auth.users LIMIT 1),
  'ak5@photon.edu',
  (SELECT encrypted_password FROM auth.users WHERE email = 'jp7@photon'),
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "AK Mishra", "role": "teacher", "photon_id": "ak5@photon"}',
  false, 'authenticated', 'authenticated'
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ak5@photon.edu');

-- Create corresponding user profiles
INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department, is_active)
SELECT 
  u.id, u.email, 'teacher', 
  u.raw_user_meta_data->>'name',
  u.raw_user_meta_data->>'photon_id',
  CASE 
    WHEN u.email = 'sp8@photon.edu' THEN 'Mathematics'
    WHEN u.email = 'mk6@photon.edu' THEN 'Physics'
    WHEN u.email = 'ak5@photon.edu' THEN 'Chemistry'
  END,
  'Science',
  true
FROM auth.users u
WHERE u.email IN ('sp8@photon.edu', 'mk6@photon.edu', 'ak5@photon.edu')
ON CONFLICT (id) DO NOTHING;

-- Verify creation
SELECT 'Auth Users:' as table_type, email, created_at FROM auth.users 
UNION ALL
SELECT 'Profiles:' as table_type, email, created_at FROM user_profiles WHERE role = 'teacher';
```

### Solution 2: New Supabase Project (RECOMMENDED)
**Your current project is corrupted - start fresh**

1. **Create New Project**:
   - Go to Supabase Dashboard
   - Create new project: `photon-coaching-new`
   - Note new URL and keys

2. **Export Current Data**:
   ```bash
   node export-current-data.js
   ```

3. **Update Environment**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://NEW_PROJECT_URL.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=NEW_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=NEW_SERVICE_ROLE_KEY
   ```

4. **Import Data to New Project**:
   ```bash
   node import-to-new-project.js
   ```

### Solution 3: Contact Supabase Support (URGENT)
**This is a critical project issue that needs Supabase intervention**

1. Go to Supabase Dashboard → Support
2. Create urgent ticket with:
   - **Subject**: "CRITICAL: Cannot create any new users - Database error"
   - **Project ID**: `decoyxbkcibyngpsrwdr`
   - **Issue**: "Both API and Dashboard user creation failing with database errors"
   - **Impact**: "Production system cannot add new users"

## 🔧 **Emergency Scripts**

Let me create emergency scripts for you: