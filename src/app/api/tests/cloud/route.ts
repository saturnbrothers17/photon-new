import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveAutoSync } from '@/lib/google-drive-auto-sync';

// GET - Fetch all published tests from cloud
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokensParam = searchParams.get('tokens');
    
    if (!tokensParam) {
      return NextResponse.json(
        { success: false, error: 'Authentication tokens required' },
        { status: 401 }
      );
    }

    console.log('📥 Fetching tests from cloud for students...');
    const tokens = JSON.parse(decodeURIComponent(tokensParam));
    const autoSync = new GoogleDriveAutoSync(tokens);

    // Get all test files from the PHOTON Tests folder
    const testFiles = await autoSync.listFolderContents(['PHOTON Coaching Institute', 'PHOTON Tests']);
    
    const tests = [];
    for (const file of testFiles) {
      if (file.name.endsWith('.json') && file.name.includes('test_')) {
        try {
          // Download and parse the test file
          const testContent = await downloadFileContent(autoSync, file.id);
          const testData = JSON.parse(testContent);
          
          // Add cloud metadata
          testData.cloudId = file.id;
          testData.cloudFileName = file.name;
          testData.lastModified = file.modifiedTime;
          testData.fileSize = file.size;
          testData.isCloudTest = true;
          
          tests.push(testData);
        } catch (error) {
          console.error(`Error processing test file ${file.name}:`, error);
          // Add basic info even if we can't parse the content
          tests.push({
            id: file.id,
            cloudId: file.id,
            name: file.name.replace('.json', '').replace(/test_\d+_\d+/, ''),
            status: 'published',
            type: extractTestType(file.name),
            createdTime: file.createdTime,
            isCloudTest: true,
            error: 'Could not load full test data'
          });
        }
      }
    }

    console.log(`✅ Found ${tests.length} tests in cloud`);
    return NextResponse.json({ 
      success: true, 
      tests: tests,
      totalTests: tests.length,
      source: 'cloud'
    });

  } catch (error: any) {
    console.error('❌ Error fetching tests from cloud:', error);
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

// POST - Publish test to cloud (for teachers)
export async function POST(request: NextRequest) {
  try {
    const { tokens, testData, questions } = await request.json();
    
    if (!tokens || !testData) {
      return NextResponse.json(
        { success: false, error: 'Tokens and test data are required' },
        { status: 400 }
      );
    }

    console.log('📤 Publishing test to cloud:', testData.name);
    const autoSync = new GoogleDriveAutoSync(tokens);

    // Create comprehensive test package
    const testPackage = {
      ...testData,
      questions: questions || [],
      publishedAt: new Date().toISOString(),
      publishedBy: 'PHOTON Faculty',
      version: '1.0',
      cloudId: `test_${testData.id}_${Date.now()}`,
      accessLevel: 'student',
      metadata: {
        totalQuestions: questions?.length || 0,
        subjects: testData.subjects || [],
        estimatedDuration: testData.duration,
        maxMarks: testData.maxMarks || (questions?.reduce((sum: number, q: any) => sum + (q.marks || 1), 0) || 0)
      }
    };

    // Upload to Google Drive
    const fileId = await autoSync.uploadTest(testPackage);
    
    console.log('✅ Test published to cloud with ID:', fileId);
    return NextResponse.json({ 
      success: true, 
      fileId: fileId,
      cloudId: testPackage.cloudId,
      message: 'Test published to cloud successfully'
    });

  } catch (error: any) {
    console.error('❌ Error publishing test to cloud:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to publish test: ${error.message}` 
      },
      { status: 500 }
    );
  }
}

// Helper function to download file content
async function downloadFileContent(autoSync: GoogleDriveAutoSync, fileId: string): Promise<string> {
  // This is a simplified version - in reality, you'd need to implement
  // a method in GoogleDriveAutoSync to download file content
  try {
    const testData = await autoSync.loadTest(fileId);
    return JSON.stringify(testData);
  } catch (error) {
    throw new Error(`Failed to download file content: ${error}`);
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