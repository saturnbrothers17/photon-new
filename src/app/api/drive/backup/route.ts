import { NextRequest, NextResponse } from 'next/server';
// Import moved inside functions to avoid client-side bundling issues

// POST - Create backup
export async function POST(request: NextRequest) {
  try {
    console.log('📋 Backup API called');
    
    const backupData = await request.json();
    console.log('📦 Backup data received, keys:', Object.keys(backupData || {}));
    
    if (!backupData) {
      console.log('❌ No backup data provided');
      return NextResponse.json(
        { success: false, error: 'No data provided for backup' },
        { status: 400 }
      );
    }

    console.log('🔧 Importing Google Drive service...');
    const { googleDriveServiceAccount } = await import('@/lib/google-drive-service-account');
    
    console.log('☁️ Creating backup...');
    const fileId = await googleDriveServiceAccount.backupData(backupData);
    
    console.log('✅ Backup created successfully:', fileId);
    return NextResponse.json({ success: true, fileId });
  } catch (error: any) {
    console.error('❌ Error creating backup:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to create backup: ${error.message}`,
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

// GET - Get folder info and storage usage
export async function GET() {
  try {
    const { googleDriveServiceAccount } = await import('@/lib/google-drive-service-account');
    const folderInfo = await googleDriveServiceAccount.getFolderInfo();
    return NextResponse.json({ success: true, ...folderInfo });
  } catch (error) {
    console.error('Error getting folder info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get folder info' },
      { status: 500 }
    );
  }
}