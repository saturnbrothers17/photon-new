-- FIX TESTS TABLE SCHEMA
-- Run this in your Supabase SQL Editor to fix the tests table

-- First, let's see the current structure of tests table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tests' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to tests table
ALTER TABLE tests ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS max_marks INTEGER DEFAULT 40;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]';

-- Update existing tests table structure if needed
ALTER TABLE tests ALTER COLUMN is_published SET DEFAULT true;

-- Create some sample tests for the teacher dashboard
INSERT INTO tests (title, description, subject, duration_minutes, max_marks, is_active, questions, created_by, is_published)
SELECT 
  'Mathematics - Algebra Basics',
  'Test covering basic algebraic concepts including linear equations and quadratic equations',
  'Mathematics',
  60,
  40,
  true,
  '[
    {
      "id": 1,
      "question": "Solve for x: 2x + 5 = 15",
      "options": ["x = 5", "x = 10", "x = 7.5", "x = 2.5"],
      "correct_answer": 0,
      "marks": 4
    },
    {
      "id": 2,
      "question": "What is the value of x² when x = 3?",
      "options": ["6", "9", "12", "15"],
      "correct_answer": 1,
      "marks": 4
    },
    {
      "id": 3,
      "question": "Simplify: 3x + 2x - x",
      "options": ["4x", "5x", "6x", "2x"],
      "correct_answer": 0,
      "marks": 4
    }
  ]'::jsonb,
  u.id,
  true
FROM auth.users u 
WHERE u.email = 'sp8@photon.edu'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO tests (title, description, subject, duration_minutes, max_marks, is_active, questions, created_by, is_published)
SELECT 
  'Physics - Motion and Force',
  'Understanding basic concepts of motion, velocity, acceleration and Newton\'s laws',
  'Physics',
  45,
  30,
  true,
  '[
    {
      "id": 1,
      "question": "What is Newton\'s first law of motion?",
      "options": ["F = ma", "Every action has equal and opposite reaction", "An object at rest stays at rest unless acted upon by force", "None of the above"],
      "correct_answer": 2,
      "marks": 5
    },
    {
      "id": 2,
      "question": "The SI unit of force is:",
      "options": ["Joule", "Newton", "Watt", "Pascal"],
      "correct_answer": 1,
      "marks": 5
    }
  ]'::jsonb,
  u.id,
  true
FROM auth.users u 
WHERE u.email = 'mk6@photon.edu'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO tests (title, description, subject, duration_minutes, max_marks, is_active, questions, created_by, is_published)
SELECT 
  'Chemistry - Periodic Table',
  'Test on periodic table trends, atomic structure and chemical bonding',
  'Chemistry',
  50,
  35,
  true,
  '[
    {
      "id": 1,
      "question": "Which element has the atomic number 6?",
      "options": ["Oxygen", "Carbon", "Nitrogen", "Boron"],
      "correct_answer": 1,
      "marks": 5
    },
    {
      "id": 2,
      "question": "What is the maximum number of electrons in the second shell?",
      "options": ["2", "8", "18", "32"],
      "correct_answer": 1,
      "marks": 5
    }
  ]'::jsonb,
  u.id,
  true
FROM auth.users u 
WHERE u.email = 'ak5@photon.edu'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Update RLS policies for tests table to allow teacher access
DROP POLICY IF EXISTS "Enable read access for all users" ON tests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tests;
DROP POLICY IF EXISTS "Enable update for creators" ON tests;

-- Create more permissive policies for tests
CREATE POLICY "Allow teachers to read all tests" ON tests
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow teachers to insert tests" ON tests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow teachers to update their tests" ON tests
  FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow teachers to delete their tests" ON tests
  FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Verify the setup
SELECT 'Tests Table Structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tests' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Sample Tests Created:' as info;
SELECT id, title, subject, duration_minutes, max_marks, is_active, created_at 
FROM tests 
ORDER BY created_at DESC;

SELECT 'Tests by Teacher:' as info;
SELECT 
  t.title,
  t.subject,
  up.name as teacher_name,
  up.email as teacher_email
FROM tests t
LEFT JOIN user_profiles up ON t.created_by = up.id
ORDER BY t.created_at DESC;