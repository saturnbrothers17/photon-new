# Step-by-Step Supabase Setup Guide

## 🎯 Overview
This guide will help you set up the authentication system step by step, handling missing tables and potential errors.

---

## 📋 **STEP 1: Check Current Tables**

First, let's see what tables you currently have. Run this in Supabase SQL Editor:

```sql
-- Check existing tables
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

---

## 🏗️ **STEP 2: Create Missing Tables**

Run this script to create all required tables (it will skip tables that already exist):

```sql
-- CREATE MISSING TABLES FOR ADVANCED SYSTEM
-- Run this script first to create all required tables before enabling RLS

-- 1. Create study_materials table
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  class_level TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER DEFAULT 0,
  file_type TEXT,
  view_count INTEGER DEFAULT 0,
  uploaded_by TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create live_tests table
CREATE TABLE IF NOT EXISTS live_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create test_participants table
CREATE TABLE IF NOT EXISTS test_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_test_id UUID REFERENCES live_tests(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'in_progress', 'completed', 'disconnected')),
  current_question INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create student_rankings table
CREATE TABLE IF NOT EXISTS student_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_marks INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  rank INTEGER,
  percentile DECIMAL(5,2),
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create material_views table
CREATE TABLE IF NOT EXISTS material_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  view_duration INTEGER DEFAULT 0, -- in seconds
  device_info JSONB DEFAULT '{}',
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create test_schedules table
CREATE TABLE IF NOT EXISTS test_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  max_participants INTEGER,
  instructions TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔧 **STEP 3: Fix test_results Table**

Add missing columns to the test_results table:

```sql
-- Update test_results table to match expected schema
DO $$ 
BEGIN
    -- Add percentage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'percentage') THEN
        ALTER TABLE test_results ADD COLUMN percentage DECIMAL(5,2);
    END IF;
    
    -- Add max_marks if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'max_marks') THEN
        ALTER TABLE test_results ADD COLUMN max_marks INTEGER;
    END IF;
    
    -- Add test_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'test_name') THEN
        ALTER TABLE test_results ADD COLUMN test_name TEXT;
    END IF;
    
    -- Add security_report if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'security_report') THEN
        ALTER TABLE test_results ADD COLUMN security_report JSONB DEFAULT '{}';
    END IF;
END $$;
```

---

## 👤 **STEP 4: Create User Profiles System**

```sql
-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
  name TEXT,
  photon_id TEXT UNIQUE,
  subject TEXT,
  class_level TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create helper functions
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_teacher(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'teacher' 
    FROM user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_student(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'student' 
    FROM user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔐 **STEP 5: Enable RLS Safely**

```sql
-- Function to safely enable RLS on a table if it exists
CREATE OR REPLACE FUNCTION safe_enable_rls(table_name text)
RETURNS void AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = $1) THEN
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', $1);
        RAISE NOTICE 'RLS enabled on table: %', $1;
    ELSE
        RAISE NOTICE 'Table % does not exist, skipping RLS', $1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on existing tables
SELECT safe_enable_rls('tests');
SELECT safe_enable_rls('test_results');
SELECT safe_enable_rls('study_materials');
SELECT safe_enable_rls('live_tests');
SELECT safe_enable_rls('test_participants');
SELECT safe_enable_rls('student_rankings');
SELECT safe_enable_rls('material_views');
SELECT safe_enable_rls('test_schedules');
SELECT safe_enable_rls('user_profiles');

