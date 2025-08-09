'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PowerfulQuestionExtractor, ExtractionResult } from '@/lib/ai-question-extractor';
import { UploadCloud, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AIExtractionTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsExtracting(true);
    setError(null);
    setResult(null);

    try {
      const extractor = new PowerfulQuestionExtractor(true); // Enable debug logging
      const extractionResult = await extractor.extractQuestions(file);
      setResult(extractionResult);
      if (extractionResult.error) {
        setError(extractionResult.error);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-blue-600" />
              AI Question Extraction Test
            </CardTitle>
            <CardDescription>
              Upload an image containing multiple-choice questions to test the extraction process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" onChange={handleFileChange} accept="image/*" />
            <Button onClick={handleExtract} disabled={!file || isExtracting} className="w-full">
              {isExtracting ? (
                <><Loader className="mr-2 h-4 w-4 animate-spin" /> Extracting...</>
              ) : (
                'Extract Questions'
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                Extraction Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                Extraction Complete
              </CardTitle>
              <CardDescription>
                Source: {result.source} | Confidence: {result.confidence?.toFixed(2) ?? 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-bold mb-2">Extracted Questions ({result.questions.length})</h3>
              {result.questions.length > 0 ? (
                <div className="space-y-4">
                  {result.questions.map((q, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50">
                      <p className="font-semibold">{q.id}: {q.question_text}</p>
                      <ul className="list-disc list-inside mt-2">
                        {q.choices.map(c => (
                          <li key={c.id} className={c.id === q.correct_answer ? 'font-bold text-green-700' : ''}>
                            {c.id}: {c.text}
                          </li>
                        ))}
                      </ul>
                      {q.explanation && <p className="text-sm mt-2 text-gray-600"><b>Explanation:</b> {q.explanation}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No questions were extracted from the image.</p>
              )}
              <h3 className="font-bold mt-6 mb-2">Raw Output</h3>
              <pre className="bg-gray-900 text-white p-4 rounded-lg text-xs overflow-x-auto">
                <code>{result.raw_text || 'No raw text available.'}</code>
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
