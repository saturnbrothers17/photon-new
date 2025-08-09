import { NextRequest, NextResponse } from 'next/server';
import { seamlessCloudStorage } from '@/lib/seamless-cloud-storage';

// GET - Fetch all tests seamlessly (no authentication required)
export async function GET() {
  try {
    console.log('📥 Seamless API: Fetching all tests...');

    if (!seamlessCloudStorage.isReady()) {
      console.log('⚠️ Cloud storage not ready, returning empty array');
      return NextResponse.json({ 
        success: true, 
        tests: [],
        source: 'local_only',
        message: 'Cloud storage initializing...'
      });
    }

    const tests = await seamlessCloudStorage.fetchAllTests();
    
    console.log(`✅ Seamless API: Retrieved ${tests.length} tests`);
    return NextResponse.json({ 
      success: true, 
      tests: tests,
      totalTests: tests.length,
      source: 'seamless_cloud',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Seamless API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Seamless fetch failed: ${error.message}`,
        tests: [],
        source: 'error'
      },
      { status: 500 }
    );
  }
}

// POST - Publish test seamlessly (no authentication required)
export async function POST(request: NextRequest) {
  try {
    const { testData, questions } = await request.json();
    
    if (!testData) {
      return NextResponse.json(
        { success: false, error: 'Test data is required' },
        { status: 400 }
      );
    }

    console.log('📤 Seamless API: Publishing test:', testData.name);

    if (!seamlessCloudStorage.isReady()) {
      console.log('⚠️ Cloud storage not ready, test will be local only');
      return NextResponse.json({ 
        success: true, 
        cloudId: null,
        message: 'Test saved locally, cloud sync pending...',
        source: 'local_only'
      });
    }

    const cloudId = await seamlessCloudStorage.publishTest(testData, questions || []);
    
    if (cloudId) {
      console.log('✅ Seamless API: Test published to cloud:', cloudId);
      return NextResponse.json({ 
        success: true, 
        cloudId: cloudId,
        message: 'Test published seamlessly to cloud',
        source: 'seamless_cloud'
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        cloudId: null,
        message: 'Test saved locally, cloud sync will retry',
        source: 'local_fallback'
      });
    }

  } catch (error: any) {
    console.error('❌ Seamless API publish error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Seamless publish failed: ${error.message}`,
        source: 'error'
      },
      { status: 500 }
    );
  }
}