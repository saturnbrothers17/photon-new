import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { data, fileName = 'photon_coaching_data.json' } = await request.json();
    
    console.log('💾 Saving data to Google Drive (Service Account)...');

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

    // Convert data to JSON string
    const jsonContent = JSON.stringify(data, null, 2);

    // Simple search for existing file (no folders - faster)
    const searchResponse = await drive.files.list({
      q: `name='${fileName}' and trashed=false`,
      fields: 'files(id, name)',
    });

    const files = searchResponse.data.files;
    let fileId: string;

    if (files && files.length > 0) {
      // Update existing file
      fileId = files[0].id!;
      console.log('🔄 Updating existing file:', fileName);
      
      await drive.files.update({
        fileId: fileId,
        media: {
          mimeType: 'application/json',
          body: jsonContent,
        },
      });
    } else {
      // Create new file
      console.log('📝 Creating new file:', fileName);
      
      const createResponse = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: 'application/json',
          description: 'PHOTON Coaching Institute - Application Data'
        },
        media: {
          mimeType: 'application/json',
          body: jsonContent,
        },
      });
      
      fileId = createResponse.data.id!;
    }

    console.log('✅ Data saved successfully to Google Drive');
    return NextResponse.json({ 
      success: true, 
      fileId: fileId,
      message: 'Data saved successfully' 
    });

  } catch (error: any) {
    console.error('❌ Error saving data to Google Drive:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}