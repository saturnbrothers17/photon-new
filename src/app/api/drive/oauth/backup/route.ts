import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// POST - Create backup using OAuth tokens
export async function POST(request: NextRequest) {
  try {
    console.log('📋 OAuth Backup API called');
    
    const { backupData, tokens } = await request.json();
    
    if (!backupData || !tokens) {
      return NextResponse.json(
        { success: false, error: 'Backup data and tokens are required' },
        { status: 400 }
      );
    }

    console.log('🔑 Setting up OAuth client...');
    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_REDIRECT_URI
    );

    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    console.log('📁 Ensuring folder exists...');
    // Create or find the folder
    const folderName = 'CoachingInstituteTests';
    let folderId;

    const folderResponse = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
    });

    if (folderResponse.data.files && folderResponse.data.files.length > 0) {
      folderId = folderResponse.data.files[0].id;
      console.log('✅ Found existing folder:', folderId);
    } else {
      const createFolderResponse = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      folderId = createFolderResponse.data.id;
      console.log('✅ Created new folder:', folderId);
    }

    console.log('💾 Creating backup file...');
    const backupFile = {
      timestamp: new Date().toISOString(),
      data: backupData
    };

    const fileMetadata = {
      name: `backup_${Date.now()}.json`,
      parents: [folderId],
    };

    const media = {
      mimeType: 'application/json',
      body: JSON.stringify(backupFile, null, 2),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, size',
    });

    console.log('✅ Backup created successfully:', response.data.id);
    return NextResponse.json({ 
      success: true, 
      fileId: response.data.id,
      fileName: response.data.name,
      size: response.data.size
    });

  } catch (error: any) {
    console.error('❌ Error creating backup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to create backup: ${error.message}` 
      },
      { status: 500 }
    );
  }
}

// GET - List files using OAuth tokens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokensParam = searchParams.get('tokens');
    
    if (!tokensParam) {
      return NextResponse.json(
        { success: false, error: 'Tokens are required' },
        { status: 400 }
      );
    }

    const tokens = JSON.parse(decodeURIComponent(tokensParam));

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_REDIRECT_URI
    );

    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Find the folder
    const folderName = 'CoachingInstituteTests';
    const folderResponse = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
    });

    if (!folderResponse.data.files || folderResponse.data.files.length === 0) {
      return NextResponse.json({ 
        success: true, 
        files: [] 
      });
    }

    const folderId = folderResponse.data.files[0].id;

    // List files in the folder
    const filesResponse = await drive.files.list({
      q: `parents in '${folderId}'`,
      fields: 'files(id, name, size, createdTime, modifiedTime)',
      orderBy: 'createdTime desc',
    });

    return NextResponse.json({ 
      success: true, 
      files: filesResponse.data.files || [] 
    });

  } catch (error: any) {
    console.error('❌ Error listing files:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to list files: ${error.message}` 
      },
      { status: 500 }
    );
  }
}