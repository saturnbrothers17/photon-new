import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  return NextResponse.json({
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPreview: apiKey ? apiKey.substring(0, 8) + '...' : null,
    envKeys: Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('API'))
  });
}
