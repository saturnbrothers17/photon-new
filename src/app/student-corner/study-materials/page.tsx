'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Eye, Clock, User, Filter, BookOpen, ChevronLeft, RefreshCw } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import Link from 'next/link';
import { StudyMaterialsViewer } from './TestViewer';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  file_url: string;
  file_type: string;
  uploaded_by: string;
  created_at: string;
  class_level: string;
}

export default function StudentStudyMaterials() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMaterials();
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchMaterials();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchQuery, selectedSubject]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching study materials via API...');
      
      // Use the API endpoint instead of direct Supabase queries
      const response = await fetch('/api/supabase/study-materials', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📚 API response:', result);
      
      if (result.error) {
        console.error('❌ API returned error:', result.error);
        throw new Error(result.error);
      }
      
      const data = result.data || [];
      console.log(`📚 Fetched ${data.length} materials via API`);
      
      // Transform data for compatibility
      const validMaterials = data.map((material: any) => ({
        ...material,
        class_level: material.tags && material.tags.length > 0 ? material.tags[0] : '10', // Extract class level from tags
        topic: material.subject // Use subject as topic for now
      })).filter((material: any) => {
        if (!material.file_path && !material.file_url) {
          console.warn('⚠️ Material missing file path:', material.id, material.title);
          return false;
        }
        return true;
      });
      
      if (validMaterials.length === 0) {
        console.warn('ℹ️ No valid study materials found.');
      }
      
      setMaterials(validMaterials);
    } catch (error: any) {
      console.error('❌ Error in fetchMaterials:', {
        error,
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      
      // More specific error messages for API calls
      if (error?.message?.includes('401')) {
        toast.error('Authentication required. Please sign in.');
      } else if (error?.message?.includes('403')) {
        toast.error('You do not have permission to view study materials.');
      } else if (error?.message?.includes('404')) {
        toast.error('Study materials service not found.');
      } else if (error?.message?.includes('500')) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to load study materials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = [...materials];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.topic?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by subject
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(material => 
        material.subject.toLowerCase() === selectedSubject.toLowerCase()
      );
    }

    setFilteredMaterials(filtered);
  };

  const handleViewMaterial = (material: StudyMaterial) => {
    console.log('Selected material:', material);
    console.log('Material has file_url:', 'file_url' in material);
    console.log('Material keys:', Object.keys(material));
    setSelectedMaterial(material);
    setViewerOpen(true);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('video')) return '🎥';
    if (fileType?.includes('audio')) return '🎵';
    return '📎';
  };

  const subjects = ['all', 'physics', 'chemistry', 'mathematics', 'biology'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/student-corner">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Student Corner
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Materials</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Access your learning resources</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search materials by title, topic, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchMaterials}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Filter className="h-5 w-5 text-gray-400 mt-2" />
                <Tabs value={selectedSubject} onValueChange={setSelectedSubject}>
                  <TabsList>
                    {subjects.map(subject => (
                      <TabsTrigger key={subject} value={subject} className="capitalize">
                        {subject === 'all' ? 'All Subjects' : subject}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading materials...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No materials found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || selectedSubject !== 'all' 
                ? 'Try adjusting your filters or search query' 
                : 'No study materials have been uploaded yet'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getFileIcon(material.file_type)}</span>
                        <Badge variant="secondary" className="capitalize">
                          {material.subject}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {material.description || 'No description available'}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {material.topic && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FileText className="h-4 w-4" />
                        <span>Topic: {material.topic}</span>
                      </div>
                    )}
                    {material.class_level && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Badge variant="outline" className="text-xs">
                          Class {material.class_level}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4" />
                      <span>{material.uploaded_by || 'Teacher'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(material.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleViewMaterial(material)}
                    className="w-full"
                    variant="default"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Material
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Material Viewer Modal */}
      {selectedMaterial && (
        <StudyMaterialsViewer
          material={selectedMaterial}
          open={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedMaterial(null);
          }}
        />
      )}
    </div>
  );
}
