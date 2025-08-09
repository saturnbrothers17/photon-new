-- CREATE MISSING TABLES FOR ADVANCED SYSTEM
-- Run this script first to create all required tables before enabling RLS

-- 1. Create study_materials table
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

-- 2. Create live_tests table
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

-- 3. Create test_participants table
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

-- 4. Create student_rankings table
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

-- 5. Create material_views table
CREATE TABLE IF NOT EXISTS material_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  view_duration INTEGER DEFAULT 0, -- in seconds
  device_info JSONB DEFAULT '{}',
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create test_schedules table
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

-- 7. Update test_results table to match expected schema
-- First check if percentage column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'percentage') THEN
        ALTER TABLE test_results ADD COLUMN percentage DECIMAL(5,2);
    END IF;
END $$;

-- Add other missing columns to test_results if they don't exist
DO $$ 
BEGIN
    -- Add max_marks if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'max_marks') THEN
        ALTER TABLE test_results ADD COLUMN max_marks INTEGER;
    END IF;
    
    -- Add test_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'test_name') THEN
        ALTER TABLE test_results ADD COLUMN test_name TEXT;
    END IF;
    
    -- Add security_report if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_results' AND column_name = 'security_report') THEN
        ALTER TABLE test_results ADD COLUMN security_report JSONB DEFAULT '{}';
    END IF;
END $$;

-- 8. Create indexes for better performance
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

-- 9. Create update triggers for timestamp columns
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

-- 10. Verify tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'tests', 
    'test_results', 
    'study_materials', 
    'live_tests', 
    'test_participants', 
    'student_rankings', 
    'material_views', 
    'test_schedules',
    'user_profiles'
)
ORDER BY tablename;