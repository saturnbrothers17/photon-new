import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

    // Get all tests created by the current teacher that are published and available for live testing
    const { data: tests, error } = await supabase
      .from('tests')
      .select(`
        id,
        title,
        subject,
        description,
        duration_minutes,
        max_marks,
        is_active,
        created_at,
        created_by
      `)
      .eq('created_by', session.user.email)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching available tests:', error);
      return new NextResponse(error.message, { status: 500 });
    }

    // Transform the data to match the expected format
    const availableTests = tests?.map(test => ({
      id: test.id,
      title: test.title,
      subject: test.subject || 'General',
      class_level: '10', // Default class level
      duration: test.duration_minutes || 60,
      total_questions: Math.floor((test.max_marks || 40) / 4), // Estimate questions from marks
      published: test.is_active,
      created_at: test.created_at
    })) || [];

    return NextResponse.json(availableTests);
  } catch (error) {
    console.error('Error fetching available tests:', error);
    return new NextResponse(`Internal Server Error: ${(error as Error).message}`, { status: 500 });
  }
}
