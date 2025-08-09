-- SUPABASE ROW LEVEL SECURITY POLICIES
-- Run this in your Supabase SQL Editor to set up proper RLS policies

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON tests;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON questions;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON test_attempts;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON student_answers;

-- Create permissive policies for development
-- Tests table policies
CREATE POLICY "Allow all operations for authenticated users" ON tests
    FOR ALL USING (true) WITH CHECK (true);

-- Questions table policies
CREATE POLICY "Allow all operations for authenticated users" ON questions
    FOR ALL USING (true) WITH CHECK (true);

-- Test attempts table policies
CREATE POLICY "Allow all operations for authenticated users" ON test_attempts
    FOR ALL USING (true) WITH CHECK (true);

-- Student answers table policies
CREATE POLICY "Allow all operations for authenticated users" ON student_answers
    FOR ALL USING (true) WITH CHECK (true);

-- Alternative: Disable RLS temporarily for development
-- Uncomment these lines if you want to completely disable RLS for now
-- ALTER TABLE tests DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE test_attempts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE student_answers DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anon role
GRANT ALL ON tests TO anon;
GRANT ALL ON questions TO anon;
GRANT ALL ON test_attempts TO anon;
GRANT ALL ON student_answers TO anon;

-- Grant necessary permissions to authenticated role
GRANT ALL ON tests TO authenticated;
GRANT ALL ON questions TO authenticated;
GRANT ALL ON test_attempts TO authenticated;
GRANT ALL ON student_answers TO authenticated;