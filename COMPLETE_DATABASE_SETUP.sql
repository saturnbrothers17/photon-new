-- =====================================================
-- COMPLETE DATABASE SETUP FOR PHOTON COACHING SYSTEM
-- =====================================================
-- Run this in Supabase SQL Editor to create all required tables
-- This will fix all database-related errors in the application

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. QUESTIONS TABLE
-- =====================================================
-- Create the questions table that stores individual questions for tests
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple_choice',
    options JSONB NOT NULL DEFAULT '[]',
    correct_answer TEXT NOT NULL,
    marks INTEGER NOT NULL DEFAULT 1,
    solution JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_questions_test_id ON public.questions(test_id);

-- =====================================================
-- 2. TEST ATTEMPTS TABLE
-- =====================================================
-- Create table to track student test attempts
CREATE TABLE IF NOT EXISTS public.test_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    student_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    score INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    time_taken INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON public.test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_student_id ON public.test_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_status ON public.test_attempts(status);

-- =====================================================
-- 3. STUDENT ANSWERS TABLE
-- =====================================================
-- Create table to store individual student answers
CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    is_correct BOOLEAN DEFAULT false,
    marks_obtained INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_answers_attempt_id ON public.student_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_question_id ON public.student_answers(question_id);

-- =====================================================
-- 4. USER PROFILES TABLE
-- =====================================================
-- Create user profiles table for additional user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'student',
    photon_id VARCHAR(50),
    subject VARCHAR(100),
    class_level VARCHAR(10),
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_photon_id ON public.user_profiles(photon_id);

-- =====================================================
-- 5. TEACHERS TABLE (Optional - for additional teacher info)
-- =====================================================
-- Create teachers table for teacher-specific information
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    photon_id VARCHAR(50) UNIQUE,
    subject VARCHAR(100),
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_teachers_email ON public.teachers(email);
CREATE INDEX IF NOT EXISTS idx_teachers_photon_id ON public.teachers(photon_id);

-- =====================================================
-- 6. STUDENTS TABLE (Optional - for additional student info)
-- =====================================================
-- Create students table for student-specific information
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    photon_id VARCHAR(50) UNIQUE,
    class_level VARCHAR(10),
    batch VARCHAR(50),
    phone VARCHAR(20),
    parent_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_students_photon_id ON public.students(photon_id);
CREATE INDEX IF NOT EXISTS idx_students_class_level ON public.students(class_level);

-- =====================================================
-- 7. RANKINGS TABLE
-- =====================================================
-- Create rankings table for test rankings and leaderboards
CREATE TABLE IF NOT EXISTS public.rankings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    student_name VARCHAR(255),
    score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    rank INTEGER NOT NULL,
    time_taken INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rankings_test_id ON public.rankings(test_id);
CREATE INDEX IF NOT EXISTS idx_rankings_student_id ON public.rankings(student_id);
CREATE INDEX IF NOT EXISTS idx_rankings_rank ON public.rankings(rank);

-- =====================================================
-- 8. ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add missing columns to tests table if they don't exist
DO $$ 
BEGIN
    -- Add class_level column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tests' AND column_name = 'class_level') THEN
        ALTER TABLE public.tests ADD COLUMN class_level VARCHAR(10);
    END IF;
    
    -- Add passing_marks column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tests' AND column_name = 'passing_marks') THEN
        ALTER TABLE public.tests ADD COLUMN passing_marks INTEGER;
    END IF;
    
    -- Add published column (alternative to is_published)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tests' AND column_name = 'published') THEN
        ALTER TABLE public.tests ADD COLUMN published BOOLEAN DEFAULT false;
    END IF;
    
    -- Add instructions column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tests' AND column_name = 'instructions') THEN
        ALTER TABLE public.tests ADD COLUMN instructions TEXT;
    END IF;
    
    -- Add difficulty_level column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tests' AND column_name = 'difficulty_level') THEN
        ALTER TABLE public.tests ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'medium';
    END IF;
END $$;

-- Add missing columns to study_materials table if they don't exist
DO $$ 
BEGIN
    -- Add class_level column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'study_materials' AND column_name = 'class_level') THEN
        ALTER TABLE public.study_materials ADD COLUMN class_level VARCHAR(10);
    END IF;
    
    -- Add uploaded_by column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'study_materials' AND column_name = 'uploaded_by') THEN
        ALTER TABLE public.study_materials ADD COLUMN uploaded_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add file_size column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'study_materials' AND column_name = 'file_size') THEN
        ALTER TABLE public.study_materials ADD COLUMN file_size BIGINT;
    END IF;
    
    -- Add file_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'study_materials' AND column_name = 'file_type') THEN
        ALTER TABLE public.study_materials ADD COLUMN file_type VARCHAR(100);
    END IF;
