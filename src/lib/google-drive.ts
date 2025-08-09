import { google } from 'googleapis';

// Google Drive API configuration
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FOLDER_NAME = 'CoachingInstituteTests';

export class GoogleDriveService {
  private drive: any;
  private auth: any;
  private folderId: string | null = null;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Check if we have stored tokens
    const storedTokens = typeof window !== 'undefined' ? localStorage.getItem('googleDriveTokens') : null;
    
    if (storedTokens) {
      const tokens = JSON.parse(storedTokens);
      this.auth = new google.auth.OAuth2(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.NEXT_PUBLIC_REDIRECT_URI
      );
      this.auth.setCredentials(tokens);
    } else {
      // Initialize OAuth2 client for authentication
      this.auth = new google.auth.OAuth2(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.NEXT_PUBLIC_REDIRECT_URI
      );
    }
    
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  // Get OAuth URL for authentication
  getAuthUrl(): string {
    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
    return authUrl;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<void> {
    try {
      const { tokens } = await this.auth.getToken(code);
      this.auth.setCredentials(tokens);
      
      // Store tokens in localStorage
      localStorage.setItem('googleDriveTokens', JSON.stringify(tokens));
      localStorage.setItem('googleDriveAuth', 'true');
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('googleDriveAuth') === 'true';
  }

  // Sign out
  signOut(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('googleDriveTokens');
      localStorage.removeItem('googleDriveAuth');
    }
    this.auth.setCredentials({});
  }

  // Create or get the main folder for storing tests
  async ensureTestFolder(): Promise<string> {
    if (this.folderId) return this.folderId;

    try {
      // Search for existing folder
      const response = await this.drive.files.list({
        q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
      });

      if (response.data.files.length > 0) {
        this.folderId = response.data.files[0].id;
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
        fields: 'id',
      });

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
        fields: 'files(id, name, createdTime, modifiedTime)',
        orderBy: 'createdTime desc',
      });

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
    } catch (error) {
      console.error('Error deleting test:', error);
      throw error;
    }
  }

  // Backup all localStorage data to Drive
  async backupLocalStorage(): Promise<string> {
    try {
      const folderId = await this.ensureTestFolder();
      
      // Get all localStorage data
      const backupData = {
        timestamp: new Date().toISOString(),
        data: {}
      };

      // Collect all localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          backupData.data[key] = localStorage.getItem(key);
        }
      }

      const fileMetadata = {
        name: `backup_${Date.now()}.json`,
        parents: [folderId],
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(backupData, null, 2),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });

      return response.data.id;
    } catch (error) {
      console.error('Error backing up to Drive:', error);
      throw error;
    }
  }
}

// Singleton instance
export const googleDriveService = new GoogleDriveService();