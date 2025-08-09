"use client";

import { useState } from 'react';
import { Plus, Trash2, Save, Eye, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useSupabaseTests } from '@/hooks/useSupabaseTests';
import { CreateTestData } from '@/lib/supabase-data-manager';
import PowerfulQuestionExtractor from '@/components/teacher-dashboard/PowerfulQuestionExtractor';

// Generate ID function
const generateId = () => Math.floor(Math.random() * 10000) + 1;

interface Question {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  negativeMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionImage?: string;
}

interface TestData {
  name: string;
  type: string;
  duration: number;
  totalMarks: number;
  subjects: string[];
  instructions: string;
  scheduledDate: string;
  scheduledTime: string;
  goLive?: boolean;
}

export default function CreateTest() {
  const { createTest, loading: isCreating } = useSupabaseTests();
  
  const [testData, setTestData] = useState<TestData>({
    name: '',
    type: 'JEE Main',
    duration: 180,
    totalMarks: 300,
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    instructions: '',
    scheduledDate: '',
    scheduledTime: ''
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showExtractor, setShowExtractor] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      subject: 'Physics',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 4,
      negativeMarks: -1,
      difficulty: 'Medium'
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: number, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleExtractedQuestions = (extractedQuestions: any[]) => {
    const newQuestions = extractedQuestions.map(eq => ({
      ...eq,
      id: Date.now() + Math.random() // Ensure unique IDs
    }));
    
    setQuestions(prev => [...prev, ...newQuestions]);
    setShowExtractor(false);
    
    // Auto-advance to step 2 if we were on step 1
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handlePublishTest = async () => {
    // Validation
    if (!testData.name.trim()) {
      alert('Please enter a test name');
      return;
    }
    
    // Only validate date/time if not going live immediately
    if (!testData.goLive) {
      if (!testData.scheduledDate) {
        alert('Please select a scheduled date');
        return;
      }
      if (!testData.scheduledTime) {
        alert('Please select a scheduled time');
        return;
      }
    }
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    // Check if all questions are properly filled
    const incompleteQuestions = questions.filter(q => 
      !q.question.trim() || 
      q.options.some(opt => !opt.trim()) ||
      q.correctAnswer === undefined
    );

    if (incompleteQuestions.length > 0) {
      alert('Please complete all questions with proper options and correct answers');
      return;
    }

    setIsPublishing(true);
    
    try {
      const isLiveTest = testData.goLive;
      
      // Create test data for Supabase
      const supabaseTestData: CreateTestData = {
        title: testData.name,
        description: testData.instructions,
        subject: testData.subjects[0] || 'General', // Use first subject as primary
        class_level: testData.type,
        duration_minutes: testData.duration,
        total_marks: testData.totalMarks,
        passing_marks: Math.floor(testData.totalMarks * 0.4), // 40% passing marks
        published: true, // Always publish when creating
        questions: questions.map(q => ({
          question_text: q.question,
          question_type: 'multiple_choice',
          options: q.options,
          correct_answer: q.options[q.correctAnswer] || q.options[0],
          marks: q.marks,
          solution: {
            explanation: `The correct answer is ${q.options[q.correctAnswer]}`,
            difficulty: q.difficulty
          }
        }))
      };
      
      console.log('🚀 Creating test with Supabase:', supabaseTestData);
      
      // Create test using Supabase
      const testId = await createTest(supabaseTestData);
      
      console.log('✅ Test created successfully with ID:', testId);
      
      if (isLiveTest) {
        alert('🔴 TEST IS NOW LIVE! Students can access this test immediately.\n\n🌐 Real-time access enabled with Supabase!');
      } else {
        alert('✅ Test published successfully! Students can now access this test.\n\n🌐 Real-time synchronization active!');
      }
      
      // Redirect to manage tests page
      window.location.href = '/teacher-dashboard/manage-tests';
    } catch (error: any) {
      console.error('❌ Error publishing test:', error);
      alert(`Error publishing test: ${error.message || 'Please try again.'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <section className="py-8 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Link href="/teacher-dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="font-headline text-3xl md:text-4xl font-black">Create New Test</h1>
                <p className="text-lg opacity-90">Design and publish tests for your students</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                onClick={handlePublishTest}
                disabled={isPublishing || questions.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isPublishing ? 'Publishing...' : 'Publish Test'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 ${currentStep >= step ? 'text-blue-600' : 'text-gray-600'}`}>
                  {step === 1 ? 'Test Details' : step === 2 ? 'Add Questions' : 'Review & Publish'}
                </span>
                {step < 3 && <div className="w-16 h-1 bg-gray-200 mx-4"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Test Details */}
        {currentStep === 1 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Name</label>
                  <input
                    type="text"
                    value={testData.name}
                    onChange={(e) => setTestData({...testData, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., JEE Main Mock Test - 13"
                  />
                </div>
                <div>
                  <label htmlFor="testType" className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
                  <select
                    id="testType"
                    value={testData.type}
                    onChange={(e) => setTestData({...testData, type: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select test type"
                  >
                    <option value="JEE Main">JEE Main</option>
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="NEET">NEET</option>
                    <option value="Chapter Test">Chapter Test</option>
                    <option value="Practice Test">Practice Test</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    id="duration"
                    type="number"
                    value={testData.duration}
                    onChange={(e) => setTestData({...testData, duration: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Enter test duration in minutes"
                    placeholder="180"
                  />
                </div>
                <div>
                  <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                  <input
                    id="totalMarks"
                    type="number"
                    value={testData.totalMarks}
                    onChange={(e) => setTestData({...testData, totalMarks: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Enter total marks for the test"
                    placeholder="300"
                  />
                </div>
                <div className={testData.goLive ? 'opacity-50' : ''}>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date {testData.goLive && <span className="text-green-600">(Not needed for live tests)</span>}
                  </label>
                  <input
                    id="scheduledDate"
                    type="date"
                    value={testData.scheduledDate}
                    onChange={(e) => setTestData({...testData, scheduledDate: e.target.value})}
                    disabled={testData.goLive}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${testData.goLive ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    title="Select scheduled date"
                  />
                </div>
                <div className={testData.goLive ? 'opacity-50' : ''}>
                  <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Time {testData.goLive && <span className="text-green-600">(Not needed for live tests)</span>}
                  </label>
                  <input
                    id="scheduledTime"
                    type="time"
                    value={testData.scheduledTime}
                    onChange={(e) => setTestData({...testData, scheduledTime: e.target.value})}
                    disabled={testData.goLive}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${testData.goLive ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    title="Select scheduled time"
                  />
                </div>
              </div>
              
              {/* Live Test Option */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-green-800 mb-2">🔴 Go Live Immediately</h3>
                    <p className="text-green-700 text-sm">Make this test available for students to take right now, bypassing the scheduled date/time.</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="goLive"
                      checked={testData.goLive || false}
                      onChange={(e) => setTestData({...testData, goLive: e.target.checked})}
                      className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <label htmlFor="goLive" className="ml-3 text-sm font-medium text-green-800">
                      Enable Live Test
                    </label>
                  </div>
                </div>
                {testData.goLive && (
                  <div className="mt-4 p-4 bg-green-100 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
                      <span className="text-green-800 font-semibold">This test will be LIVE immediately after publishing!</span>
                    </div>
                    <p className="text-green-700 text-sm mt-2">Students will be able to start taking this test as soon as you click "Publish Test".</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Instructions</label>
                <textarea
                  value={testData.instructions}
                  onChange={(e) => setTestData({...testData, instructions: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter detailed instructions for students..."
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)} className="bg-blue-600 hover:bg-blue-700">
                  Next: Add Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Add Questions */}
        {currentStep === 2 && (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-2xl font-bold text-gray-800">Add Questions</h2>
              <div className="flex gap-3">
                <Button onClick={addQuestion} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
                <Button 
                  onClick={() => setShowExtractor(!showExtractor)} 
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Extract from Image/PDF
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Questions
                </Button>
              </div>
            </div>

            {/* Question Extractor */}
            {showExtractor && (
              <div className="mb-8">
                <PowerfulQuestionExtractor 
                  onQuestionsExtracted={handleExtractedQuestions} 
                  setShowExtractor={setShowExtractor} 
                />
              </div>
            )}

            <div className="space-y-6">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor={`subject-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <select
                          id={`subject-${question.id}`}
                          value={question.subject}
                          onChange={(e) => updateQuestion(question.id, 'subject', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          title="Select subject"
                        >
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Biology">Biology</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                        <input
                          id={`marks-${question.id}`}
                          type="number"
                          value={question.marks}
                          onChange={(e) => updateQuestion(question.id, 'marks', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          title="Enter marks"
                          placeholder="4"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                        <select
                          id={`difficulty-${question.id}`}
                          value={question.difficulty}
                          onChange={(e) => updateQuestion(question.id, 'difficulty', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          title="Select difficulty level"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    {question.questionImage && (
                      <div className="mb-4">
                        <img src={question.questionImage} alt="Extracted Question Image" className="rounded-lg border border-gray-200" />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your question here..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              id={`correct-${question.id}-${optionIndex}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                              className="text-green-600"
                              title={`Mark option ${optionIndex + 1} as correct answer`}
                            />
                            <label htmlFor={`correct-${question.id}-${optionIndex}`} className="text-sm font-medium text-gray-700">
                              Option {optionIndex + 1}:
                            </label>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optionIndex] = e.target.value;
                                updateQuestion(question.id, 'options', newOptions);
                              }}
                              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              placeholder={`Enter option ${optionIndex + 1}`}
                              title={`Option ${optionIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                </Card>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button onClick={() => setCurrentStep(1)} variant="outline">
                Previous: Test Details
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={questions.length === 0}
              >
                Next: Review & Publish
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Publish */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Review Test Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Test Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {testData.name}</div>
                      <div><span className="font-medium">Type:</span> {testData.type}</div>
                      <div><span className="font-medium">Duration:</span> {testData.duration} minutes</div>
                      <div><span className="font-medium">Total Marks:</span> {testData.totalMarks}</div>
                      <div><span className="font-medium">Scheduled:</span> {testData.scheduledDate} at {testData.scheduledTime}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Question Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Total Questions:</span> {questions.length}</div>
                      <div><span className="font-medium">Physics:</span> {questions.filter(q => q.subject === 'Physics').length}</div>
                      <div><span className="font-medium">Chemistry:</span> {questions.filter(q => q.subject === 'Chemistry').length}</div>
                      <div><span className="font-medium">Mathematics:</span> {questions.filter(q => q.subject === 'Mathematics').length}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center">
                    <Button onClick={() => setCurrentStep(2)} variant="outline">
                      Previous: Edit Questions
                    </Button>
                    <div className="flex gap-3">
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Test
                      </Button>
                      <Button 
                        onClick={handlePublishTest}
                        disabled={isPublishing}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isPublishing ? 'Publishing...' : 'Publish Test'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}