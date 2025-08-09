// Simple test to verify credentials
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function simpleTest() {
  console.log('🔧 Testing Google Service Account...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing');
  console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ Set (length: ' + process.env.GOOGLE_PRIVATE_KEY.length + ')' : '❌ Missing');
  console.log('GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID ? '✅ Set' : '❌ Missing');
  console.log('');

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.error('❌ Missing required environment variables');
    return;
  }

  try {
    console.log('🔑 Initializing Google Auth...');
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    console.log('✅ Auth initialized');

    console.log('🔍 Getting auth client...');
    const authClient = await auth.getClient();
    console.log('✅ Auth client obtained');

    console.log('🚀 Initializing Drive API...');
    const drive = google.drive({ version: 'v3', auth: authClient });
    console.log('✅ Drive API initialized');

    console.log('📋 Testing API call with timeout...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000);
    });

    const apiCall = drive.files.list({
      pageSize: 1,
      fields: 'files(id, name)',
    });

    const response = await Promise.race([apiCall, timeoutPromise]);
    
    console.log('✅ API call successful!');
    console.log('📁 Response:', response.data);
    console.log('\n🎉 Service Account is working correctly!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('\n💡 This might indicate:');
      console.log('- Google Drive API is not enabled');
      console.log('- Network connectivity issues');
      console.log('- Service account permissions issues');
    } else if (error.message.includes('invalid_grant')) {
      console.log('\n💡 Invalid grant error usually means:');
      console.log('- Private key format is incorrect');
      console.log('- Service account email is wrong');
      console.log('- Clock skew issues');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Permission denied usually means:');
      console.log('- Google Drive API is not enabled');
      console.log('- Service account lacks proper permissions');
    }
  }
}

simpleTest();