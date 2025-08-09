// Demo data for testing test analysis
export const demoTestResult = {
  testId: 'demo-test-001',
  testName: 'Demo Mathematics Test',
  totalQuestions: 5,
  correctAnswers: 3,
  wrongAnswers: 2,
  unanswered: 0,
  score: 3,
  percentage: 60,
  timeTaken: 1800,
  originalDuration: 3600,
  attemptedQuestions: [
    {
      question: {
        id: 'q1',
        questionText: 'What is the value of 2x + 3 when x = 4?',
        options: ['9', '10', '11', '12'],
        correctAnswer: '11',
        subject: 'Mathematics'
      },
      selectedAnswer: '11',
      isCorrect: true,
      timeSpent: 45,
      solution: {
        explanation: 'Substitute x = 4 into the expression 2x + 3.',
        stepByStep: [
          'Step 1: Identify the expression: 2x + 3',
          'Step 2: Substitute x = 4: 2(4) + 3',
          'Step 3: Calculate: 8 + 3 = 11',
          'Step 4: The value is 11'
        ],
        tips: [
          'Always substitute the given value first',
          'Follow the order of operations (PEMDAS)',
          'Double-check your calculations'
        ],
        relatedConcepts: ['Algebra', 'Substitution', 'Order of Operations'],
        videoExplanation: 'https://example.com/math-basics'
      },
      questionImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    },
    {
      questionId: 2,
      questionText: "Find the area of a circle with radius 7cm",
      subject: "Geometry",
      marks: 3,
      obtainedMarks: 3,
      status: "correct" as const,
      selectedAnswer: "154 cm²",
      correctAnswer: "154 cm²"
    },
    {
      questionId: 3,
      questionText: "Simplify: sin²θ + cos²θ",
      subject: "Trigonometry",
      marks: 2,
      obtainedMarks: 0,
      status: "incorrect" as const,
      selectedAnswer: "0",
      correctAnswer: "1"
    }
  ]
};

// Function to save demo data
export const saveDemoResult = () => {
  localStorage.setItem('test-result-demo-1', JSON.stringify(demoTestResult));
};
