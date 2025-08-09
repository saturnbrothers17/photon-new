import { google } from 'googleapis';

export interface FolderStructure {
  root: string;
  student: string;
  test: string;
  type: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  webViewLink?: string;
}

export class GoogleDriveFolderManager {
  private drive: any;
  private rootFolderName = 'CoachingInstituteData';
  
  private folderStructure = {
    ROOT: 'CoachingInstituteData',
    STUDENTS: 'Students',
    TEACHERS: 'Teachers',
    TESTS: 'Tests',
    RESULTS: 'Results',
    QUESTIONS: 'Questions',
    MATERIALS: 'StudyMaterials',
    ANALYTICS: 'Analytics',
    BACKUPS: 'Backups',
    STUDENT_PROFILES: 'StudentProfiles',
    ATTENDANCE: 'Attendance',
    FEES: 'Fees',
    NOTIFICATIONS: 'Notifications',
    ASSIGNMENTS: 'Assignments',
    PERFORMANCE: 'Performance',
    REPORTS: 'Reports'
  };

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  async ensureFolderStructure(): Promise<DriveFolder> {
    const rootFolderId = await this.ensureFolder(this.rootFolderName);
    
    // Create main category folders
    await Promise.all([
      this.ensureFolder(this.folderStructure.STUDENTS, rootFolderId),
      this.ensureFolder(this.folderStructure.TEACHERS, rootFolderId),
      this.ensureFolder(this.folderStructure.TESTS, rootFolderId),
      this.ensureFolder(this.folderStructure.MATERIALS, rootFolderId),
      this.ensureFolder(this.folderStructure.ANALYTICS, rootFolderId),
      this.ensureFolder(this.folderStructure.BACKUPS, rootFolderId),
    ]);

    return {
      id: rootFolderId,
      name: this.rootFolderName,
    };
  }

  async getStudentFolderStructure(studentId: string): Promise<{
    studentRoot: string;
    results: string;
    assignments: string;
    performance: string;
    attendance: string;
  }> {
    const rootFolderId = await this.ensureFolder(this.rootFolderName);
    const studentsFolderId = await this.ensureFolder(this.folderStructure.STUDENTS, rootFolderId);
    const studentFolderId = await this.ensureFolder(studentId, studentsFolderId);

    const folders = await Promise.all([
      this.ensureFolder(this.folderStructure.RESULTS, studentFolderId),
      this.ensureFolder(this.folderStructure.ASSIGNMENTS, studentFolderId),
      this.ensureFolder(this.folderStructure.PERFORMANCE, studentFolderId),
      this.ensureFolder(this.folderStructure.ATTENDANCE, studentFolderId),
    ]);

    return {
      studentRoot: studentFolderId,
      results: folders[0],
      assignments: folders[1],
      performance: folders[2],
      attendance: folders[3],
    };
  }

  async getTestFolderStructure(testId: string, studentId?: string): Promise<{
    testRoot: string;
    questions: string;
    results: string;
    analytics: string;
  }> {
    const rootFolderId = await this.ensureFolder(this.rootFolderName);
    const testsFolderId = await this.ensureFolder(this.folderStructure.TESTS, rootFolderId);
    const testFolderId = await this.ensureFolder(testId, testsFolderId);

    const folders = await Promise.all([
      this.ensureFolder(this.folderStructure.QUESTIONS, testFolderId),
      this.ensureFolder(this.folderStructure.RESULTS, testFolderId),
      this.ensureFolder(this.folderStructure.ANALYTICS, testFolderId),
    ]);

    return {
      testRoot: testFolderId,
      questions: folders[0],
      results: folders[1],
      analytics: folders[2],
    };
  }

  async saveFileToFolder(
    folderId: string,
    fileName: string,
    content: any,
    mimeType: string = 'application/json'
  ): Promise<{
    id: string;
    webViewLink: string;
    folderPath: string;
  }> {
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType,
      body: JSON.stringify(content, null, 2),
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    return {
      id: response.data.id!,
      webViewLink: response.data.webViewLink!,
      folderPath: folderId,
    };
  }

  async getFilesFromFolder(folderId: string, fileType?: string): Promise<any[]> {
    const query = `'${folderId}' in parents${fileType ? ` and name contains '${fileType}'` : ''}`;
    
    const response = await this.drive.files.list({
      q: query,
      fields: 'files(id, name, createdTime, modifiedTime, webViewLink)',
      orderBy: 'createdTime desc',
    });

    return Promise.all(
      (response.data.files || []).map(async (file) => {
        if (!file.id) return null;
        
        try {
          const fileResponse = await this.drive.files.get({
            fileId: file.id,
            alt: 'media',
          });
          
          return {
            ...file,
            data: fileResponse.data,
          };
        } catch (error) {
          console.error(`Error fetching file ${file.name}:`, error);
          return null;
        }
      }).filter(Boolean)
    );
  }

  private async ensureFolder(folderName: string, parentId?: string): Promise<string> {
    const query = parentId 
      ? `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
      : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const response = await this.drive.files.list({
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

    const folder = await this.drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    return folder.data.id!;
  }

  async getFolderPath(folderId: string): Promise<string[]> {
    const path: string[] = [];
    let currentId = folderId;

    while (currentId) {
      const response = await this.drive.files.get({
        fileId: currentId,
        fields: 'id, name, parents',
      });

      if (response.data.name) {
        path.unshift(response.data.name);
      }

      if (response.data.parents && response.data.parents.length > 0) {
        currentId = response.data.parents[0];
      } else {
        break;
      }
    }

    return path;
  }

  async createBackupFolder(): Promise<string> {
    const rootFolderId = await this.ensureFolder(this.rootFolderName);
    const backupFolderId = await this.ensureFolder(this.folderStructure.BACKUPS, rootFolderId);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const dailyBackupFolderId = await this.ensureFolder(`backup_${timestamp}`, backupFolderId);
    
    return dailyBackupFolderId;
  }
}
