// Quick test to verify Google Drive connection
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function testDriveConnection() {
  try {
    console.log('🔧 Testing Google Drive connection...');
    console.log('Environment variables:', {
      hasProjectId: !!process.env.GOOGLE_PROJECT_ID,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      hasServiceEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      projectId: process.env.GOOGLE_PROJECT_ID
    });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    // Test by searching for our data file
    const response = await drive.files.list({
      q: "name='photon_coaching_data.json' and trashed=false",
      fields: 'files(id, name, size, createdTime)',
    });

    console.log('✅ Google Drive connection successful!');
    console.log('📁 Found files:', response.data.files);
    
    if (response.data.files && response.data.files.length > 0) {
      const file = response.data.files[0];
      console.log('📄 Data file details:', {
        id: file.id,
        name: file.name,
        size: file.size,
        created: file.createdTime
      });
      
      // Try to read the file content
      const fileContent = await drive.files.get({
        fileId: file.id,
        alt: 'media',
      });
      
      const data = JSON.parse(fileContent.data);
      console.log('📊 Data summary:', {
        totalTests: data.tests?.length || 0,
        totalResults: data.testResults?.length || 0,
        lastSync: data.lastSync
      });
    } else {
      console.log('📝 No data file found - this is normal for first run');
    }

  } catch (error) {
    console.error('❌ Google Drive connection failed:', error.message);
    console.error('🔍 Full error:', error);
  }
}

testDriveConnection();