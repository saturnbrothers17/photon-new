/**
 * STUDENT DEBUG PAGE
 * 
 * Debug page to check test visibility for students
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentDebugPage() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/tests');
      const result = await response.json();
      setDebugData(result);
    } catch (error: unknown) {
      console.error('Error fetching debug data:', error);
      const message = error instanceof Error ? error.message : String(error);
      setDebugData({ success: false, error: message });
    } finally {
      setLoading(false);
    }
  };

  const testPublishedAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/student/tests?action=published');
      const result = await response.json();
      console.log('Published tests API result:', result);
      alert(`Published tests API: ${result.success ? 'Success' : 'Failed'}\nTests found: ${result.data?.length || 0}`);
    } catch (error: unknown) {
      console.error('Error testing published API:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Student Debug - Test Visibility</h1>
        
        <div className="grid gap-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={fetchDebugData} disabled={loading}>
                  Refresh Debug Data
                </Button>
                <Button onClick={testPublishedAPI} disabled={loading}>
                  Test Published API
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Debug Results */}
          {debugData && (
            <Card>
              <CardHeader>
                <CardTitle>Debug Results</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          {debugData?.success && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {debugData.data.totalTests}
                  </div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {debugData.data.publishedTests}
                  </div>
                  <div className="text-sm text-gray-600">Published Tests</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {debugData.data.totalTests - debugData.data.publishedTests}
                  </div>
                  <div className="text-sm text-gray-600">Draft Tests</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Test List */}
          {debugData?.success && debugData.data.publishedTestsData && (
            <Card>
              <CardHeader>
                <CardTitle>Published Tests (What Students Should See)</CardTitle>
              </CardHeader>
              <CardContent>
                {debugData.data.publishedTestsData.length > 0 ? (
                  <div className="space-y-4">
                    {debugData.data.publishedTestsData.map((test: any) => (
                      <div key={test.id} className="p-4 bg-green-50 border border-green-200 rounded">
                        <h3 className="font-semibold">{test.title}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          ID: {test.id} | Questions: {test.questions_count} | Created: {new Date(test.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No published tests found - this is why students see "No Upcoming Tests"
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}