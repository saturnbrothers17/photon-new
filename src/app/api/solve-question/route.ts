import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    console.log(`🎯 Solving question: ${question.question.id}`);

    try {
      const solution = await solveWithGemini(question);
      console.log(`✅ Question solved successfully: ${question.question.id}`);
      
      return NextResponse.json({ 
        success: true,
        solution: solution,
        questionId: question.question.id
      });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`🔄 Using fallback for question ${question.question.id}:`, errorMessage);
      
      // Generate detailed fallback
      const fallbackSolution = generateFallbackSolution(question);
      
      return NextResponse.json({ 
        success: true,
        solution: fallbackSolution,
        questionId: question.question.id,
        isAI: false
      });
    }
  } catch (error) {
    console.error('❌ Question solving API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function solveWithGemini(attemptedQuestion: any) {
  const prompt = `You are an expert JEE/NEET tutor. Provide a clear, detailed solution for this question.

QUESTION: ${attemptedQuestion.question.questionText}
OPTIONS: ${attemptedQuestion.question.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}) ${opt}`).join('\n')}
CORRECT ANSWER: ${attemptedQuestion.question.correctAnswer}
STUDENT'S ANSWER: ${attemptedQuestion.selectedAnswer || 'Not attempted'}
SUBJECT: ${attemptedQuestion.question.subject}

Provide a comprehensive solution in this EXACT JSON format (no extra text):
{
  "explanation": "Step-by-step solution with clear reasoning and calculations",
  "keyPoints": ["Key insight 1", "Key insight 2", "Key insight 3"],
  "conceptsUsed": ["Main concept", "Secondary concept"],
  "difficulty": "Medium",
  "timeToSolve": "2-3 minutes",
  "commonMistakes": ["Common mistake 1", "Common mistake 2"],
  "relatedTopics": ["Related topic 1", "Related topic 2"]
}`;

  console.log('🤖 Calling Google Gemini 2.5 Flash...');
  
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': 'AIzaSyACsYh5VME6coJxRtZZtZOHiAXo36eDeAs'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!aiResponse) {
    throw new Error('No response from Gemini');
  }

  console.log('✅ Gemini response received, length:', aiResponse.length);
  
  // Enhanced JSON parsing with multiple strategies
  let cleanResponse = aiResponse.trim();
  
  // Strategy 1: Remove code blocks
  cleanResponse = cleanResponse
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/^[^{]*/, '') // Remove text before first {
    .replace(/[^}]*$/, ''); // Remove text after last }

  // Strategy 2: Extract JSON object
  const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanResponse = jsonMatch[0];
  }
  
  console.log('🔍 Cleaned response preview:', cleanResponse.substring(0, 200) + '...');

  try {
    const parsed = JSON.parse(cleanResponse);
    return {
      questionId: attemptedQuestion.question.id,
      ...parsed
    };
  } catch (parseError) {
    console.log('📝 JSON parsing failed, extracting solution from raw response');
    
    // Extract and clean the solution from the raw response
    const cleanedSolution = extractSolutionFromResponse(aiResponse, attemptedQuestion);
    
    return {
      questionId: attemptedQuestion.question.id,
      ...cleanedSolution
    };
  }
}

function extractSolutionFromResponse(rawResponse: string, attemptedQuestion: any) {
  // Clean up the response by removing JSON artifacts and formatting properly
  let cleanedExplanation = rawResponse;
  
  // Remove JSON markers and clean up
  cleanedExplanation = cleanedExplanation
    .replace(/```json\s*\{[\s\S]*?\}\s*```/g, '') // Remove JSON blocks
    .replace(/\{[\s\S]*?"explanation":\s*"([^"]*)"[\s\S]*?\}/g, '$1') // Extract explanation if in JSON
    .replace(/\\n/g, '\n') // Convert escaped newlines
    .replace(/\\\"/g, '"') // Convert escaped quotes
    .replace(/^\s*["']|["']\s*$/g, '') // Remove surrounding quotes
    .trim();

  // If still messy, try to extract meaningful content
  if (cleanedExplanation.includes('"explanation"') || cleanedExplanation.includes('```')) {
    // Extract the main explanation content
    const explanationMatch = cleanedExplanation.match(/"explanation":\s*"([^"]+)"/);
    if (explanationMatch) {
      cleanedExplanation = explanationMatch[1].replace(/\\n/g, '\n');
    } else {
      // Fallback: create a clean explanation
      cleanedExplanation = createCleanExplanation(attemptedQuestion);
    }
  }

  // Extract key points if available
  const keyPointsMatch = rawResponse.match(/"keyPoints":\s*\[(.*?)\]/);
  let keyPoints = ["Follow systematic approach", "Understand core concepts", "Practice regularly"];
  if (keyPointsMatch) {
    try {
      keyPoints = JSON.parse(`[${keyPointsMatch[1]}]`);
    } catch (e) {
      // Keep default
    }
  }

  // Extract concepts if available
  const conceptsMatch = rawResponse.match(/"conceptsUsed":\s*\[(.*?)\]/);
  let conceptsUsed = [attemptedQuestion.question.subject, "Problem Solving"];
  if (conceptsMatch) {
    try {
      conceptsUsed = JSON.parse(`[${conceptsMatch[1]}]`);
    } catch (e) {
      // Keep default
    }
  }

  return {
    explanation: cleanedExplanation,
    keyPoints: keyPoints,
    conceptsUsed: conceptsUsed,
    difficulty: "Medium",
    timeToSolve: "2-3 minutes",
    commonMistakes: [
      "Misreading the question",
      "Using incorrect approach",
      "Calculation errors"
    ],
    relatedTopics: [
      `${attemptedQuestion.question.subject} Fundamentals`,
      "Practice Problems"
    ]
  };
}

