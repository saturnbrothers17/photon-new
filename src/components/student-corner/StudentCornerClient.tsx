"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, Download, FileText, Trophy, Users, Clock, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getTestById, getAllTests } from '@/lib/test-data';

const quickLinks = [
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Class Schedule",
    description: "View your class timetable and updates",
    href: "#schedule",
    color: "bg-purple-50 text-purple-600"
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Downloads",
    description: "Download important documents and forms",
    href: "#downloads",
    color: "bg-orange-50 text-orange-600"
  }
];



export default function StudentCornerClient() {
  const router = useRouter();
  const [upcomingTests, setUpcomingTests] = useState<any[]>([]);
  const [ongoingTests, setOngoingTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        // Mock data for now
        const mockTests = [
          {
            id: 1,
            title: "JEE Main Physics Mock Test",
            subject: "Physics",
            date: "2024-12-20",
            time: "14:00",
            duration: 180,
            questions: 75
          },
          {
            id: 2,
            title: "NEET Chemistry Practice",
            subject: "Chemistry",
            date: "2024-12-21",
            time: "10:00",
            duration: 180,
            questions: 45
          }
        ];
        
        setUpcomingTests(mockTests);
        setOngoingTests([]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const hasOngoingTest = ongoingTests.length > 0;

  const isTestStartable = (test: any): boolean => {
    if (!test.date || !test.time) return false;
    const [year, month, day] = test.date.split('-').map(Number);
    const [hours, minutes] = test.time.split(':').map(Number);
    const testDateTime = new Date(year, month - 1, day, hours, minutes);
    return new Date() >= testDateTime;
  };

  const handleStartTest = (testId: number) => {
    router.push(`/student-corner/mock-tests/take-test?testId=${testId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10" />
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-4">
              <Users className="h-4 w-4 mr-2" />
              Student Portal
            </div>
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-gray-800 tracking-tight">
              Student Corner
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Your one-stop destination for study materials, test results, announcements, and everything you need for your JEE & NEET preparation journey.
            </p>
          </div>
        </div>
      </section>

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

      {/* Quick Links */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <Link key={index} href={link.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${link.color} mb-4`}>
                      {link.icon}
                    </div>
                    <h3 className="font-headline text-lg font-bold text-gray-800 mb-2">{link.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{link.description}</p>
                    <div className="flex items-center text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      Access Now <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>



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
                        <h3 className="font-headline text-xl font-bold text-gray-800">{test.name}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="default">
                            {test.type}
                          </Badge>
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {test.registeredStudents || 0} registered
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{test.date}</div>
                        <div className="text-sm text-gray-600">{test.time}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <div className="text-gray-600">Duration</div>
                          <div className="font-semibold">{test.duration}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <div className="text-gray-600">Questions</div>
                          <div className="font-semibold">{test.totalQuestions}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <div className="text-gray-600">Max Marks</div>
                          <div className="font-semibold">{test.maxMarks}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <div className="text-gray-600">Subjects</div>
                          <div className="font-semibold">{test.subjects?.length || 0}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {isTestStartable(test) ? (
                        <Button size="sm" className="flex-1" onClick={() => handleStartTest(test.id)}>
                          Start Test
                        </Button>
                      ) : (
                        <Button size="sm" className="flex-1" disabled>
                          Register Now
                        </Button>
                      )}
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

      {/* Contact Support */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-headline text-3xl font-bold mb-4">Need Help?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Our student support team is here to help you with any queries regarding your studies, tests, or materials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="tel:9450545318">Call Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}