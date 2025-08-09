import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const FOLDER_STRUCTURE = {
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
    const testResult = await request.json();
    
    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Ensure folder structure exists
    const rootFolderId = await ensureFolder(drive, FOLDER_STRUCTURE.ROOT);
    const resultsFolderId = await ensureFolder(drive, FOLDER_STRUCTURE.RESULTS, rootFolderId);
    const testsFolderId = await ensureFolder(drive, FOLDER_STRUCTURE.TESTS, rootFolderId);

    // Create student-specific folder
    const studentId = testResult.studentId || 'anonymous';
    const studentFolderId = await ensureFolder(drive, studentId, resultsFolderId);

    // Create test-specific folder
    const testFolderId = await ensureFolder(drive, testResult.testId, studentFolderId);

    // Save test result
    const fileName = `result_${testResult.testId}_${Date.now()}.json`;
    const fileMetadata = {
      name: fileName,
      parents: [testFolderId],
    };

    const media = {
      mimeType: 'application/json',
      body: JSON.stringify(testResult, null, 2),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    return NextResponse.json({ 
      success: true, 
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
      folderPath: `${FOLDER_STRUCTURE.ROOT}/${FOLDER_STRUCTURE.RESULTS}/${studentId}/${testResult.testId}`
    });

  } catch (error) {
    console.error('Error saving test result:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId') || 'latest';
    const studentId = searchParams.get('studentId') || 'anonymous';

    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Ensure folder structure exists
    const rootFolderId = await ensureFolder(drive, FOLDER_STRUCTURE.ROOT);
    const resultsFolderId = await ensureFolder(drive, FOLDER_STRUCTURE.RESULTS, rootFolderId);
    const studentFolderId = await ensureFolder(drive, studentId, resultsFolderId);
    const testFolderId = await ensureFolder(drive, testId, studentFolderId);

    // Get all test results for this test
    const response = await drive.files.list({
      q: `'${testFolderId}' in parents and name contains 'result_' and mimeType='application/json'`,
      fields: 'files(id, name, createdTime, modifiedTime, webViewLink)',
      orderBy: 'createdTime desc',
    });

    const results = await Promise.all(
      (response.data.files || []).map(async (file) => {
        if (!file.id) return null;
        const fileResponse = await drive.files.get({
          fileId: file.id,
          alt: 'media',
        });
        return {
          ...file,
          data: fileResponse.data,
        };
      }).filter(Boolean)
    );

    return NextResponse.json({ 
      success: true, 
      results,
      folderPath: `${FOLDER_STRUCTURE.ROOT}/${FOLDER_STRUCTURE.RESULTS}/${studentId}/${testId}`
    });

  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

async function ensureFolder(drive: any, folderName: string, parentId?: string) {
  const query = parentId 
    ? `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

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