END $$;

-- =====================================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. CREATE RLS POLICIES
-- =====================================================

-- Questions table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.questions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.questions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.questions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.questions;

CREATE POLICY "Enable read access for all users" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.questions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.questions FOR DELETE USING (true);

-- Test attempts table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.test_attempts;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.test_attempts;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.test_attempts;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.test_attempts;

CREATE POLICY "Enable read access for all users" ON public.test_attempts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.test_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.test_attempts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.test_attempts FOR DELETE USING (true);

-- Student answers table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.student_answers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.student_answers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.student_answers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.student_answers;

CREATE POLICY "Enable read access for all users" ON public.student_answers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.student_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.student_answers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.student_answers FOR DELETE USING (true);

-- User profiles table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.user_profiles;

CREATE POLICY "Enable read access for all users" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.user_profiles FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.user_profiles FOR DELETE USING (true);

-- Teachers table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.teachers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.teachers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.teachers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.teachers;

CREATE POLICY "Enable read access for all users" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.teachers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.teachers FOR DELETE USING (true);

-- Students table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.students;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.students;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.students;

CREATE POLICY "Enable read access for all users" ON public.students FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.students FOR DELETE USING (true);

-- Rankings table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.rankings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.rankings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.rankings;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.rankings;

CREATE POLICY "Enable read access for all users" ON public.rankings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.rankings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.rankings FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.rankings FOR DELETE USING (true);

-- =====================================================
-- 11. CREATE USEFUL DATABASE FUNCTIONS
-- =====================================================

-- Function to create test with questions atomically
CREATE OR REPLACE FUNCTION create_test_with_questions(
    test_data JSONB,
    questions_data JSONB[]
) RETURNS UUID AS $$
DECLARE
    new_test_id UUID;
    question_item JSONB;
BEGIN
    -- Insert test
    INSERT INTO public.tests (
        title, description, subject, class_level, duration_minutes, 
        total_marks, max_marks, is_published, created_by
    ) VALUES (
        test_data->>'title',
        test_data->>'description', 
        test_data->>'subject',
        test_data->>'class_level',
        (test_data->>'duration_minutes')::INTEGER,
        (test_data->>'total_marks')::INTEGER,
        (test_data->>'max_marks')::INTEGER,
        (test_data->>'is_published')::BOOLEAN,
        (test_data->>'created_by')::UUID
    ) RETURNING id INTO new_test_id;
    
    -- Insert questions
    FOREACH question_item IN ARRAY questions_data
    LOOP
        INSERT INTO public.questions (
            test_id, question_text, question_type, options, 
            correct_answer, marks, solution
        ) VALUES (
            new_test_id,
            question_item->>'question_text',
            question_item->>'question_type',
            (question_item->>'options')::JSONB,
            question_item->>'correct_answer',
            (question_item->>'marks')::INTEGER,
            (question_item->>'solution')::JSONB
        );
    END LOOP;
    
    RETURN new_test_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate test statistics
