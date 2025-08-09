import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'get-all':
        return await getAllTests(body);
      case 'get-published':
        return await getPublishedTests(body);
      case 'get-by-id':
        return await getTestById(body);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Tests Simple API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getAllTests(body: any) {
  try {
    console.log('📚 Getting all tests');

    const { data, error } = await supabaseAdmin
      .from('tests')
      .select('id, title, subject, description, duration_minutes, max_marks, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error getting tests:', error);
      throw error;
    }

    // Add computed fields for compatibility
    const testsWithDefaults = (data || []).map(test => ({
      ...test,
      subject: test.subject || 'General',
      class_level: '10',
      duration_minutes: test.duration_minutes || 60,
      is_published: test.is_active || false,
      total_marks: test.max_marks || 40,
      passing_marks: Math.floor((test.max_marks || 40) * 0.4)
    }));

    console.log('✅ Retrieved tests:', testsWithDefaults.length, 'tests');

    return NextResponse.json({
      success: true,
      data: testsWithDefaults,
      message: 'Tests retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getAllTests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getPublishedTests(body: any) {
  try {
    console.log('📚 Getting published tests');

    const { data, error } = await supabaseAdmin
      .from('tests')
      .select('id, title, subject, description, duration_minutes, max_marks, is_active, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error getting published tests:', error);
      throw error;
    }

    // Add computed fields for compatibility
    const testsWithDefaults = (data || []).map(test => ({
      ...test,
      subject: test.subject || 'General',
      class_level: '10',
      duration_minutes: test.duration_minutes || 60,
      is_published: test.is_active || false,
      total_marks: test.max_marks || 40,
      passing_marks: Math.floor((test.max_marks || 40) * 0.4)
    }));

    console.log('✅ Retrieved published tests:', testsWithDefaults.length, 'tests');

    return NextResponse.json({
      success: true,
      data: testsWithDefaults,
      message: 'Published tests retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getPublishedTests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getTestById(body: any) {
  try {
    const { testId } = body;
    
    console.log('📚 Getting test by ID:', testId);

    const { data, error } = await supabaseAdmin
      .from('tests')
      .select('id, title, subject, description, duration_minutes, max_marks, is_active, created_at')
      .eq('id', testId)
      .single();

    if (error) {
      console.error('❌ Database error getting test by ID:', error);
      throw error;
    }

    // Add computed fields for compatibility
    const testWithDefaults = {
      ...data,
      subject: data.subject || 'General',
      class_level: '10',
      duration_minutes: data.duration_minutes || 60,
      is_published: data.is_active || false,
      total_marks: data.max_marks || 40,
      passing_marks: Math.floor((data.max_marks || 40) * 0.4)
    };

    console.log('✅ Retrieved test by ID:', testWithDefaults);

    return NextResponse.json({
      success: true,
      data: testWithDefaults,
      message: 'Test retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getTestById:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}