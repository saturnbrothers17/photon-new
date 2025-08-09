"use client";

import { useState, useEffect, useCallback } from 'react';

interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  answers: any;
  submittedAt: string;
  timeTaken: number;
  totalQuestions: number;
  attemptedQuestions: number;
  flaggedQuestions: any[];
  testName: string;
  testType: string;
  score: number;
  maxMarks: number;
  securityReport: any;
}

interface FormattedTestResult {
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
  attemptedQuestions: any[];
  subjectPerformance: any[];
  submittedAt: string;
}

export const useTestResults = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save test result to Supabase
  const saveTestResult = async (testResult: Partial<TestResult>) => {
    try {
      setLoading(true);
      setError(null);

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
        console.log('✅ Test result saved successfully');
        return { success: true, data: result.data };
      } else {
        console.error('❌ Failed to save test result:', result.error);
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('❌ Error saving test result:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get test results for a student
  const getTestResults = async (studentId: string = 'current-student') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/supabase/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'get-results', 
          studentId 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResults(result.data || []);
        return { success: true, data: result.data };
      } else {
        console.error('❌ Failed to get test results:', result.error);
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('❌ Error getting test results:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get latest test result (no state updates to prevent infinite loops)
  const getLatestTestResult = useCallback(async (studentId: string = 'current-student'): Promise<FormattedTestResult | null> => {
    try {
      // Direct API call without state updates
      const response = await fetch('/api/supabase/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'get-results', 
          studentId 
        })
      });

      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        const latestResult = result.data[0];
        
        // Get test questions for calculations
        const testResponse = await fetch(`/api/supabase/tests?action=get-by-id&testId=${latestResult.test_id}`);
        const testData = await testResponse.json();
        const questions = testData.success ? testData.data.questions : [];
        
        return formatTestResult(latestResult, questions);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting latest test result:', error);
      return null;
    }
  }, []); // Empty dependency array to prevent recreation

  // Format raw test result for display
  const formatTestResult = (rawResult: any, questions: any[]): FormattedTestResult => {
    const correctAnswers = calculateCorrectAnswers(rawResult.answers, questions);
    const wrongAnswers = calculateWrongAnswers(rawResult.answers, questions);
    
    return {
      testId: rawResult.test_id,
      testName: rawResult.test_name,
      totalQuestions: rawResult.total_questions,
      correctAnswers,
      wrongAnswers,
      unanswered: rawResult.total_questions - rawResult.attempted_questions,
      score: rawResult.score,
      percentage: Math.round((correctAnswers / rawResult.total_questions) * 100),
      timeTaken: rawResult.time_taken,
      originalDuration: 180 * 60, // Default 3 hours
      attemptedQuestions: generateAttemptedQuestions(rawResult.answers, questions),
      subjectPerformance: calculateSubjectPerformance(rawResult.answers, questions),
      submittedAt: rawResult.submitted_at
    };
  };

  // Helper functions
  const calculateCorrectAnswers = (answers: any, questions: any[]) => {
    if (!answers || !questions || questions.length === 0) return 0;
    let correct = 0;
    Object.keys(answers).forEach(questionIndex => {
      const question = questions[parseInt(questionIndex)];
      if (question && answers[questionIndex] === question.correct_answer) {
        correct++;
      }
    });
    return correct;
  };

  const calculateWrongAnswers = (answers: any, questions: any[]) => {
    if (!answers || !questions || questions.length === 0) return 0;
    let wrong = 0;
    Object.keys(answers).forEach(questionIndex => {
      const question = questions[parseInt(questionIndex)];
      if (question && answers[questionIndex] && answers[questionIndex] !== question.correct_answer) {
        wrong++;
      }
    });
    return wrong;
  };

  const generateAttemptedQuestions = (answers: any, questions: any[]) => {
    if (!answers || !questions || questions.length === 0) return [];
    return questions.map((question, index) => ({
      question: question,
      selectedAnswer: answers[index] || null,
      isCorrect: answers[index] === question.correct_answer,
      questionIndex: index
    }));
  };

  const calculateSubjectPerformance = (answers: any, questions: any[]) => {
    if (!answers || !questions || questions.length === 0) return [];
    const subjects: any = {};
    
    questions.forEach((question, index) => {
      const subject = question.subject || 'General';
      if (!subjects[subject]) {
        subjects[subject] = { correct: 0, total: 0 };
      }
      subjects[subject].total++;
      if (answers[index] === question.correct_answer) {
        subjects[subject].correct++;
      }
    });

    return Object.keys(subjects).map(subject => ({
      subject,
      correctAnswers: subjects[subject].correct,
      totalQuestions: subjects[subject].total,
      accuracy: Math.round((subjects[subject].correct / subjects[subject].total) * 100)
    }));
  };

  return {
    testResults,
    loading,
    error,
    saveTestResult,
    getTestResults,
    getLatestTestResult,
    formatTestResult
  };
};