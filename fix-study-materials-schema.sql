-- FIX STUDY MATERIALS SCHEMA
-- Run this in your Supabase SQL Editor to fix the study materials table

-- First, let's see the current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'study_materials' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to study_materials table
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS uploaded_by TEXT;

-- Create the storage bucket for study materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'study-materials',
  'study-materials', 
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES 
  (
    'study-materials-select',
    'study-materials',
    'Allow public read access',
    'true',
    'true',
    'SELECT'
  ),
  (
    'study-materials-insert',
    'study-materials', 
    'Allow authenticated users to upload',
    'auth.role() = ''authenticated''',
    'auth.role() = ''authenticated''',
    'INSERT'
  ),
  (
    'study-materials-update',
    'study-materials',
    'Allow authenticated users to update their files', 
    'auth.role() = ''authenticated''',
    'auth.role() = ''authenticated''',
    'UPDATE'
  ),
  (
    'study-materials-delete',
    'study-materials',
    'Allow authenticated users to delete their files',
    'auth.role() = ''authenticated''',
    'auth.role() = ''authenticated''',
    'DELETE'
  )
ON CONFLICT (id) DO NOTHING;

-- Update RLS policies for study_materials table to be more permissive
DROP POLICY IF EXISTS "Enable read access for all users" ON study_materials;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON study_materials;
DROP POLICY IF EXISTS "Enable update for creators" ON study_materials;

-- Create new, more permissive policies
CREATE POLICY "Allow public read access to study materials" ON study_materials
  FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert study materials" ON study_materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow creators to update their materials" ON study_materials
  FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow creators to delete their materials" ON study_materials
  FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Insert some sample study materials for testing
INSERT INTO study_materials (title, description, subject, file_path, file_type, file_size, tags, is_public, uploaded_by, created_by)
SELECT 
  'Sample Mathematics Notes',
  'Basic algebra and geometry concepts for Class 10 students',
  'Mathematics',
  'samples/math-notes.pdf',
  'application/pdf',
  2048576,
  ARRAY['Class 10', 'Algebra', 'Geometry'],
  true,
  'JP7 Teacher',
  u.id
FROM auth.users u 
WHERE u.email = 'jp7@photon'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO study_materials (title, description, subject, file_path, file_type, file_size, tags, is_public, uploaded_by, created_by)
SELECT 
  'Physics Formulas Sheet',
  'Important physics formulas and constants',
  'Physics',
  'samples/physics-formulas.pdf',
  'application/pdf',
  1024000,
  ARRAY['Class 11', 'Class 12', 'Formulas'],
  true,
  'Mahavir Kesari',
  u.id
FROM auth.users u 
WHERE u.email = 'mk6@photon.edu'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO study_materials (title, description, subject, file_path, file_type, file_size, tags, is_public, uploaded_by, created_by)
SELECT 
  'Chemistry Lab Manual',
  'Step-by-step chemistry experiments and procedures',
  'Chemistry',
  'samples/chemistry-lab.pdf',
  'application/pdf',
  3072000,
  ARRAY['Class 11', 'Class 12', 'Lab Work'],
  true,
  'AK Mishra',
  u.id
FROM auth.users u 
WHERE u.email = 'ak5@photon.edu'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 'Study Materials Table Structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'study_materials' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Sample Study Materials:' as info;
SELECT id, title, subject, uploaded_by, created_at 
FROM study_materials 
ORDER BY created_at DESC;

SELECT 'Storage Bucket:' as info;
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'study-materials';