-- Simple fix for tests table
-- First, check if table exists and drop if needed
DROP TABLE IF EXISTS public.tests CASCADE;
DROP TABLE IF EXISTS public.live_tests CASCADE;

-- Create tests table with correct schema
CREATE TABLE public.tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    max_marks INTEGER DEFAULT 100,
    instructions TEXT DEFAULT 'Follow all test instructions carefully',
    created_by TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create live_tests table
CREATE TABLE public.live_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data with TEXT for created_by
INSERT INTO public.tests (title, subject, duration_minutes, max_marks, instructions, created_by, is_active) VALUES
('Mathematics Mock Test', 'Mathematics', 60, 100, 'Complete all questions within the time limit', 'demo@teacher.com', true),
('Physics Practice Test', 'Physics', 45, 75, 'Focus on conceptual understanding', 'demo@teacher.com', true);

-- Verify
SELECT * FROM public.tests;
