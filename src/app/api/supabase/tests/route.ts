/**
 * SUPABASE TESTS API
 * 
 * Handles all test-related operations using Supabase
 * Replaces Google Drive functionality completely
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseDataManager, CreateTestData } from '@/lib/supabase-data-manager';
import { getCurrentUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const testId = searchParams.get('testId');
    const subject = searchParams.get('subject');
    const isPublished = searchParams.get('published');
    const search = searchParams.get('search');

    switch (action) {
      case 'get-all':
        const filters = {
          subject: subject || undefined,
          published: isPublished ? isPublished === 'true' : undefined,
          search: search || undefined
        };
        const tests = await supabaseDataManager.getAllTests(filters);
        return NextResponse.json({ success: true, data: tests });

      case 'get-published':
        const publishedTests = await supabaseDataManager.getPublishedTests();
        return NextResponse.json({ success: true, data: publishedTests });

      case 'get-by-id':
        if (!testId) {
          return NextResponse.json({ success: false, error: 'Test ID required' }, { status: 400 });
        }
        const test = await supabaseDataManager.getTestById(testId);
        if (!test) {
          return NextResponse.json({ success: false, error: 'Test not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: test });

      case 'statistics':
        if (!testId) {
          return NextResponse.json({ success: false, error: 'Test ID required' }, { status: 400 });
        }
        const stats = await supabaseDataManager.getTestStatistics(testId);
        return NextResponse.json({ success: true, data: stats });

      default:
        // Default: get all tests
        const allTests = await supabaseDataManager.getAllTests();
        return NextResponse.json({ success: true, data: allTests });
    }
  } catch (error: any) {
    console.error('❌ Error in tests GET API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      console.warn('⚠️ Empty or invalid JSON body in tests API');
    }

    console.log('🔄 POST request to supabase/tests:', { action, bodyKeys: Object.keys(body || {}) });

    // Get current user
    const currentUser = await getCurrentUser();
    const userId = currentUser.id;
    
    console.log('👤 Current user:', { id: userId, email: currentUser.email, role: currentUser.role });

    switch (action) {
      case 'get-all':
        const bodyData = body as any;
        const filters = {
          subject: bodyData?.subject || undefined,
          published: bodyData?.published !== undefined ? bodyData.published : bodyData?.is_published !== undefined ? bodyData.is_published : undefined,
          search: bodyData?.search || undefined
        };
        const allTests = await supabaseDataManager.getAllTests(filters);
        return NextResponse.json({ success: true, data: allTests });

      case 'create':
        const createData = body as any;
        const testData: CreateTestData = {
          title: createData?.title || createData?.name,
          description: createData?.description || createData?.instructions,
          subject: createData?.subject || 'General',
          class_level: createData?.class_level,
          duration_minutes: createData?.duration_minutes || createData?.duration,
          total_marks: createData?.total_marks || createData?.totalMarks,
          passing_marks: createData?.passing_marks,
          published: createData?.published ?? createData?.is_published ?? (createData?.status === 'published'),
          questions: createData?.questions?.map((q: any) => ({
            question_text: q.question || q.question_text,
            question_type: 'multiple_choice',
            options: q.options || [],
            correct_answer: q.correctAnswer || q.correct_answer,
            marks: q.marks || 4,
            solution: q.solution
          })) || []
        };

        console.log('📝 Creating test with data:', { 
          title: testData.title, 
          subject: testData.subject, 
          questionsCount: testData.questions.length,
          userId 
        });

        const testId = await supabaseDataManager.createTest(testData, userId);
        
        console.log('✅ Test created successfully with ID:', testId);
        
        return NextResponse.json({ 
          success: true, 
          data: { testId },
          message: 'Test created successfully'
        });

      case 'create-attempt':
        const { testId: attemptTestId, studentId } = body as any;
        if (!attemptTestId || !studentId) {
          return NextResponse.json(
            { success: false, error: 'Test ID and Student ID required' },
            { status: 400 }
          );
        }
        const attemptId = await supabaseDataManager.createTestAttempt(attemptTestId, studentId);
        return NextResponse.json({ 
          success: true, 
          data: { attemptId },
          message: 'Test attempt created successfully'
        });

      case 'submit-attempt':
        const { attemptId: submitAttemptId, answers } = body as any;
        if (!submitAttemptId || !answers) {
          return NextResponse.json(
            { success: false, error: 'Attempt ID and answers required' },
            { status: 400 }
          );
        }
        await supabaseDataManager.submitTestAttempt(submitAttemptId, answers);
        return NextResponse.json({ 
          success: true,
          message: 'Test attempt submitted successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Error in tests POST API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const testId = searchParams.get('testId');
    const body = await request.json().catch(() => ({}));

    if (!testId) {
      return NextResponse.json({ success: false, error: 'Test ID required' }, { status: 400 });
    }

    switch (action) {
      case 'update':
        const updateData: Partial<CreateTestData> = {
          title: body.title,
          description: body.description,
          subject: body.subject,
          class_level: body.class_level,
          duration_minutes: body.duration_minutes,
          total_marks: body.total_marks,
          passing_marks: body.passing_marks,
          published: body.published ?? body.is_published,
          questions: body.questions?.map((q: any) => ({
            question_text: q.question_text,
            question_type: q.question_type || 'multiple_choice',
            options: q.options,
            correct_answer: q.correct_answer,
            marks: q.marks,
            solution: q.solution
          }))
        };

        await supabaseDataManager.updateTest(testId, updateData);
        return NextResponse.json({ 
          success: true,
          message: 'Test updated successfully'
        });

      case 'publish':
        await supabaseDataManager.toggleTestPublication(testId, true);
        return NextResponse.json({ 
          success: true,
          message: 'Test published successfully'
        });

      case 'unpublish':
        await supabaseDataManager.toggleTestPublication(testId, false);
        return NextResponse.json({ 
          success: true,
          message: 'Test unpublished successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Error in tests PUT API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return NextResponse.json({ success: false, error: 'Test ID required' }, { status: 400 });
    }

    await supabaseDataManager.deleteTest(testId);
    return NextResponse.json({ 
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error in tests DELETE API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}