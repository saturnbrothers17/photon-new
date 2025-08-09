// Test saving data to Google Drive
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function testSaveData() {
  try {
    console.log('💾 Testing Google Drive save operation...');

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

    // Create test data
    const testData = {
      tests: [
        {
          id: 1,
          name: "Test from Port 3001",
          type: "JEE Main",
          status: "published",
          createdDate: new Date().toISOString(),
          questions: [
            {
              id: 1,
              question: "What is 2+2?",
              options: ["3", "4", "5", "6"],
              correctAnswer: 1,
              marks: 1
            }
          ]
        }
      ],
      testResults: [],
      studyMaterials: [],
      studentProgress: [],
      userSettings: {},
      lastSync: new Date().toISOString(),
      version: '1.0.0'
    };

    const fileName = 'photon_coaching_data.json';
    const jsonContent = JSON.stringify(testData, null, 2);

    // Check if file exists
    const searchResponse = await drive.files.list({
      q: `name='${fileName}' and trashed=false`,
      fields: 'files(id, name)',
    });

    const files = searchResponse.data.files;
    let fileId;

    if (files && files.length > 0) {
      // Update existing file
      fileId = files[0].id;
      console.log('🔄 Updating existing file:', fileName);
      
      await drive.files.update({
        fileId: fileId,
        media: {
          mimeType: 'application/json',
          body: jsonContent,
        },
      });
    } else {
      // Create new file
      console.log('📝 Creating new file:', fileName);
      
      const createResponse = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: 'application/json',
          description: 'PHOTON Coaching Institute - Test Data'
        },
        media: {
          mimeType: 'application/json',
          body: jsonContent,
        },
      });
      
      fileId = createResponse.data.id;
    }

    console.log('✅ Test data saved successfully!');
    console.log('📄 File ID:', fileId);

    // Verify by reading back
    const fileContent = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    });

    const savedData = JSON.parse(fileContent.data);
    console.log('📊 Verified saved data:', {
      totalTests: savedData.tests?.length || 0,
      firstTestName: savedData.tests?.[0]?.name,
      lastSync: savedData.lastSync
    });

  } catch (error) {
    console.error('❌ Save test failed:', error.message);
    console.error('🔍 Full error:', error);
  }
}

testSaveData();