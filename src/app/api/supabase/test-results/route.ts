import { NextRequest, NextResponse } from 'next/server';
import { createServerAuthenticatedClient, requireAuth, isTeacher } from '@/lib/supabase-auth';

export async function POST(request: NextRequest) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      console.warn('⚠️ Empty or invalid JSON body in test-results');
    }
    const action = (body as any)?.action || 'get-all';

    switch (action) {
      case 'save-result':
        return await saveTestResult(body);
      case 'get-results':
        return await getTestResults(body);
      case 'get-result-by-id':
        return await getTestResultById(body);
      case 'get-all-results':
        return await getAllTestResults(body);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Test Results API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function saveTestResult(body: any) {
  try {
    const supabase = createServerAuthenticatedClient();
    const { testResult } = body;
    
    console.log('💾 Saving test result:', testResult);

    // Insert test result with only existing columns
    const resultData = {
      id: testResult.id || crypto.randomUUID(),
      test_id: testResult.testId,
      student_id: testResult.studentId,
      answers: testResult.answers || {},
      submitted_at: testResult.submittedAt || new Date().toISOString(),
      time_taken: testResult.timeTaken || 0,
      total_questions: testResult.totalQuestions || 0,
      attempted_questions: testResult.attemptedQuestions || 0,
      flagged_questions: testResult.flaggedQuestions || []
    };

    // Add optional fields only if they exist in the schema
    if (testResult.score !== undefined) resultData.score = testResult.score;
    if (testResult.testName) resultData.test_name = testResult.testName;
    if (testResult.maxMarks) resultData.max_marks = testResult.maxMarks;
    if (testResult.testType) resultData.test_type = testResult.testType;
    if (testResult.securityReport) resultData.security_report = testResult.securityReport;

    const { data, error } = await supabase
      .from('test_results')
      .insert([resultData])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error saving test result:', error);
      
      // Check if it's a table not found error
      if (error.message.includes('test_results') && error.message.includes('schema cache')) {
        return NextResponse.json({
          success: false,
          error: 'TABLE_NOT_FOUND',
          message: 'Test results table not found. Please run the setup SQL script.',
          setupInstructions: 'Check SETUP_TEST_RESULTS_TABLE.md for instructions'
        }, { status: 404 });
      }
      
      throw error;
    }

    console.log('✅ Test result saved successfully:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Test result saved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in saveTestResult:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getTestResults(body: any) {
  try {
    const supabase = createServerAuthenticatedClient();
    const { studentId } = body;
    
    console.log('📊 Getting test results for student:', studentId);

    // Get results with safe column selection
    const { data, error } = await supabase
      .from('test_results')
      .select('id, test_id, student_id, answers, submitted_at, time_taken, total_questions, attempted_questions, flagged_questions, score')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('❌ Database error getting test results:', error);
      throw error;
    }

    console.log('✅ Retrieved test results:', data?.length || 0, 'results');

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Test results retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getTestResults:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getTestResultById(body: any) {
  try {
    const supabase = createServerAuthenticatedClient();
    const user = await requireAuth(supabase);
    const { resultId } = body;
    
    console.log('📊 Getting test result by ID for user:', user.id, resultId);

    // RLS will ensure user can only access their own results or teacher can access all
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('id', resultId)
      .single();

    if (error) {
      console.error('❌ Database error getting test result:', error);
      throw error;
    }

    console.log('✅ Retrieved test result:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Test result retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getTestResultById:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getAllTestResults(body: any) {
  try {
    const supabase = createServerAuthenticatedClient();
    
    console.log('📊 Getting all test results');

    // Get all results with safe column selection
    const { data, error } = await supabase
      .from('test_results')
      .select('id, test_id, student_id, answers, submitted_at, time_taken, total_questions, attempted_questions, score')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('❌ Database error getting all test results:', error);
      throw error;
    }

    console.log('✅ Retrieved all test results:', data?.length || 0, 'results');

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'All test results retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getAllTestResults:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}