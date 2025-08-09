-- SAFELY ENABLE RLS ON EXISTING TABLES
-- This script checks if tables exist before enabling RLS

-- Function to safely enable RLS on a table if it exists
CREATE OR REPLACE FUNCTION safe_enable_rls(table_name text)
RETURNS void AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = $1) THEN
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', $1);
        RAISE NOTICE 'RLS enabled on table: %', $1;
    ELSE
        RAISE NOTICE 'Table % does not exist, skipping RLS', $1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on tables that exist
SELECT safe_enable_rls('tests');
SELECT safe_enable_rls('test_results');
SELECT safe_enable_rls('study_materials');
SELECT safe_enable_rls('live_tests');
SELECT safe_enable_rls('test_participants');
SELECT safe_enable_rls('student_rankings');
SELECT safe_enable_rls('material_views');
SELECT safe_enable_rls('test_schedules');
SELECT safe_enable_rls('user_profiles');

-- Clean up the helper function
DROP FUNCTION safe_enable_rls(text);