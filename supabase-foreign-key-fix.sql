-- SUPABASE FOREIGN KEY CONSTRAINT FIX
-- Run this in your Supabase SQL Editor to fix the foreign key constraint issue

-- Option 1: Remove the foreign key constraint (Recommended for development)
ALTER TABLE tests DROP CONSTRAINT IF EXISTS tests_created_by_fkey;
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_test_id_fkey;
ALTER TABLE test_attempts DROP CONSTRAINT IF EXISTS test_attempts_test_id_fkey;
ALTER TABLE test_attempts DROP CONSTRAINT IF EXISTS test_attempts_student_id_fkey;
ALTER TABLE student_answers DROP CONSTRAINT IF EXISTS student_answers_attempt_id_fkey;
ALTER TABLE student_answers DROP CONSTRAINT IF EXISTS student_answers_question_id_fkey;

-- Option 2: Make created_by nullable (Alternative approach)
-- ALTER TABLE tests ALTER COLUMN created_by DROP NOT NULL;

-- Option 3: Create a simple users table if you want to keep the constraint
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'teacher',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default user for development
INSERT INTO users (id, email, name, role) 
VALUES ('a0000000-0000-4000-8000-000000000000', 'demo@teacher.com', 'Demo Teacher', 'teacher')
ON CONFLICT (id) DO NOTHING;

-- Re-add the foreign key constraint with the users table
-- ALTER TABLE tests ADD CONSTRAINT tests_created_by_fkey 
--   FOREIGN KEY (created_by) REFERENCES users(id);

-- Grant permissions on users table
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;

-- Disable RLS on users table for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Show current constraints for verification
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name IN ('tests', 'questions', 'test_attempts', 'student_answers')
  AND tc.constraint_type = 'FOREIGN KEY';