import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'calculate':
        return await calculateRankings(body);
      case 'get-by-test':
        return await getRankingsByTest(body);
      case 'get-by-student':
        return await getRankingsByStudent(body);
      case 'get-leaderboard':
        return await getLeaderboard(body);
      case 'get-analytics':
        return await getTestAnalytics(body);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Rankings API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateRankings(body: any) {
  try {
    const { testId } = body;
    
    console.log('📊 Calculating rankings for test:', testId);

    // Call the database function to calculate rankings
    const { error } = await supabaseAdmin
      .rpc('calculate_test_rankings', { test_uuid: testId });

    if (error) {
      console.error('❌ Database error calculating rankings:', error);
      throw error;
    }

    console.log('✅ Rankings calculated successfully');

    return NextResponse.json({
      success: true,
      message: 'Rankings calculated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in calculateRankings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getRankingsByTest(body: any) {
  try {
    const { testId, limit = 50 } = body;
    
    console.log('📊 Getting rankings by test:', testId);

    const { data, error } = await supabaseAdmin
      .from('student_rankings')
      .select(`
        *,
        tests (
          id,
          title,
          subject,
          class_level
        )
      `)
      .eq('test_id', testId)
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('❌ Database error getting rankings:', error);
      throw error;
    }

    console.log('✅ Retrieved rankings:', data?.length || 0, 'rankings');

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Rankings retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getRankingsByTest:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getRankingsByStudent(body: any) {
  try {
    const { studentId, limit = 20 } = body;
    
    console.log('📊 Getting rankings by student:', studentId);

    const { data, error } = await supabaseAdmin
      .from('student_rankings')
      .select(`
        *,
        tests (
          id,
          title,
          subject,
          class_level
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Database error getting student rankings:', error);
      throw error;
    }

    console.log('✅ Retrieved student rankings:', data?.length || 0, 'rankings');

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Student rankings retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getRankingsByStudent:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getLeaderboard(body: any) {
  try {
    const { subject, classLevel, limit = 100 } = body;
    
    console.log('🏆 Getting leaderboard');

    let query = supabaseAdmin
      .from('student_rankings')
      .select(`
        student_id,
        AVG(percentage) as avg_percentage,
        COUNT(*) as tests_taken,
        SUM(score) as total_score,
        AVG(percentile) as avg_percentile,
        tests (
          subject,
          class_level
        )
      `)
      .order('avg_percentage', { ascending: false })
      .limit(limit);

    if (subject) {
      query = query.eq('tests.subject', subject);
    }

    if (classLevel) {
      query = query.eq('tests.class_level', classLevel);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Database error getting leaderboard:', error);
      throw error;
    }

    console.log('✅ Retrieved leaderboard:', data?.length || 0, 'entries');

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Leaderboard retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getLeaderboard:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getTestAnalytics(body: any) {
  try {
    const { testId } = body;
    
    console.log('📈 Getting test analytics:', testId);

    // Get basic test statistics
    const { data: rankings, error: rankingsError } = await supabaseAdmin
      .from('student_rankings')
      .select('*')
      .eq('test_id', testId);

    if (rankingsError) {
      console.error('❌ Database error getting analytics:', rankingsError);
      throw rankingsError;
    }

    if (!rankings || rankings.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalParticipants: 0,
          averageScore: 0,
          averagePercentage: 0,
          highestScore: 0,
          lowestScore: 0,
          averageTime: 0,
          distribution: []
        },
        message: 'No analytics data available'
      });
    }

    // Calculate analytics
    const totalParticipants = rankings.length;
    const averageScore = rankings.reduce((sum, r) => sum + r.score, 0) / totalParticipants;
    const averagePercentage = rankings.reduce((sum, r) => sum + r.percentage, 0) / totalParticipants;
    const highestScore = Math.max(...rankings.map(r => r.score));
    const lowestScore = Math.min(...rankings.map(r => r.score));
    const averageTime = rankings.reduce((sum, r) => sum + r.time_taken, 0) / totalParticipants;

    // Score distribution
    const distribution = [
      { range: '90-100%', count: rankings.filter(r => r.percentage >= 90).length },
      { range: '80-89%', count: rankings.filter(r => r.percentage >= 80 && r.percentage < 90).length },
      { range: '70-79%', count: rankings.filter(r => r.percentage >= 70 && r.percentage < 80).length },
      { range: '60-69%', count: rankings.filter(r => r.percentage >= 60 && r.percentage < 70).length },
      { range: '50-59%', count: rankings.filter(r => r.percentage >= 50 && r.percentage < 60).length },
      { range: 'Below 50%', count: rankings.filter(r => r.percentage < 50).length }
    ];

    const analytics = {
      totalParticipants,
      averageScore: Math.round(averageScore * 100) / 100,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      highestScore,
      lowestScore,
      averageTime: Math.round(averageTime),
      distribution
    };

    console.log('✅ Retrieved test analytics:', analytics);

    return NextResponse.json({
      success: true,
      data: analytics,
      message: 'Test analytics retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getTestAnalytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}