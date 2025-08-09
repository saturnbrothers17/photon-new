import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    console.log('📥 Loading data from Google Drive (Service Account)...');
    console.log('🔧 Environment variables check:', {
      hasProjectId: !!process.env.GOOGLE_PROJECT_ID,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      hasServiceEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      projectId: process.env.GOOGLE_PROJECT_ID?.substring(0, 10) + '...'
    });

    // Initialize Google Drive API with service account (simplified)
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const fileName = 'photon_coaching_data.json';
    
    // Simple search for the data file (no folders - faster)
    const searchResponse = await drive.files.list({
      q: `name='${fileName}' and trashed=false`,
      fields: 'files(id, name)',
    });

    const files = searchResponse.data.files;
    if (!files || files.length === 0) {
      console.log('📝 No data file found, will create new one');
      return NextResponse.json({ 
        success: true, 
        data: null,
        message: 'No existing data file found' 
      });
    }

    // Download the file content
    const fileId = files[0].id!;
    const fileResponse = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    });

    const fileContent = fileResponse.data as string;
    const parsedData = JSON.parse(fileContent);

    console.log('✅ Data loaded successfully from Google Drive');
    return NextResponse.json({ 
      success: true, 
      data: parsedData,
      fileId: fileId 
    });

  } catch (error: any) {
    console.error('❌ Error loading data from Google Drive:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}