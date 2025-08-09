import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: 'API key missing',
      envVars: Object.keys(process.env).filter(k => k.includes('GEMINI'))
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Test: Hello, this is a test.");
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ 
      success: true,
      response: text,
      apiKeyValid: true
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message,
      apiKey: apiKey.substring(0, 8) + '...'
    });
  }
}
