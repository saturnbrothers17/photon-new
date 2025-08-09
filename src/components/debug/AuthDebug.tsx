/**
 * AUTH DEBUG COMPONENT
 * 
 * Simple component to test authentication and UUID generation
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDebug() {
  const [authResult, setAuthResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-auth');
      const result = await response.json();
      setAuthResult(result);
    } catch (error) {
      setAuthResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testCreateTest = async () => {
    setLoading(true);
    try {
      const testData = {
        title: 'Debug Test',
        description: 'Test created for debugging',
        subject: 'Physics',
        class_level: 'JEE Main',
        duration_minutes: 60,
        total_marks: 100,
        passing_marks: 40,
        is_published: false,
        questions: [
          {
            question_text: 'What is 2+2?',
            question_type: 'multiple_choice',
            options: ['3', '4', '5', '6'],
            correct_answer: '4',
            marks: 4,
            solution: { explanation: 'Basic arithmetic' }
          }
        ]
      };

      const response = await fetch('/api/supabase/tests?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      setAuthResult(result);
    } catch (error) {
      setAuthResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={testAuth} disabled={loading}>
            Test Auth
          </Button>
          <Button onClick={testCreateTest} disabled={loading}>
            Test Create Test
          </Button>
        </div>
        
        {authResult && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(authResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}