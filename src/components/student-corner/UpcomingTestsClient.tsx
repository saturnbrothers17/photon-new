"use client";

import { useEffect, useState } from 'react';
import { BookOpen, Calendar, Clock, Target, Trophy, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePublishedTests } from '@/hooks/useSupabaseTests';
import { TestWithQuestions } from '@/lib/supabase-data-manager';

export function UpcomingTestsClient() {
  const { tests: publishedTests, loading, error } = usePublishedTests();
  
  // For now, we'll show the first 2 published tests as upcoming
  const upcomingTests = publishedTests.slice(0, 2);
  
  // TODO: Implement ongoing tests logic with Supabase
  const ongoingTests: any[] = []; // Placeholder for ongoing tests
  const hasOngoingTest = ongoingTests.length > 0;

  return (
    <>
      {/* Live Test Alert - Only show if there are ongoing tests */}
      {hasOngoingTest && (
        <section className="py-6 bg-orange-50 border-b-2 border-orange-200">
          <div className="container mx-auto px-4 md:px-6">
            <Card className="border-orange-200 bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="font-headline text-lg font-bold text-gray-800">{ongoingTests[0]?.name} is Live Now!</h3>
                      <p className="text-sm text-gray-600">Time remaining: {ongoingTests[0]?.timeRemaining} | {ongoingTests[0]?.currentQuestion}/{ongoingTests[0]?.totalQuestions} questions completed</p>
                    </div>
                  </div>
                  <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Link href={`/student-corner/mock-tests/take-test?testId=${ongoingTests[0]?.id}`}>Continue Test</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            {!loading && upcomingTests.length > 0 ? (
              upcomingTests.map((test, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-headline text-xl font-bold text-gray-800">{test.title}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="default">
                            {test.class_level || 'General'}
                          </Badge>
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {test.attempts_count || 0} attempts
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {new Date(test.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {test.duration_minutes ? `${test.duration_minutes} min` : 'No time limit'}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <div className="text-gray-600">Duration</div>
                          <div className="font-semibold">
                            {test.duration_minutes ? `${test.duration_minutes} min` : 'No limit'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <div className="text-gray-600">Questions</div>
                          <div className="font-semibold">{test.questions?.length || 0}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <div className="text-gray-600">Max Marks</div>
                          <div className="font-semibold">{test.total_marks || 0}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <div className="text-gray-600">Subject</div>
                          <div className="font-semibold">{test.subject}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button size="sm" className="flex-1">Register Now</Button>
                      <Button size="sm" variant="outline">View Syllabus</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-headline text-xl font-bold text-gray-800 mb-2">No Upcoming Tests</h3>
                  <p className="text-gray-600 mb-6">There are no scheduled tests at the moment. Check back later for new tests from your faculty.</p>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/student-corner/mock-tests">
                View All Mock Tests <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}