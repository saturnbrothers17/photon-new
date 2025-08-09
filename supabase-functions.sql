-- SUPABASE DATABASE FUNCTIONS
-- Run this in your Supabase SQL Editor to create functions that bypass RLS

-- Function to create a test with questions (bypasses RLS)
CREATE OR REPLACE FUNCTION create_test_with_questions(
  test_data jsonb,
  questions_data jsonb[]
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to run with elevated privileges
AS $$
DECLARE
  new_test_id uuid;
  question_record jsonb;
BEGIN
  -- Insert the test
  INSERT INTO tests (
    title,
    description,
    subject,
    class_level,
    duration_minutes,
    total_marks,
    passing_marks,
    is_published,
    created_by
  ) VALUES (
    (test_data->>'title')::text,
    (test_data->>'description')::text,
    (test_data->>'subject')::text,
    (test_data->>'class_level')::text,
    (test_data->>'duration_minutes')::integer,
    (test_data->>'total_marks')::integer,
    (test_data->>'passing_marks')::integer,
    (test_data->>'is_published')::boolean,
    (test_data->>'created_by')::uuid
  ) RETURNING id INTO new_test_id;

  -- Insert the questions
  FOREACH question_record IN ARRAY questions_data
  LOOP
    INSERT INTO questions (
      test_id,
      question_text,
      question_type,
      options,
      correct_answer,
      marks,
      solution
    ) VALUES (
      new_test_id,
      (question_record->>'question_text')::text,
      (question_record->>'question_type')::text,
      question_record->'options',
      (question_record->>'correct_answer')::text,
      (question_record->>'marks')::integer,
      question_record->'solution'
    );
  END LOOP;

  RETURN new_test_id;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION create_test_with_questions(jsonb, jsonb[]) TO anon;
GRANT EXECUTE ON FUNCTION create_test_with_questions(jsonb, jsonb[]) TO authenticated;

-- Function to get all tests with questions (bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_tests_with_questions()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  subject text,
  class_level text,
  duration_minutes integer,
  total_marks integer,
  passing_marks integer,
  is_published boolean,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  questions jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.subject,
    t.class_level,
    t.duration_minutes,
    t.total_marks,
    t.passing_marks,
    t.is_published,
    t.created_at,
    t.updated_at,
    t.created_by,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', q.id,
          'question_text', q.question_text,
          'question_type', q.question_type,
          'options', q.options,
          'correct_answer', q.correct_answer,
          'marks', q.marks,
          'solution', q.solution,
          'created_at', q.created_at
        )
      ) FILTER (WHERE q.id IS NOT NULL),
      '[]'::jsonb
    ) as questions
  FROM tests t
  LEFT JOIN questions q ON t.id = q.test_id
  GROUP BY t.id, t.title, t.description, t.subject, t.class_level, 
           t.duration_minutes, t.total_marks, t.passing_marks, 
           t.is_published, t.created_at, t.updated_at, t.created_by
  ORDER BY t.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_all_tests_with_questions() TO anon;
GRANT EXECUTE ON FUNCTION get_all_tests_with_questions() TO authenticated;