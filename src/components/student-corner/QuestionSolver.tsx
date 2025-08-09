'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles } from 'lucide-react';

export default function QuestionSolver() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8" />
            <div>
              <CardTitle className="text-2xl font-bold">AI Question Solver</CardTitle>
              <CardDescription className="text-blue-100">
                Coming Soon: AI-powered solutions with Google Gemini 2.5 Flash
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 mb-6 flex items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <Sparkles className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Exciting Update Coming Soon!</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We're working hard to bring you an advanced AI question solving experience powered by Google Gemini 2.5 Flash.
            </p>
            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg inline-block">
              <p className="font-medium">Stay tuned for the launch!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
