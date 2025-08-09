import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Fetch all published tests from Supabase
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('📥 Fetching published tests from Supabase...');

    // Fetch all published tests
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log(`✅ Found ${tests?.length || 0} published tests`);
    return NextResponse.json({ 
      success: true, 
      tests: tests || [],
      totalTests: tests?.length || 0,
      source: 'supabase'
    });

  } catch (error: any) {
    console.error('❌ Error fetching tests from Supabase:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to fetch tests: ${error.message}`,
        tests: [],
        source: 'error'
      },
      { status: 500 }
    );
  }
}

// POST - Publish test to Supabase (for teachers)
export async function POST(request: NextRequest) {
  try {
    const { testData, questions } = await request.json();
    
    if (!testData) {
      return NextResponse.json(
        { success: false, error: 'Test data is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('📤 Publishing test to Supabase:', testData.name);

    // Create comprehensive test package
    const testPackage = {
      ...testData,
      questions: questions || [],
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('tests')
      .insert(testPackage)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Test published to Supabase with ID:', data.id);
    return NextResponse.json({ 
      success: true, 
      testId: data.id,
      message: 'Test published to Supabase successfully'
    });

  } catch (error: any) {
    console.error('❌ Error publishing test to Supabase:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to publish test: ${error.message}` 
      },
      { status: 500 }
    );
  }
}

// Helper function to extract test type from filename
function extractTestType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('jee_main') || lower.includes('jee-main')) return 'JEE Main';
  if (lower.includes('jee_advanced') || lower.includes('jee-advanced')) return 'JEE Advanced';
  if (lower.includes('neet')) return 'NEET';
  if (lower.includes('chapter')) return 'Chapter Test';
  if (lower.includes('mock')) return 'Mock Test';
  return 'Practice Test';
}