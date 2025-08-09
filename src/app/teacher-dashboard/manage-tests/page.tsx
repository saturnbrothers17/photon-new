"use client";

import { useEffect, useState } from 'react';
import { Search, Filter, Eye, Edit, Trash2, BarChart3, Users, Calendar, Clock, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useSupabaseTests } from '@/hooks/useSupabaseTests';
import { TestWithQuestions } from '@/lib/supabase-data-manager';





const getStatusColor = (status: string) => {
  switch (status) {
    case "published": return "bg-green-100 text-green-800";
    case "draft": return "bg-yellow-100 text-yellow-800";
    case "scheduled": return "bg-blue-100 text-blue-800";
    case "live": return "bg-red-100 text-red-800 animate-pulse";
    case "archived": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "JEE Main": return "bg-blue-100 text-blue-800";
    case "JEE Advanced": return "bg-purple-100 text-purple-800";
    case "NEET": return "bg-green-100 text-green-800";
    case "Chapter Test": return "bg-orange-100 text-orange-800";
    case "Practice Test": return "bg-cyan-100 text-cyan-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function ManageTests() {
  const { tests: allTests, loading, error, deleteTest: removeTest, publishTest, unpublishTest } = useSupabaseTests();

  const handleDeleteTest = async (testId: string) => {
    if (confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      try {
        console.log(`🗑️ Deleting test ${testId}...`);
        await removeTest(testId);
        console.log(`✅ Test ${testId} deleted successfully`);
        alert('Test deleted successfully!');
      } catch (error: any) {
        console.error('❌ Error deleting test:', error);
        alert(`Error deleting test: ${error.message || 'Please try again.'}`);
      }
    }
  };

  const handleTogglePublish = async (testId: string, isCurrentlyPublished: boolean) => {
    try {
      if (isCurrentlyPublished) {
        await unpublishTest(testId);
        alert('Test unpublished successfully!');
      } else {
        await publishTest(testId);
        alert('Test published successfully!');
      }
    } catch (error: any) {
      console.error('❌ Error toggling test publication:', error);
      alert(`Error: ${error.message || 'Please try again.'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-4xl md:text-5xl font-black mb-2">Manage Tests</h1>
              <p className="text-lg opacity-90">View, edit, and analyze all your created tests</p>
            </div>
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/teacher-dashboard/create-test">
                <Plus className="h-5 w-5 mr-2" />
                Create New Test
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">Total: {allTests.length} tests</Badge>
              <Badge className="bg-green-100 text-green-800">
                Published: {allTests.filter(t => t.is_published).length}
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800">
                Drafts: {allTests.filter(t => !t.is_published).length}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Tests Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6">
            {allTests.length > 0 ? (
              allTests.map((test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-headline text-xl font-bold text-gray-800 mb-2">{test.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getTypeColor(test.class_level || 'General')}>{test.class_level || 'General'}</Badge>
                          <Badge className={getStatusColor(test.is_published ? 'published' : 'draft')}>
                            {test.is_published ? 'published' : 'draft'}
                          </Badge>
                          {test.is_published && (
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              {test.attempts_count || 0} attempts
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Created on {new Date(test.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {new Date(test.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {test.duration_minutes ? `${test.duration_minutes} min` : 'No time limit'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {test.questions?.length || 0} questions
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-gray-600 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Duration
                        </div>
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
                      <div>
                        <div className="text-gray-600">Status</div>
                        <div className="font-semibold capitalize">
                          {test.is_published ? 'published' : 'draft'}
                        </div>
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

                    <div className="flex flex-wrap gap-3">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Test
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={test.is_published ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                        onClick={() => handleTogglePublish(test.id, test.is_published)}
                      >
                        {test.is_published ? 'Unpublish' : 'Publish'}
                      </Button>
                      {test.is_published && (
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteTest(test.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-headline text-xl font-bold text-gray-800 mb-2">No Tests Found</h3>
                  <p className="text-gray-600 mb-6">You haven't created any tests yet. Start by creating your first test.</p>
                  <Button asChild>
                    <Link href="/teacher-dashboard/create-test">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Test
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-headline text-3xl font-bold text-gray-800 mb-8 text-center">Test Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{allTests.length}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {allTests.filter(t => t.is_published).length}
                </div>
                <div className="text-sm text-gray-600">Published</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {allTests.reduce((sum, test) => sum + (test.attempts_count || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {allTests.length > 0 ? Math.round(allTests.reduce((sum, test) => sum + (test.questions?.length || 0), 0) / allTests.length) : 0}
                </div>
                <div className="text-sm text-gray-600">Avg Questions</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}