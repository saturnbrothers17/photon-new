-- SIMPLE TEACHER CREATION FOR SUPABASE
-- This script creates the minimum required data
-- Run this in Supabase SQL Editor after creating auth users manually

-- First, check current teachers
SELECT 'Current Teachers:' as info;
SELECT name, email, photon_id, role, is_active 
FROM user_profiles 
WHERE role = 'teacher';

-- If you've already created the auth users manually in Supabase Dashboard,
-- this will ensure their profiles are properly set up

-- Update existing profiles or create new ones for teachers
-- (This assumes auth users already exist)

-- For Shiv Prakash Yadav (sp8@photon.edu)
INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department, is_active)
SELECT 
  u.id,
  'sp8@photon.edu',
  'teacher',
  'Shiv Prakash Yadav',
  'sp8@photon',
  'Mathematics',
  'Science',
  true
FROM auth.users u
WHERE u.email = 'sp8@photon.edu'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = u.id);

-- For Mahavir Kesari (mk6@photon.edu)
INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department, is_active)
SELECT 
  u.id,
  'mk6@photon.edu',
  'teacher',
  'Mahavir Kesari',
  'mk6@photon',
  'Physics',
  'Science',
  true
FROM auth.users u
WHERE u.email = 'mk6@photon.edu'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = u.id);

-- For AK Mishra (ak5@photon.edu)
INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department, is_active)
SELECT 
  u.id,
  'ak5@photon.edu',
  'teacher',
  'AK Mishra',
  'ak5@photon',
  'Chemistry',
  'Science',
  true
FROM auth.users u
WHERE u.email = 'ak5@photon.edu'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = u.id);

-- Update existing profiles if they already exist
UPDATE user_profiles 
SET 
  role = 'teacher',
  name = 'Shiv Prakash Yadav',
  photon_id = 'sp8@photon',
  subject = 'Mathematics',
  department = 'Science',
  is_active = true,
  updated_at = NOW()
WHERE email = 'sp8@photon.edu';

UPDATE user_profiles 
SET 
  role = 'teacher',
  name = 'Mahavir Kesari',
  photon_id = 'mk6@photon',
  subject = 'Physics',
  department = 'Science',
  is_active = true,
  updated_at = NOW()
WHERE email = 'mk6@photon.edu';

UPDATE user_profiles 
SET 
  role = 'teacher',
  name = 'AK Mishra',
  photon_id = 'ak5@photon',
  subject = 'Chemistry',
  department = 'Science',
  is_active = true,
  updated_at = NOW()
WHERE email = 'ak5@photon.edu';

-- Final verification
SELECT 'Final Teacher List:' as info;
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

-- Check if auth users exist
SELECT 'Auth Users Check:' as info;
SELECT 
  email,
  email_confirmed_at IS NOT NULL as confirmed,
  created_at
FROM auth.users 
WHERE email IN ('sp8@photon.edu', 'mk6@photon.edu', 'ak5@photon.edu', 'jp7@photon')
ORDER BY created_at;