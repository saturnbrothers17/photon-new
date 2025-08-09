-- Study Materials Setup Script
-- Run this in your Supabase SQL editor

-- Create study_materials table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    subject TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT true,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON public.study_materials
    FOR SELECT USING (is_public = true);

CREATE POLICY "Allow authenticated users to upload" ON public.study_materials
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own materials" ON public.study_materials
    FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Allow users to delete their own materials" ON public.study_materials
    FOR DELETE USING (auth.uid() = uploaded_by);

-- Create storage bucket for study materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('study-materials', 'study-materials', true, 52428800, ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp'
]) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow public read access to study materials" ON storage.objects
    FOR SELECT USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = 'public');

CREATE POLICY "Allow authenticated users to upload study materials" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'study-materials' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Allow users to update their own materials" ON storage.objects
    FOR UPDATE USING (auth.uid() = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own materials" ON storage.objects
    FOR DELETE USING (auth.uid() = (storage.foldername(name))[1]);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON public.study_materials(subject);
CREATE INDEX IF NOT EXISTS idx_study_materials_created_at ON public.study_materials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_materials_uploaded_by ON public.study_materials(uploaded_by);
