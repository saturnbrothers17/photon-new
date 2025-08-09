// Test script to verify Google Drive Service Account setup
// Run with: node test-service-account.js

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testServiceAccount() {
  console.log('🔧 Testing Google Drive Service Account Setup...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing');
  console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
  console.log('GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID ? '✅ Set' : '❌ Missing');
  console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✅ Set' : '❌ Missing');
  console.log('');

  try {
    // Initialize auth
    let auth;
    
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      console.log('🔑 Using individual environment variables...');
      auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          project_id: process.env.GOOGLE_PROJECT_ID,
        },
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('🔑 Using service account key file...');
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });
    } else {
      throw new Error('No valid credentials found. Please set up environment variables.');
    }

    // Initialize Drive API
    const drive = google.drive({ version: 'v3', auth });
    console.log('✅ Google Drive API initialized');

    // Test authentication by listing files
    console.log('🔍 Testing authentication...');
    const response = await drive.files.list({
      pageSize: 5,
      fields: 'files(id, name, mimeType, createdTime)',
    });

    console.log('✅ Authentication successful!');
    console.log(`📁 Found ${response.data.files.length} files in your Drive`);
    
    if (response.data.files.length > 0) {
      console.log('\n📋 Sample files:');
      response.data.files.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name} (${file.mimeType})`);
      });
    }

    // Test folder creation
    console.log('\n📁 Testing folder creation...');
    const folderResponse = await drive.files.create({
      requestBody: {
        name: 'CoachingInstituteTests_Test',
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id, name',
    });

    console.log('✅ Test folder created:', folderResponse.data.name);
    console.log('📁 Folder ID:', folderResponse.data.id);

    // Clean up - delete test folder
    await drive.files.delete({
      fileId: folderResponse.data.id,
    });
    console.log('🗑️ Test folder cleaned up');

    console.log('\n🎉 All tests passed! Your Service Account is ready to use.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('- Check that your private key is correctly formatted');
      console.log('- Ensure there are no extra spaces or characters');
      console.log('- Verify the service account email is correct');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('- Make sure Google Drive API is enabled in Google Cloud Console');
      console.log('- Check that the service account has proper permissions');
    } else if (error.message.includes('ENOENT')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('- Check that the service account key file path is correct');
      console.log('- Ensure the JSON key file exists and is readable');
    }
  }
}

// Run the test
testServiceAccount();