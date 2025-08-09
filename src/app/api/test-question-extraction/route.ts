import { NextResponse } from 'next/server';
import { powerfulExtractor } from '@/lib/ai-question-extractor-new';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }
    
    console.log('Received file:', file.name, file.size, file.type);
    
    // Test the extraction
    const result = await powerfulExtractor.extractQuestions(file);
    
    return NextResponse.json({
      success: true,
      result: result
    });
  } catch (error: any) {
    console.error('Question extraction error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}
