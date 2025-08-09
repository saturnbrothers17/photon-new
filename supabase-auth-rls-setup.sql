-- SUPABASE AUTHENTICATION & RLS SETUP
-- This script sets up proper authentication and Row Level Security

-- Enable RLS on all tables
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_schedules ENABLE ROW LEVEL SECURITY;

-- Create user profiles table to store additional user information
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

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is teacher
CREATE OR REPLACE FUNCTION is_teacher(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'teacher' 
    FROM user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is student
CREATE OR REPLACE FUNCTION is_student(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'student' 
    FROM user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teachers can view all profiles" ON user_profiles
  FOR SELECT USING (is_teacher(auth.uid()));

-- RLS Policies for tests
CREATE POLICY "Teachers can manage all tests" ON tests
  FOR ALL USING (is_teacher(auth.uid()));

CREATE POLICY "Students can view published tests" ON tests
  FOR SELECT USING (is_published = true OR is_teacher(auth.uid()));

-- RLS Policies for test_results
CREATE POLICY "Teachers can view all test results" ON test_results
  FOR SELECT USING (is_teacher(auth.uid()));

CREATE POLICY "Students can view their own results" ON test_results
  FOR SELECT USING (student_id = auth.uid()::text OR is_teacher(auth.uid()));

CREATE POLICY "Students can insert their own results" ON test_results
  FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Teachers can insert any results" ON test_results
  FOR INSERT WITH CHECK (is_teacher(auth.uid()));

-- RLS Policies for study_materials
CREATE POLICY "Teachers can manage study materials" ON study_materials
  FOR ALL USING (is_teacher(auth.uid()));

CREATE POLICY "Students can view active materials" ON study_materials
  FOR SELECT USING (is_active = true OR is_teacher(auth.uid()));

-- RLS Policies for live_tests
CREATE POLICY "Teachers can manage live tests" ON live_tests
  FOR ALL USING (is_teacher(auth.uid()));

CREATE POLICY "Students can view active live tests" ON live_tests
  FOR SELECT USING (is_active = true OR is_teacher(auth.uid()));

-- RLS Policies for test_participants
CREATE POLICY "Teachers can view all participants" ON test_participants
  FOR SELECT USING (is_teacher(auth.uid()));

CREATE POLICY "Students can view their own participation" ON test_participants
  FOR SELECT USING (student_id = auth.uid()::text OR is_teacher(auth.uid()));

CREATE POLICY "Students can join tests" ON test_participants
  FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can update their participation" ON test_participants
  FOR UPDATE USING (student_id = auth.uid()::text OR is_teacher(auth.uid()));

-- RLS Policies for student_rankings
CREATE POLICY "Teachers can view all rankings" ON student_rankings
  FOR SELECT USING (is_teacher(auth.uid()));

CREATE POLICY "Students can view their own rankings" ON student_rankings
  FOR SELECT USING (student_id = auth.uid()::text OR is_teacher(auth.uid()));

CREATE POLICY "Teachers can manage rankings" ON student_rankings
  FOR ALL USING (is_teacher(auth.uid()));

-- RLS Policies for material_views
CREATE POLICY "Teachers can view all material views" ON material_views
  FOR SELECT USING (is_teacher(auth.uid()));

CREATE POLICY "Students can view their own material views" ON material_views
  FOR SELECT USING (student_id = auth.uid()::text OR is_teacher(auth.uid()));

CREATE POLICY "Students can track their views" ON material_views
  FOR INSERT WITH CHECK (student_id = auth.uid()::text);

-- RLS Policies for test_schedules
CREATE POLICY "Teachers can manage test schedules" ON test_schedules
  FOR ALL USING (is_teacher(auth.uid()));

CREATE POLICY "Students can view published schedules" ON test_schedules
  FOR SELECT USING (is_published = true OR is_teacher(auth.uid()));

-- Create trigger to automatically create user profile on signup
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

-- Create trigger
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

-- Insert the test teacher profile if it doesn't exist
INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department)
SELECT 
  id, 
  email, 
  'teacher', 
  'JP7 Teacher', 
  'jp7', 
  'Physics', 
  'Science'
FROM auth.users 
WHERE email = 'jp7@photon'
ON CONFLICT (id) DO UPDATE SET
  role = 'teacher',
  name = 'JP7 Teacher',
  photon_id = 'jp7',
  subject = 'Physics',
  department = 'Science',
  updated_at = NOW();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_photon_id ON user_profiles(photon_id);
CREATE INDEX IF NOT EXISTS idx_test_results_student_id ON test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_participants_student_id ON test_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_student_rankings_student_id ON student_rankings(student_id);
CREATE INDEX IF NOT EXISTS idx_material_views_student_id ON material_views(student_id);

COMMIT;