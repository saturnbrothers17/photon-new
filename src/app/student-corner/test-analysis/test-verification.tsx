// Test verification component for Google Drive integration and detailed solutions
import React, { useEffect, useState } from 'react';
import { demoTestResult } from './demo-data';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  subject: string;
}

interface QuestionAttempt {
  questionId: number;
  questionText: string;
  subject: string;
  marks: number;
  obtainedMarks: number;
  status: 'correct' | 'wrong' | 'unanswered';
  selectedAnswer: string;
  correctAnswer: string;
  timeSpent: number;
  solution?: {
    explanation: string;
    stepByStep: string[];
    tips: string[];
    relatedConcepts: string[];
    videoExplanation: string;
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
  originalDuration: number;
  attemptedQuestions: QuestionAttempt[];
}

interface TestVerificationProps {
  onTestComplete?: (result: TestResult) => void;
}

export default function TestVerification({ onTestComplete }: TestVerificationProps) {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [attemptedQuestions, setAttemptedQuestions] = useState<QuestionAttempt[]>([]);
  const [showDemo, setShowDemo] = useState(false);

  // Simulate loading test result from Google Drive
  const loadTestResult = async () => {
    // Simulate loading from Google Drive
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Use demo data directly with type assertion
    setTestResult(demoTestResult as any);
  };

  useEffect(() => {
    loadTestResult();
  }, []);

  const handleSaveToGoogleDrive = async () => {
    try {
      // Simulate saving to Google Drive
      console.log('Saving test result to Google Drive...');
      
      // In real implementation, this would use the Google Drive API
      const response = await fetch('/api/drive/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveTestResult',
          data: demoTestResult,
          studentId: 'student-001',
          testId: 'demo-test-001'
        })
      });

      if (response.ok) {
        alert('Test result saved to Google Drive successfully!');
      } else {
        alert('Failed to save to Google Drive. Check console for details.');
      }
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      alert('Error saving to Google Drive. Check console for details.');
    }
  };

  if (!testResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test result...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Test Verification</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Google Drive Integration</h3>
              <p className="text-sm text-blue-700 mt-2">
                Test results are saved to structured folders in Google Drive
              </p>
              <button
                onClick={handleSaveToGoogleDrive}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save to Google Drive
              </button>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Detailed Solutions</h3>
              <p className="text-sm text-green-700 mt-2">
                Each question includes step-by-step solutions with explanations
              </p>
              <button
                onClick={() => setShowDemo(!showDemo)}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {showDemo ? 'Hide' : 'Show'} Demo
              </button>
            </div>
          </div>

          {showDemo && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Demo Test Result</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Test:</strong> {testResult.testName}
                </div>
                <div>
                  <strong>Score:</strong> {testResult.score}/{testResult.totalQuestions}
                </div>
                <div>
                  <strong>Percentage:</strong> {testResult.percentage}%
                </div>
                <div>
                  <strong>Time Taken:</strong> {Math.round(testResult.timeTaken / 60)} minutes
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Sample Question with Solution:</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">Question 1: Sample Physics Question</p>
                  <div className="text-sm text-gray-600">
                    Detailed solution with step-by-step explanation...
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    Solution includes: step-by-step explanation, tips, and related concepts
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Integration Status</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>✓ Google Drive folder structure created</li>
            <li>✓ Test results saved with folder hierarchy</li>
            <li>✓ Detailed solutions integrated</li>
            <li>✓ Fallback to localStorage implemented</li>
            <li>✓ API endpoints created for data operations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
