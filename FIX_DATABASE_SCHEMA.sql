-- COMPREHENSIVE DATABASE SCHEMA FIX
-- This script fixes all the database schema issues identified in the error logs

-- 1. Fix the tests table - add missing columns
DO $$ 
BEGIN
    -- Add is_published column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tests' AND column_name = 'is_published') THEN
        ALTER TABLE tests ADD COLUMN is_published BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_published column to tests table';
    END IF;
    
    -- Add class_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tests' AND column_name = 'class_level') THEN
        ALTER TABLE tests ADD COLUMN class_level TEXT;
        RAISE NOTICE 'Added class_level column to tests table';
    END IF;
    
    -- Add subject column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tests' AND column_name = 'subject') THEN
        ALTER TABLE tests ADD COLUMN subject TEXT;
        RAISE NOTICE 'Added subject column to tests table';
    END IF;
    
    -- Add duration_minutes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tests' AND column_name = 'duration_minutes') THEN
        ALTER TABLE tests ADD COLUMN duration_minutes INTEGER DEFAULT 60;
        RAISE NOTICE 'Added duration_minutes column to tests table';
    END IF;
    
    -- Add total_marks column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tests' AND column_name = 'total_marks') THEN
        ALTER TABLE tests ADD COLUMN total_marks INTEGER;
        RAISE NOTICE 'Added total_marks column to tests table';
    END IF;
    
    -- Add passing_marks column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tests' AND column_name = 'passing_marks') THEN
        ALTER TABLE tests ADD COLUMN passing_marks INTEGER;
        RAISE NOTICE 'Added passing_marks column to tests table';
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tests' AND column_name = 'description') THEN
        ALTER TABLE tests ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to tests table';
    END IF;
END $$;

-- 2. Fix the test_results table - add missing columns
DO $$ 
BEGIN
    -- Add percentage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'percentage') THEN
        ALTER TABLE test_results ADD COLUMN percentage DECIMAL(5,2);
        RAISE NOTICE 'Added percentage column to test_results table';
    END IF;
    
    -- Add max_marks column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'max_marks') THEN
        ALTER TABLE test_results ADD COLUMN max_marks INTEGER;
        RAISE NOTICE 'Added max_marks column to test_results table';
    END IF;
    
    -- Add test_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'test_name') THEN
        ALTER TABLE test_results ADD COLUMN test_name TEXT;
        RAISE NOTICE 'Added test_name column to test_results table';
    END IF;
    
    -- Add security_report column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'security_report') THEN
        ALTER TABLE test_results ADD COLUMN security_report JSONB DEFAULT '{}';
        RAISE NOTICE 'Added security_report column to test_results table';
    END IF;
    
    -- Add score column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'score') THEN
        ALTER TABLE test_results ADD COLUMN score INTEGER;
        RAISE NOTICE 'Added score column to test_results table';
    END IF;
END $$;

-- 3. Create study_materials table if it doesn't exist
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

-- 4. Create live_tests table if it doesn't exist
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

-- 5. Create test_participants table if it doesn't exist
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

-- 6. Create student_rankings table if it doesn't exist
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

-- 7. Create material_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS material_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  view_duration INTEGER DEFAULT 0, -- in seconds
  device_info JSONB DEFAULT '{}',
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create test_schedules table if it doesn't exist
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

-- 9. Create user_profiles table if it doesn't exist
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

-- 10. Update existing data to fix foreign key relationships
-- Update percentage column in test_results if it's null
UPDATE test_results 
SET percentage = CASE 
    WHEN max_marks > 0 THEN (score::decimal / max_marks::decimal) * 100
    ELSE 0
END
WHERE percentage IS NULL AND score IS NOT NULL AND max_marks IS NOT NULL;

