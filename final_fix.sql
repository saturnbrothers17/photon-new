-- Final fix for tests table schema
-- Drop existing tables and create with correct structure
DROP TABLE IF EXISTS public.tests CASCADE;
DROP TABLE IF EXISTS public.live_tests CASCADE;
DROP TABLE IF EXISTS public.test_results CASCADE;

-- Create tests table with all required columns
CREATE TABLE public.tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    max_marks INTEGER DEFAULT 100,
    instructions TEXT DEFAULT 'Follow all test instructions carefully',
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour',
    is_active BOOLEAN DEFAULT true,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_results table
CREATE TABLE public.test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    answers JSONB DEFAULT '{}',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data with proper timestamps
INSERT INTO public.tests (title, subject, description, duration_minutes, max_marks, start_time, end_time, is_active, created_by) VALUES
('Mathematics Mock Test', 'Mathematics', 'Comprehensive algebra and geometry test', 60, 100, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '30 minutes', true, 'demo@teacher.com'),
('Physics Practice Test', 'Physics', 'Mechanics and thermodynamics concepts', 45, 75, NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '45 minutes', true, 'demo@teacher.com'),
('Chemistry Quiz', 'Chemistry', 'Basic chemical reactions and equations', 30, 50, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '2 hours', false, 'demo@teacher.com');

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tests_is_active ON public.tests(is_active);
CREATE INDEX IF NOT EXISTS idx_tests_created_by ON public.tests(created_by);
CREATE INDEX IF NOT EXISTS idx_tests_start_time ON public.tests(start_time);
CREATE INDEX IF NOT EXISTS idx_tests_end_time ON public.tests(end_time);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON public.test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_student_id ON public.test_results(student_id);

-- Verify data
SELECT * FROM public.tests ORDER BY created_at DESC;
