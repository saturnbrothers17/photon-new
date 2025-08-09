'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTestResults } from '@/hooks/useTestResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BookOpen,
  BarChart3,
  PieChart,
  Award,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import QuestionSolver from '@/components/student-corner/QuestionSolver';

interface TestResult {
  testId: number;
  testName: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number;
  percentage: number;
  timeTaken: number;
  originalDuration: number;
  attemptedQuestions: any[];
  subjectPerformance: any[];
  submittedAt: string;
}

interface AISolution {
  questionId: number;
  explanation: string;
  keyPoints: string[];
  conceptsUsed: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeToSolve: string;
  commonMistakes: string[];
  relatedTopics: string[];
}



export default function TestAnalysis() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiSolutions, setAiSolutions] = useState<AISolution[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const { getLatestTestResult } = useTestResults();

  // Helper functions (must be defined before useMemo)
  const getGradeFromPercentage = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'bg-green-500' };
    if (percentage >= 70) return { grade: 'B+', color: 'bg-blue-500' };
    if (percentage >= 60) return { grade: 'B', color: 'bg-blue-400' };
    if (percentage >= 50) return { grade: 'C', color: 'bg-yellow-500' };
    return { grade: 'D', color: 'bg-red-500' };
  };

  // All hooks must be called before any early returns
  const grade = useMemo(() => {
    return testResult ? getGradeFromPercentage(testResult.percentage) : { grade: 'N/A', color: 'bg-gray-500' };
  }, [testResult?.percentage]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      console.log('🧹 Test analysis page cleanup completed');
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadTestResult = async () => {
      try {
        console.log('📊 Loading latest test result from Supabase...');
        
        const result = await getLatestTestResult();
        
        if (!isMounted) return; // Prevent state update if component unmounted
        
        if (result) {
          console.log('📊 Test result loaded:', result);
          setTestResult(result);
        } else {
          console.log('📊 No test results found in database');
          // No results found, redirect back
          window.location.href = '/student-corner/mock-tests';
        }
      } catch (error) {
        console.error('❌ Error loading test result:', error);
        if (isMounted) {
          window.location.href = '/student-corner/mock-tests';
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTestResult();
    
    return () => {
      isMounted = false; // Cleanup flag
    };
  }, []); // Remove getLatestTestResult from dependencies









  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test analysis...</p>
        </div>
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Test Result Found</h2>
          <p className="text-gray-600 mb-6">Please take a test first to view analysis.</p>
          <Button asChild>
            <Link href="/student-corner/mock-tests">Back to Tests</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/student-corner/mock-tests">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tests
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{testResult.testName}</h1>
                <p className="text-gray-600">Test Analysis & AI Solutions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  console.log('🔍 Debug Info:');
                  console.log('Test Result:', testResult);
                  console.log('Selected Question:', selectedQuestion);
                  console.log('Current Question:', testResult?.attemptedQuestions[selectedQuestion]);
                }}
              >
                Debug
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Overall Score</p>
                  <p className="text-3xl font-bold">{testResult.percentage}%</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${grade.color} text-white`}>
                  {grade.grade}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-gray-600">Accuracy</p>
                  <p className="text-2xl font-bold">{testResult.correctAnswers}/{testResult.totalQuestions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-gray-600">Time Taken</p>
                  <p className="text-2xl font-bold">{formatTime(testResult.timeTaken)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-gray-600">Rank</p>
                  <p className="text-2xl font-bold">Top 15%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="solver">AI Solver</TabsTrigger>
            <TabsTrigger value="analysis">Deep Analysis</TabsTrigger>
            <TabsTrigger value="improvement">Improvement Plan</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Question-wise Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Question-wise Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResult.attemptedQuestions.map((q, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">Q{index + 1}</span>
                          <Badge variant="outline">{q.question.subject}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {q.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : q.selectedAnswer ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                          <span className="text-sm text-gray-600">
                            {q.isCorrect ? 'Correct' : q.selectedAnswer ? 'Wrong' : 'Skipped'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Subject-wise Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testResult.subjectPerformance.map((subject, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{subject.subject}</span>
                          <span className={`font-bold ${getPerformanceColor(subject.accuracy)}`}>
                            {subject.accuracy}%
                          </span>
                        </div>
                        <Progress value={isNaN(subject.accuracy) ? 0 : Math.max(0, Math.min(100, subject.accuracy))} className="h-2" />
                        <div className="text-sm text-gray-600">
                          {subject.correctAnswers}/{subject.totalQuestions} correct
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Solver Tab */}
          <TabsContent value="solver" className="space-y-6">
            <QuestionSolver questions={testResult.attemptedQuestions} />
          </TabsContent>

          {/* Deep Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Strengths & Weaknesses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Strengths
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {testResult.subjectPerformance
                          .filter((s: any) => s.accuracy >= 70)
                          .map((subject: any, idx: number) => (
                            <li key={idx} className="text-gray-700">
                              Strong performance in {subject.subject} ({subject.accuracy}%)
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {testResult.subjectPerformance
                          .filter((s: any) => s.accuracy < 70)
                          .map((subject: any, idx: number) => (
                            <li key={idx} className="text-gray-700">
                              Need improvement in {subject.subject} ({subject.accuracy}%)
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time Management Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Time Efficiency</span>
                      <span className="font-bold">
                        {Math.round((testResult.timeTaken / testResult.originalDuration) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(testResult.timeTaken / testResult.originalDuration) * 100} 
                      className="h-2" 
                    />
                    <div className="text-sm text-gray-600">
                      <p>You used {formatTime(testResult.timeTaken)} out of {formatTime(testResult.originalDuration)}</p>
                      <p className="mt-2">
                        Average time per question: {Math.round(testResult.timeTaken / testResult.totalQuestions)} seconds
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Improvement Plan Tab */}
          <TabsContent value="improvement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Personalized Study Plan
                </CardTitle>
                <CardDescription>
                  Based on your performance, here's a customized improvement plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {testResult.subjectPerformance
                    .filter((s: any) => s.accuracy < 80)
                    .map((subject: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-800">{subject.subject}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Current Score: {subject.accuracy}% | Target: 85%+
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          <li>Review fundamental concepts and formulas</li>
                          <li>Practice 10-15 questions daily</li>
                          <li>Focus on time management techniques</li>
                          <li>Take subject-specific mock tests</li>
                        </ul>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}