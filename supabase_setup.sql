-- Create study_materials table with correct schema
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_study_materials_updated_at BEFORE UPDATE ON public.study_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