-- Set default values for new columns in tests table
UPDATE tests 
SET 
    is_published = COALESCE(is_published, false),
    class_level = COALESCE(class_level, '10'),
    subject = COALESCE(subject, 'General'),
    duration_minutes = COALESCE(duration_minutes, 60),
    total_marks = COALESCE(total_marks, (
        SELECT SUM(COALESCE((q->>'marks')::integer, 4))
        FROM jsonb_array_elements(questions) q
        WHERE questions IS NOT NULL
    )),
    passing_marks = COALESCE(passing_marks, GREATEST(1, COALESCE(total_marks, 40) * 40 / 100))
WHERE 
    is_published IS NULL OR 
    class_level IS NULL OR 
    subject IS NULL OR 
    duration_minutes IS NULL OR 
    total_marks IS NULL OR 
    passing_marks IS NULL;

-- 11. Create helper functions for RLS
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

-- 12. Create helper functions for operations
CREATE OR REPLACE FUNCTION increment_material_views(material_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE study_materials 
  SET view_count = view_count + 1 
  WHERE id = material_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tests_published ON tests(is_published);
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject);
CREATE INDEX IF NOT EXISTS idx_tests_class_level ON tests(class_level);

CREATE INDEX IF NOT EXISTS idx_test_results_student_id ON test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_percentage ON test_results(percentage);

CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON study_materials(subject);
CREATE INDEX IF NOT EXISTS idx_study_materials_class_level ON study_materials(class_level);
CREATE INDEX IF NOT EXISTS idx_study_materials_active ON study_materials(is_active);

CREATE INDEX IF NOT EXISTS idx_live_tests_test_id ON live_tests(test_id);
CREATE INDEX IF NOT EXISTS idx_live_tests_active ON live_tests(is_active);
CREATE INDEX IF NOT EXISTS idx_live_tests_start_time ON live_tests(start_time);

CREATE INDEX IF NOT EXISTS idx_test_participants_live_test_id ON test_participants(live_test_id);
CREATE INDEX IF NOT EXISTS idx_test_participants_student_id ON test_participants(student_id);

CREATE INDEX IF NOT EXISTS idx_student_rankings_test_id ON student_rankings(test_id);
CREATE INDEX IF NOT EXISTS idx_student_rankings_student_id ON student_rankings(student_id);
CREATE INDEX IF NOT EXISTS idx_student_rankings_rank ON student_rankings(rank);

CREATE INDEX IF NOT EXISTS idx_material_views_material_id ON material_views(material_id);
CREATE INDEX IF NOT EXISTS idx_material_views_student_id ON material_views(student_id);

CREATE INDEX IF NOT EXISTS idx_test_schedules_test_id ON test_schedules(test_id);
CREATE INDEX IF NOT EXISTS idx_test_schedules_scheduled_date ON test_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_test_schedules_published ON test_schedules(is_published);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_photon_id ON user_profiles(photon_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 14. Create update triggers for timestamp columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to tables with updated_at columns
DROP TRIGGER IF EXISTS update_study_materials_updated_at ON study_materials;
CREATE TRIGGER update_study_materials_updated_at
    BEFORE UPDATE ON study_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_live_tests_updated_at ON live_tests;
CREATE TRIGGER update_live_tests_updated_at
    BEFORE UPDATE ON live_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_test_schedules_updated_at ON test_schedules;
CREATE TRIGGER update_test_schedules_updated_at
    BEFORE UPDATE ON test_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 15. Insert test teacher profile if it doesn't exist
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

-- 16. Verify the schema fixes
SELECT 
    'Schema Fix Verification' as check_type,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'tests', 'test_results', 'study_materials', 'live_tests', 
    'test_participants', 'student_rankings', 'material_views', 
    'test_schedules', 'user_profiles'
);

-- Check if required columns exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tests'
AND column_name IN ('is_published', 'class_level', 'subject', 'duration_minutes')
ORDER BY table_name, column_name;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'test_results'
AND column_name IN ('percentage', 'max_marks', 'test_name', 'score')
ORDER BY table_name, column_name;

-- Final success message
SELECT 'Database schema has been fixed successfully!' as status;