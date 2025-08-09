"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Flag, TriangleAlert, Save, Shield, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SecureTestEnvironment from "@/components/student-corner/SecureTestEnvironment";

export default function TakeTest() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId');

  const [testData, setTestData] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string | string[] }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [showSecurePrompt, setShowSecurePrompt] = useState(false);

  // Load test data effect
  useEffect(() => {
    console.log('TakeTest: useEffect triggered with testId:', testId);
    if (!testId) {
      setError('No test ID provided.');
      setLoading(false);
      return;
    }

    const loadTestData = async () => {
      console.log('TakeTest: Starting loadTestData for testId:', testId);
      try {
        console.log('TakeTest: Fetching test via Supabase API');
        const response = await fetch(`/api/supabase/tests?action=get-by-id&testId=${testId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const json = await response.json();
        console.log('TakeTest: API Response:', json);
        
        if (!json.success) {
          throw new Error(json.error || 'Test not found');
        }
        
        const test = json.data;
        console.log('TakeTest: Received test data:', test);
        
        if (!test) {
          throw new Error('Test not found.');
        }

        setTestData(test);
        setQuestions(test.questions || []);
        console.log('TakeTest: Test data and questions set. Questions count:', test.questions?.length || 0);
        
        // Set time remaining based on duration_minutes
        const durationMinutes = test.duration_minutes || 180; // Default 3 hours
        setTimeRemaining(durationMinutes * 60); // Convert to seconds
        console.log('TakeTest: Time remaining set to', durationMinutes * 60, 'seconds.');
        
        // Show secure mode prompt after loading
        setShowSecurePrompt(true);
        
      } catch (error: any) {
        console.error('TakeTest: Error in loadTestData:', error);
        setError(error.message || 'Failed to load test.');
      } finally {
        setLoading(false);
        console.log('TakeTest: loadTestData finished. Loading:', false);
      }
    };

    loadTestData();
  }, [testId]);

  // Helper functions - Define before useEffect that uses them
  const handleSubmitTest = useCallback(async () => {
    if (isSubmitted) return;

    try {
      setIsSubmitted(true);
      
      const testResult = {
        id: Date.now().toString(),
        testId: testData?.id,
        studentId: 'current-student',
        answers,
        submittedAt: new Date().toISOString(),
        timeTaken: Math.floor((Date.now() - startTime) / 1000),
        totalQuestions: questions.length,
        attemptedQuestions: Object.keys(answers).length,
        flaggedQuestions: Array.from(flaggedQuestions),
        testName: testData?.title,
        testType: testData?.class_level,
        score: 0,
        maxMarks: 0
      };

      // TODO: Implement test result saving with Supabase
      console.log('Test result to save:', testResult);
      alert('Test submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Error submitting test.');
      setIsSubmitted(false);
    }
  }, [testData, answers, flaggedQuestions, questions.length, startTime]);

  // Timer effect - ALWAYS called after function definitions
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isSubmitted, handleSubmitTest]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getQuestionStatus = (questionId: number) => {
    if (answers[questionId]) return 'answered';
    if (flaggedQuestions.has(questionId)) return 'flagged';
    return 'not-visited';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'flagged': return 'bg-orange-500 text-white';
      case 'current': return 'bg-blue-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  // Secure test handlers
  const handleStartSecureTest = useCallback(() => {
    setIsSecureMode(true);
    setShowSecurePrompt(false);
  }, []);

  const handleSecureTestSubmit = useCallback(async (answers: any, flags: any, timeTaken: number) => {
    try {
      const testResult = {
        id: Date.now().toString(),
        testId: testData?.id,
        studentId: 'current-student',
        answers,
        submittedAt: new Date().toISOString(),
        timeTaken,
        totalQuestions: questions.length,
        attemptedQuestions: Object.keys(answers).length,
        flaggedQuestions: flags,
        testName: testData?.title,
        testType: testData?.class_level,
        score: 0,
        maxMarks: questions.length * 4 // Assuming 4 marks per question
      };

      console.log('Secure test result to save:', testResult);
      
      // Save to Supabase
      try {
        const response = await fetch('/api/supabase/test-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'save-result', 
            testResult 
          })
        });

        const result = await response.json();
        if (result.success) {
          console.log('✅ Test result saved to database');
        } else {
          console.error('❌ Failed to save test result:', result.error);
        }
      } catch (saveError) {
        console.error('❌ Error saving test result:', saveError);
      }
      
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting secure test:', error);
    }
  }, [testData, questions.length]);

  const handleExitSecureMode = useCallback(() => {
    setIsSecureMode(false);
  }, []);

  // Render logic - all hooks are called before any early returns
  console.log('TakeTest: Rendering component. Loading:', loading, 'Error:', error, 'TestData:', !!testData);

  // Secure mode rendering
  if (isSecureMode && testData && questions.length > 0) {
    return (
      <SecureTestEnvironment
        testData={testData}
        questions={questions}
        onTestSubmit={handleSecureTestSubmit}
        onExitSecureMode={handleExitSecureMode}
      />
    );
  }

  // Secure mode prompt
  if (showSecurePrompt && testData && questions.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="font-headline text-3xl font-bold text-gray-800 mb-2">Secure Test Environment</h2>
              <p className="text-lg text-gray-600">You are about to enter a secure, anti-cheating test environment</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <TriangleAlert className="h-5 w-5" />
                Important Security Notice
              </h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• Your screen will enter fullscreen mode</li>
                <li>• Tab switching will be monitored and blocked</li>
                <li>• Right-click and keyboard shortcuts will be disabled</li>
                <li>• Any suspicious activity will be logged</li>
                <li>• You cannot exit until the test is submitted</li>
                <li>• Browser developer tools are blocked</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Test Details</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Test:</strong> {testData.title}</p>
                <p><strong>Subject:</strong> {testData.subject}</p>
                <p><strong>Questions:</strong> {questions.length}</p>
                <p><strong>Duration:</strong> {Math.floor((testData.duration_minutes || 180) / 60)}h {(testData.duration_minutes || 180) % 60}m</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartSecureTest}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Start Secure Test
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              By clicking "Start Secure Test", you agree to the monitoring and security measures.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <TriangleAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Test</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => window.location.href = '/student-corner/mock-tests'}>
            Go back to Mock Tests
          </Button>
        </div>
      </div>
    );
  }

  if (!testData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Not Available</h2>
          <p className="text-gray-600 mb-6">This test is not available or has no questions.</p>
          <Button asChild>
            <Link href="/student-corner/mock-tests">Back to Tests</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-headline text-2xl font-bold text-gray-800 mb-2">Test Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">Your answers have been saved. Results will be available shortly.</p>
            <Button className="w-full" asChild>
              <Link href="/student-corner/test-analysis">View Results</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main test interface
  const currentQ = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-xl font-bold text-gray-800">{testData?.title}</h1>
              <div className="flex items-center gap-4 mt-1">
                <Badge variant="outline">Question {currentQuestion + 1} of {questions.length}</Badge>
                <Badge className="bg-blue-100 text-blue-800">{testData?.subject}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">{formatTime(timeRemaining)}</div>
                <div className="text-sm text-gray-600">Time Remaining</div>
              </div>
              <Button
                onClick={() => {
                  setIsSubmitted(true);
                  handleSubmitTest();
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Submit Test
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress))} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Progress: {Math.round(progress)}%</span>
              <span>Answered: {answeredCount} | Flagged: {flaggedCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">Q{currentQuestion + 1}</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {testData?.subject}
                    </Badge>
                    <Badge variant="outline">+{currentQ?.marks || 4} marks</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFlagQuestion(currentQuestion)}
                    className={flaggedQuestions.has(currentQuestion) ? 'bg-orange-100 border-orange-300' : ''}
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    {flaggedQuestions.has(currentQuestion) ? 'Unflag' : 'Flag'}
                  </Button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-800 text-lg leading-relaxed">{currentQ?.question_text}</p>
                </div>

                <div className="space-y-3">
                  {(currentQ?.options || []).map((option: any, index: number) => (
                    <label
                      key={index}
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={answers[currentQuestion] === option}
                        onChange={() => handleAnswerSelect(currentQuestion, option)}
                        className="mr-3"
                      />
                      <span>{String.fromCharCode(65 + index)}) {option}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Save className="h-4 w-4 mr-1" />
                      Save & Next
                    </Button>
                    <Button
                      onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                      disabled={currentQuestion === questions.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigation Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-4">Question Palette</h3>

                {/* Legend */}
                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <span>Not Visited</span>
                  </div>
                </div>

                {/* Questions Grid */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">All Questions</h4>
                  <div className="grid grid-cols-5 gap-1">
                    {questions.map((question, questionIndex) => {
                      const status = questionIndex === currentQuestion ? 'current' : getQuestionStatus(questionIndex);

                      return (
                        <button
                          key={questionIndex}
                          onClick={() => setCurrentQuestion(questionIndex)}
                          className={`w-8 h-8 text-xs font-semibold rounded ${getStatusColor(status)} hover:opacity-80 transition-opacity`}
                        >
                          {questionIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Answered:</span>
                      <span className="font-semibold">{answeredCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flagged:</span>
                      <span className="font-semibold">{flaggedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span className="font-semibold">{questions.length - answeredCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}