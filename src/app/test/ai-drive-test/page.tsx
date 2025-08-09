'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, TestTube2, Database } from 'lucide-react';
import AIExtractionTest from '@/components/teacher-dashboard/AIExtractionTest';
import GoogleDriveServiceAccount from '@/components/teacher-dashboard/GoogleDriveServiceAccount';

export default function AIDriveTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI Extraction & Google Drive Integration Test
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Test the complete workflow of AI-powered question extraction and saving results to Google Drive
          </p>
        </div>

        <Tabs defaultValue="test" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="test" className="flex items-center gap-2">
              <TestTube2 className="h-4 w-4" />
              Test Extraction & Save
            </TabsTrigger>
            <TabsTrigger value="drive" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Drive Management
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="space-y-6">
            <AIExtractionTest />
          </TabsContent>
          
          <TabsContent value="drive" className="space-y-6">
            <GoogleDriveServiceAccount />
          </TabsContent>
        </Tabs>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Lightbulb className="h-5 w-5" />
              How to Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-700 mb-2">1. Upload Image</h3>
                <p className="text-sm text-gray-600">
                  Upload an image of a question paper with MCQs to test AI extraction
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-700 mb-2">2. Extract Questions</h3>
                <p className="text-sm text-gray-600">
                  AI will extract questions, options, and answers with confidence scores
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-700 mb-2">3. Save to Drive</h3>
                <p className="text-sm text-gray-600">
                  Save extracted questions directly to your Google Drive account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
