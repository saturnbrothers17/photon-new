import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get live tests created by this teacher
    const { data: liveTests, error } = await supabase
      .from('live_tests')
      .select(`
        id,
        test_id,
        start_time,
        end_time,
        max_participants,
        current_participants,
        status,
        created_at,
        tests (
          title,
          subject,
          class_level
        )
      `)
      .eq('created_by', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching live tests:', error);
      return new NextResponse(error.message, { status: 500 });
    }

    return NextResponse.json(liveTests || []);
  } catch (error) {
    console.error('Error fetching live tests:', error);
    return new NextResponse(`Internal Server Error: ${(error as Error).message}`, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      console.warn('⚠️ Empty or invalid JSON body in live-tests');
    }
    const action = (body as any)?.action || 'get-active';

    switch (action) {
      case 'create':
        return await createLiveTest(body);
      case 'get-active':
        return await getActiveTests(body);
      case 'get-scheduled':
        return await getScheduledTests(body);
      case 'get-by-id':
        return await getLiveTestById(body);
      case 'join-test':
        return await joinLiveTest(body);
      case 'update-participant':
        return await updateParticipant(body);
      case 'get-participants':
        return await getTestParticipants(body);
      case 'end-test':
        return await endLiveTest(body);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Live Tests API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createLiveTest(body: any) {
  try {
    const { testId, startTime, endTime, maxParticipants, instructions } = body;
    
    console.log('🔴 Creating live test:', testId);

    const { data, error } = await supabaseAdmin
      .from('live_tests')
      .insert([{
        test_id: testId,
        start_time: startTime,
        end_time: endTime,
        max_participants: maxParticipants || 100,
        instructions: instructions || '',
        created_by: 'teacher'
      }])
      .select(`
        *,
        tests (
          id,
          title,
          subject,
          class_level,
          duration_minutes,
          questions
        )
      `)
      .single();

    if (error) {
      console.error('❌ Database error creating live test:', error);
      throw error;
    }

    console.log('✅ Live test created successfully:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Live test created successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in createLiveTest:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getActiveTests(body: any) {
  try {
    console.log('🔴 Getting active live tests');

    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('is_active', true)
      .lte('start_time', now)
      .gte('end_time', now)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('❌ Database error getting active tests:', error);
      throw error;
    }

    console.log('✅ Retrieved active tests:', data?.length || 0, 'tests');

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Active tests retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getActiveTests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getScheduledTests(body: any) {
  try {
    console.log('📅 Getting scheduled tests');

    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('test_schedules')
      .select(`
        *,
        tests (
          id,
          title,
          subject,
          class_level,
          duration_minutes,
          questions
        )
      `)
      .eq('is_published', true)
      .gte('scheduled_date', now)
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('❌ Database error getting scheduled tests:', error);
      throw error;
    }

    console.log('✅ Retrieved scheduled tests:', data?.length || 0, 'tests');

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Scheduled tests retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getScheduledTests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getLiveTestById(body: any) {
  try {
    const { liveTestId } = body;
    
    console.log('🔴 Getting live test by ID:', liveTestId);

    const { data, error } = await supabaseAdmin
      .from('tests')
      .select(`*`)
      .eq('id', liveTestId)
      .single();

    if (error) {
      console.error('❌ Database error getting live test:', error);
      throw error;
    }

    console.log('✅ Retrieved live test:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Live test retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getLiveTestById:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function joinLiveTest(body: any) {
  try {
    const { liveTestId, studentId } = body;
    
    console.log('👥 Student joining live test:', liveTestId, studentId);

    // Check if student already joined
    const { data: existing } = await supabaseAdmin
      .from('test_participants')
      .select('*')
      .eq('live_test_id', liveTestId)
      .eq('student_id', studentId)
      .single();

    if (existing) {
      // Update existing participant
      const { data, error } = await supabaseAdmin
        .from('test_participants')
        .update({ 
          status: 'in_progress',
          last_activity: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data,
        message: 'Rejoined live test successfully'
      });
    }

    // Add new participant
    const { data, error } = await supabaseAdmin
      .from('test_participants')
      .insert([{
        live_test_id: liveTestId,
        student_id: studentId,
        status: 'joined'
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error joining live test:', error);
      throw error;
    }

    // Update participant count
    await supabaseAdmin
      .rpc('increment', { 
        table_name: 'live_tests',
        column_name: 'current_participants',
        row_id: liveTestId
      });

    console.log('✅ Student joined live test successfully:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Joined live test successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in joinLiveTest:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function updateParticipant(body: any) {
  try {
    const { participantId, status, currentQuestion, answersCount } = body;
    
    console.log('🔄 Updating participant:', participantId);

    const { data, error } = await supabaseAdmin
      .from('test_participants')
      .update({
        status: status || 'in_progress',
        current_question: currentQuestion,
        answers_count: answersCount,
        last_activity: new Date().toISOString()
      })
      .eq('id', participantId)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error updating participant:', error);
      throw error;
    }

    console.log('✅ Participant updated successfully:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Participant updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in updateParticipant:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getTestParticipants(body: any) {
  try {
    const { liveTestId } = body;
    
    console.log('👥 Getting test participants:', liveTestId);

    const { data, error } = await supabaseAdmin
      .from('test_participants')
      .select('*')
      .eq('live_test_id', liveTestId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('❌ Database error getting participants:', error);
      throw error;
    }

    console.log('✅ Retrieved test participants:', data?.length || 0, 'participants');

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Test participants retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getTestParticipants:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function endLiveTest(body: any) {
  try {
    const { liveTestId } = body;
    
    console.log('🛑 Ending live test:', liveTestId);

    const { data, error } = await supabaseAdmin
      .from('live_tests')
      .update({ is_active: false })
      .eq('id', liveTestId)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error ending live test:', error);
      throw error;
    }

    console.log('✅ Live test ended successfully:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Live test ended successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in endLiveTest:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}