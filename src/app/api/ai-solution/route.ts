/**
 * PHOTON Prep AI Solution API
 * Automatically generates detailed solutions for test questions
 */

import { NextRequest, NextResponse } from 'next/server';
import PhotonPrepAI from '@/lib/ai-solution-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, questions, studentId, testId } = body;

    const ai = PhotonPrepAI.getInstance();

    switch (action) {
      case 'generate-solutions':
        return await generateSolutions(questions, ai);
      case 'generate-single-solution':
        return await generateSingleSolution(body.question, ai);
      case 'batch-generate':
        return await batchGenerateSolutions(questions, ai);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI Solution API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI solution' },
      { status: 500 }
    );
  }
}

async function generateSolutions(questions: any[], ai: PhotonPrepAI) {
  const solutions = [];
  
  for (const question of questions) {
    try {
      const solution = await ai.generateSolution(question);
      solutions.push({
        questionId: question.id,
        solution: solution,
        generatedAt: new Date().toISOString(),
        aiEngine: 'PHOTON Prep'
      });
    } catch (error) {
      console.error(`Error generating solution for question ${question.id}:`, error);
      solutions.push({
        questionId: question.id,
        error: 'Failed to generate solution',
        generatedAt: new Date().toISOString()
      });
    }
  }

  return NextResponse.json({
    solutions,
    totalGenerated: solutions.length,
    aiEngine: 'PHOTON Prep',
    timestamp: new Date().toISOString()
  });
}

async function generateSingleSolution(question: any, ai: PhotonPrepAI) {
  try {
    const solution = await ai.generateSolution(question);
    
    return NextResponse.json({
      solution,
      questionId: question.id,
      aiEngine: 'PHOTON Prep',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating single solution:', error);
    return NextResponse.json(
      { error: 'Failed to generate solution' },
      { status: 500 }
    );
  }
}

async function batchGenerateSolutions(questions: any[], ai: PhotonPrepAI) {
  const batchSize = 5; // Process 5 questions at a time
  const results = [];
  
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    const batchResults = [];
    
    for (const question of batch) {
      try {
        const solution = await ai.generateSolution(question);
        batchResults.push({
          questionId: question.id,
          solution: solution,
          generatedAt: new Date().toISOString(),
          aiEngine: 'PHOTON Prep'
        });
      } catch (error) {
        console.error(`Error in batch processing for question ${question.id}:`, error);
        batchResults.push({
          questionId: question.id,
          error: 'Failed to generate solution',
          generatedAt: new Date().toISOString()
        });
      }
    }
    
    results.push(...batchResults);
  }

  return NextResponse.json({
    results,
    totalProcessed: results.length,
    aiEngine: 'PHOTON Prep',
    timestamp: new Date().toISOString()
  });
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'PHOTON Prep AI Solution API is active',
    endpoints: [
      'POST /api/ai-solution - Generate AI solutions',
      'Actions: generate-solutions, generate-single-solution, batch-generate'
    ],
    aiEngine: 'PHOTON Prep',
    status: 'operational'
  });
}
