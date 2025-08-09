import { google } from 'googleapis';

// Seamless cloud storage system - always connected, no user intervention required
export class SeamlessCloudStorage {
  private drive: any;
  private auth: any;
  private isInitialized = false;
  private folderCache: Map<string, string> = new Map();

  constructor() {
    this.initializeServiceAccount();
  }

  private async initializeServiceAccount() {
    try {
      console.log('🔧 Initializing seamless cloud storage...');

      // Use Service Account for always-on connection
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          project_id: process.env.GOOGLE_PROJECT_ID,
        },
        scopes: [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.metadata.readonly'
        ],
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.isInitialized = true;
      
      console.log('✅ Seamless cloud storage initialized - always connected!');
      
      // Initialize folder structure on startup
      await this.ensureFolderStructure();
    } catch (error) {
      console.error('❌ Failed to initialize seamless cloud storage:', error);
      // Don't throw error - system should work without cloud if needed
    }
  }

  // Check if cloud storage is ready
  isReady(): boolean {
    return this.isInitialized;
  }

  // Ensure complete folder structure exists
  private async ensureFolderStructure(): Promise<void> {
    try {
      console.log('🏗️ Setting up PHOTON folder structure...');

      const rootFolder = await this.ensureFolder('PHOTON Coaching Institute');
      
      // Main categories
      const mainFolders = [
        'PHOTON Tests',
        'Study Materials', 
        'Student Data',
        'Analytics & Reports',
        'System Backups',
        'Question Banks'
      ];

      for (const folderName of mainFolders) {
        await this.ensureFolder(folderName, rootFolder);
      }

      // Test type subfolders
      const testTypesFolder = await this.ensureFolder('PHOTON Tests', rootFolder);
      const testTypes = ['JEE Main', 'JEE Advanced', 'NEET', 'Chapter Tests', 'Mock Tests', 'Practice Tests'];
      
      for (const testType of testTypes) {
        const testTypeFolder = await this.ensureFolder(testType, testTypesFolder);
        
        // Subject subfolders for each test type
        const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General'];
        for (const subject of subjects) {
          await this.ensureFolder(subject, testTypeFolder);
        }
      }

      // Study materials subfolders
      const studyFolder = await this.ensureFolder('Study Materials', rootFolder);
      const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General'];
      for (const subject of subjects) {
        await this.ensureFolder(subject, studyFolder);
      }

      console.log('✅ PHOTON folder structure ready');
    } catch (error) {
      console.error('❌ Error setting up folder structure:', error);
    }
  }

  // Create or get folder
  private async ensureFolder(folderName: string, parentId?: string): Promise<string> {
    const cacheKey = parentId ? `${parentId}/${folderName}` : folderName;
    
    if (this.folderCache.has(cacheKey)) {
      return this.folderCache.get(cacheKey)!;
    }

    try {
      // Search for existing folder
      const query = parentId 
        ? `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and parents in '${parentId}'`
        : `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`;

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
      });

      let folderId;
      if (response.data.files && response.data.files.length > 0) {
        folderId = response.data.files[0].id;
      } else {
        // Create new folder
        const folderMetadata: any = {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        };

        if (parentId) {
          folderMetadata.parents = [parentId];
        }

        const folderResponse = await this.drive.files.create({
          requestBody: folderMetadata,
          fields: 'id',
        });

        folderId = folderResponse.data.id;
        console.log(`📁 Created folder: ${folderName}`);
      }

      this.folderCache.set(cacheKey, folderId);
      return folderId;
    } catch (error) {
      console.error(`Error ensuring folder ${folderName}:`, error);
      throw error;
    }
  }

  // Seamlessly publish test (called automatically when test is created)
  async publishTest(testData: any, questions: any[] = []): Promise<string | null> {
    if (!this.isInitialized) {
      console.log('⚠️ Cloud storage not ready, test saved locally only');
      return null;
    }

    try {
      console.log('📤 Seamlessly publishing test to cloud:', testData.name);

      // Determine folder path
      const testType = this.mapTestType(testData.type);
      const subject = this.mapSubject(testData.subject || 'General');
      
      const rootFolder = await this.ensureFolder('PHOTON Coaching Institute');
      const testsFolder = await this.ensureFolder('PHOTON Tests', rootFolder);
      const typeFolder = await this.ensureFolder(testType, testsFolder);
      const subjectFolder = await this.ensureFolder(subject, typeFolder);

      // Create comprehensive test package
      const testPackage = {
        ...testData,
        questions: questions,
        publishedAt: new Date().toISOString(),
        publishedBy: 'PHOTON Coaching Institute',
        version: '1.0',
        cloudId: `test_${testData.id}_${Date.now()}`,
        accessLevel: 'public',
        folderPath: `PHOTON Tests/${testType}/${subject}`,
        metadata: {
          totalQuestions: questions.length,
          subjects: testData.subjects || [subject],
          estimatedDuration: testData.duration,
          maxMarks: testData.maxMarks || questions.reduce((sum, q) => sum + (q.marks || 1), 0),
          createdBy: 'PHOTON Faculty',
          institute: 'PHOTON Coaching Institute'
        }
      };

      // Upload to Google Drive
      const fileName = `${testData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${testData.id}_${Date.now()}.json`;
      const fileMetadata = {
        name: fileName,
        parents: [subjectFolder],
        description: `Test: ${testData.name} | Type: ${testData.type} | Subject: ${subject} | Questions: ${questions.length}`
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(testPackage, null, 2),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size, createdTime, parents',
      });

      console.log('✅ Test seamlessly published to cloud:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('❌ Error publishing test to cloud:', error);
      // Don't throw error - system should continue working
      return null;
    }
  }

  // Seamlessly fetch all available tests
  async fetchAllTests(): Promise<any[]> {
    if (!this.isInitialized) {
      console.log('⚠️ Cloud storage not ready, returning empty array');
      return [];
    }

    try {
      console.log('📥 Seamlessly fetching all tests from cloud...');

      const rootFolder = await this.ensureFolder('PHOTON Coaching Institute');
      const testsFolder = await this.ensureFolder('PHOTON Tests', rootFolder);

      // Get all test files recursively
      const allTests = await this.getAllTestsRecursively(testsFolder);
      
      console.log(`✅ Seamlessly loaded ${allTests.length} tests from cloud`);
      return allTests;
    } catch (error) {
      console.error('❌ Error fetching tests from cloud:', error);
      return [];
    }
  }

  // Recursively get all test files from folders
  private async getAllTestsRecursively(folderId: string): Promise<any[]> {
    const tests: any[] = [];

    try {
      const response = await this.drive.files.list({
        q: `parents in '${folderId}'`,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime)',
      });

      for (const file of response.data.files || []) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          // Recursively search subfolders
          const subTests = await this.getAllTestsRecursively(file.id);
          tests.push(...subTests);
        } else if (file.name.endsWith('.json') && file.name.includes('test_')) {
          try {
            // Download and parse test file
            const testContent = await this.downloadTestFile(file.id);
            const testData = JSON.parse(testContent);
            
            // Add cloud metadata
            testData.cloudId = file.id;
            testData.cloudFileName = file.name;
            testData.lastModified = file.modifiedTime;
            testData.fileSize = file.size;
            testData.isCloudTest = true;
            testData.source = 'cloud';
            
            tests.push(testData);
          } catch (error) {
            console.error(`Error processing test file ${file.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error getting tests from folder:', error);
    }

    return tests;
  }

  // Download test file content
  private async downloadTestFile(fileId: string): Promise<string> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading test file:', error);
      throw error;
    }
  }

  // Create system backup
  async createBackup(data: any): Promise<string | null> {
    if (!this.isInitialized) {
      console.log('⚠️ Cloud storage not ready, backup not created');
      return null;
    }

    try {
      console.log('💾 Creating seamless system backup...');

      const rootFolder = await this.ensureFolder('PHOTON Coaching Institute');
      const backupFolder = await this.ensureFolder('System Backups', rootFolder);

      const backupData = {
        timestamp: new Date().toISOString(),
        institute: 'PHOTON Coaching Institute',
        backupType: 'complete_system',
        data: data,
        metadata: {
          totalKeys: Object.keys(data).length,
          backupSize: JSON.stringify(data).length,
          version: '1.0'
        }
      };

      const fileName = `system_backup_${Date.now()}.json`;
      const fileMetadata = {
        name: fileName,
        parents: [backupFolder],
        description: `Complete system backup created on ${new Date().toLocaleString()}`
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(backupData, null, 2),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size',
      });

      console.log('✅ System backup created seamlessly:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      return null;
    }
  }

  // Helper methods
  private mapTestType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'JEE Main': 'JEE Main',
      'JEE Advanced': 'JEE Advanced',
      'NEET': 'NEET',
      'Chapter Test': 'Chapter Tests',
      'Mock Test': 'Mock Tests',
      'Practice Test': 'Practice Tests'
    };
    return typeMap[type] || 'Mock Tests';
  }

  private mapSubject(subject: string): string {
    const subjectMap: { [key: string]: string } = {
      'Physics': 'Physics',
      'Chemistry': 'Chemistry',
      'Mathematics': 'Mathematics',
      'Math': 'Mathematics',
      'Biology': 'Biology',
      'Bio': 'Biology'
    };
    return subjectMap[subject] || 'General';
  }

  // Get storage statistics
  async getStorageStats(): Promise<any> {
    if (!this.isInitialized) {
      return { connected: false, totalTests: 0, totalSize: 0 };
    }

    try {
      const tests = await this.fetchAllTests();
      const totalSize = tests.reduce((sum, test) => sum + (parseInt(test.fileSize) || 0), 0);

      return {
        connected: true,
        totalTests: tests.length,
        totalSize: totalSize,
        lastSync: new Date().toISOString(),
        status: 'Always Connected'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { connected: false, error: errorMessage };
    }
  }
}

// Singleton instance - always available
export const seamlessCloudStorage = new SeamlessCloudStorage();