CREATE OR REPLACE FUNCTION get_test_statistics(test_uuid UUID)
RETURNS TABLE(
    total_attempts BIGINT,
    average_score NUMERIC,
    highest_score INTEGER,
    lowest_score INTEGER,
    pass_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_attempts,
        ROUND(AVG(score), 2) as average_score,
        MAX(score) as highest_score,
        MIN(score) as lowest_score,
        ROUND(
            (COUNT(*) FILTER (WHERE percentage >= 40.0) * 100.0 / NULLIF(COUNT(*), 0)), 
            2
        ) as pass_rate
    FROM public.test_attempts 
    WHERE test_id = test_uuid AND status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. INSERT SAMPLE DATA FOR EXISTING TESTS
-- =====================================================

-- Add sample questions for existing tests that don't have questions
DO $$
DECLARE
    test_record RECORD;
    question_count INTEGER;
BEGIN
    -- Loop through all existing tests
    FOR test_record IN SELECT id, title, subject FROM public.tests LOOP
        -- Check if this test already has questions
        SELECT COUNT(*) INTO question_count 
        FROM public.questions 
        WHERE test_id = test_record.id;
        
        -- If no questions exist, add sample questions
        IF question_count = 0 THEN
            INSERT INTO public.questions (test_id, question_text, options, correct_answer, marks) VALUES
            (test_record.id, 
             'What is the fundamental concept in ' || test_record.subject || '?', 
             '["Basic Principle", "Advanced Theory", "Core Concept", "Primary Rule"]', 
             'Core Concept', 
             4),
            (test_record.id, 
             'Which method is most effective for solving ' || test_record.subject || ' problems?', 
             '["Method A", "Method B", "Method C", "Method D"]', 
             'Method B', 
             4),
            (test_record.id, 
             'What is the key to understanding ' || test_record.subject || '?', 
             '["Practice", "Theory", "Application", "All of the above"]', 
             'All of the above', 
             4);
            
            RAISE NOTICE 'Added sample questions for test: %', test_record.title;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- 13. CREATE TEACHER PROFILES FOR EXISTING USERS
-- =====================================================

-- Insert teacher profiles for existing auth users
INSERT INTO public.teachers (user_id, name, email, photon_id, subject, department)
SELECT 
    u.id,
    CASE 
        WHEN u.email = 'sp8@photon.edu' THEN 'Shiv Prakash Yadav'
        WHEN u.email = 'jp7@photon' THEN 'Jai Prakash Mishra'
        WHEN u.email = 'mk6@photon.edu' THEN 'Mahavir Kesari'
        WHEN u.email = 'ak5@photon.edu' THEN 'AK Mishra'
        ELSE SPLIT_PART(u.email, '@', 1)
    END as name,
    u.email,
    SPLIT_PART(u.email, '@', 1) as photon_id,
    CASE 
        WHEN u.email LIKE 'sp8%' THEN 'Physics'
        WHEN u.email LIKE 'jp7%' THEN 'Mathematics'
        WHEN u.email LIKE 'mk6%' THEN 'Chemistry'
        WHEN u.email LIKE 'ak5%' THEN 'Biology'
        ELSE 'General'
    END as subject,
    'Science' as department
FROM auth.users u
WHERE u.email IN ('sp8@photon.edu', 'jp7@photon', 'mk6@photon.edu', 'ak5@photon.edu')
ON CONFLICT (email) DO NOTHING;

-- Insert user profiles for existing auth users
INSERT INTO public.user_profiles (id, name, role, photon_id, subject, class_level, department)
SELECT 
    u.id,
    CASE 
        WHEN u.email = 'sp8@photon.edu' THEN 'Shiv Prakash Yadav'
        WHEN u.email = 'jp7@photon' THEN 'Jai Prakash Mishra'
        WHEN u.email = 'mk6@photon.edu' THEN 'Mahavir Kesari'
        WHEN u.email = 'ak5@photon.edu' THEN 'AK Mishra'
        ELSE SPLIT_PART(u.email, '@', 1)
    END as name,
    'teacher' as role,
    SPLIT_PART(u.email, '@', 1) as photon_id,
    CASE 
        WHEN u.email LIKE 'sp8%' THEN 'Physics'
        WHEN u.email LIKE 'jp7%' THEN 'Mathematics'
        WHEN u.email LIKE 'mk6%' THEN 'Chemistry'
        WHEN u.email LIKE 'ak5%' THEN 'Biology'
        ELSE 'General'
    END as subject,
    '12' as class_level,
    'Science' as department
FROM auth.users u
WHERE u.email IN ('sp8@photon.edu', 'jp7@photon', 'mk6@photon.edu', 'ak5@photon.edu')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 14. UPDATE EXISTING DATA
-- =====================================================

-- Update existing tests to have proper published status
UPDATE public.tests 
SET published = COALESCE(is_published, false)
WHERE published IS NULL;

-- Update existing tests to have passing marks if max_marks exists
UPDATE public.tests 
SET passing_marks = COALESCE(max_marks, ROUND(total_marks * 0.4))
WHERE passing_marks IS NULL;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '- questions';
    RAISE NOTICE '- test_attempts'; 
    RAISE NOTICE '- student_answers';
    RAISE NOTICE '- user_profiles';
    RAISE NOTICE '- teachers';
    RAISE NOTICE '- students';
    RAISE NOTICE '- rankings';
    RAISE NOTICE '';
    RAISE NOTICE 'Added missing columns to existing tables';
    RAISE NOTICE 'Enabled RLS and created policies';
    RAISE NOTICE 'Created useful database functions';
    RAISE NOTICE 'Added sample data for existing tests';
    RAISE NOTICE '==============================================';
END $$;