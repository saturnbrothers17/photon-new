'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Shield, Clock, Users, AlertTriangle, CheckCircle, XCircle,
  Play, Pause, SkipForward, Flag, Eye, EyeOff
} from 'lucide-react';
import SecureTestEnvironment from '@/components/student-corner/SecureTestEnvironment';

interface LiveTest {
  id: string;
  test_id: string;
  start_time: string;
  end_time: string;
  current_participants: number;
  max_participants: number;
  instructions: string;
  tests: {
    id: string;
    title: string;
    subject: string;
    class_level: string;
    duration_minutes: number;
    questions: Question[];
  };
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  marks: number;
}

interface TestSession {
  participantId: string;
  startTime: number;
  answers: { [questionId: string]: number };
  currentQuestion: number;
  timeRemaining: number;
  isSubmitted: boolean;
}

export default function LiveTestPage() {
  const params = useParams();
  const router = useRouter();
  const liveTestId = params.id as string;
  const [studentId] = useState('student_' + Math.random().toString(36).substr(2, 9));
  
  const [liveTest, setLiveTest] = useState<LiveTest | null>(null);
  const [session, setSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showInstructions, setShowInstructions] = useState(true);
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const participantUpdateRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadLiveTest();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (participantUpdateRef.current) clearInterval(participantUpdateRef.current);
    };
  }, [liveTestId]);

  useEffect(() => {
    if (session && !session.isSubmitted) {
      // Start timer
      timerRef.current = setInterval(() => {
        setSession(prev => {
          if (!prev) return null;
          
          const newTimeRemaining = prev.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            handleAutoSubmit();
            return { ...prev, timeRemaining: 0, isSubmitted: true };
          }
          
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);

      // Update participant status every 30 seconds
      participantUpdateRef.current = setInterval(() => {
        updateParticipantStatus();
      }, 30000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (participantUpdateRef.current) clearInterval(participantUpdateRef.current);
    };
  }, [session]);

  const loadLiveTest = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/supabase/live-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'get-by-id', 
          liveTestId 
        })
      });

      const result = await response.json();
      if (result.success) {
        setLiveTest(result.data);
        
        // Check if test is still active
        const now = new Date();
        const endTime = new Date(result.data.end_time);
        
        if (now > endTime) {
          alert('This test has ended.');
          router.push('/student-corner');
          return;
        }
      } else {
        alert('Test not found or no longer available');
        router.push('/student-corner');
      }
    } catch (error) {
      console.error('Error loading live test:', error);
      alert('Error loading test');
      router.push('/student-corner');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTest = async () => {
    if (!liveTest) return;
    
    try {
      setJoining(true);
      
      const response = await fetch('/api/supabase/live-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join-test',
          liveTestId,
          studentId
        })
      });

      const result = await response.json();
      if (result.success) {
        // Initialize test session
        const durationSeconds = liveTest.tests.duration_minutes * 60;
        const newSession: TestSession = {
          participantId: result.data.id,
          startTime: Date.now(),
          answers: {},
          currentQuestion: 0,
          timeRemaining: durationSeconds,
          isSubmitted: false
        };
        
        setSession(newSession);
        setShowInstructions(false);
        
        // Enter fullscreen mode
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        alert('Error joining test: ' + result.error);
      }
    } catch (error) {
      console.error('Error joining test:', error);
      alert('Error joining test');
    } finally {
      setJoining(false);
    }
  };

  const updateParticipantStatus = async () => {
    if (!session) return;
    
    try {
      await fetch('/api/supabase/live-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-participant',
          participantId: session.participantId,
          currentQuestion: currentQuestionIndex,
          answersCount: Object.keys(session.answers).length
        })
      });
    } catch (error) {
      console.error('Error updating participant status:', error);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (!session || session.isSubmitted) return;
    
    const questionId = liveTest?.tests.questions[questionIndex]?.id;
    if (!questionId) return;
    
    setSelectedAnswer(answerIndex);
    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: answerIndex
        }
      };
    });
  };

  const handleNextQuestion = () => {
    if (!liveTest || currentQuestionIndex >= liveTest.tests.questions.length - 1) return;
    
    setCurrentQuestionIndex(prev => prev + 1);
    
    // Load saved answer for next question
    const nextQuestionId = liveTest.tests.questions[currentQuestionIndex + 1]?.id;
    const savedAnswer = session?.answers[nextQuestionId];
    setSelectedAnswer(savedAnswer ?? null);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex <= 0) return;
    
    setCurrentQuestionIndex(prev => prev - 1);
    
    // Load saved answer for previous question
    const prevQuestionId = liveTest?.tests.questions[currentQuestionIndex - 1]?.id;
    const savedAnswer = prevQuestionId ? session?.answers[prevQuestionId as keyof typeof session.answers] : undefined;
    setSelectedAnswer(savedAnswer ?? null);
  };

  const handleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex);
      } else {
        newSet.add(currentQuestionIndex);
      }
      return newSet;
    });
  };

  const handleSubmitTest = async () => {
    if (!session || !liveTest) return;
    
    const confirmSubmit = window.confirm(
      'Are you sure you want to submit your test? This action cannot be undone.'
    );
    
    if (!confirmSubmit) return;
    
    try {
      // Calculate score
      let score = 0;
      let maxMarks = 0;
      
      liveTest.tests.questions.forEach((question) => {
        maxMarks += question.marks;
        const studentAnswer = session.answers[question.id];
        if (studentAnswer === question.correct_answer) {
          score += question.marks;
        }
      });
      
      const percentage = (score / maxMarks) * 100;
      const timeTaken = Math.floor((Date.now() - session.startTime) / 1000);
      
      // Submit results
      const response = await fetch('/api/supabase/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-result',
          studentId,
          testId: liveTest.test_id,
          testName: liveTest.tests.title,
          answers: session.answers,
          score,
          maxMarks,
          percentage,
          timeTaken,
          isLiveTest: true,
          liveTestId
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setSession(prev => prev ? { ...prev, isSubmitted: true } : null);
        
        // Exit fullscreen
        if (document.exitFullscreen && isFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
        
        alert(`Test submitted successfully!\nScore: ${score}/${maxMarks} (${percentage.toFixed(1)}%)`);
        router.push('/student-corner');
      } else {
        alert('Error submitting test: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Error submitting test');
    }
  };

  const handleAutoSubmit = async () => {
    if (!session || !liveTest) return;
    
    try {
      // Auto-submit when time runs out
      let score = 0;
      let maxMarks = 0;
      
      liveTest.tests.questions.forEach((question) => {
        maxMarks += question.marks;
        const studentAnswer = session.answers[question.id];
        if (studentAnswer === question.correct_answer) {
          score += question.marks;
        }
      });
      
      const percentage = (score / maxMarks) * 100;
      const timeTaken = liveTest.tests.duration_minutes * 60; // Full duration
      
      await fetch('/api/supabase/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-result',
          studentId,
          testId: liveTest.test_id,
          testName: liveTest.tests.title,
          answers: session.answers,
          score,
          maxMarks,
          percentage,
          timeTaken,
          isLiveTest: true,
          liveTestId,
          autoSubmitted: true
        })
      });
      
      // Exit fullscreen
      if (document.exitFullscreen && isFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
      
      alert(`Time's up! Test auto-submitted.\nScore: ${score}/${maxMarks} (${percentage.toFixed(1)}%)`);
      router.push('/student-corner');
    } catch (error) {
      console.error('Error auto-submitting test:', error);
    }
  };

  const handleSecurityViolation = (violationType: string) => {
    setViolations(prev => prev + 1);
    
    if (violations >= 2) {
      alert('Too many security violations. Test will be auto-submitted.');
      handleAutoSubmit();
    } else {
      alert(`Security violation detected: ${violationType}. Warning ${violations + 1}/3`);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return session ? Object.keys(session.answers).length : 0;
  };

  const getTotalQuestions = () => {
    return liveTest?.tests.questions.length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live test...</p>
        </div>
      </div>
    );
  }

  if (!liveTest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Not Available</h2>
          <p className="text-gray-600 mb-4">This live test is no longer available or has ended.</p>
          <Button onClick={() => router.push('/student-corner')}>
            Return to Student Corner
          </Button>
        </div>
      </div>
    );
  }

  // Show instructions before joining
  if (showInstructions && !session) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-6 w-6 text-blue-600" />
                {liveTest.tests.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{liveTest.tests.subject} - Class {liveTest.tests.class_level}</span>
                <Badge variant="secondary">
                  <Users className="h-4 w-4 mr-1" />
                  {liveTest.current_participants}/{liveTest.max_participants}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-4 w-4 mr-1" />
                  {liveTest.tests.duration_minutes} minutes
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Test Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{liveTest.tests.questions.length}</p>
                  <p className="text-sm text-gray-600">Questions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{liveTest.tests.duration_minutes}</p>
                  <p className="text-sm text-gray-600">Minutes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {liveTest.tests.questions.reduce((sum, q) => sum + q.marks, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Marks</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Instructions</h3>
                
                {liveTest.instructions && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Teacher's Instructions:</h4>
                    <p className="text-yellow-700">{liveTest.instructions}</p>
                  </div>
                )}

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Guidelines:
                  </h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• The test will run in fullscreen mode</li>
                    <li>• Switching tabs or applications will be detected</li>
                    <li>• Screenshots and screen recording are blocked</li>
                    <li>• You have 3 warnings before auto-submission</li>
                    <li>• The test will auto-submit when time runs out</li>
                    <li>• Ensure stable internet connection</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">General Instructions:</h4>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Read each question carefully before answering</li>
                    <li>• You can navigate between questions using Next/Previous buttons</li>
                    <li>• Flag questions you want to review later</li>
                    <li>• Your answers are saved automatically</li>
                    <li>• Submit the test before time runs out</li>
                    <li>• Once submitted, you cannot make changes</li>
                  </ul>
                </div>
              </div>

              {/* Join Button */}
              <div className="text-center pt-4">
                <Button 
                  onClick={handleJoinTest}
                  disabled={joining}
                  className="px-8 py-3 text-lg"
                >
                  {joining ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Joining Test...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start Live Test
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  By clicking "Start Live Test", you agree to the security guidelines
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Test interface
  if (session && !session.isSubmitted) {
    const currentQuestion = liveTest.tests.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / liveTest.tests.questions.length) * 100;

    return (
      <SecureTestEnvironment
        onViolation={handleSecurityViolation}
        violationCount={violations}
        maxViolations={3}
      >
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-semibold text-lg">{liveTest.tests.title}</h1>
                  <p className="text-sm text-gray-600">{liveTest.tests.subject} - Class {liveTest.tests.class_level}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Time Remaining</p>
                    <p className={`text-lg font-bold ${session.timeRemaining <= 300 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatTime(session.timeRemaining)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-lg font-bold text-blue-600">
                      {getAnsweredCount()}/{getTotalQuestions()}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">Violations</p>
                    <p className={`text-lg font-bold ${violations >= 2 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {violations}/3
                    </p>
                  </div>
                </div>
              </div>
              
              <Progress value={isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress))} className="mt-2" />
            </div>
          </div>

          {/* Question Content */}
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      Question {currentQuestionIndex + 1} of {liveTest.tests.questions.length}
                      {flaggedQuestions.has(currentQuestionIndex) && (
                        <Flag className="h-5 w-5 text-orange-500 fill-current" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFlagQuestion}
                        className={flaggedQuestions.has(currentQuestionIndex) ? 'bg-orange-100' : ''}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question Text */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
                  </div>

                  {/* Answer Options */}
                  <RadioGroup
                    value={selectedAnswer?.toString()}
                    onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, parseInt(value))}
                  >
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            <span className="font-medium mr-2">({String.fromCharCode(65 + index)})</span>
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {selectedAnswer !== null ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {selectedAnswer !== null ? 'Answered' : 'Not answered'}
                      </span>
                    </div>

                    {currentQuestionIndex < liveTest.tests.questions.length - 1 ? (
                      <Button onClick={handleNextQuestion}>
                        Next
                        <SkipForward className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmitTest} className="bg-green-600 hover:bg-green-700">
                        Submit Test
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Question Navigator */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-sm">Question Navigator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-10 gap-2">
                    {liveTest.tests.questions.map((_, index) => {
                      const isAnswered = session.answers[liveTest.tests.questions[index].id] !== undefined;
                      const isCurrent = index === currentQuestionIndex;
                      const isFlagged = flaggedQuestions.has(index);
                      
                      return (
                        <Button
                          key={index}
                          variant={isCurrent ? 'default' : 'outline'}
                          size="sm"
                          className={`relative ${
                            isAnswered ? 'bg-green-100 border-green-300' : ''
                          } ${isFlagged ? 'bg-orange-100 border-orange-300' : ''}`}
                          onClick={() => {
                            setCurrentQuestionIndex(index);
                            const questionId = liveTest.tests.questions[index].id;
                            const savedAnswer = session.answers[questionId];
                            setSelectedAnswer(savedAnswer ?? null);
                          }}
                        >
                          {index + 1}
                          {isFlagged && (
                            <Flag className="h-3 w-3 absolute -top-1 -right-1 text-orange-500 fill-current" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                      <span>Flagged</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                      <span>Not answered</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SecureTestEnvironment>
    );
  }

  // Test completed
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Submitted Successfully!</h2>
        <p className="text-gray-600 mb-4">Your answers have been recorded and will be evaluated.</p>
        <Button onClick={() => router.push('/student-corner')}>
          Return to Student Corner
        </Button>
      </div>
    </div>
  );
}