'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Play,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function QuestionExtractionAPITest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'extracting' | 'success' | 'failed'>('idle');
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError(null);
    setExtractionResult(null);
  };

  const runExtractionTest = async () => {
    if (!selectedFile) {
      setError('Please select an image file first');
      return;
    }

    setExtractionStatus('extracting');
    setError(null);
    setExtractionResult(null);

    try {
      // Create FormData and send to API
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/test-question-extraction', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setExtractionResult(data.result);
        setExtractionStatus('success');
      } else {
        setError(data.error);
        setExtractionStatus('failed');
      }
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.message || 'Unknown error occurred during API test');
      setExtractionStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            API-Based Question Extraction Test
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Test the AI-powered question extraction through API routes
          </p>
        </div>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Question Paper Image</CardTitle>
            <CardDescription>
              Select an image file containing MCQ questions to extract via API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="question-image">Question Paper Image</Label>
              <Input 
                id="question-image" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              {selectedFile && (
                <p className="text-sm text-gray-500 mt-2">
                  Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>
            
            <Button 
              onClick={runExtractionTest}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={extractionStatus === 'extracting' || !selectedFile}
            >
              {extractionStatus === 'extracting' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting Questions...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Extract Questions via API
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {extractionResult && (
          <Card>
            <CardHeader>
              <CardTitle>Extraction Results</CardTitle>
              <CardDescription>
                AI-powered question extraction completed via API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Successfully extracted {extractionResult.totalFound} questions in {extractionResult.processingTime}ms
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Success Rate</h3>
                  <p className="text-2xl font-bold text-blue-600">{extractionResult.successRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-800 mb-2">Total Questions</h3>
                  <p className="text-2xl font-bold text-purple-600">{extractionResult.totalFound}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-orange-800 mb-2">Processing Time</h3>
                  <p className="text-2xl font-bold text-orange-600">{extractionResult.processingTime}ms</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-800 mb-3">Extracted Questions:</h3>
                <div className="space-y-4">
                  {extractionResult.questions.map((question: any, index: number) => (
                    <div key={question.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                        <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                          Confidence: {question.confidence}%
                        </span>
                      </div>
                      <p className="text-gray-800 mb-3">{question.questionText}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option: string, optIndex: number) => (
                          <div key={optIndex} className="p-2 border rounded bg-gray-50">
                            <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                            <span className="text-gray-700">{option}</span>
                          </div>
                        ))}
                      </div>
                      {question.correctAnswer !== undefined && (
                        <p className="mt-3 text-sm text-green-600">
                          Correct Answer: {String.fromCharCode(65 + question.correctAnswer)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {extractionResult.debugInfo.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-800 mb-2">Debug Information:</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
                    {extractionResult.debugInfo.map((log: string, index: number) => (
                      <p key={index} className="text-sm font-mono mb-1">{log}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card>
            <CardHeader>
              <CardTitle>Extraction Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
