const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test the API key
const apiKey = 'AIzaSyCxQdF41ZAalUxPrNm_En_iIm_z1MjgztA';

async function testApiKey() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Test: Hello, this is a test.");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Key is valid!');
    console.log('Response:', text);
  } catch (error) {
    console.error('❌ API Key error:', error.message);
  }
}

testApiKey();
