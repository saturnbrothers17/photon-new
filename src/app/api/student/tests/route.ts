/**
 * STUDENT TESTS API
 * 
 * API endpoint for students to access published tests
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseDataManager } from '@/lib/supabase-data-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'published':
        // Get only published tests for students
        const publishedTests = await supabaseDataManager.getPublishedTests();
        return NextResponse.json({ 
          success: true, 
          data: publishedTests,
          message: `Found ${publishedTests.length} published tests`
        });

      default:
        // Default: get published tests
        const tests = await supabaseDataManager.getPublishedTests();
        return NextResponse.json({ 
          success: true, 
          data: tests,
          message: `Found ${tests.length} published tests`
        });
    }
  } catch (error: any) {
    console.error('❌ Error in student tests API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}