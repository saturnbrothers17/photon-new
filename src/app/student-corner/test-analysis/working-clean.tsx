"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  subject: string;
}

interface AttemptedQuestion {
  question: Question;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  solution?: {
    explanation: string;
    stepByStep: string[];
    tips: string[];
    relatedConcepts: string[];
    correctAnswer: string;
    confidence: number;
  };
}

interface TestResult {
  testId: string;
  testName: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number;
  percentage: number;
  timeTaken: number;
  attemptedQuestions: AttemptedQuestion[];
  submittedAt: string;
}

export default function TestAnalysisPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSolution, setShowSolution] = useState<number | null>(null);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  useEffect(() => {
    const loadTestResults = async () => {
      try {
        setLoading(true);
        
        // Demo data for PHOTON Prep AI integration
        const demoData: TestResult = {
          testId: 'demo-001',
          testName: 'Mathematics Mock Test',
          totalQuestions: 3,
          correctAnswers: 2,
          wrongAnswers: 1,
          unanswered: 0,
          score: 2,
          percentage: 66.67,
          timeTaken: 1800,
          submittedAt: new Date().toISOString(),
          attemptedQuestions: [
            {
              question: {
                id: 'q1',
                questionText: 'What is the value of 2x + 5 when x = 3?',
                options: ['10', '11', '12', '13'],
                correctAnswer: '11',
                subject: 'Mathematics'
              },
              selectedAnswer: '11',
              isCorrect: true,
              timeSpent: 45,
              solution: {
                explanation: "PHOTON Prep's comprehensive analysis: This algebraic substitution problem requires careful evaluation of the expression 2x + 5 when x = 3.",
                stepByStep: [
                  "Step 1: Identify the expression: 2x + 5",
                  "Step 2: Substitute x = 3: 2(3) + 5",
                  "Step 3: Calculate: 6 + 5 = 11",
                  "Step 4: Verify: 2×3+5=11 ✓"
                ],
                tips: [
                  'Always substitute values carefully',
                  'Follow order of operations',
                  'Double-check calculations',
                  'Practice substitution problems'
                ],
                relatedConcepts: ['Mathematics', 'Algebra', 'Substitution', 'Basic Arithmetic'],
                correctAnswer: '11',
                confidence: 0.98
              }
            },
            {
              question: {
                id: 'q2',
                questionText: 'Solve for x: 3x - 7 = 14',
                options: ['5', '6', '7', '8'],
                correctAnswer: '7',
                subject: 'Mathematics'
              },
              selectedAnswer: '6',
              isCorrect: false,
              timeSpent: 120,
              solution: {
                explanation: "PHOTON Prep's analysis: This linear equation requires systematic isolation of the variable x using inverse operations.",
                stepByStep: [
                  "Step 1: Start with: 3x - 7 = 14",
                  "Step 2: Add 7 to both sides: 3x = 21",
                  "Step 3: Divide by 3: x = 7",
                  "Step 4: Verify: 3(7) - 7 = 14 ✓"
                ],
                tips: [
                  'Isolate the variable systematically',
                  'Use inverse operations',
                  'Check your answer',
                  'Practice equation solving'
                ],
                relatedConcepts: ['Mathematics', 'Linear Equations', 'Algebra', 'Equation Solving'],
                correctAnswer: '7',
                confidence: 0.95
              }
            },
            {
              question: {
                id: 'q3',
                questionText: 'What is 25% of 80?',
                options: ['15', '20', '25', '30'],
                correctAnswer: '20',
                subject: 'Mathematics'
              },
              selectedAnswer: '20',
              isCorrect: true,
              timeSpent: 30,
              solution: {
                explanation: "PHOTON Prep's analysis: This percentage calculation demonstrates efficient mental math strategies for finding 25% of 80.",
                stepByStep: [
                  "Step 1: Convert 25% to decimal: 0.25",
                  "Step 2: Calculate: 0.25 × 80 = 20",
                  "Step 3: Alternative: 80 ÷ 4 = 20",
                  "Step 4: Verify: 25% of 80 = 20 ✓"
                ],
                tips: [
                  'Convert percentages to decimals',
                  'Use mental math shortcuts',
                  'Remember 25% = 1/4',
                  'Practice percentage calculations'
                ],
                relatedConcepts: ['Mathematics', 'Percentages', 'Arithmetic', 'Mental Math'],
                correctAnswer: '20',
                confidence: 0.99
              }
            }
          ]
        };

        setTestResult(demoData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading test results:', error);
        setLoading(false);
      }
    };

    loadTestResults();
  }, []);

  const toggleSolution = (index: number) => {
    setShowSolution(showSolution === index ? null : index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">PHOTON Prep is analyzing your test...</p>
        </div>
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No test results found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Analysis - Powered by PHOTON Prep</span>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm">
                  AI Powered
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{testResult.correctAnswers}</div>
                <div className="text-sm text-green-800">Correct</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{testResult.wrongAnswers}</div>
                <div className="text-sm text-red-800">Incorrect</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{testResult.percentage}%</div>
                <div className="text-sm text-blue-800">Score</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{formatTime(testResult.timeTaken)}</div>
                <div className="text-sm text-purple-800">Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {testResult.attemptedQuestions.map((item, index) => (
            <Card key={index} className="border-l-4 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Question {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`px-2 py-1 rounded text-sm ${
                        item.isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isCorrect ? "Correct" : "Incorrect"}
                    </div>
                    <div className="bg-blue-100 px-2 py-1 rounded text-sm">
                      {item.question.subject}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-900 mb-3 font-medium">{item.question.questionText}</p>
                
                <div className="space-y-2 mb-3">
                  {item.question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg border ${
                        option === item.question.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : option === item.selectedAnswer
                          ? item.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        <div className="flex items-center space-x-2">
                          {option === item.question.correctAnswer && (
                            <span className="text-green-600 font-bold">✓ Correct</span>
                          )}
                          {option === item.selectedAnswer && (
                            <span className={item.isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                              {item.isCorrect ? '✓ Your Answer' : '✗ Your Answer'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {item.solution && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                      PHOTON Prep AI Analysis
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                        <p className="text-gray-700">{item.solution.explanation}</p>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Step-by-Step:</h5>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                          {item.solution.stepByStep.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Learning Tips:</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {item.solution.tips.map((tip, tipIndex) => (
                            <li key={tipIndex}>{tip}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Related Concepts:</h5>
                        <div className="flex flex-wrap gap-2">
                          {item.solution.relatedConcepts.map((concept, conceptIndex) => (
                            <div key={conceptIndex} className="bg-blue-100 px-2 py-1 rounded text-sm">
                              {concept}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <span>Confidence: {item.solution.confidence * 100}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <Link href="/student-corner/mock-tests" passHref>
            <Button variant="outline">Take Another Test</Button>
          </Link>
          <Link href="/student-corner" passHref>
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
