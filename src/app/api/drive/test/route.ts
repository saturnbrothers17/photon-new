import { NextRequest, NextResponse } from 'next/server';
// Import moved inside functions to avoid client-side bundling issues

// GET - List all tests
export async function GET() {
  try {
    const { googleDriveServiceAccount } = await import('@/lib/google-drive-service-account');
    const tests = await googleDriveServiceAccount.listTests();
    return NextResponse.json({ success: true, tests });
  } catch (error) {
    console.error('Error listing tests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list tests' },
      { status: 500 }
    );
  }
}

// POST - Save a new test
export async function POST(request: NextRequest) {
  try {
    const testData = await request.json();
    
    if (!testData || !testData.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid test data' },
        { status: 400 }
      );
    }

    const { googleDriveServiceAccount } = await import('@/lib/google-drive-service-account');
    const fileId = await googleDriveServiceAccount.saveTest(testData);
    return NextResponse.json({ success: true, fileId });
  } catch (error) {
    console.error('Error saving test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save test' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a test
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      );
    }

    const { googleDriveServiceAccount } = await import('@/lib/google-drive-service-account');
    await googleDriveServiceAccount.deleteTest(fileId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete test' },
      { status: 500 }
    );
  }
}