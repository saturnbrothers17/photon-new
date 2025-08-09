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

    // Get counts in parallel
    const [
      testsResult,
      materialsResult,
      liveTestsResult,
      resultsResult
    ] = await Promise.all([
      supabase.from('tests').select('*', { count: 'exact', head: true }),
      supabase.from('study_materials').select('*', { count: 'exact', head: true }),
      supabase.from('live_tests').select('*', { count: 'exact', head: true }),
      supabase.from('test_results').select('*', { count: 'exact', head: true })
    ]);

    // Calculate stats
    const stats = {
      totalTests: testsResult.count || 0,
      publishedTests: testsResult.count || 0, // You can add a filter for published tests
      totalMaterials: materialsResult.count || 0,
      activeTests: liveTestsResult.count || 0,
      totalStudents: 0, // Will need student table
      todaySubmissions: resultsResult.count || 0,
      averageScore: 0, // Calculate from results
      totalQuestions: 0 // Calculate from tests
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