-- Clean up
DROP FUNCTION safe_enable_rls(text);
```

---

## 🛡️ **STEP 6: Create Essential RLS Policies**

Only create policies for core tables that definitely exist:

```sql
-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Tests policies (if tests table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tests') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Teachers can manage all tests" ON tests;
        DROP POLICY IF EXISTS "Students can view published tests" ON tests;
        
        -- Create new policies
        EXECUTE 'CREATE POLICY "Teachers can manage all tests" ON tests FOR ALL USING (is_teacher(auth.uid()))';
        EXECUTE 'CREATE POLICY "Students can view published tests" ON tests FOR SELECT USING (is_published = true OR is_teacher(auth.uid()))';
    END IF;
END $$;

-- Test results policies (if test_results table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_results') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Teachers can view all test results" ON test_results;
        DROP POLICY IF EXISTS "Students can view their own results" ON test_results;
        DROP POLICY IF EXISTS "Students can insert their own results" ON test_results;
        DROP POLICY IF EXISTS "Teachers can insert any results" ON test_results;
        
        -- Create new policies
        EXECUTE 'CREATE POLICY "Teachers can view all test results" ON test_results FOR SELECT USING (is_teacher(auth.uid()))';
        EXECUTE 'CREATE POLICY "Students can view their own results" ON test_results FOR SELECT USING (student_id = auth.uid()::text OR is_teacher(auth.uid()))';
        EXECUTE 'CREATE POLICY "Students can insert their own results" ON test_results FOR INSERT WITH CHECK (student_id = auth.uid()::text)';
        EXECUTE 'CREATE POLICY "Teachers can insert any results" ON test_results FOR INSERT WITH CHECK (is_teacher(auth.uid()))';
    END IF;
END $$;
```

---

## 👨‍🏫 **STEP 7: Create Test Teacher Profile**

```sql
-- Insert the test teacher profile
INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department)
SELECT 
  id, 
  email, 
  'teacher', 
  'JP7 Teacher', 
  'jp7', 
  'Physics', 
  'Science'
FROM auth.users 
WHERE email = 'jp7@photon'
ON CONFLICT (id) DO UPDATE SET
  role = 'teacher',
  name = 'JP7 Teacher',
  photon_id = 'jp7',
  subject = 'Physics',
  department = 'Science',
  updated_at = NOW();
```

---

## 📊 **STEP 8: Create Performance Indexes**

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_photon_id ON user_profiles(photon_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Only create indexes for tables that exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_results') THEN
        CREATE INDEX IF NOT EXISTS idx_test_results_student_id ON test_results(student_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'study_materials') THEN
        CREATE INDEX IF NOT EXISTS idx_study_materials_active ON study_materials(is_active);
        CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON study_materials(subject);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_tests') THEN
        CREATE INDEX IF NOT EXISTS idx_live_tests_active ON live_tests(is_active);
        CREATE INDEX IF NOT EXISTS idx_live_tests_test_id ON live_tests(test_id);
    END IF;
END $$;
```

---

## ✅ **STEP 9: Verify Setup**

```sql
-- Verify all tables exist
SELECT 
    tablename,
    schemaname,
    CASE 
        WHEN tablename IN ('tests', 'test_results', 'user_profiles') THEN 'Core Table'
        WHEN tablename IN ('study_materials', 'live_tests', 'test_participants') THEN 'Advanced Feature'
        WHEN tablename IN ('student_rankings', 'material_views', 'test_schedules') THEN 'Analytics & Scheduling'
        ELSE 'Other'
    END as table_type
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'tests', 'test_results', 'study_materials', 'live_tests', 
    'test_participants', 'student_rankings', 'material_views', 
    'test_schedules', 'user_profiles'
)
ORDER BY table_type, tablename;

-- Verify test user profile
SELECT 
    email,
    role,
    name,
    photon_id,
    subject,
    department
FROM user_profiles 
WHERE email = 'jp7@photon';

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'tests', 'test_results', 'study_materials', 'live_tests', 
    'test_participants', 'student_rankings', 'material_views', 
    'test_schedules', 'user_profiles'
)
ORDER BY tablename;
```

---

## 🧪 **STEP 10: Test the Setup**

After running all the scripts, test the authentication:

```bash
# Test authentication
node test-authenticated-api.js

# Test login in browser
# Navigate to: http://localhost:3002/faculty-portal
# Login with: jp7@photon / jp7@photon
```

---

## 🔧 **Troubleshooting**

### If you get "relation does not exist" errors:
1. Run STEP 2 to create missing tables
2. Skip the problematic table in RLS setup
3. The system will work with basic tables

### If you get "permission denied" errors:
1. Make sure you're running as database owner
2. Check that user has proper permissions
3. Try running scripts one by one

### If policies fail to create:
1. Drop existing policies first
2. Check that helper functions exist
3. Policies are optional for basic functionality

---

## 🎉 **Minimum Working Setup**

For basic authentication to work, you only need:
1. ✅ `user_profiles` table
2. ✅ Helper functions (`is_teacher`, `is_student`)
3. ✅ Test teacher profile
4. ✅ Basic RLS on `user_profiles`

The advanced features (live tests, materials, rankings) can be added later!

---

## 📞 **Need Help?**

If you encounter issues:
1. Run each step individually
2. Check the error messages carefully
3. Skip optional features if they cause problems
4. The basic authentication will work with minimal setup