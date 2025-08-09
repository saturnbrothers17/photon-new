import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    geminiKey: process.env.GEMINI_API_KEY ? 'present' : 'missing',
    geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    allEnvVars: Object.keys(process.env),
    nodeEnv: process.env.NODE_ENV,
    pwd: process.cwd()
  });
}
