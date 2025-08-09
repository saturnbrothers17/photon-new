import { google } from 'googleapis';

// Google Drive API configuration for Service Account
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FOLDER_NAME = 'CoachingInstituteTests';

export class GoogleDriveServiceAccount {
  private drive: any;
  private auth: any;
  private folderId: string | null = null;
  private initialized: boolean = false;

  constructor() {
    // Don't call async method in constructor
  }

  private async initializeAuth() {
    if (this.initialized) return;
    
    console.log('🔧 Initializing Google Drive Service Account...');
    try {
      // Method 1: Using individual environment variables
      if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        this.auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            project_id: process.env.GOOGLE_PROJECT_ID,
          },
          scopes: SCOPES,
        });
      }
      // Method 2: Using service account key file path
      else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          scopes: SCOPES,
        });
      }
      // Method 3: Using default credentials (for production environments)
      else {
        this.auth = new google.auth.GoogleAuth({
          scopes: SCOPES,
        });
      }

      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.initialized = true;
      console.log('✅ Google Drive Service Account initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive Service Account:', error);
      throw error;
    }
  }

  // Test authentication
  async testAuth(): Promise<boolean> {
    try {
      await this.initializeAuth();
      const response = await this.drive.files.list({
        pageSize: 1,
        fields: 'files(id, name)',
      });
      console.log('Authentication test successful');
      return true;
    } catch (error) {
      console.error('Authentication test failed:', error);
      return false;
    }
  }

  // Create or get the main folder for storing tests
  async ensureTestFolder(): Promise<string> {
    await this.initializeAuth();
    
    if (this.folderId) return this.folderId;

    try {
      // Search for existing folder
      const response = await this.drive.files.list({
        q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
      });

      if (response.data.files.length > 0) {
        this.folderId = response.data.files[0].id;
        console.log(`Found existing folder: ${this.folderId}`);
        return this.folderId;
      }

      // Create new folder if it doesn't exist
      const folderResponse = await this.drive.files.create({
        requestBody: {
          name: FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });

      this.folderId = folderResponse.data.id;
      console.log(`Created new folder: ${this.folderId}`);
      return this.folderId;
    } catch (error) {
      console.error('Error creating/finding folder:', error);
      throw error;
    }
  }

  // Save test data to Google Drive
  async saveTest(testData: any): Promise<string> {
    try {
      const folderId = await this.ensureTestFolder();
      
      const fileMetadata = {
        name: `test_${testData.id}_${Date.now()}.json`,
        parents: [folderId],
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(testData, null, 2),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size, createdTime',
      });

      console.log(`Test saved to Drive: ${response.data.name} (${response.data.id})`);
      return response.data.id;
    } catch (error) {
      console.error('Error saving test to Drive:', error);
      throw error;
    }
  }

  // Load test data from Google Drive
  async loadTest(fileId: string): Promise<any> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      return JSON.parse(response.data);
    } catch (error) {
      console.error('Error loading test from Drive:', error);
      throw error;
    }
  }

  // List all tests in the folder
  async listTests(): Promise<any[]> {
    try {
      const folderId = await this.ensureTestFolder();
      
      const response = await this.drive.files.list({
        q: `parents in '${folderId}' and name contains 'test_'`,
        fields: 'files(id, name, size, createdTime, modifiedTime)',
        orderBy: 'createdTime desc',
      });

      console.log(`Found ${response.data.files.length} test files`);
      return response.data.files || [];
    } catch (error) {
      console.error('Error listing tests:', error);
      throw error;
    }
  }

  // Delete a test file
  async deleteTest(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId: fileId,
      });
      console.log(`Deleted test file: ${fileId}`);
    } catch (error) {
      console.error('Error deleting test:', error);
      throw error;
    }
  }

  // Backup data to Drive
  async backupData(data: any, filename?: string): Promise<string> {
    try {
      console.log('🔄 Starting backup process...');
      const folderId = await this.ensureTestFolder();
      
      const backupData = {
        timestamp: new Date().toISOString(),
        data: data
      };

      const fileMetadata = {
        name: filename || `backup_${Date.now()}.json`,
        parents: [folderId],
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

      console.log(`Backup created: ${response.data.name} (${response.data.id})`);
      return response.data.id;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  // Get folder info and storage usage
  async getFolderInfo(): Promise<any> {
    try {
      const folderId = await this.ensureTestFolder();
      
      const folderInfo = await this.drive.files.get({
        fileId: folderId,
        fields: 'id, name, createdTime, modifiedTime'
      });

      const files = await this.listTests();
      const totalSize = files.reduce((sum, file) => sum + (parseInt(file.size) || 0), 0);

      return {
        folder: folderInfo.data,
        fileCount: files.length,
        totalSize: totalSize,
        files: files
      };
    } catch (error) {
      console.error('Error getting folder info:', error);
      throw error;
    }
  }
}

// Singleton instance
export const googleDriveServiceAccount = new GoogleDriveServiceAccount();