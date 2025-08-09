import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { questions } = await request.json();
    
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid questions data' }, { status: 400 });
    }

    console.log(`🚀 Generating solutions for ${questions.length} questions using Qwen 2.5 72B via OpenRouter...`);
    const solutions = [];
    let aiSuccessCount = 0;
    let fallbackCount = 0;
    
    for (const question of questions) {
      try {
        const solution = await generateAISolution(question);
        solutions.push(solution);
        aiSuccessCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`🔄 Using fallback solution for question ${question.question.id}:`, errorMessage);
        // Always provide detailed fallback solution
        const fallbackSolution = generateFallbackSolution(question);
        solutions.push(fallbackSolution);
        fallbackCount++;
      }
    }

    console.log(`✅ Solutions generated: ${aiSuccessCount} Qwen AI + ${fallbackCount} fallback = ${solutions.length} total`);
    
    // Always return solutions, even if all are fallbacks
    return NextResponse.json({ 
      solutions,
      stats: {
        total: solutions.length,
        aiGenerated: aiSuccessCount,
        fallback: fallbackCount
      }
    });
  } catch (error) {
    console.error('❌ Critical error in AI solutions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateAISolution(attemptedQuestion: any) {
  try {
    const prompt = `You are an expert JEE/NEET tutor with 15+ years of experience. Provide a comprehensive, educational solution for this multiple choice question.

QUESTION DETAILS:
Question: ${attemptedQuestion.question.questionText}
Options: ${attemptedQuestion.question.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}) ${opt}`).join(', ')}
Correct Answer: ${attemptedQuestion.question.correctAnswer}
Student's Answer: ${attemptedQuestion.selectedAnswer || 'Not attempted'}
Subject: ${attemptedQuestion.question.subject}
Is Correct: ${attemptedQuestion.isCorrect}

REQUIREMENTS:
1. Provide step-by-step solution with clear reasoning
2. Explain WHY the correct answer is right
3. Explain WHY other options are wrong (if applicable)
4. Include key concepts and formulas used
5. Mention common mistakes students make
6. Suggest related topics for further study
7. Estimate time needed to solve this type of question

Return ONLY valid JSON in this exact format:
{
  "explanation": "Detailed step-by-step solution with clear mathematical/scientific reasoning. Include formulas, calculations, and logical steps.",
  "keyPoints": [
    "Key insight 1 about the solution approach",
    "Key insight 2 about the concept used",
    "Key insight 3 about the calculation method"
  ],
  "conceptsUsed": [
    "Primary concept/formula used",
    "Secondary concept if applicable"
  ],
  "difficulty": "Easy|Medium|Hard",
  "timeToSolve": "1-2 minutes|2-3 minutes|3-5 minutes",
  "commonMistakes": [
    "Common mistake 1 students make",
    "Common mistake 2 students make"
  ],
  "relatedTopics": [
    "Related topic 1 for further study",
    "Related topic 2 for practice"
  ],
  "whyWrong": "If student got it wrong, explain specifically why their answer was incorrect and what they might have misunderstood"
}

Make the explanation educational, encouraging, and suitable for competitive exam preparation.`;

    console.log('🤖 Using Qwen 2.5 72B via OpenRouter for solution generation...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://photon-coaching-institute.com',
        'X-Title': 'PHOTON Coaching Institute',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are an expert JEE/NEET tutor with 15+ years of experience. Always provide educational, step-by-step solutions in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`⚠️ OpenRouter API returned ${response.status}: ${errorText}`);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.log('⚠️ No response from Qwen. Using fallback solution.');
      throw new Error('No response from Qwen');
    }

    // Clean and parse the JSON response with better error handling
    let cleanResponse = aiResponse
      .replace(/```json\n?|\n?```/g, '')
      .replace(/```\n?|\n?```/g, '')
      .trim();

    // Try to extract JSON if it's embedded in text
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(cleanResponse);
      console.log('✅ Qwen solution generated successfully for question:', attemptedQuestion.question.id);
      return {
        questionId: attemptedQuestion.question.id,
        ...parsed
      };
    } catch (parseError) {
      console.log('⚠️ JSON parsing failed, attempting to extract structured data...');
      
      // Try to extract structured information from the response
      const structuredSolution = extractStructuredSolution(aiResponse, attemptedQuestion);
      if (structuredSolution) {
        console.log('✅ Structured solution extracted successfully for question:', attemptedQuestion.question.id);
        return structuredSolution;
      }
      
      console.error('Failed to parse Qwen response:', cleanResponse);
      console.log('Raw response:', aiResponse);
      throw new Error('Invalid AI response format');
    }
  } catch (error) {
    console.log('🔄 Qwen generation failed, using detailed fallback for question:', attemptedQuestion.question.id);
    throw error; // Re-throw to trigger fallback in main function
  }
}

function extractStructuredSolution(aiResponse: string, attemptedQuestion: any) {
  try {
    // Extract explanation (look for detailed text)
    const explanation = aiResponse.length > 100 ? aiResponse : 
      `**Step-by-Step Solution:**\n\n${aiResponse}\n\nThe correct answer is "${attemptedQuestion.question.correctAnswer}".`;

    return {
      questionId: attemptedQuestion.question.id,
      explanation: explanation,
      keyPoints: [
        "Analyze the question carefully",
        "Apply relevant concepts and formulas",
        "Calculate step by step to reach the answer"
      ],
      conceptsUsed: [attemptedQuestion.question.subject, "Problem Solving"],
      difficulty: "Medium",
      timeToSolve: "2-3 minutes",
      commonMistakes: [
        "Misreading the question",
        "Using incorrect formulas",
        "Calculation errors"
      ],
      relatedTopics: [
        `${attemptedQuestion.question.subject} Fundamentals`,
        "Practice Problems"
      ],
      whyWrong: !attemptedQuestion.isCorrect && attemptedQuestion.selectedAnswer ? 
        `You selected "${attemptedQuestion.selectedAnswer}" but the correct answer is "${attemptedQuestion.question.correctAnswer}". Review the concepts and try similar problems.` : 
        ""
    };
  } catch (error) {
    return null;
  }
}

function generateFallbackSolution(attemptedQuestion: any) {
  const isCorrect = attemptedQuestion.isCorrect;
  const subject = attemptedQuestion.question.subject;
  const correctAnswer = attemptedQuestion.question.correctAnswer;
  const studentAnswer = attemptedQuestion.selectedAnswer;
  const questionText = attemptedQuestion.question.questionText;
  
  // Generate more detailed explanation based on subject
  let detailedExplanation = `
**Comprehensive Solution for ${subject} Question:**

**Question Analysis:**
${questionText}

**Step-by-Step Solution:**

1. **Identify Key Information**: First, let's break down what the question is asking and what information we have.

2. **Apply Core Concepts**: This question requires understanding of fundamental ${subject} principles.

3. **Solution Process**: 
   - Analyze the given options carefully
   - Apply the relevant ${subject} formulas or concepts
   - Eliminate incorrect options systematically
   - Arrive at the correct answer through logical reasoning

4. **Correct Answer**: "${correctAnswer}"

**Why This Answer is Correct:**
The answer "${correctAnswer}" is correct because it aligns with the fundamental principles of ${subject} and satisfies all the conditions mentioned in the question.

${!isCorrect && studentAnswer ? `
**Why Your Answer Was Incorrect:**
You selected "${studentAnswer}" which is incorrect because it doesn't align with the core ${subject} principles required for this problem. This is a common mistake that can be avoided by careful analysis.
` : ''}

**Key Learning Points:**
- Master the fundamental concepts before attempting complex problems
- Always verify your answer by checking if it satisfies all given conditions
- Practice similar problems to build pattern recognition
`;

  return {
    questionId: attemptedQuestion.question.id,
    explanation: detailedExplanation,
    keyPoints: [
      `Master fundamental ${subject} concepts and formulas`,
      "Develop systematic problem-solving approach",
      "Practice identifying key information in questions",
      "Build speed and accuracy through regular practice"
    ],
    conceptsUsed: [subject, "Analytical Reasoning", "Problem Solving"],
    difficulty: "Medium",
    timeToSolve: "2-3 minutes",
    commonMistakes: [
      "Not reading the question carefully enough",
      "Confusing similar concepts or formulas",
      "Making arithmetic or algebraic errors",
      "Not checking if the answer is reasonable"
    ],
    relatedTopics: [
      `${subject} - Core Concepts`,
      `${subject} - Problem Solving Techniques`,
      "Exam Strategy and Time Management",
      "Practice Problems and Mock Tests"
    ],
    whyWrong: !isCorrect && studentAnswer ? 
      `You selected "${studentAnswer}" instead of the correct answer "${correctAnswer}". This suggests you may need to review the fundamental ${subject} concepts related to this topic. Focus on understanding the underlying principles rather than memorizing formulas.` : 
      ""
  };
}