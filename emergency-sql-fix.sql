-- EMERGENCY SQL FIX FOR SUPABASE USER CREATION
-- Run this in Supabase Dashboard → SQL Editor
-- WARNING: This bypasses normal auth security

-- Step 1: Analyze current auth.users structure
SELECT 'Current auth.users structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- Step 2: Check existing user for reference
SELECT 'Existing user reference:' as info;
SELECT id, email, instance_id, aud, role, created_at, email_confirmed_at IS NOT NULL as confirmed
FROM auth.users 
WHERE email = 'jp7@photon'
LIMIT 1;

-- Step 3: Emergency user creation
-- Copy structure from existing working user
DO $$
DECLARE
    ref_user RECORD;
    new_user_1 UUID := gen_random_uuid();
    new_user_2 UUID := gen_random_uuid();
    new_user_3 UUID := gen_random_uuid();
BEGIN
    -- Get reference user data
    SELECT * INTO ref_user FROM auth.users WHERE email = 'jp7@photon' LIMIT 1;
    
    IF ref_user.id IS NOT NULL THEN
        -- Create Teacher 1: Shiv Prakash Yadav
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role, aud, confirmation_token, recovery_token,
            email_change_token_new, email_change, phone, phone_confirmed_at,
            phone_change, phone_change_token, phone_change_sent_at,
            confirmed_at, email_change_sent_at, recovery_sent_at,
            invited_at, action_link, email_change_token_current,
            email_change_confirm_status, banned_until, reauthentication_token,
            reauthentication_sent_at, is_sso_user, deleted_at
        ) VALUES (
            new_user_1,
            ref_user.instance_id,
            'sp8@photon.edu',
            ref_user.encrypted_password, -- Same password hash as jp7
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Shiv Prakash Yadav", "role": "teacher", "photon_id": "sp8@photon", "subject": "Mathematics", "department": "Science"}',
            false,
            'authenticated',
            'authenticated',
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
            NOW(), NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL,
            COALESCE(ref_user.is_sso_user, false),
            NULL
        );

        -- Create Teacher 2: Mahavir Kesari
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role, aud, confirmation_token, recovery_token,
            email_change_token_new, email_change, phone, phone_confirmed_at,
            phone_change, phone_change_token, phone_change_sent_at,
            confirmed_at, email_change_sent_at, recovery_sent_at,
            invited_at, action_link, email_change_token_current,
            email_change_confirm_status, banned_until, reauthentication_token,
            reauthentication_sent_at, is_sso_user, deleted_at
        ) VALUES (
            new_user_2,
            ref_user.instance_id,
            'mk6@photon.edu',
            ref_user.encrypted_password,
            NOW(), NOW(), NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Mahavir Kesari", "role": "teacher", "photon_id": "mk6@photon", "subject": "Physics", "department": "Science"}',
            false, 'authenticated', 'authenticated',
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
            NOW(), NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL,
            COALESCE(ref_user.is_sso_user, false), NULL
        );

        -- Create Teacher 3: AK Mishra
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role, aud, confirmation_token, recovery_token,
            email_change_token_new, email_change, phone, phone_confirmed_at,
            phone_change, phone_change_token, phone_change_sent_at,
            confirmed_at, email_change_sent_at, recovery_sent_at,
            invited_at, action_link, email_change_token_current,
            email_change_confirm_status, banned_until, reauthentication_token,
            reauthentication_sent_at, is_sso_user, deleted_at
        ) VALUES (
            new_user_3,
            ref_user.instance_id,
            'ak5@photon.edu',
            ref_user.encrypted_password,
            NOW(), NOW(), NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "AK Mishra", "role": "teacher", "photon_id": "ak5@photon", "subject": "Chemistry", "department": "Science"}',
            false, 'authenticated', 'authenticated',
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
            NOW(), NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL,
            COALESCE(ref_user.is_sso_user, false), NULL
        );

        -- Create corresponding user profiles
        INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department, is_active, created_at)
        VALUES 
        (new_user_1, 'sp8@photon.edu', 'teacher', 'Shiv Prakash Yadav', 'sp8@photon', 'Mathematics', 'Science', true, NOW()),
        (new_user_2, 'mk6@photon.edu', 'teacher', 'Mahavir Kesari', 'mk6@photon', 'Physics', 'Science', true, NOW()),
        (new_user_3, 'ak5@photon.edu', 'teacher', 'AK Mishra', 'ak5@photon', 'Chemistry', 'Science', true, NOW());

        RAISE NOTICE 'Successfully created 3 teachers via emergency SQL injection';
    ELSE
        RAISE EXCEPTION 'Reference user jp7@photon not found';
    END IF;
END $$;

-- Step 4: Verify creation
SELECT 'VERIFICATION - Auth Users:' as info;
SELECT email, created_at, email_confirmed_at IS NOT NULL as confirmed
FROM auth.users 
ORDER BY created_at;

SELECT 'VERIFICATION - User Profiles:' as info;
SELECT name, email, photon_id, role, subject
FROM user_profiles 
WHERE role = 'teacher'
ORDER BY created_at;

-- Step 5: Count totals
SELECT 
    'SUMMARY' as info,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM user_profiles WHERE role = 'teacher') as total_teachers;

-- If this works, all teachers will have the same password as jp7@photon
-- They can change it after first login