'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, BookOpen, Users, BarChart3, FileText, Trophy, 
  RefreshCw, Activity, Target, Upload
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalTests: number;
  totalResults: number;
  totalStudents: number;
  averageScore: number;
}

interface TestResult {
  id: string;
  student_id: string;
  score: number;
  submitted_at: string;
  time_taken: number;
}

export default function SimpleTeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    totalResults: 0,
    totalStudents: 0,
    averageScore: 0
  });
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);

  useEffect(() => {
    loadDashboardData();
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadRecentResults()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        loadStats(),
        loadRecentResults()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const [testsRes, resultsRes] = await Promise.all([
        fetch('/api/supabase/tests-simple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get-all' })
        }).catch(() => ({ json: () => ({ success: false, data: [] }) })),
        fetch('/api/supabase/test-results-simple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get-all-results' })
        }).catch(() => ({ json: () => ({ success: false, data: [] }) }))
      ]);

      const tests = await testsRes.json();
      const results = await resultsRes.json();

      const uniqueStudents = results.success ? 
        new Set(results.data.map((r: any) => r.student_id)).size : 0;

      const avgScore = results.success && results.data.length > 0 ? 
        results.data.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / results.data.length : 0;

      setStats({
        totalTests: tests.success ? tests.data.length : 0,
        totalResults: results.success ? results.data.length : 0,
        totalStudents: uniqueStudents,
        averageScore: Math.round(avgScore * 100) / 100
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentResults = async () => {
    try {
      const response = await fetch('/api/supabase/test-results-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-all-results' })
      }).catch(() => ({ json: () => ({ success: false, data: [] }) }));

      const result = await response.json();
      if (result.success) {
        // Sort by submission date and take latest 10
        const sorted = result.data
          .sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
          .slice(0, 10);
        setRecentResults(sorted);
      }
    } catch (error) {
      console.error('Error loading recent results:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-headline text-4xl font-bold text-gray-800 mb-2">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600">
              Manage tests and monitor student performance
            </p>
          </div>
          <Button 
            onClick={refreshData} 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalTests}</p>
                  <p className="text-sm text-green-600">Available</p>
                </div>
                <FileText className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Test Results</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalResults}</p>
                  <p className="text-sm text-blue-600">Submissions</p>
                </div>
                <Trophy className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                  <p className="text-sm text-orange-600">Active</p>
                </div>
                <Users className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageScore}</p>
                  <p className="text-sm text-purple-600">Points</p>
                </div>
                <Target className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tests">Test Management</TabsTrigger>
            <TabsTrigger value="materials">Study Materials</TabsTrigger>
            <TabsTrigger value="results">Recent Results</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Test Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Recent Test Results
                  </CardTitle>
                  <CardDescription>
                    Latest student submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {recentResults.slice(0, 8).map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Student: {result.student_id}</p>
                          <p className="text-xs text-gray-500">{formatDate(result.submitted_at)}</p>
                          <p className="text-xs text-blue-600">Time: {formatDuration(result.time_taken)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{result.score || 0}</p>
                          <Badge variant="secondary">
                            Score
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {recentResults.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No test results yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/teacher-dashboard/create-test">
                    <Button className="w-full justify-start">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create New Test
                    </Button>
                  </Link>
                  <Link href="/teacher-dashboard/manage-tests">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage Tests
                    </Button>
                  </Link>
                  <Link href="/teacher-dashboard/manage-materials">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Manage Study Materials
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start" onClick={refreshData}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Test Management Tab */}
          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Management</CardTitle>
                <CardDescription>Create and manage your tests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/teacher-dashboard/create-test">
                    <Button className="w-full h-20 flex flex-col items-center justify-center">
                      <PlusCircle className="h-8 w-8 mb-2" />
                      Create New Test
                    </Button>
                  </Link>
                  <Link href="/teacher-dashboard/manage-tests">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                      <BookOpen className="h-8 w-8 mb-2" />
                      Manage Existing Tests
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Test Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Tests:</span>
                      <span className="font-semibold ml-2">{stats.totalTests}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Submissions:</span>
                      <span className="font-semibold ml-2">{stats.totalResults}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Study Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Materials Management</CardTitle>
                <CardDescription>Upload, organize, and delete study materials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/teacher-dashboard/upload-materials">
                    <Button className="w-full h-20 flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 mb-2" />
                      Upload New Material
                    </Button>
                  </Link>
                  <Link href="/teacher-dashboard/manage-materials">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 mb-2" />
                      Manage Materials
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Storage Management</h3>
                  <div className="text-sm text-green-700 space-y-2">
                    <p>• Upload educational content for students</p>
                    <p>• Delete old materials to free up Supabase storage</p>
                    <p>• Organize by subject and class level</p>
                    <p>• Monitor storage usage and optimize space</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  All Test Results
                </CardTitle>
                <CardDescription>
                  Complete list of student submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Results Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">#</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Student ID</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Score</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Time Taken</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentResults.map((result, index) => (
                          <tr key={result.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge variant="secondary">
                                #{index + 1}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 font-medium">
                              {result.student_id}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">
                              {result.score || 0}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {formatDuration(result.time_taken)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                              {formatDate(result.submitted_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {recentResults.length === 0 && (
                    <div className="text-center py-12">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No test results available</p>
                      <p className="text-sm text-gray-400">Results will appear here as students submit tests</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}