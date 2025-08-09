'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle,
  Play,
  HardDrive
} from 'lucide-react';

export default function SimpleIntegrationTest() {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setTestStatus('testing');
    setError(null);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/drive-simple-test');
      const data = await response.json();
      
      if (data.success) {
        setTestResult(data);
        setTestStatus('success');
      } else {
        setError(data.error);
        setTestStatus('failed');
      }
    } catch (err: any) {
      setError(err.message);
      setTestStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <HardDrive className="h-8 w-8 text-blue-600" />
            Simple Integration Test
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Test the Google Drive integration functionality
          </p>
          <Button 
            onClick={runTest}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={testStatus === 'testing'}
          >
            <Play className="h-4 w-4 mr-2" />
            {testStatus === 'testing' ? 'Running Test...' : 'Run Integration Test'}
          </Button>
        </div>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Status of the Google Drive integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testStatus === 'success' && testResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Integration Test Passed!</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Folder Information</h3>
                    <p className="text-sm text-gray-600">Folder ID: {testResult.folderId}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">File Status</h3>
                    <p className="text-sm text-gray-600">Files in folder: {testResult.fileCount}</p>
                  </div>
                </div>
              </div>
            )}
            
            {testStatus === 'failed' && error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Test Failed</span>
                <p className="text-sm text-red-700 mt-2">{error}</p>
              </div>
            )}
            
            {testStatus === 'idle' && (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">Click the button above to run the integration test</p>
              </div>
            )}
            
            {testStatus === 'testing' && (
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-blue-700">Running integration test...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
