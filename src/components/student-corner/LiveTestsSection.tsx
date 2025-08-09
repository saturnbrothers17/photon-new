"use client";

import { useState } from 'react';
import { Calendar, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePublishedTests } from '@/hooks/useSupabaseTests';

export function LiveTestsSection() {
  const { tests, loading, error } = usePublishedTests();
  const [startingTestId, setStartingTestId] = useState<string | null>(null);

  // For now, we'll treat all published tests as available
  // TODO: Implement proper live test logic with start/end times
  const liveTests: any[] = []; // Placeholder for live tests
  const upcomingTests = tests.slice(0, 4); // Show first 4 published tests

  const handleStartTest = (test: any) => {
    if (!test?.id) {
      alert('Invalid test data');
      return;
    }

    // Direct navigation with test ID
    const testUrl = `/student-corner/mock-tests/take-test?testId=${test.id}`;
    window.location.href = testUrl;
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tests...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️ Error loading tests</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </section>
    );
  }

  console.log('📊 Student tests loaded:', { total: tests.length, published: tests.filter(t => t.is_published).length });

  return (
    <>
      {/* Live Tests Section */}
      {liveTests.length > 0 && (
        <section className="py-8 bg-gradient-to-r from-red-50 to-orange-50 border-b-2 border-red-200">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="font-headline text-2xl font-bold text-gray-800">🔴 LIVE TESTS - Take Now!</h2>
              <Badge className="bg-red-600 text-white animate-pulse">LIVE</Badge>
            </div>
            <div className="grid gap-6">
              {liveTests.map((test) => (
                <Card key={test.id} className="border-red-300 bg-white shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <h3 className="font-headline text-xl font-bold text-gray-800">{test.name}</h3>
                          <Badge className="bg-red-600 text-white animate-pulse">LIVE NOW</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className="bg-blue-100 text-blue-800">{test.type}</Badge>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Available Now
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">LIVE</div>
                        <div className="text-sm text-gray-600">Start Anytime</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 p-4 bg-red-50 rounded-lg">
                      <div>
                        <div className="text-gray-600">Duration</div>
                        <div className="font-semibold">{test.duration}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Questions</div>
                        <div className="font-semibold">{test.totalQuestions}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Max Marks</div>
                        <div className="font-semibold">{test.maxMarks}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Subjects</div>
                        <div className="font-semibold">{test.subjects?.length || 0}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-1">Subject:</div>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {test.subject}
                        </span>
                        {test.class_level && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {test.class_level}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button 
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                      onClick={() => handleStartTest(test)}
                      disabled={startingTestId === test.id}>
                      {startingTestId === test.id ? 'Starting...' : '🚀 START TEST NOW - LIVE!'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Tests */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline text-3xl font-bold text-gray-800">Upcoming Tests</h2>
            <Button asChild variant="outline">
              <Link href="/student-corner/mock-tests">View All Tests</Link>
            </Button>
          </div>
          <div className="grid gap-6 max-w-4xl mx-auto">
            {upcomingTests.length > 0 ? (
              upcomingTests.slice(0, 2).map((test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-headline text-xl font-bold text-gray-800">{test.title}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-blue-100 text-blue-800">{test.class_level || 'General'}</Badge>
                          <Badge variant="outline">
                            {test.attempts_count || 0} attempts
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary" suppressHydrationWarning>
                          {new Date(test.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600" suppressHydrationWarning>
                          {test.duration_minutes ? `${test.duration_minutes} min` : 'No limit'}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-gray-600">Duration</div>
                        <div className="font-semibold">
                          {test.duration_minutes ? `${test.duration_minutes} min` : 'No limit'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Questions</div>
                        <div className="font-semibold">{test.questions?.length || 0}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Max Marks</div>
                        <div className="font-semibold">{test.total_marks || 0}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Subject</div>
                        <div className="font-semibold">{test.subject}</div>
                      </div>
                    </div>
                    <Button 
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                      onClick={() => handleStartTest(test)}
                      disabled={startingTestId === test.id}>
                      {startingTestId === test.id ? 'Starting...' : 'START TEST'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-headline text-xl font-bold text-gray-800 mb-2">No Upcoming Tests</h3>
                  <p className="text-gray-600 mb-6">Check the Mock Tests section to see tests created by your faculty.</p>
                  <Button asChild>
                    <Link href="/student-corner/mock-tests">View Mock Tests</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </>
  );
}