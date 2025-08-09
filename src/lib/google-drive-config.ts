// Google Drive API Configuration
export const GOOGLE_DRIVE_CONFIG = {
  // You'll need to get these from Google Cloud Console
  CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  REDIRECT_URI: process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  
  // Scopes for Google Drive access
  SCOPES: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ],
  
  // Folder configuration
  FOLDER_NAME: 'CoachingInstituteTests',
  
  // File naming patterns
  TEST_FILE_PREFIX: 'test_',
  BACKUP_FILE_PREFIX: 'backup_',
  QUESTION_BANK_PREFIX: 'questions_'
};

// OAuth2 configuration for client-side authentication
export const getOAuth2Config = () => ({
  client_id: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
  redirect_uri: GOOGLE_DRIVE_CONFIG.REDIRECT_URI,
  scope: GOOGLE_DRIVE_CONFIG.SCOPES.join(' '),
  response_type: 'code',
  access_type: 'offline',
  prompt: 'consent'
});