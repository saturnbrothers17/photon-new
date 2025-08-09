import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent test results (last 50)
    const { data: results, error } = await supabase
      .from('test_results')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Results fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
    }

    // Format results for dashboard
    const formattedResults = (results || []).map((result: any, index: number) => ({
      id: result.id,
      student_id: result.student_id || 'Unknown',
      test_name: result.test_name || 'Test',
      score: result.score || 0,
      max_marks: result.max_marks || 100,
      percentage: result.percentage || ((result.score / result.max_marks) * 100),
      submitted_at: result.submitted_at || result.created_at,
      time_taken: result.time_taken || 0,
      rank: index + 1
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Results error:', error);
    return NextResponse.json({ error: 'Failed to load results' }, { status: 500 });
  }
}
