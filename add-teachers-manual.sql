
-- Add teachers to Supabase manually
-- Run this in your Supabase SQL editor

-- First, let's check if the user_profiles table exists and has the right structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';

-- Insert teacher profiles (you'll need to create auth users first through Supabase dashboard)
-- Or use these INSERT statements after creating auth users

-- For now, let's create placeholder entries that can be updated when users sign up
INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department, is_active)
VALUES 
  (gen_random_uuid(), 'sp8@photon.edu', 'teacher', 'Shiv Prakash Yadav', 'sp8@photon', 'Mathematics', 'Science', true),
  (gen_random_uuid(), 'mk6@photon.edu', 'teacher', 'Mahavir Kesari', 'mk6@photon', 'Physics', 'Science', true),
  (gen_random_uuid(), 'ak5@photon.edu', 'teacher', 'AK Mishra', 'ak5@photon', 'Chemistry', 'Science', true)
ON CONFLICT (photon_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  subject = EXCLUDED.subject,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the insertion
SELECT * FROM user_profiles WHERE role = 'teacher';
