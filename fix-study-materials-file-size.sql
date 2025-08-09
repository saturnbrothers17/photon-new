-- Fix study materials table to include file_size and file_type columns
-- This ensures proper storage tracking and display

-- Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'study_materials' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add file_size column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'study_materials' AND column_name = 'file_size') THEN
        ALTER TABLE public.study_materials ADD COLUMN file_size BIGINT DEFAULT 0;
        RAISE NOTICE 'Added file_size column to study_materials table';
    ELSE
        RAISE NOTICE 'file_size column already exists in study_materials table';
    END IF;
END $$;

-- Add file_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'study_materials' AND column_name = 'file_type') THEN
        ALTER TABLE public.study_materials ADD COLUMN file_type VARCHAR(100) DEFAULT 'application/pdf';
        RAISE NOTICE 'Added file_type column to study_materials table';
    ELSE
        RAISE NOTICE 'file_type column already exists in study_materials table';
    END IF;
END $$;

-- Update existing records with default values if they have NULL file_size
UPDATE public.study_materials 
SET file_size = 0 
WHERE file_size IS NULL;

-- Update existing records with default file_type if they have NULL file_type
UPDATE public.study_materials 
SET file_type = 'application/pdf' 
WHERE file_type IS NULL OR file_type = '';

-- Show updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'study_materials' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data to verify
SELECT id, title, subject, file_size, file_type, created_at 
FROM public.study_materials 
ORDER BY created_at DESC 
LIMIT 5;