import { google } from 'googleapis';

// Folder structure configuration
export const DRIVE_FOLDERS = {
  ROOT: 'PHOTON Coaching Institute',
  TESTS: 'PHOTON Tests',
  STUDY_MATERIALS: 'Study Materials',
  STUDENT_DATA: 'Student Data',
  ANALYTICS: 'Analytics & Reports',
  BACKUPS: 'System Backups',
  QUESTION_BANKS: 'Question Banks'
} as const;

// Subject-wise subfolders
export const SUBJECT_FOLDERS = {
  PHYSICS: 'Physics',
  CHEMISTRY: 'Chemistry',
  MATHEMATICS: 'Mathematics',
  BIOLOGY: 'Biology',
  GENERAL: 'General'
} as const;

// Test type subfolders
export const TEST_TYPE_FOLDERS = {
  JEE_MAIN: 'JEE Main',
  JEE_ADVANCED: 'JEE Advanced',
  NEET: 'NEET',
  CHAPTER_TESTS: 'Chapter Tests',
  MOCK_TESTS: 'Mock Tests',
  PRACTICE_TESTS: 'Practice Tests'
} as const;

export class GoogleDriveAutoSync {
  private drive: any;
  private auth: any;
  private folderCache: Map<string, string> = new Map();

  constructor(tokens: any) {
    this.initializeAuth(tokens);
  }

  private initializeAuth(tokens: any) {
    this.auth = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_REDIRECT_URI
    );
    this.auth.setCredentials(tokens);
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  // Create or get folder by path
  private async ensureFolder(folderPath: string[], parentId?: string): Promise<string> {
    const cacheKey = folderPath.join('/');
    if (this.folderCache.has(cacheKey)) {
      return this.folderCache.get(cacheKey)!;
    }

    let currentParentId = parentId;
    
    for (const folderName of folderPath) {
      // Search for existing folder
      const query = currentParentId 
        ? `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and parents in '${currentParentId}'`
        : `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`;

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
      });

