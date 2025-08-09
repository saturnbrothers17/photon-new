import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_DRIVE_FOLDER_STRUCTURE = {
  ROOT: 'CoachingInstituteData',
  STUDENTS: 'Students',
  TEACHERS: 'Teachers',
  TESTS: 'Tests',
  RESULTS: 'Results',
  QUESTIONS: 'Questions',
  MATERIALS: 'StudyMaterials',
  ANALYTICS: 'Analytics',
  BACKUPS: 'Backups'
};

export async function POST(request: NextRequest) {
  try {
    const { folderName, parentFolderId, structureType } = await request.json();
    
    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Create folder structure
    const folderId = await createFolderStructure(drive, folderName, parentFolderId, structureType);
    
    return NextResponse.json({ 
      success: true, 
      folderId,
      folderName,
      structure: GOOGLE_DRIVE_FOLDER_STRUCTURE
    });

  } catch (error: any) {
    console.error('Error in folder structure:', error);
    return NextResponse.json({ 
      error: 'Failed to get folder structure', 
      details: error.message 
    }, { status: 500 });
  }
}

async function createFolderStructure(drive: any, rootFolderName: string, parentId?: string, structureType?: string) {
  const rootFolderId = await ensureFolder(drive, rootFolderName, parentId);
  
  // Create sub-folders based on structure type
  const subFolders = structureType === 'tests' 
    ? [GOOGLE_DRIVE_FOLDER_STRUCTURE.TESTS, GOOGLE_DRIVE_FOLDER_STRUCTURE.RESULTS, GOOGLE_DRIVE_FOLDER_STRUCTURE.QUESTIONS]
    : structureType === 'students' 
    ? [GOOGLE_DRIVE_FOLDER_STRUCTURE.STUDENTS, GOOGLE_DRIVE_FOLDER_STRUCTURE.RESULTS]
    : [GOOGLE_DRIVE_FOLDER_STRUCTURE.MATERIALS, GOOGLE_DRIVE_FOLDER_STRUCTURE.ANALYTICS, GOOGLE_DRIVE_FOLDER_STRUCTURE.BACKUPS];

  for (const folderName of subFolders) {
    await ensureFolder(drive, folderName, rootFolderId);
  }

  return rootFolderId;
}

async function ensureFolder(drive: any, folderName: string, parentId?: string) {
  // Check if folder exists
  const query = parentId 
    ? `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id;
  }

  // Create folder if it doesn't exist
  const folderMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId && { parents: [parentId] }),
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  return folder.data.id;
}
