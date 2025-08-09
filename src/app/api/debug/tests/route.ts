/**
 * DEBUG TESTS API
 * 
 * Simple endpoint to debug test visibility
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseDataManager } from '@/lib/supabase-data-manager';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Fetching all tests...');
    
    // Get all tests
    const allTests = await supabaseDataManager.getAllTests();
    console.log(`📊 Found ${allTests.length} total tests`);
    
    // Get published tests
    const publishedTests = await supabaseDataManager.getPublishedTests();
    console.log(`📢 Found ${publishedTests.length} published tests`);
    
    // Log details
    allTests.forEach(test => {
      console.log(`Test: ${test.title} | Published: ${test.is_published} | Questions: ${test.questions?.length || 0}`);
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        totalTests: allTests.length,
        publishedTests: publishedTests.length,
        allTests: allTests.map(t => ({
          id: t.id,
          title: t.title,
          is_published: t.is_published,
          questions_count: t.questions?.length || 0,
          created_at: t.created_at
        })),
        publishedTestsData: publishedTests.map(t => ({
          id: t.id,
          title: t.title,
          is_published: t.is_published,
          questions_count: t.questions?.length || 0,
          created_at: t.created_at
        }))
      }
    });
  } catch (error: any) {
    console.error('❌ Debug API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}