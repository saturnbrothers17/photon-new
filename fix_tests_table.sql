-- Fix tests table schema issues
-- Check current structure first
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'tests' AND table_schema = 'public';

-- Add missing columns to tests table
ALTER TABLE public.tests 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS max_marks INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS created_by TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create live_tests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.live_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.test_results (
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tests_is_active ON public.tests(is_active);
CREATE INDEX IF NOT EXISTS idx_tests_created_by ON public.tests(created_by);
CREATE INDEX IF NOT EXISTS idx_live_tests_is_active ON public.live_tests(is_active);
CREATE INDEX IF NOT EXISTS idx_test_results_student_id ON public.test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON public.test_results(test_id);

-- Insert sample test data
INSERT INTO public.tests (title, subject, duration_minutes, max_marks, instructions, created_by, is_active) VALUES
('Mathematics Mock Test', 'Mathematics', 60, 100, 'Complete all questions within the time limit', 'demo@teacher.com', true),
('Physics Practice Test', 'Physics', 45, 75, 'Focus on conceptual understanding', 'demo@teacher.com', true),
('Chemistry Quiz', 'Chemistry', 30, 50, 'Multiple choice questions only', 'demo@teacher.com', false);

-- Insert sample live test
INSERT INTO public.live_tests (test_id, start_time, end_time, is_active) 
SELECT id, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour', true 
FROM public.tests 
WHERE title = 'Mathematics Mock Test';

-- Verify data
SELECT * FROM public.tests ORDER BY created_at DESC;
SELECT * FROM public.live_tests ORDER BY created_at DESC;
