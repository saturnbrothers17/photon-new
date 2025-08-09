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

    // Get current teacher's statistics
    const teacherId = session.user.id;

    // Fetch total tests created by this teacher
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select('id, is_published, total_questions')
      .eq('created_by', teacherId);

    if (testsError) {
      console.error('Error fetching tests:', testsError);
    }

    // Fetch study materials created by this teacher
    const { data: materials, error: materialsError } = await supabase
      .from('study_materials')
      .select('id')
      .eq('uploaded_by', teacherId);

    if (materialsError) {
      console.error('Error fetching materials:', materialsError);
    }

    // Fetch live tests
    const { data: liveTests, error: liveTestsError } = await supabase
      .from('live_tests')
      .select('id, status')
      .eq('created_by', teacherId);

    if (liveTestsError) {
      console.error('Error fetching live tests:', liveTestsError);
    }

    // Fetch recent test results (submissions)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: results, error: resultsError } = await supabase
      .from('test_results')
      .select('id, score, max_marks, percentage')
      .gte('created_at', today.toISOString());

    if (resultsError) {
      console.error('Error fetching results:', resultsError);
    }

    // Fetch total students (unique users who have taken tests)
    const { data: students, error: studentsError } = await supabase
      .from('test_results')
      .select('student_id')
      .not('student_id', 'is', null);

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
    }

    // Calculate statistics
    const totalTests = tests?.length || 0;
    const publishedTests = tests?.filter(test => test.is_published)?.length || 0;
    const totalMaterials = materials?.length || 0;
    const activeTests = liveTests?.filter(test => test.status === 'in_progress')?.length || 0;
    const uniqueStudents = new Set(students?.map(s => s.student_id) || []).size;
    const todaySubmissions = results?.length || 0;
    const averageScore = results && results.length > 0 
      ? results.reduce((sum, result) => sum + (result.percentage || 0), 0) / results.length
      : 0;
    const totalQuestions = tests?.reduce((sum, test) => sum + (test.total_questions || 0), 0) || 0;

    const stats = {
      totalTests,
      publishedTests,
      totalMaterials,
      activeTests,
      totalStudents: uniqueStudents,
      todaySubmissions,
      averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal place
      totalQuestions
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new NextResponse(`Internal Server Error: ${(error as Error).message}`, { status: 500 });
  }
}
