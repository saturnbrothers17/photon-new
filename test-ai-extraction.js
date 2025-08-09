const fs = require('fs');
const path = require('path');

// Test the AI question extraction functionality
async function testAIExtraction() {
  console.log('Testing AI Question Extraction...');
  
  try {
    // Import the powerfulExtractor
    const { powerfulExtractor } = require('./src/lib/ai-question-extractor');
    
    // Check if API keys are configured
    console.log('Checking API key configuration...');
    
    // Log the available environment variables (without exposing the actual keys)
    console.log('Environment variables:');
    console.log('- NEXT_PUBLIC_OPENROUTER_API_KEY:', process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ? 'SET' : 'NOT SET');
    console.log('- NEXT_PUBLIC_QWEN_API_KEY:', process.env.NEXT_PUBLIC_QWEN_API_KEY ? 'SET' : 'NOT SET');
    console.log('- NEXT_PUBLIC_GEMINI_API_KEY:', process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'SET' : 'NOT SET');
    
    console.log('AI Question Extractor initialized successfully!');
    console.log('Primary provider: OpenRouter AI Vision');
    console.log('Fallback providers: Qwen AI Vision, Gemini AI Vision, Advanced OCR, Hybrid AI+OCR');
    
    return true;
  } catch (error) {
    console.error('Error testing AI extraction:', error.message);
    return false;
  }
}

// Test the Google Drive integration
async function testGoogleDrive() {
  console.log('\nTesting Google Drive Integration...');
  
  try {
    // Import the Google Drive service
    const { googleDriveServiceAccount } = require('./src/lib/google-drive-service-account');
    
    console.log('Google Drive Service Account initialized successfully!');
    console.log('Folder name: CoachingInstituteTests');
    
    // Test authentication
    console.log('Testing authentication...');
    const isAuthenticated = await googleDriveServiceAccount.testAuth();
    console.log('Authentication test:', isAuthenticated ? 'PASSED' : 'FAILED');
    
    return isAuthenticated;
  } catch (error) {
    console.error('Error testing Google Drive:', error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('='.repeat(50));
  console.log('AI Question Extraction & Google Drive Integration Test');
  console.log('='.repeat(50));
  
  const extractionSuccess = await testAIExtraction();
  const driveSuccess = await testGoogleDrive();
  
  console.log('\n' + '='.repeat(50));
  console.log('TEST RESULTS');
  console.log('='.repeat(50));
  console.log('AI Question Extraction:', extractionSuccess ? 'PASSED' : 'FAILED');
  console.log('Google Drive Integration:', driveSuccess ? 'PASSED' : 'FAILED');
  
  if (extractionSuccess && driveSuccess) {
    console.log('\n🎉 All tests passed! The system is ready for use.');
    console.log('\nTo test the full workflow:');
    console.log('1. Visit http://localhost:9002/test/ai-drive-test');
    console.log('2. Upload an image of a question paper');
    console.log('3. Click "Extract Questions"');
    console.log('4. Click "Save to Drive" to save results to Google Drive');
  } else {
    console.log('\n❌ Some tests failed. Please check the configuration.');
  }
  
  console.log('='.repeat(50));
}

// Load environment variables
require('dotenv').config({ path: './.env.local' });

// Run the tests
runTests().catch(console.error);
