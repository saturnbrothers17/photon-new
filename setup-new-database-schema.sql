-- SETUP DATABASE SCHEMA FOR NEW SUPABASE PROJECT
-- Run this in your new Supabase project: https://qlzxzpibxqsynmnjjvne.supabase.co
-- Go to SQL Editor and run this script

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
  name TEXT,
  photon_id TEXT UNIQUE,
  subject TEXT,
  class_level TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT false,
  time_limit INTEGER,
  total_marks INTEGER DEFAULT 0
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES tests(id),
  student_id TEXT NOT NULL,
  student_name TEXT,
  answers JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  total_marks INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  time_taken INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_materials table
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  subject TEXT,
  class_level TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create live_tests table
CREATE TABLE IF NOT EXISTS live_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_participants table
CREATE TABLE IF NOT EXISTS test_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES live_tests(id),
  student_id TEXT NOT NULL,
  student_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  answers JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false
);

-- Create student_rankings table
CREATE TABLE IF NOT EXISTS student_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT,
  total_tests INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  average_percentage DECIMAL(5,2) DEFAULT 0,
  rank_position INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create material_views table
CREATE TABLE IF NOT EXISTS material_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES study_materials(id),
  student_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_duration INTEGER -- in seconds
);

-- Create test_schedules table
CREATE TABLE IF NOT EXISTS test_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES tests(id),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER, -- in minutes
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_schedules ENABLE ROW LEVEL SECURITY;

-- Create user profile creation function
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role, name, photon_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'photon_id', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Create function to update user profile timestamp
CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
DROP TRIGGER IF EXISTS update_user_profile_timestamp_trigger ON user_profiles;
CREATE TRIGGER update_user_profile_timestamp_trigger
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_timestamp();

-- Create basic RLS policies
-- User profiles policies
CREATE POLICY "Enable read access for all users" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable update for users based on id" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Tests policies
CREATE POLICY "Enable read access for all users" ON tests FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON tests FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Enable update for creators" ON tests FOR UPDATE USING (auth.uid() = created_by);

-- Test results policies
CREATE POLICY "Enable read access for all users" ON test_results FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON test_results FOR INSERT WITH CHECK (true);

-- Study materials policies
CREATE POLICY "Enable read access for all users" ON study_materials FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON study_materials FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Enable update for creators" ON study_materials FOR UPDATE USING (auth.uid() = created_by);

-- Live tests policies
CREATE POLICY "Enable read access for all users" ON live_tests FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON live_tests FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Test participants policies
CREATE POLICY "Enable read access for all users" ON test_participants FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON test_participants FOR INSERT WITH CHECK (true);

-- Student rankings policies
CREATE POLICY "Enable read access for all users" ON student_rankings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON student_rankings FOR INSERT WITH CHECK (true);

-- Material views policies
CREATE POLICY "Enable read access for all users" ON material_views FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON material_views FOR INSERT WITH CHECK (true);

-- Test schedules policies
CREATE POLICY "Enable read access for all users" ON test_schedules FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON test_schedules FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_photon_id ON user_profiles(photon_id);
CREATE INDEX IF NOT EXISTS idx_test_results_student_id ON test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_participants_student_id ON test_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_student_rankings_student_id ON student_rankings(student_id);
CREATE INDEX IF NOT EXISTS idx_material_views_student_id ON material_views(student_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert user profiles for existing auth users
INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department, is_active)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'role', 'teacher'),
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'photon_id', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'subject',
  u.raw_user_meta_data->>'department',
  true
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = u.id);

-- Verify the setup
SELECT 'Database setup complete!' as status;
SELECT 'Auth users:' as info, COUNT(*) as count FROM auth.users;
SELECT 'User profiles:' as info, COUNT(*) as count FROM user_profiles;
SELECT 'Teachers:' as info, COUNT(*) as count FROM user_profiles WHERE role = 'teacher';