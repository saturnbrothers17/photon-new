-- CREATE TEACHERS IN SUPABASE
-- Run this script in your Supabase SQL Editor
-- Go to: Supabase Dashboard → SQL Editor → New Query

-- This script creates auth users and their profiles for the three teachers

-- Create auth users using Supabase's auth.users table
-- Note: This approach directly inserts into auth.users which may not work in all cases
-- If this fails, use the Supabase Dashboard method instead

-- Teacher 1: Shiv Prakash Yadav
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
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'sp8@photon.edu',
  crypt('sp8@photon', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Shiv Prakash Yadav", "role": "teacher", "photon_id": "sp8@photon", "subject": "Mathematics", "department": "Science"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Teacher 2: Mahavir Kesari
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
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'mk6@photon.edu',
  crypt('mk6@photon', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Mahavir Kesari", "role": "teacher", "photon_id": "mk6@photon", "subject": "Physics", "department": "Science"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Teacher 3: AK Mishra
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
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'ak5@photon.edu',
  crypt('ak5@photon', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "AK Mishra", "role": "teacher", "photon_id": "ak5@photon", "subject": "Chemistry", "department": "Science"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- The user_profiles should be automatically created by the trigger
-- But let's ensure they exist with correct data

-- Wait a moment for triggers to execute, then ensure profiles exist
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through each new user and ensure their profile exists
  FOR user_record IN 
    SELECT id, email, raw_user_meta_data
    FROM auth.users 
    WHERE email IN ('sp8@photon.edu', 'mk6@photon.edu', 'ak5@photon.edu')
  LOOP
    -- Insert or update the user profile
    INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department, is_active)
    VALUES (
      user_record.id,
      user_record.email,
      'teacher',
      user_record.raw_user_meta_data->>'name',
      user_record.raw_user_meta_data->>'photon_id',
      user_record.raw_user_meta_data->>'subject',
      user_record.raw_user_meta_data->>'department',
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'teacher',
      name = EXCLUDED.name,
      photon_id = EXCLUDED.photon_id,
      subject = EXCLUDED.subject,
      department = EXCLUDED.department,
      is_active = true,
      updated_at = NOW();
  END LOOP;
END $$;

-- Verify the creation
SELECT 
  'Auth Users' as table_name,
  email,
  created_at,
  email_confirmed_at IS NOT NULL as confirmed
FROM auth.users 
WHERE email IN ('sp8@photon.edu', 'mk6@photon.edu', 'ak5@photon.edu')

UNION ALL

SELECT 
  'User Profiles' as table_name,
  email,
  created_at,
  is_active::text as confirmed
FROM user_profiles 
WHERE email IN ('sp8@photon.edu', 'mk6@photon.edu', 'ak5@photon.edu')
ORDER BY table_name, email;

-- Show final teacher list
SELECT 
  name,
  email,
  photon_id,
  subject,
  department,
  is_active,
  created_at
FROM user_profiles 
WHERE role = 'teacher'
ORDER BY created_at;