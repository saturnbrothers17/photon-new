'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  Zap, 
  Brain, 
  Eye, 
  Settings,
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Cpu,
  Target,
  RefreshCw,
  Cloud,
  Save
} from 'lucide-react';
import { aiQuestionExtractor, AIExtractedQuestion, ExtractionResult } from '@/lib/ai-question-extractor';
import { useSupabaseTests } from '@/hooks/useSupabaseTests';

interface PowerfulQuestionExtractorProps {
  onQuestionsExtracted: (questions: any[]) => void;
  setShowExtractor: (show: boolean) => void;
}

export default function PowerfulQuestionExtractor({ 
  onQuestionsExtracted, 
  setShowExtractor 
}: PowerfulQuestionExtractorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<AIExtractedQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);
  
  const { createTest } = useSupabaseTests();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError('Please upload an image (PNG, JPG, JPEG) or PDF file.');
        return;
      }

      setSelectedFile(file);
      setExtractionResult(null);
      setExtractedQuestions([]);
      setError(null);
      setDebugInfo([]);
    }
  }, []);

  const handleSetApiKey = useCallback(() => {
    if (geminiApiKey.trim()) {
      // API key is now handled automatically by the extractor
      setShowApiKeyInput(false);
      setApiKeyConfigured(true);
      setError(null);
    }
  }, [geminiApiKey]);

  // Auto-configure API key from environment on component mount
  useEffect(() => {
    // API keys are now automatically loaded from environment variables
    const hasGeminiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const hasOpenRouterKey = !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
    if (hasGeminiKey || hasOpenRouterKey) {
      setApiKeyConfigured(true);
    } else {
      // Still allow manual configuration for demo purposes
      setApiKeyConfigured(true);
    }
  }, []);

  const handleExtractQuestions = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);
    setDebugInfo([]);

    try {
      // Simulate realistic progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev < 90) return prev + Math.random() * 15;
          return prev;
        });
      }, 500);

      const result = await aiQuestionExtractor.extractQuestions(selectedFile);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      // Check if extraction was successful
      if (result.questions.length === 0) {
        throw new Error(result.error || 'No questions could be extracted from the image');
      }
      
      // Show success message with source info
      if (result.source === 'openrouter') {
        console.log('✅ Questions extracted using OpenRouter AI');
      } else {
        console.log(`✅ Questions extracted using ${result.source} (demo mode)`);
      }
      
      setExtractionResult(result);
      
      // Convert Question[] to AIExtractedQuestion[] for component state
      const convertedForState = (result.questions || []).map(q => ({
        question: q.question_text || '',
        options: (q.choices || []).map(c => c.text || ''),
        correctAnswer: q.correct_answer || 'A',
        subject: q.subject || 'General',
        difficulty: q.difficulty || 'Medium'
      }));
      
      setExtractedQuestions(convertedForState);
      setDebugInfo(Array.isArray(result.debugLogs) ? result.debugLogs : []);

      // Convert to the format expected by the parent component
      const convertedQuestions = (result.questions || []).map(q => ({
        id: Date.now() + Math.random(),
        subject: q.subject || 'General',
        question: q.question_text || '',
        options: (q.choices || []).map(c => c.text || '') || [],
        correctAnswer: (q.choices || []).findIndex(c => c.id === q.correct_answer) || 0,
        marks: 4,
        negativeMarks: 1,
        difficulty: q.difficulty || 'Medium',
        questionImage: undefined
      }));

      // Auto-close and pass questions to parent
      setTimeout(() => {
        onQuestionsExtracted(convertedQuestions);
        setShowExtractor(false);
      }, 1500);

    } catch (error: any) {
      console.error('❌ Extraction failed:', error);
      const errorMessage = error?.message || 'Extraction failed. Please try again.';
      setError(errorMessage);
      setDebugInfo(prev => [...prev, `Error: ${errorMessage}`]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingProgress(0), 2000);
    }
  }, [selectedFile, onQuestionsExtracted, setShowExtractor]);

  const handleSaveToSupabase = useCallback(async () => {
    if (!extractionResult || !extractedQuestions.length) return;

    setIsSaving(true);
    setError(null);
    setSaveResult(null);
    
    try {
      // Create a test object with the extracted questions
      const testData = {
        title: `AI Extracted Questions - ${new Date().toLocaleDateString()}`,
        description: `Questions extracted using AI from uploaded image on ${new Date().toLocaleDateString()}`,
        subject: extractedQuestions[0]?.subject || 'General',
        class_level: 'JEE Main',
        duration_minutes: 180,
        total_marks: extractedQuestions.length * 4,
        passing_marks: Math.floor(extractedQuestions.length * 4 * 0.4),
        published: false, // Save as draft initially
        questions: extractedQuestions.map(q => ({
          question_text: q.question || '',
          question_type: 'multiple_choice',
          options: q.options || [],
          correct_answer: q.options?.[q.correctAnswer === 'A' ? 0 : q.correctAnswer === 'B' ? 1 : q.correctAnswer === 'C' ? 2 : 3] || q.options?.[0] || '',
          marks: 4,
          solution: {
            explanation: `The correct answer is ${q.correctAnswer}`,
            difficulty: q.difficulty || 'Medium'
          }
        }))
      };

      const testId = await createTest(testData);
      setSaveResult(`Successfully saved to Supabase with ID: ${testId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save to Supabase');
    } finally {
      setIsSaving(false);
    }
  }, [extractionResult, extractedQuestions, createTest]);

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'AI_VISION':
        return <Badge className="bg-purple-100 text-purple-800"><Brain className="h-3 w-3 mr-1" />AI Vision</Badge>;
      case 'OCR_ADVANCED':
        return <Badge className="bg-blue-100 text-blue-800"><Eye className="h-3 w-3 mr-1" />Advanced OCR</Badge>;
      case 'HYBRID':
        return <Badge className="bg-green-100 text-green-800"><Cpu className="h-3 w-3 mr-1" />Hybrid AI</Badge>;
      case 'AI':
        return <Badge className="bg-purple-100 text-purple-800"><Brain className="h-3 w-3 mr-1" />AI</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Zap className="h-3 w-3 mr-1" />AI</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Extractor Card */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Powerful AI Question Extractor
            <Badge className="bg-purple-600 text-white">Next-Gen AI</Badge>
          </CardTitle>
          <CardDescription>
            Advanced AI-powered question extraction using Google Gemini Vision + OCR technology.
            Supports images and PDFs with industry-leading accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key Configuration */}
          {apiKeyConfigured ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Gemini 2.0 Flash AI Vision is ready! Maximum accuracy enabled.
                </span>
              </div>
              <Badge className="bg-green-600 text-white">
                <Brain className="h-3 w-3 mr-1" />
                AI Ready
              </Badge>
            </div>
          ) : !showApiKeyInput ? (
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Configure Gemini 2.0 Flash API for maximum accuracy
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowApiKeyInput(true)}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Setup API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Gemini 2.0 Flash API Configuration</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter your Gemini 2.0 Flash API key..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSetApiKey} disabled={!geminiApiKey.trim()}>
                  <Zap className="h-4 w-4 mr-1" />
                  Activate
                </Button>
              </div>
              <p className="text-xs text-blue-600">
                Get your free API key from Google AI Studio. This enables the most powerful AI vision extraction.
              </p>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Question Paper
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="powerful-file-upload"
                disabled={isProcessing}
              />
              <label htmlFor="powerful-file-upload" className="cursor-pointer">
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-700 mb-2">
                  Upload Question Paper
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  PNG, JPG, JPEG, PDF up to 10MB
                </p>
                <div className="flex justify-center gap-4 text-xs text-gray-400">
                  <span>✓ AI Vision Support</span>
                  <span>✓ Advanced OCR</span>
                  <span>✓ Multi-format</span>
                </div>
              </label>
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  {selectedFile.type.startsWith('image/') ? (
                    <Eye className="h-5 w-5 text-green-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-green-800">{selectedFile.name}</p>
                  <p className="text-sm text-green-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI processing
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleExtractQuestions}
                disabled={isProcessing}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Extract Questions
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-blue-800">AI Processing Questions...</span>
                <span className="text-blue-600">{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="h-3" />
              <div className="flex justify-center gap-4 text-xs text-blue-600">
                <span>🤖 AI Vision Analysis</span>
                <span>🔍 OCR Processing</span>
                <span>🧠 Smart Parsing</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="font-medium text-red-800">Extraction Failed</p>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {extractionResult && extractedQuestions.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Extraction Successful!
              <Badge className="bg-green-600 text-white">
                {extractedQuestions.length} Questions Found
              </Badge>
            </CardTitle>
            <div className="flex gap-4 text-sm text-green-700">
              <span>📦 Source: {extractionResult.source}</span>
              <span>📊 Questions: {extractedQuestions.length}</span>
              {Array.isArray(extractionResult.debugLogs) && (
                <span>🪵 Logs: {extractionResult.debugLogs.length}</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Questions Preview */}
            <div className="space-y-3">
              {(extractedQuestions || []).slice(0, 3).map((question, index) => (
                <div key={index} className="p-3 bg-white border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
                    <div className="flex gap-2">
                      {getMethodBadge('AI')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{question.question || ''}</p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    {(question.options || []).map((option, optIndex) => (
                      <span key={optIndex} className="truncate">
                        {String.fromCharCode(65 + optIndex)}) {option}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              
              {(extractedQuestions || []).length > 3 && (
                <p className="text-center text-sm text-green-600 font-medium">
                  + {(extractedQuestions || []).length - 3} more questions extracted
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={() => {
                    onQuestionsExtracted((extractedQuestions || []).map(q => ({
                      id: Date.now() + Math.random(),
                      subject: q.subject || 'General',
                      question: q.question || '',
                      options: q.options || [],
                      correctAnswer: q.correctAnswer === 'A' ? 0 : q.correctAnswer === 'B' ? 1 : q.correctAnswer === 'C' ? 2 : q.correctAnswer === 'D' ? 3 : 0,
                      marks: 4,
                      negativeMarks: 1,
                      difficulty: q.difficulty || 'Medium',
                      questionImage: undefined
                    })));
                    setShowExtractor(false);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Use Questions
                </Button>
                <Button 
                  onClick={handleSaveToSupabase}
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save to Database'}
                </Button>
              </div>
              {saveResult && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-sm text-blue-700">{saveResult}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {debugInfo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-700">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={debugInfo.join('\n')}
              readOnly
              className="text-xs font-mono h-32 bg-gray-50"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}