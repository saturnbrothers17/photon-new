-- =====================================================
-- DATABASE SETUP VERIFICATION SCRIPT
-- =====================================================
-- Run this after the main setup to verify everything is working

-- Check if all required tables exist
DO $$
DECLARE
    table_name TEXT;
    table_exists BOOLEAN;
    tables_to_check TEXT[] := ARRAY[
        'tests', 'questions', 'test_attempts', 'student_answers', 
        'user_profiles', 'teachers', 'students', 'rankings', 
        'study_materials', 'live_tests', 'test_results'
    ];
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'VERIFYING DATABASE SETUP';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Checking table existence:';
    
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) INTO table_exists;
        
        IF table_exists THEN
            RAISE NOTICE '✅ % table exists', table_name;
        ELSE
            RAISE NOTICE '❌ % table missing', table_name;
        END IF;
    END LOOP;
END $$;

-- Check table row counts
DO $$
DECLARE
    test_count INTEGER;
    question_count INTEGER;
    material_count INTEGER;
    teacher_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Checking data counts:';
    
    SELECT COUNT(*) INTO test_count FROM public.tests;
    RAISE NOTICE '📊 Tests: %', test_count;
    
    SELECT COUNT(*) INTO question_count FROM public.questions;
    RAISE NOTICE '📊 Questions: %', question_count;
    
    SELECT COUNT(*) INTO material_count FROM public.study_materials;
    RAISE NOTICE '📊 Study Materials: %', material_count;
    
    SELECT COUNT(*) INTO teacher_count FROM public.teachers;
    RAISE NOTICE '📊 Teachers: %', teacher_count;
END $$;

-- Check if required columns exist in tests table
DO $$
DECLARE
    column_name TEXT;
    column_exists BOOLEAN;
    columns_to_check TEXT[] := ARRAY[
        'class_level', 'passing_marks', 'published', 'instructions', 'difficulty_level'
    ];
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Checking tests table columns:';
    
    FOREACH column_name IN ARRAY columns_to_check
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'tests'
            AND column_name = column_name
        ) INTO column_exists;
        
        IF column_exists THEN
            RAISE NOTICE '✅ tests.% column exists', column_name;
        ELSE
            RAISE NOTICE '❌ tests.% column missing', column_name;
        END IF;
    END LOOP;
END $$;

-- Check if required columns exist in study_materials table
DO $$
DECLARE
    column_name TEXT;
    column_exists BOOLEAN;
    columns_to_check TEXT[] := ARRAY[
        'class_level', 'uploaded_by', 'file_size', 'file_type'
    ];
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Checking study_materials table columns:';
    
    FOREACH column_name IN ARRAY columns_to_check
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'study_materials'
            AND column_name = column_name
        ) INTO column_exists;
        
        IF column_exists THEN
            RAISE NOTICE '✅ study_materials.% column exists', column_name;
        ELSE
            RAISE NOTICE '❌ study_materials.% column missing', column_name;
        END IF;
    END LOOP;
END $$;

-- Check RLS status
DO $$
DECLARE
    table_name TEXT;
    rls_enabled BOOLEAN;
    tables_to_check TEXT[] := ARRAY[
        'questions', 'test_attempts', 'student_answers', 
        'user_profiles', 'teachers', 'students', 'rankings'
    ];
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Checking RLS status:';
    
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class 
        WHERE relname = table_name AND relnamespace = 'public'::regnamespace;
        
        IF rls_enabled THEN
            RAISE NOTICE '✅ RLS enabled on %', table_name;
        ELSE
            RAISE NOTICE '❌ RLS disabled on %', table_name;
        END IF;
    END LOOP;
END $$;

-- Check if functions exist
DO $$
DECLARE
    function_name TEXT;
    function_exists BOOLEAN;
    functions_to_check TEXT[] := ARRAY[
        'create_test_with_questions', 'get_test_statistics'
    ];
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Checking database functions:';
    
    FOREACH function_name IN ARRAY functions_to_check
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = function_name
        ) INTO function_exists;
        
        IF function_exists THEN
            RAISE NOTICE '✅ Function % exists', function_name;
        ELSE
            RAISE NOTICE '❌ Function % missing', function_name;
        END IF;
    END LOOP;
END $$;

-- Test sample queries
DO $$
DECLARE
    test_with_questions RECORD;
    question_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Testing sample queries:';
    
    -- Test getting tests with questions
    FOR test_with_questions IN 
        SELECT t.id, t.title, COUNT(q.id) as question_count
        FROM public.tests t
        LEFT JOIN public.questions q ON t.id = q.test_id
        GROUP BY t.id, t.title
        LIMIT 3
    LOOP
        RAISE NOTICE '📝 Test "%" has % questions', 
            test_with_questions.title, 
            test_with_questions.question_count;
    END LOOP;
    
    -- Test teacher data
    SELECT COUNT(*) INTO question_count FROM public.teachers;
    IF question_count > 0 THEN
        RAISE NOTICE '👨‍🏫 Found % teacher records', question_count;
    ELSE
        RAISE NOTICE '⚠️ No teacher records found';
    END IF;
END $$;

-- Final status
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'VERIFICATION COMPLETE';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'If you see ✅ for most items above, the setup was successful!';
    RAISE NOTICE 'Any ❌ items indicate missing components that may need attention.';
    RAISE NOTICE '';
    RAISE NOTICE 'Your application should now work without database errors.';
    RAISE NOTICE '==============================================';
END $$;