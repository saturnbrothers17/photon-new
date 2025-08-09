import { google } from 'googleapis';

// Seamless Google Drive Service - No OAuth Required
export class SeamlessGoogleDrive {
  private static instance: SeamlessGoogleDrive;
  private drive: any;
  private auth: any;
  private rootFolderId: string | null = null;
  private folderCache: Map<string, string> = new Map();
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): SeamlessGoogleDrive {
    if (!SeamlessGoogleDrive.instance) {
      SeamlessGoogleDrive.instance = new SeamlessGoogleDrive();
    }
    return SeamlessGoogleDrive.instance;
  }

  private async initialize() {
    if (this.initialized) return;

    try {
      console.log('🚀 Initializing Seamless Google Drive...');
      
      // Use service account credentials from environment variables
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          project_id: process.env.GOOGLE_PROJECT_ID,
        },
        scopes: [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive'
        ],
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });
      
      // Initialize folder structure
      await this.ensureFolderStructure();
      
      this.initialized = true;
      console.log('✅ Seamless Google Drive initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive:', error);
      throw new Error('Google Drive initialization failed');
    }
  }

  private async ensureFolderStructure() {
    try {
      // Get the Shared Drive ID from environment variable
      const sharedDriveId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
      
      if (!sharedDriveId) {
        throw new Error('❌ GOOGLE_DRIVE_ROOT_FOLDER_ID is not set in .env');
      }
      
      this.rootFolderId = sharedDriveId;
      console.log('📁 Using Shared Drive ID:', sharedDriveId);
      
      // Create essential subfolders inside the Shared Drive
      const folders = ['Tests', 'Results', 'StudyMaterials', 'Students', 'Teachers', 'Analytics'];
      
      for (const folderName of folders) {
        const folderId = await this.createOrGetFolder(folderName, sharedDriveId);
        this.folderCache.set(folderName, folderId);
      }
      
      console.log('✅ Folder structure ensured in Shared Drive');
    } catch (error) {
      console.error('❌ Failed to ensure folder structure:', error);
      throw error;
    }
  }

  private async createOrGetFolder(name: string, parentId: string | null): Promise<string> {
    try {
      // Search for existing folder
      const query = parentId 
        ? `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
        : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        includeItemsFromAllDrives: true,  // Include Shared Drives
        supportsAllDrives: true,          // Enable Shared Drives support
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create new folder if it doesn't exist
      const folderMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id',
        supportsAllDrives: true,  // Enable Shared Drives support
      });

      return folder.data.id;
    } catch (error) {
      console.error(`❌ Failed to create/get folder ${name}:`, error);
      throw error;
    }
  }

  // Public methods for seamless operations
  public async saveTest(testData: any): Promise<string> {
    await this.initialize();
    
    try {
      const testsFolder = this.folderCache.get('Tests');
      const fileName = `test_${testData.id || Date.now()}.json`;
      
      if (!testsFolder) {
        throw new Error('❌ Tests folder not found. Please ensure the Shared Drive is accessible.');
      }
      
      const fileMetadata = {
        name: fileName,
        parents: [testsFolder],
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(testData, null, 2),
      };

      console.log('📤 Uploading test to Shared Drive...');
      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        supportsAllDrives: true,
        fields: 'id,webViewLink',
      });

      console.log(`✅ Test saved: ${fileName}`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Failed to save test:', error);
      throw error;
    }
  }

  public async getTests(): Promise<any[]> {
    await this.initialize();
    
    try {
      const testsFolder = this.folderCache.get('Tests');
      
      const response = await this.drive.files.list({
        q: `parents in '${testsFolder}' and mimeType='application/json' and trashed=false`,
        fields: 'files(id, name, modifiedTime)',
        orderBy: 'modifiedTime desc',
      });

      const tests = [];
      
      for (const file of response.data.files || []) {
        try {
          const fileContent = await this.drive.files.get({
            fileId: file.id,
            alt: 'media',
          });
          
          const testData = JSON.parse(fileContent.data);
          tests.push({
            ...testData,
            driveFileId: file.id,
            lastModified: file.modifiedTime,
          });
        } catch (error) {
          console.warn(`⚠️ Failed to parse test file ${file.name}:`, error);
        }
      }

      return tests;
    } catch (error) {
      console.error('❌ Failed to get tests:', error);
      return [];
    }
  }

  public async getTestById(testId: string): Promise<any | null> {
    await this.initialize();
    
    try {
      const tests = await this.getTests();
      return tests.find(test => test.id === testId) || null;
    } catch (error) {
      console.error('❌ Failed to get test by ID:', error);
      return null;
    }
  }

  public async saveTestResult(resultData: any): Promise<string> {
    await this.initialize();
    
    try {
      const resultsFolder = this.folderCache.get('Results');
      const fileName = `result_${resultData.testId}_${resultData.studentId}_${Date.now()}.json`;
      
      const fileMetadata = {
        name: fileName,
        parents: [resultsFolder],
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(resultData, null, 2),
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });

      console.log(`✅ Test result saved: ${fileName}`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Failed to save test result:', error);
      throw error;
    }
  }

  public async getStudyMaterials(): Promise<any[]> {
    await this.initialize();
    
    try {
      const materialsFolder = this.folderCache.get('StudyMaterials');
      
      const response = await this.drive.files.list({
        q: `parents in '${materialsFolder}' and trashed=false`,
        fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink)',
        orderBy: 'modifiedTime desc',
      });

      return response.data.files || [];
    } catch (error) {
      console.error('❌ Failed to get study materials:', error);
      return [];
    }
  }

  public async uploadStudyMaterial(file: any, fileName: string): Promise<string> {
    await this.initialize();
    
    try {
      const materialsFolder = this.folderCache.get('StudyMaterials');
      
      const fileMetadata = {
        name: fileName,
        parents: [materialsFolder],
      };

      const media = {
        mimeType: file.type || 'application/octet-stream',
        body: file,
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
      });

      console.log(`✅ Study material uploaded: ${fileName}`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Failed to upload study material:', error);
      throw error;
    }
  }

  public async getLiveTests(): Promise<any[]> {
    const tests = await this.getTests();
    const now = new Date();
    
    return tests.filter(test => {
      if (!test.isLive) return false;
      
      const startTime = new Date(test.startTime);
      const endTime = new Date(test.endTime);
      
      return now >= startTime && now <= endTime;
    });
  }

  public async getUpcomingTests(): Promise<any[]> {
    const tests = await this.getTests();
    const now = new Date();
    
    return tests.filter(test => {
      const startTime = new Date(test.startTime);
      return startTime > now;
    });
  }

  // Health check method
  public async healthCheck(): Promise<boolean> {
    try {
      await this.initialize();
      
      // Try to list files in root folder to verify connection
      await this.drive.files.list({
        q: `parents in '${this.rootFolderId}'`,
        pageSize: 1,
      });
      
      return true;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const seamlessGoogleDrive = SeamlessGoogleDrive.getInstance();
