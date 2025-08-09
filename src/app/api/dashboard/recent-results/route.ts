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

    // Get recent test results for tests created by this teacher
    const { data: results, error } = await supabase
      .from('test_results')
      .select(`
        id,
        student_id,
        score,
        max_marks,
        percentage,
        time_taken,
        created_at,
        tests!inner(
          id,
          title,
          subject,
          class_level,
          created_by
        )
      `)
      .eq('tests.created_by', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent results:', error);
      return new NextResponse(error.message, { status: 500 });
    }

    // Transform the data to match the expected format
    const recentResults = results?.map(result => ({
      id: result.id,
      student_id: result.student_id,
      test_name: result.tests?.title || 'Unknown Test',
      subject: result.tests?.subject || 'Unknown',
      class_level: result.tests?.class_level || 'Unknown',
      score: result.score,
      max_marks: result.max_marks,
      percentage: result.percentage,
      time_taken: result.time_taken,
      created_at: result.created_at
    })) || [];

    return NextResponse.json(recentResults);
  } catch (error) {
    console.error('Error fetching recent results:', error);
    return new NextResponse(`Internal Server Error: ${(error as Error).message}`, { status: 500 });
  }
}