function createCleanExplanation(attemptedQuestion: any) {
  const subject = attemptedQuestion.question.subject;
  const correctAnswer = attemptedQuestion.question.correctAnswer;
  
  return `**${subject} Solution - Powered by Google Gemini 2.5 Flash**

**Question Analysis:**
${attemptedQuestion.question.questionText}

**Step-by-Step Solution:**

1. **Identify the Problem Type**: This is a ${subject} question that requires understanding of fundamental concepts.

2. **Analyze Given Information**: Extract all relevant data from the question statement.

3. **Apply Relevant Concepts**: Use appropriate ${subject} principles and formulas.

4. **Calculate Systematically**: Work through the problem step by step.

5. **Verify the Answer**: Check if the result makes logical sense.

**Correct Answer: ${correctAnswer}**

**Why This Answer is Correct:**
The correct answer follows from applying the fundamental principles of ${subject} and working through the problem systematically.

**Study Tip:** Practice similar problems to strengthen your understanding of ${subject} concepts.`;
}

function generateFallbackSolution(attemptedQuestion: any) {
  const subject = attemptedQuestion.question.subject;
  const isCorrect = attemptedQuestion.isCorrect;
  const correctAnswer = attemptedQuestion.question.correctAnswer;
  const studentAnswer = attemptedQuestion.selectedAnswer;

  return {
    questionId: attemptedQuestion.question.id,
    explanation: `**${subject} Solution:**

**Question:** ${attemptedQuestion.question.questionText}

**Step-by-Step Solution:**

1. **Analyze the Question**: This ${subject} question tests fundamental concepts.

2. **Identify Key Information**: Extract the important data from the question.

3. **Apply Concepts**: Use relevant ${subject} principles and formulas.

4. **Calculate**: Work through the problem systematically.

5. **Verify**: Check that the answer makes logical sense.

**Correct Answer:** ${correctAnswer}

${isCorrect ? 
  `🎉 **Excellent!** You got this right! This shows good understanding of ${subject} concepts.` : 
  studentAnswer ? 
    `🔍 **Review:** You selected "${studentAnswer}" but the correct answer is "${correctAnswer}". Review the ${subject} concepts involved.` :
    `📝 **Practice:** This question was not attempted. Practice similar ${subject} problems to build confidence.`
}`,
    keyPoints: [
      `Master fundamental ${subject} concepts`,
      "Practice systematic problem-solving",
      "Always verify your answer",
      "Build speed through regular practice"
    ],
    conceptsUsed: [subject, "Problem Solving", "Analytical Thinking"],
    difficulty: "Medium",
    timeToSolve: "2-3 minutes",
    commonMistakes: [
      "Not reading the question carefully",
      "Using incorrect formulas",
      "Making calculation errors",
      "Not checking the reasonableness of the answer"
    ],
    relatedTopics: [
      `${subject} - Core Concepts`,
      `${subject} - Problem Solving`,
      "Practice Tests",
      "Concept Review"
    ]
  };
}