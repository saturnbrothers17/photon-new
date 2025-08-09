import { google } from 'googleapis';

export class GoogleDriveService {
  private drive: ReturnType<typeof google.drive>;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.drive = google.drive({ version: 'v3', auth });
  }

  async saveTest(testData: any): Promise<string> {
    try {
      const fileName = `test_${testData.id || Date.now()}.json`;
      const folderId = await this.getOrCreateFolder('Tests');

      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(testData, null, 2),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,webViewLink',
      });

      console.log('✅ Test saved to Google Drive:', response.data.webViewLink);
      return response.data.id!;
    } catch (error) {
      console.error('❌ Error saving to Google Drive:', error);
      throw error;
    }
  }

  private async getOrCreateFolder(folderName: string): Promise<string> {
    try {
      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (response.data.files?.length) {
        return response.data.files[0].id!;
      }

      // Create folder if it doesn't exist
      const folder = await this.drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });

      return folder.data.id!;
    } catch (error) {
      console.error(`❌ Error getting/creating folder ${folderName}:`, error);
      throw error;
    }
  }

  // Add more methods for other operations (getTests, deleteTest, etc.)
}
