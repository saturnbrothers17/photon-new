import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up PHOTON Coaching Institute folder structure...');

    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`,
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Create main PHOTON folder
    const mainFolderName = 'PHOTON Coaching Institute';
    let mainFolderId = await createOrFindFolder(drive, mainFolderName, null);

    // Create subfolders
    const subfolders = [
      'Tests',
      'Test Results', 
      'Study Materials',
      'Student Progress',
      'Backups'
    ];

    const createdFolders = { mainFolderId };

    for (const subfolder of subfolders) {
      const subfolderId = await createOrFindFolder(drive, subfolder, mainFolderId);
      createdFolders[subfolder.toLowerCase().replace(' ', '_')] = subfolderId;
    }

    // Create a welcome file
    const welcomeContent = `
# PHOTON Coaching Institute - Data Storage

This folder contains all your PHOTON Coaching Institute data:

## Folder Structure:
- **Tests**: All test data and questions
- **Test Results**: Student test results and analytics  
- **Study Materials**: Educational content and resources
- **Student Progress**: Individual student progress tracking
- **Backups**: Automatic backups of all data

## System Information:
- Created: ${new Date().toISOString()}
- System: PHOTON Coaching Institute Management System
- Version: 1.0.0

Your data is automatically synchronized and backed up to this Google Drive folder.
All data persists across devices and browser sessions.

## Support:
If you need help, contact your system administrator.
`;

    await drive.files.create({
      requestBody: {
        name: 'README - PHOTON System Info.txt',
        mimeType: 'text/plain',
        parents: [mainFolderId],
        description: 'PHOTON Coaching Institute System Information'
      },
      media: {
        mimeType: 'text/plain',
        body: welcomeContent,
      },
    });

    console.log('✅ PHOTON folder structure created successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'PHOTON Coaching Institute folder structure created successfully',
      folders: createdFolders,
      mainFolderId: mainFolderId
    });

  } catch (error: any) {
    console.error('❌ Error setting up folder structure:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

async function createOrFindFolder(drive: any, folderName: string, parentId: string | null): Promise<string> {
  try {
    // Search for existing folder
    const query = parentId 
      ? `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and parents in '${parentId}' and trashed=false`
      : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const searchResponse = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
    });

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      console.log(`📁 Found existing folder: ${folderName}`);
      return searchResponse.data.files[0].id;
    }

    // Create new folder
    console.log(`📁 Creating folder: ${folderName}`);
    const folderResponse = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
        description: `PHOTON Coaching Institute - ${folderName}`
      },
      fields: 'id, name'
    });

    const folderId = folderResponse.data.id;
    console.log(`✅ Created folder: ${folderName} (${folderId})`);

    return folderId;
  } catch (error) {
    console.error(`❌ Error creating folder ${folderName}:`, error);
    throw error;
  }
}