      if (response.data.files && response.data.files.length > 0) {
        currentParentId = response.data.files[0].id;
      } else {
        // Create new folder
        const folderMetadata: any = {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        };

        if (currentParentId) {
          folderMetadata.parents = [currentParentId];
        }

        const folderResponse = await this.drive.files.create({
          requestBody: folderMetadata,
          fields: 'id',
        });

        currentParentId = folderResponse.data.id;
        console.log(`✅ Created folder: ${folderName} (${currentParentId})`);
      }
    }

    this.folderCache.set(cacheKey, currentParentId!);
    return currentParentId!;
  }

  // Initialize the complete folder structure
  async initializeFolderStructure(): Promise<void> {
    console.log('🏗️ Initializing PHOTON folder structure...');

    // Create root folder
    const rootFolderId = await this.ensureFolder([DRIVE_FOLDERS.ROOT]);

    // Create main category folders
    const mainFolders = [
      DRIVE_FOLDERS.TESTS,
      DRIVE_FOLDERS.STUDY_MATERIALS,
      DRIVE_FOLDERS.STUDENT_DATA,
      DRIVE_FOLDERS.ANALYTICS,
      DRIVE_FOLDERS.BACKUPS,
      DRIVE_FOLDERS.QUESTION_BANKS
    ];

    for (const folder of mainFolders) {
      await this.ensureFolder([DRIVE_FOLDERS.ROOT, folder]);
    }

    // Create test type subfolders
    for (const testType of Object.values(TEST_TYPE_FOLDERS)) {
      await this.ensureFolder([DRIVE_FOLDERS.ROOT, DRIVE_FOLDERS.TESTS, testType]);
      
      // Create subject subfolders for each test type
      for (const subject of Object.values(SUBJECT_FOLDERS)) {
        await this.ensureFolder([DRIVE_FOLDERS.ROOT, DRIVE_FOLDERS.TESTS, testType, subject]);
      }
    }

    // Create subject folders for study materials
    for (const subject of Object.values(SUBJECT_FOLDERS)) {
      await this.ensureFolder([DRIVE_FOLDERS.ROOT, DRIVE_FOLDERS.STUDY_MATERIALS, subject]);
    }

    // Create question bank subject folders
    for (const subject of Object.values(SUBJECT_FOLDERS)) {
      await this.ensureFolder([DRIVE_FOLDERS.ROOT, DRIVE_FOLDERS.QUESTION_BANKS, subject]);
    }

    console.log('✅ Folder structure initialized successfully');
  }

  // Upload test data
  async uploadTest(testData: any): Promise<string> {
    try {
      console.log(`📝 Uploading test: ${testData.name}`);

      // Determine folder path based on test type and subject
      const testType = this.mapTestType(testData.type);
      const subject = this.mapSubject(testData.subject || 'General');
      
      const folderPath = [DRIVE_FOLDERS.ROOT, DRIVE_FOLDERS.TESTS, testType, subject];
      const folderId = await this.ensureFolder(folderPath);

      // Create file metadata
      const fileName = `${testData.name}_${testData.id}_${Date.now()}.json`;
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
        description: `Test: ${testData.name} | Type: ${testData.type} | Subject: ${subject} | Questions: ${testData.totalQuestions}`
      };

      // Prepare file content
      const fileContent = {
        ...testData,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'PHOTON Auto-Sync',
        folderPath: folderPath.join(' > ')
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(fileContent, null, 2),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size, createdTime, parents',
      });

      console.log(`✅ Test uploaded: ${fileName} (${response.data.id})`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Error uploading test:', error);
      throw error;
    }
  }

  // Upload study material
  async uploadStudyMaterial(materialData: any, fileBlob?: Blob): Promise<string> {
    try {
      console.log(`📚 Uploading study material: ${materialData.title}`);

      const subject = this.mapSubject(materialData.subject || 'General');
      const folderPath = [DRIVE_FOLDERS.ROOT, DRIVE_FOLDERS.STUDY_MATERIALS, subject];
      const folderId = await this.ensureFolder(folderPath);

      const fileName = fileBlob 
        ? `${materialData.title}_${Date.now()}.${this.getFileExtension(materialData.fileName)}`
        : `${materialData.title}_${Date.now()}.json`;

      const fileMetadata = {
        name: fileName,
        parents: [folderId],
        description: `Study Material: ${materialData.title} | Subject: ${subject} | Type: ${materialData.type || 'Document'}`
      };

      let media;
      if (fileBlob) {
        // Upload actual file (PDF, image, etc.)
        media = {
          mimeType: materialData.mimeType || 'application/octet-stream',
          body: fileBlob,
        };
      } else {
        // Upload as JSON metadata
        const content = {
          ...materialData,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'PHOTON Auto-Sync',
          folderPath: folderPath.join(' > ')
        };
        media = {
          mimeType: 'application/json',
          body: JSON.stringify(content, null, 2),
        };
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size, createdTime, parents',
      });

      console.log(`✅ Study material uploaded: ${fileName} (${response.data.id})`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Error uploading study material:', error);
      throw error;
    }
  }

  // Upload student data
  async uploadStudentData(studentData: any): Promise<string> {
    try {
      console.log(`👨‍🎓 Uploading student data: ${studentData.name || 'Student Record'}`);

      const folderPath = [DRIVE_FOLDERS.ROOT, DRIVE_FOLDERS.STUDENT_DATA];
      const folderId = await this.ensureFolder(folderPath);

      const fileName = `student_${studentData.id || Date.now()}_${Date.now()}.json`;
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
        description: `Student Data: ${studentData.name || 'Unknown'} | ID: ${studentData.id || 'N/A'}`
      };

      const content = {
        ...studentData,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'PHOTON Auto-Sync',
        folderPath: folderPath.join(' > ')
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(content, null, 2),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size, createdTime, parents',
      });

      console.log(`✅ Student data uploaded: ${fileName} (${response.data.id})`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Error uploading student data:', error);
      throw error;
    }
  }

  // Upload analytics report
  async uploadAnalyticsReport(reportData: any): Promise<string> {
    try {
      console.log(`📊 Uploading analytics report: ${reportData.title}`);

      const folderPath = [DRIVE_FOLDERS.ROOT, DRIVE_FOLDERS.ANALYTICS];
      const folderId = await this.ensureFolder(folderPath);

      const fileName = `analytics_${reportData.type || 'report'}_${Date.now()}.json`;
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
        description: `Analytics Report: ${reportData.title} | Type: ${reportData.type || 'General'}`
      };

      const content = {
        ...reportData,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'PHOTON Auto-Sync',
        folderPath: folderPath.join(' > ')
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(content, null, 2),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size, createdTime, parents',
      });

      console.log(`✅ Analytics report uploaded: ${fileName} (${response.data.id})`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Error uploading analytics report:', error);
      throw error;
    }
  }

  // Create system backup
  async createSystemBackup(backupData: any): Promise<string> {
    try {
      console.log('💾 Creating system backup...');

      const folderPath = [DRIVE_FOLDERS.ROOT, DRIVE_FOLDERS.BACKUPS];
      const folderId = await this.ensureFolder(folderPath);

      const fileName = `system_backup_${Date.now()}.json`;
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
        description: `Complete system backup created on ${new Date().toLocaleString()}`
      };

      const content = {
        backupType: 'complete_system',
        timestamp: new Date().toISOString(),
        data: backupData,
        metadata: {
          totalKeys: Object.keys(backupData).length,
          backupSize: JSON.stringify(backupData).length,
          version: '1.0',
          institute: 'PHOTON Coaching Institute'
        },
        folderPath: folderPath.join(' > ')
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(content, null, 2),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size, createdTime, parents',
      });

      console.log(`✅ System backup created: ${fileName} (${response.data.id})`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Error creating system backup:', error);
      throw error;
    }
  }

  // List files in a specific folder
  async listFolderContents(folderPath: string[]): Promise<any[]> {
    try {
      const folderId = await this.ensureFolder(folderPath);
      
      const response = await this.drive.files.list({
        q: `parents in '${folderId}'`,
        fields: 'files(id, name, size, createdTime, modifiedTime, mimeType, description)',
        orderBy: 'createdTime desc',
      });

      return response.data.files || [];
    } catch (error) {
      console.error('❌ Error listing folder contents:', error);
      throw error;
    }
  }

  // Get folder structure overview
  async getFolderStructure(): Promise<any> {
    try {
      const structure = {
        root: DRIVE_FOLDERS.ROOT,
        folders: {},
        totalFiles: 0,
        totalSize: 0
      };

      // Get main folders
      for (const [key, folderName] of Object.entries(DRIVE_FOLDERS)) {
        if (key === 'ROOT') continue;
        
        try {
          const files = await this.listFolderContents([DRIVE_FOLDERS.ROOT, folderName]);
          structure.folders[key] = {
            name: folderName,
            fileCount: files.length,
            files: files.slice(0, 5), // Show only first 5 files
            totalSize: files.reduce((sum, file) => sum + (parseInt(file.size) || 0), 0)
          };
          structure.totalFiles += files.length;
          structure.totalSize += structure.folders[key].totalSize;
        } catch (error) {
          structure.folders[key] = {
            name: folderName,
            fileCount: 0,
            files: [],
            totalSize: 0,
            error: 'Folder not accessible'
          };
        }
      }

      return structure;
    } catch (error) {
      console.error('❌ Error getting folder structure:', error);
      throw error;
    }
  }

  // Helper methods
  private mapTestType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'JEE Main': TEST_TYPE_FOLDERS.JEE_MAIN,
      'JEE Advanced': TEST_TYPE_FOLDERS.JEE_ADVANCED,
      'NEET': TEST_TYPE_FOLDERS.NEET,
      'Chapter Test': TEST_TYPE_FOLDERS.CHAPTER_TESTS,
      'Mock Test': TEST_TYPE_FOLDERS.MOCK_TESTS,
      'Practice Test': TEST_TYPE_FOLDERS.PRACTICE_TESTS
    };
    return typeMap[type] || TEST_TYPE_FOLDERS.MOCK_TESTS;
  }

  private mapSubject(subject: string): string {
    const subjectMap: { [key: string]: string } = {
      'Physics': SUBJECT_FOLDERS.PHYSICS,
      'Chemistry': SUBJECT_FOLDERS.CHEMISTRY,
      'Mathematics': SUBJECT_FOLDERS.MATHEMATICS,
      'Math': SUBJECT_FOLDERS.MATHEMATICS,
      'Biology': SUBJECT_FOLDERS.BIOLOGY,
      'Bio': SUBJECT_FOLDERS.BIOLOGY
    };
    return subjectMap[subject] || SUBJECT_FOLDERS.GENERAL;
  }

  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop() || 'txt';
  }
}