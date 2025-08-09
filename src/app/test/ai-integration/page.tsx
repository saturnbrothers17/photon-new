'use client';

import React, { useState } from 'react';
import { PowerfulQuestionExtractor } from '@/lib/ai-question-extractor';
import AIProviderSelector from '@/components/AIProviderSelector';

export default function AIIntegrationTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractionResult(null);
      setError('');
      setDebugLogs([]);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setError('');
    setDebugLogs([]);

    try {
      const extractor = new PowerfulQuestionExtractor({
        qwenApiKey: process.env.NEXT_PUBLIC_QWEN_API_KEY,
        geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        debug: true
      });

      const result = await extractor.extractQuestions(selectedFile);
      setExtractionResult(result);
      
      // Capture debug logs
      if (result.debugInfo?.debugLogs) {
        setDebugLogs(result.debugInfo.debugLogs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">AI Question Extraction Test</h1>
            <AIProviderSelector />
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Test Configuration</h2>
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Qwen API:</strong> {process.env.NEXT_PUBLIC_QWEN_API_KEY ? '✅ Configured' : '❌ Not set'}
                </div>
                <div>
                  <strong>Gemini API:</strong> {process.env.NEXT_PUBLIC_GEMINI_API_KEY ? '✅ Configured' : '❌ Not set'}
                </div>
                <div>
                  <strong>Default Provider:</strong> {process.env.NEXT_PUBLIC_AI_PROVIDER || 'qwen'}
                </div>
                <div>
                  <strong>Environment:</strong> {process.env.NODE_ENV}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Upload Test Image
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              aria-label="Upload test image for AI question extraction"
            />
          </div>

          {selectedFile && (
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Selected File</h3>
                <p><strong>Name:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={!selectedFile || isExtracting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isExtracting ? 'Extracting...' : 'Extract Questions'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {extractionResult && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Extraction Results</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Questions Found: {extractionResult.questions?.length || 0}</div>
                  <div>Confidence: {extractionResult.confidence?.toFixed(1) || 0}%</div>
                  <div>Extraction Time: {extractionResult.extractionTime?.toFixed(0) || 0}ms</div>
                  <div>Methods Used: {extractionResult.methodsUsed?.join(', ') || 'None'}</div>
                </div>
              </div>

              {extractionResult.questions && extractionResult.questions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Extracted Questions</h4>
                  {extractionResult.questions.map((q: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="font-semibold mb-2">Question {index + 1}</div>
                      <div className="mb-2">{q.question}</div>
                      <div className="text-sm text-gray-600">
                        <div>Options: {q.options?.join(', ')}</div>
                        <div>Correct: {q.correctAnswer}</div>
                        <div>Confidence: {q.confidence}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {debugLogs.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Debug Logs</h4>
                  <div className="bg-gray-100 rounded-lg p-4 max-h-40 overflow-y-auto text-sm font-mono">
                    {debugLogs.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
