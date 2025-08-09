-- First, check what columns actually exist
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'study_materials' AND table_schema = 'public';

-- If table exists but has different columns, drop and recreate or alter
-- Option 1: Drop and recreate (if you don't have important data)
DROP TABLE IF EXISTS public.study_materials CASCADE;

-- Option 2: Alter existing table (if you have data to preserve)
-- ALTER TABLE public.study_materials 
-- ADD COLUMN IF NOT EXISTS file_name TEXT,
-- ADD COLUMN IF NOT EXISTS file_type TEXT,
-- ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Create the table with correct schema
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table exists
ALTER TABLE public.study_materials 
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Create storage bucket for study materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('study-materials', 'study-materials', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for study_materials table
CREATE POLICY "Allow public read access" ON public.study_materials
    FOR SELECT USING (is_public = true);

CREATE POLICY "Allow authenticated users to upload" ON public.study_materials
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own materials" ON public.study_materials
    FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Allow users to delete their own materials" ON public.study_materials
    FOR DELETE USING (uploaded_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON public.study_materials(subject);
CREATE INDEX IF NOT EXISTS idx_study_materials_is_public ON public.study_materials(is_public);
CREATE INDEX IF NOT EXISTS idx_study_materials_uploaded_by ON public.study_materials(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_study_materials_created_at ON public.study_materials(created_at DESC);

-- Insert sample data for testing
INSERT INTO public.study_materials (title, description, subject, file_path, file_type, file_size, uploaded_by) VALUES
('Algebra Basics', 'Introduction to algebraic concepts', 'Mathematics', 'study-materials/algebra-basics.pdf', 'application/pdf', 1024000, 'test-teacher'),
('Physics Formulas', 'Essential physics formulas and concepts', 'Physics', 'study-materials/physics-formulas.pdf', 'application/pdf', 2048000, 'test-teacher');

-- Verify setup
SELECT * FROM public.study_materials ORDER BY created_at DESC;
