'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Brain, 
  Cloud, 
  CheckCircle, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { powerfulExtractor } from '@/lib/ai-question-extractor';
import { useGoogleDriveAPI } from '@/hooks/useGoogleDriveAPI';

export default function AIExtractionTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);
  
  const { saveTest } = useGoogleDriveAPI();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractionResult(null);
      setError(null);
      setSaveResult(null);
    }
  };

  const handleExtractQuestions = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await powerfulExtractor.extractQuestions(selectedFile);
      setExtractionResult(result);
    } catch (err: any) {
      setError(err.message || 'Extraction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToDrive = async () => {
    if (!extractionResult || !extractionResult.questions.length) return;

    setIsSaving(true);
    setError(null);
    
    try {
      // Create a test object with the extracted questions
      const testObject = {
        id: `test_${Date.now()}`,
        title: `AI Extracted Questions - ${new Date().toLocaleDateString()}`,
        subject: 'General',
        questions: extractionResult.questions.map((q: any, index: number) => ({
          id: q.id,
          question: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer || 0,
          marks: q.marks || 4,
          subject: q.subject || 'General',
          difficulty: q.difficulty || 'Medium',
          explanation: q.explanation || ''
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const fileId = await saveTest(testObject);
      setSaveResult(`Successfully saved to Google Drive with ID: ${fileId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save to Google Drive');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Extraction & Google Drive Test
          </CardTitle>
          <CardDescription>
            Test the AI question extraction and Google Drive saving functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Question Paper
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="test-file-upload"
                disabled={isProcessing}
              />
              <label htmlFor="test-file-upload" className="cursor-pointer">
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-700 mb-2">
                  Upload Question Paper
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </label>
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">{selectedFile.name}</p>
                  <p className="text-sm text-green-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleExtractQuestions}
                disabled={isProcessing}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isProcessing ? 'Processing...' : 'Extract Questions'}
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="font-medium text-red-800">Operation Failed</p>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Extraction Results */}
          {extractionResult && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Extraction Successful!
                  <Badge className="bg-green-600 text-white">
                    {extractionResult.questions.length} Questions Found
                  </Badge>
                </CardTitle>
                <div className="flex gap-4 text-sm text-green-700">
                  <span>⚡ {extractionResult.processingTime}ms</span>
                  <span>🎯 {Math.round(extractionResult.successRate)}% accuracy</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {extractionResult.questions.slice(0, 3).map((question: any, index: number) => (
                    <div key={question.id} className="p-3 bg-white border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
                        <Badge variant="outline" className="text-xs">
                          {question.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{question.questionText}</p>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                        {question.options.map((option: string, optIndex: number) => (
                          <span key={optIndex} className="truncate">
                            {String.fromCharCode(65 + optIndex)}) {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {extractionResult.questions.length > 3 && (
                    <p className="text-center text-sm text-green-600 font-medium">
                      + {extractionResult.questions.length - 3} more questions extracted
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={handleSaveToDrive}
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Cloud className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving to Drive...' : 'Save to Google Drive'}
                </Button>
                
                {saveResult && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-blue-700">{saveResult}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
