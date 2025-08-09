import { googleDriveServiceAccount } from '@/lib/google-drive-service-account';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test authentication
    const auth = await googleDriveServiceAccount.getAuth();
    
    // Test folder creation/retrieval
    const folderId = await googleDriveServiceAccount.getOrCreateFolder('CoachingInstituteTests');
    
    // Test file listing
    const files = await googleDriveServiceAccount.listFiles(folderId);
    
    return NextResponse.json({
      success: true,
      message: 'Google Drive integration is working properly',
      folderId,
      fileCount: files.length
    });
  } catch (error: any) {
    console.error('Google Drive test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
