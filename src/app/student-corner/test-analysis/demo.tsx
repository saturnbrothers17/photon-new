"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface AISolution {
  explanation: string;
  stepByStep: string[];
  tips: string[];
  relatedConcepts: string[];
  correctAnswer: string;
  confidence: number;
  subject: string;
}

interface DemoQuestion {
  id: string;
  questionText: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  subject: string;
  solution: AISolution;
}

export default function PHOTONPrepDemo() {
  const [expandedSolutions, setExpandedSolutions] = useState<Set<number>>(new Set());
  
  const demoQuestions: DemoQuestion[] = [
    {
      id: 'q1',
      questionText: 'What is the value of 2x + 5 when x = 3?',
      options: ['10', '11', '12', '13'],
      selectedAnswer: '11',
      correctAnswer: '11',
      isCorrect: true,
      timeSpent: 45,
      subject: 'Mathematics',
      solution: {
        explanation: "PHOTON Prep's analysis: This is a basic algebraic substitution problem. We need to substitute x = 3 into the expression 2x + 5.",
        stepByStep: [
          "Step 1: Identify the expression: 2x + 5",
          "Step 2: Substitute x = 3 into the expression",
          "Step 3: Calculate 2(3) + 5 = 6 + 5 = 11",
          "Step 4: Verify the calculation: 2×3+5=11 ✓"
        ],
        tips: [
          'Always substitute values carefully',
          'Follow order of operations (PEMDAS)',
          'Double-check your calculations',
          'Practice substitution problems regularly'
        ],
        relatedConcepts: ['Mathematics', 'Algebra', 'Substitution', 'Basic Arithmetic'],
        correctAnswer: '11',
        confidence: 0.98,
        subject: 'Mathematics'
      }
    },
    {
      id: 'q2',
      questionText: 'Solve for x: 3x - 7 = 14',
      options: ['5', '6', '7', '8'],
      selectedAnswer: '6',
      correctAnswer: '7',
      isCorrect: false,
      timeSpent: 120,
      subject: 'Mathematics',
      solution: {
        explanation: "PHOTON Prep's analysis: This is a linear equation that requires isolating the variable x. Let's solve it step by step.",
        stepByStep: [
          "Step 1: Start with the equation: 3x - 7 = 14",
          "Step 2: Add 7 to both sides: 3x = 14 + 7 = 21",
          "Step 3: Divide both sides by 3: x = 21 ÷ 3 = 7",
          "Step 4: Verify: 3(7) - 7 = 21 - 7 = 14 ✓"
        ],
        tips: [
          'Isolate the variable by performing inverse operations',
          'Always perform the same operation on both sides',
          'Check your answer by substituting back into the original equation',
          'Practice solving linear equations regularly'
        ],
        relatedConcepts: ['Mathematics', 'Linear Equations', 'Algebra', 'Equation Solving'],
        correctAnswer: '7',
        confidence: 0.95,
        subject: 'Mathematics'
      }
    },
    {
      id: 'q3',
      questionText: 'What is 25% of 80?',
      options: ['15', '20', '25', '30'],
      selectedAnswer: '20',
      correctAnswer: '20',
      isCorrect: true,
      timeSpent: 30,
      subject: 'Mathematics',
      solution: {
        explanation: "PHOTON Prep's analysis: This is a percentage calculation problem. We need to find 25% of 80.",
        stepByStep: [
          "Step 1: Convert 25% to decimal: 25% = 0.25",
          "Step 2: Multiply 0.25 × 80 = 20",
          "Step 3: Verify: 25% of 80 = 20 ✓",
          "Step 4: Alternative method: 80 ÷ 4 = 20 (since 25% = 1/4)"
        ],
        tips: [
          'Convert percentages to decimals or fractions',
          'Remember that 25% = 1/4 = 0.25',
          'For 25%, you can divide by 4',
          'Practice percentage calculations regularly'
        ],
        relatedConcepts: ['Mathematics', 'Percentages', 'Arithmetic', 'Mental Math'],
        correctAnswer: '20',
        confidence: 0.99,
        subject: 'Mathematics'
      }
    }
  ];

  const toggleSolution = (index: number) => {
    const newExpanded = new Set(expandedSolutions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSolutions(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>PHOTON Prep AI Test Analysis Demo</span>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  AI Powered
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Experience how PHOTON Prep automatically generates detailed solutions for each test question.
              The AI analyzes each question and provides step-by-step solutions, learning tips, and related concepts.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">2</div>
                <div className="text-sm text-green-800">Correct</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">1</div>
                <div className="text-sm text-red-800">Incorrect</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">66.7%</div>
                <div className="text-sm text-blue-800">Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {demoQuestions.map((question, index) => (
            <Card key={question.id} className="border-l-4 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">Question {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={question.isCorrect ? "default" : "destructive"}
                      className={question.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {question.isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100">
                      {question.subject}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-900 mb-3 font-medium">{question.questionText}</p>
                
                <div className="space-y-2 mb-3">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-2 rounded text-sm ${
                        option === question.correctAnswer
                          ? 'bg-green-100 border border-green-300'
                          : option === question.selectedAnswer
                          ? question.isCorrect
                            ? 'bg-green-100 border border-green-300'
                            : 'bg-red-100 border border-red-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {option === question.correctAnswer && (
                          <span className="text-green-600 font-bold">✓ Correct</span>
                        )}
                        {option === question.selectedAnswer && (
                          <span className={question.isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {question.isCorrect ? '✓ Your Answer' : '✗ Your Answer'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Solution */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-900 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                      PHOTON Prep AI Solution
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSolution(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {expandedSolutions.has(index) ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide Solution
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show AI Solution
                        </>
                      )}
                    </Button>
                  </div>

                  {expandedSolutions.has(index) && (
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Detailed Explanation:</h5>
                        <p className="text-gray-700">{question.solution.explanation}</p>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Step-by-Step Solution:</h5>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                          {question.solution.stepByStep.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Learning Tips from PHOTON Prep:</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {question.solution.tips.map((tip, tipIndex) => (
                            <li key={tipIndex}>{tip}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Related Concepts:</h5>
                        <div className="flex flex-wrap gap-2">
                          {question.solution.relatedConcepts.map((concept, conceptIndex) => (
                            <Badge key={conceptIndex} variant="outline" className="bg-blue-100">
                              {concept}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="bg-green-50 p-3 rounded mt-3">
                        <h5 className="font-medium text-green-900 mb-1">Correct Answer:</h5>
                        <p className="text-green-700 font-semibold">{question.solution.correctAnswer}</p>
                      </div>

                      {!question.isCorrect && (
                        <div className="bg-red-50 p-3 rounded mt-3">
                          <h5 className="font-medium text-red-900 mb-1">Your Answer Analysis:</h5>
                          <p className="text-red-700">
                            Your answer was <strong>{question.selectedAnswer}</strong>. 
                            Review the solution above to understand why this is incorrect.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            This is how PHOTON Prep automatically generates detailed solutions for every test question.
            The AI provides personalized learning insights and step-by-step explanations.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline">
              Try Another Test
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
              Learn More About PHOTON Prep
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
