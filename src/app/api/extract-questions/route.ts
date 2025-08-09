import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import sharp from 'sharp';

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Set timeout for requests
const REQUEST_TIMEOUT = 30000; // 30 seconds

async function fileToGenerativePart(file: File) {
  const base64EncodedData = Buffer.from(await file.arrayBuffer()).toString("base64");
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

export async function POST(request: Request) {
  console.log('🔍 Checking API key:', API_KEY ? '✅ Found' : '❌ Missing');
  console.log('🔍 API key value:', API_KEY ? API_KEY.substring(0, 8) + '...' : 'empty');
  console.log('🔍 All env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
  
  if (!API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not found, client will use fallback questions');
    return NextResponse.json({ 
      questions: [
        {
          questionText: 'What is the value of 2x + 5 when x = 3?',
          options: ['10', '11', '12', '13'],
          correctAnswer: 1,
          subject: 'Mathematics',
          difficulty: 'Easy'
        },
        {
          questionText: 'Which of the following is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 2,
          subject: 'General Knowledge',
          difficulty: 'Easy'
        }
      ],
      fallback: true,
      message: 'Using demo questions due to missing API key'
    }, { status: 200 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout - processing took too long')), 25000)
    );

    const generationConfig = {
      temperature: 0.1,
      topK: 10, // Further reduced for faster processing
      topP: 0.8,
      maxOutputTokens: 1024, // Reduced for faster processing
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const imagePart = await fileToGenerativePart(file);

    const prompt = `
      Extract MCQs from this document. Return JSON with:
      {
        "questions": [
          {
            "questionText": "question text",
            "options": ["option1", "option2", "option3", "option4"]
          }
        ]
      }
      Focus on accuracy and speed. Skip image processing for now.
    `;

    const parts = [imagePart, { text: prompt }];

    let result;
    try {
      // Race between AI call and timeout
      result = await Promise.race([
        model.generateContent({ contents: [{ role: 'user', parts }], generationConfig, safetySettings }),
        timeoutPromise
      ]) as any; // Type assertion for race result
    } catch (e: any) {
      if (e.message.includes('timeout')) {
        return NextResponse.json({ error: 'Processing timeout. Please try with a smaller file or try again.' }, { status: 408 });
      }
      if (e.message.includes('503')) {
        return NextResponse.json({ error: 'The AI model is currently overloaded. Please try again in a moment.' }, { status: 503 });
      }
      throw e; // Re-throw other errors
    }

    const responseText = result.response.text();
    // Clean the response to ensure it's valid JSON
    const cleanedJson = responseText.replace(/```json|```/g, '').trim();
    const parsedResponse = JSON.parse(cleanedJson);

    // Skip image processing for faster response
    // Return questions without image cropping for immediate usability

    return NextResponse.json(parsedResponse, { status: 200 });

  } catch (error: any) {
    console.error('Error extracting questions:', error);
    return NextResponse.json({ error: 'Failed to extract questions.', details: error.message }, { status: 500 });
  }
}
