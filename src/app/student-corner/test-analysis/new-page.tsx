"use client";

import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Clock, BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import Link from 'next/link';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  questionImage?: string;
}

interface AISolution {
  explanation: string;
  stepByStep: string[];
  tips: string[];
  relatedConcepts: string[];
  correctAnswer: string;
  confidence: number;
  subject: string;
  difficulty: string;
}

interface AttemptedQuestion {
  question: Question;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  solution?: AISolution;
  aiGenerated?: boolean;
  aiEngine?: string;
}

interface SubjectPerformance {
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
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
  originalDuration: number;
  attemptedQuestions: AttemptedQuestion[];
  subjectPerformance: SubjectPerformance[];
  submittedAt: string;
  aiEnhanced?: boolean;
}

export default function TestAnalysisPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showQuestionDetails, setShowQuestionDetails] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState<number | null>(null);
  const [expandedSolutions, setExpandedSolutions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string>('PHOTON Prep is analyzing your test...');

  // Generate AI solution for a question
  const generateAISolution = (question: Question, selectedAnswer: string, isCorrect: boolean): AISolution => {
    const subject = question.subject.toLowerCase();
    
    const baseSolution = {
      explanation: `PHOTON Prep's comprehensive analysis for ${question.subject}: ${question.questionText}`,
      stepByStep: [
        "Step 1: Carefully analyze the question requirements",
        "Step 2: Identify the key concepts being tested",
        "Step 3: Apply the appropriate problem-solving approach",
        `Step 4: The correct answer is ${question.correctAnswer}`
      ],
      tips: [
        'Read the question carefully before attempting',
        'Break complex problems into smaller parts',
        'Check your calculations step by step',
        'Practice similar problems to improve'
      ],
      relatedConcepts: [question.subject, 'Problem Solving', 'Critical Thinking'],
      correctAnswer: question.correctAnswer,
      confidence: 0.95,
      subject: question.subject,
      difficulty: 'medium'
    };

    // Subject-specific enhancements
    if (subject === 'mathematics') {
      baseSolution.stepByStep = [
        "Step 1: Identify the mathematical concept being tested",
        "Step 2: Set up the appropriate equation or formula",
        "Step 3: Solve step by step with clear calculations",
        `Step 4: Verify that ${question.correctAnswer} satisfies all conditions`
      ];
      baseSolution.relatedConcepts = ['Mathematics', 'Algebra', 'Problem Solving', 'Critical Thinking'];
    } else if (subject === 'physics') {
      baseSolution.stepByStep = [
        "Step 1: Identify the physics principle involved",
        "Step 2: Apply the relevant formula or law",
        "Step 3: Perform calculations with proper units",
        `Step 4: Confirm that ${question.correctAnswer} is physically reasonable`
      ];
      baseSolution.relatedConcepts = ['Physics', 'Mechanics', 'Problem Solving', 'Scientific Method'];
    }

    return baseSolution;
  };

  useEffect(() => {
    const loadTestResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load test results from localStorage (demo data)
        let testData: TestResult;
        
        const saved = localStorage.getItem('testResult');
        if (saved) {
          testData = JSON.parse(saved);
        } else {
          // Demo data
          testData = {
            testId: 'demo-001',
            testName: 'Mathematics Mock Test',
            totalQuestions: 3,
            correctAnswers: 2,
            wrongAnswers: 1,
            unanswered: 0,
            score: 2,
            percentage: 66.67,
            timeTaken: 1800,
            originalDuration: 3600,
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
                timeSpent: 45
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
                timeSpent: 120
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
                timeSpent: 30
              }
            ],
            subjectPerformance: [
              { subject: 'Mathematics', totalQuestions: 3, correctAnswers: 2, accuracy: 66.67 }
            ]
          };
        }

        // Simulate AI processing delay
        setTimeout(() => {
          const enhancedQuestions = testData.attemptedQuestions.map(item => {
            const aiSolution = generateAISolution(item.question, item.selectedAnswer, item.isCorrect);
            return {
              ...item,
              solution: aiSolution,
              aiGenerated: true,
              aiEngine: 'PHOTON Prep'
            };
          });

          setTestResult({
            ...testData,
            attemptedQuestions: enhancedQuestions,
            aiEnhanced: true
          });
          
          setAiStatus('AI solutions generated successfully');
          setLoading(false);
        }, 2000);

      } catch (error) {
        console.error('Error loading test results:', error);
        setError('Failed to load test results');
        setLoading(false);
      }
    };

    loadTestResults();
  }, []);

  const toggleQuestionDetails = (index: number) => {
    setShowQuestionDetails(showQuestionDetails === index ? null : index);
  };

  const toggleSolution = (index: number) => {
    setShowSolution(showSolution === index ? null : index);
  };

  const toggleSolutionExpansion = (index: number) => {
    const newExpanded = new Set(expandedSolutions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSolutions(newExpanded);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusColor = (isCorrect: boolean) => {
    return isCorrect ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isCorrect: boolean) => {
    return isCorrect ? '✓' : '✗';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{aiStatus}</p>
          <p className="text-sm text-gray-500 mt-2">Powered by PHOTON Prep AI</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No test results found</p>
          <Link href="/student-corner/mock-tests" passHref>
            <Button className="mt-4">Take a Test</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const pieData = {
    labels: ['Correct', 'Wrong', 'Unanswered'],
    datasets: [
      {
        data: [testResult.correctAnswers, testResult.wrongAnswers, testResult.unanswered],
        backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: testResult.subjectPerformance.map(sp => sp.subject),
    datasets: [
      {
        label: 'Accuracy (%)',
        data: testResult.subjectPerformance.map(sp => sp.accuracy),
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Analysis</h1>
              <p className="text-sm text-gray-600 mt-1">AI-enhanced by PHOTON Prep</p>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                AI Powered
              </span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{testResult.correctAnswers}</div>
              <div className="text-sm text-green-800">Correct Answers</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{testResult.wrongAnswers}</div>
              <div className="text-sm text-red-800">Wrong Answers</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{testResult.percentage}%</div>
              <div className="text-sm text-blue-800">Score</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatTime(testResult.timeTaken)}</div>
              <div className="text-sm text-purple-800">Time Taken</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-center">Performance Overview</h3>
              <div className="w-64 h-64 mx-auto">
                <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-center">Subject Performance</h3>
              <div className="h-64">
                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Solutions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Question Analysis with AI Solutions</h2>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm">
                PHOTON Prep
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {testResult.attemptedQuestions.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                      Q{index + 1}
                    </span>
                    <Badge 
                      variant={item.isCorrect ? "default" : "destructive"}
                      className={item.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {item.isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100">
                      {item.question.subject}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">{formatTime(item.timeSpent)}</span>
                </div>

                <div className="mb-3">
                  <p className="font-medium text-gray-900">{item.question.questionText}</p>
                </div>

                <div className="space-y-2 mb-3">
                  {item.question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-2 rounded text-sm ${
                        option === item.question.correctAnswer
                          ? 'bg-green-100 border border-green-300'
                          : option === item.selectedAnswer
                          ? item.isCorrect
                            ? 'bg-green-100 border border-green-300'
                            : 'bg-red-100 border border-red-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
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
                  ))}
                </div>

                {/* AI Solution */}
                {item.solution && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-blue-900">PHOTON Prep AI Solution</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSolution(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {showSolution === index ? (
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

                    {showSolution === index && (
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Detailed Explanation:</h5>
                          <p className="text-gray-700">{item.solution.explanation}</p>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Step-by-Step Solution:</h5>
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
                              <Badge key={conceptIndex} variant="outline" className="bg-blue-100">
                                {concept}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="bg-green-50 p-3 rounded mt-3">
                          <h5 className="font-medium text-green-900 mb-1">Correct Answer:</h5>
                          <p className="text-green-700 font-semibold">{item.solution.correctAnswer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 mt-6">
          <Link href="/student-corner/mock-tests" passHref>
            <Button variant="outline">
              <Trophy className="mr-2 h-4 w-4" />
              Attempt Another Test
            </Button>
          </Link>
          <Link href="/student-corner" passHref>
            <Button>
              <TrendingUp className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
