import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test if environment variables are properly loaded
    const qwenKey = process.env.NEXT_PUBLIC_QWEN_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    
    return NextResponse.json({
      success: true,
      keys: {
        qwen: qwenKey ? 'configured' : 'missing',
        gemini: geminiKey ? 'configured' : 'missing',
        openRouter: openRouterKey ? 'configured' : 'missing'
      },
      message: 'AI keys configuration check completed'
    });
  } catch (error: any) {
    console.error('AI keys test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
