import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'save-result':
        return await saveTestResult(body);
      case 'get-results':
        return await getTestResults(body);
      case 'get-all-results':
        return await getAllTestResults(body);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Test Results Simple API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function saveTestResult(body: any) {
  try {
    const { 
      studentId, 
      testId, 
      testName, 
      answers, 
      score, 
      maxMarks, 
      timeTaken,
      isLiveTest,
      liveTestId,
      autoSubmitted 
    } = body;
    
    console.log('💾 Saving test result for student:', studentId);

    // Calculate percentage
    const percentage = maxMarks > 0 ? (score / maxMarks) * 100 : 0;

    // Create result data with existing columns only
    const resultData: any = {
      id: crypto.randomUUID(),
      test_id: testId,
      student_id: studentId,
      answers: answers || {},
      submitted_at: new Date().toISOString(),
      time_taken: timeTaken || 0,
      total_questions: Object.keys(answers || {}).length,
      attempted_questions: Object.keys(answers || {}).length,
      flagged_questions: []
    };

    // Add score if available
    if (score !== undefined) {
      resultData.score = score;
    }

    const { data, error } = await supabaseAdmin
      .from('test_results')
      .insert([resultData])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error saving test result:', error);
      throw error;
    }

    // Add computed fields for response
    const resultWithComputed = {
      ...data,
      test_name: testName || 'Test',
      max_marks: maxMarks || 100,
      percentage: percentage,
      rank: 1 // Default rank
    };

    console.log('✅ Test result saved successfully:', resultWithComputed.id);

    return NextResponse.json({
      success: true,
      data: resultWithComputed,
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
    const { studentId } = body;
    
    console.log('📊 Getting test results for student:', studentId);

    const { data, error } = await supabaseAdmin
      .from('test_results')
      .select('*')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('❌ Database error getting test results:', error);
      throw error;
    }

    // Add computed fields for compatibility
    const resultsWithComputed = (data || []).map(result => ({
      ...result,
      test_name: 'Test',
      max_marks: 100,
      percentage: result.score ? (result.score / 100) * 100 : 0,
      rank: 1
    }));

    console.log('✅ Retrieved test results:', resultsWithComputed.length, 'results');

    return NextResponse.json({
      success: true,
      data: resultsWithComputed,
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

async function getAllTestResults(body: any) {
  try {
    console.log('📊 Getting all test results');

    const { data, error } = await supabaseAdmin
      .from('test_results')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Database error getting all test results:', error);
      throw error;
    }

    // Add computed fields for compatibility
    const resultsWithComputed = (data || []).map(result => ({
      ...result,
      test_name: 'Test',
      max_marks: 100,
      percentage: result.score ? (result.score / 100) * 100 : 0,
      rank: 1
    }));

    console.log('✅ Retrieved all test results:', resultsWithComputed.length, 'results');

    return NextResponse.json({
      success: true,
      data: resultsWithComputed,
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