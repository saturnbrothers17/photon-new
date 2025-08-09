'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthMonitor } from '@/hooks/useAuthMonitor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PlusCircle, BookOpen, Users, BarChart3, Calendar, FileText, Trophy, Clock, TrendingUp, 
  Upload, Play, Eye, Download, Settings, AlertCircle, CheckCircle, XCircle,
  Activity, Target, Award, Zap, FileUp, PlayCircle, StopCircle, RefreshCw, LogOut
} from 'lucide-react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Subject = 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';
type ClassLevel = '11' | '12' | 'Dropper' | 'Repeater';
type TabValue = 'overview' | 'tests' | 'materials' | 'live' | 'results';

interface DashboardStats {
  totalTests: number;
  publishedTests: number;
  totalMaterials: number;
  activeTests: number;
  totalStudents: number;
  todaySubmissions: number;
  averageScore: number;
  totalQuestions: number;
}

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  class_level: ClassLevel;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

interface LiveTest {
  id: string;
  test_id: string;
  title: string;
  subject: Subject;
  duration: number;
  max_participants: number;
  current_participants?: number;
  start_time: string;
  end_time?: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  created_at: string;
  tests?: {
    title: string;
    subject: string;
    class_level: string;
  };
}

interface TestResult {
  id: string;
  student_id: string;
  test_name: string;
  score: number;
  max_marks: number;
  percentage: number;
  submitted_at: string;
  time_taken: number;
  rank?: number;
}

interface AvailableTest {
  id: string;
  title: string;
  subject: Subject;
  duration: number;
  published: boolean;
}

export default function AdvancedTeacherDashboard() {
  const router = useRouter();
  const { handleLogout } = useAuthMonitor();
  const supabase = createClientComponentClient();
  
  // Main application state
  const [state, setState] = useState({
    loading: true,
    refreshing: false,
    uploadingMaterial: false,
    stats: {
      totalTests: 0,
      publishedTests: 0,
      totalMaterials: 0,
      activeTests: 0,
      totalStudents: 0,
      todaySubmissions: 0,
      averageScore: 0,
      totalQuestions: 0
    },
    studyMaterials: [] as StudyMaterial[],
    liveTests: [] as LiveTest[],
    recentResults: [] as TestResult[],
    availableTests: [] as AvailableTest[],
    teacherName: '',
    activeTab: 'overview' as TabValue,
  });

  // Helper function to update nested state
  const updateState = (updates: Partial<typeof state>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      stats: { ...prev.stats, ...(updates.stats || {}) }
    }));
  };

    // Destructure state for UI usage
  const { stats, liveTests, recentResults, studyMaterials, availableTests, loading, uploadingMaterial, refreshing, teacherName, activeTab } = state;

  // Material upload form state
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    subject: 'Physics' as Subject,
    classLevel: '11' as ClassLevel,
    file: null as File | null
  });

  // Live test form state
  const [liveTestForm, setLiveTestForm] = useState({
    testId: '',
    title: '',
    subject: 'Physics' as Subject,
    duration: 60,
    maxParticipants: 50,
    startTime: new Date().toISOString().slice(0, 16), // Current datetime for input[type="datetime-local"]
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16), // 2 hours from now
    instructions: ''
  });

  // Authentication and data loading
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error('Please login to access the dashboard');
          router.push('/faculty-portal');
          return;
        }

        // Load dashboard data
        await loadDashboardData();
        
        // Set up real-time subscriptions for live updates
        const testChannel = supabase
          .channel('tests-changes')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'tests' 
          }, () => {
            loadStats();
            loadAvailableTests();
          })
          .subscribe();
          
        const materialsChannel = supabase
          .channel('materials-changes')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'study_materials' 
          }, () => {
            loadStudyMaterials();
            loadStats();
          })
          .subscribe();
          
        const liveTestsChannel = supabase
          .channel('live-tests-changes')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'live_tests' 
          }, () => {
            loadLiveTests();
          })
          .subscribe();
          
        const resultsChannel = supabase
          .channel('results-changes')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'test_results' 
          }, () => {
            loadRecentResults();
            loadStats();
          })
          .subscribe();
        
        // Cleanup subscriptions on unmount
        return () => {
          supabase.removeChannel(testChannel);
          supabase.removeChannel(materialsChannel);
          supabase.removeChannel(liveTestsChannel);
          supabase.removeChannel(resultsChannel);
        };
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        toast.error('Failed to initialize dashboard');
      } finally {
        updateState({ loading: false });
      }
    };

    initializeDashboard();
  }, [router, supabase]);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      updateState({ refreshing: true });
      
      // Load all data in parallel
      await Promise.all([
        loadTeacherName(),
        loadStats(),
        loadStudyMaterials(),
        loadLiveTests(),
        loadRecentResults(),
        loadAvailableTests()
      ]);
      
      toast.success('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load some dashboard data');
    } finally {
      updateState({ refreshing: false });
    }
  }, []);

  // Refresh data with debouncing
  const refreshData = useCallback(async () => {
    updateState({ refreshing: true });
    try {
      await loadDashboardData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      updateState({ refreshing: false });
    }
  }, [loadDashboardData]);

  // Load teacher profile
  const loadTeacherName = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Map email to teacher name directly in frontend
      const teacherMap: Record<string, string> = {
        'jp7@photon': 'Jai Prakash Mishra',
        'jp7@photon.edu': 'Jai Prakash Mishra',
        'sp8@photon': 'Shiv Prakash Yadav',
        'sp8@photon.edu': 'Shiv Prakash Yadav',
        'mk6@photon': 'Mahavir Kesari',
        'mk6@photon.edu': 'Mahavir Kesari',
        'ak5@photon': 'AK Mishra',
        'ak5@photon.edu': 'AK Mishra'
      };
      
      const userEmail = session.user.email?.toLowerCase() || '';
      const name = teacherMap[userEmail] || session.user.email?.split('@')[0] || 'Teacher';
      updateState({ teacherName: name });
      
    } catch (error) {
      console.error('Error loading teacher name:', error);
    }
  }, [supabase]);

  // Load dashboard statistics
  const loadStats = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch('/api/teacher/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        updateState({ stats: data });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [supabase]);

  // Load live tests
  const loadLiveTests = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch('/api/supabase/live-tests', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        updateState({ liveTests: data });
      }
    } catch (error) {
      console.error('Error loading live tests:', error);
    }
  }, [supabase]);

  // Load recent test results
  const loadRecentResults = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch('/api/teacher/results', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        updateState({ recentResults: data });
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  }, [supabase]);

  // Load study materials
  const loadStudyMaterials = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch('/api/supabase/study-materials', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const json = await response.json();
        const materials = Array.isArray(json)
          ? json
          : (Array.isArray(json?.data) ? json.data : []);
        updateState({ studyMaterials: materials });
      }
    } catch (error) {
      console.error('Error loading study materials:', error);
    }
  }, [supabase]);

  // Load available tests for live testing
  const loadAvailableTests = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch('/api/supabase/tests-simple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get-published' })
      });
      
      if (!response.ok) throw new Error('Failed to fetch available tests');
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch tests');
      }
      
      const data = result.data || [];
      updateState({ availableTests: data });
      
      // Update stats with the count of tests
      updateState({
        stats: {
          ...state.stats,
          totalTests: data.length,
          publishedTests: data.filter((test: any) => test.is_published).length
        }
      });
    } catch (error) {
      console.error('Error loading available tests:', error);
      toast.error('Failed to load available tests');
    }
  }, [supabase]);

  // Handle material file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMaterialForm(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };

  // Handle material form submission
  const handleMaterialUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!materialForm.title.trim()) {
      toast.error('Please enter a title for the material');
      return;
    }

    if (!materialForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ];

    if (!allowedTypes.includes(materialForm.file.type)) {
      toast.error('Invalid file type. Please upload a PDF, Word, PowerPoint, image, or video file.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (materialForm.file.size > maxSize) {
      toast.error('File size too large. Maximum size is 10MB.');
      return;
    }

    try {
      updateState({ uploadingMaterial: true });
      
      // Authentication is handled by the API endpoint
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', materialForm.file);
      formData.append('title', materialForm.title);
      formData.append('description', materialForm.description);
      formData.append('subject', materialForm.subject);
      formData.append('classLevel', materialForm.classLevel);
      
      console.log('📤 Uploading material:', {
        title: materialForm.title,
        subject: materialForm.subject,
        fileName: materialForm.file.name,
        fileSize: materialForm.file.size
      });
      
      // Upload to the full study-materials API (with file handling)
      const response = await fetch('/api/supabase/study-materials', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload failed with status:', response.status, 'Response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || `Upload failed (${response.status})`);
        } catch (parseError) {
          throw new Error(`Upload failed (${response.status}): ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Study material uploaded successfully!');
      
      // Reset form
      setMaterialForm({
        title: '',
        description: '',
        subject: 'Physics',
        classLevel: '11',
        file: null
      });
      
      // Reset file input
      const fileInput = document.getElementById('material-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh study materials list
      await loadStudyMaterials();
      
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload material');
    } finally {
      updateState({ uploadingMaterial: false });
    }
  };

  // Handle material deletion
  const handleDeleteMaterial = async (materialId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis will permanently remove the material and free up storage space. This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting material:', materialId, title);
      
      const response = await fetch(`/api/supabase/study-materials?id=${materialId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete failed with status:', response.status, 'Response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || `Delete failed (${response.status})`);
        } catch (parseError) {
          throw new Error(`Delete failed (${response.status}): ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('✅ Delete response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Delete failed');
      }

      toast.success(`"${title}" deleted successfully! Storage space freed.`);
      
      // Refresh study materials list
      await loadStudyMaterials();
      await loadStats(); // Update stats to reflect the change
      
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete material');
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Start live test
  const handleStartLiveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!liveTestForm?.testId || !liveTestForm?.startTime || !(liveTestForm as any)?.endTime) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await fetch('/api/supabase/live-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          testId: liveTestForm.testId,
          startTime: liveTestForm.startTime,
          endTime: (liveTestForm as any).endTime,
          maxParticipants: (liveTestForm as any).maxParticipants ?? 100,
          instructions: (liveTestForm as any).instructions ?? ''
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Live test started successfully!');
        // Reset form if setter exists
        try {
          // @ts-ignore - setter may exist in scope
          setLiveTestForm({
            testId: '',
            startTime: '',
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16), // 2 hours from now
            maxParticipants: 100,
            instructions: ''
          });
        } catch {}
        // Reload
        try { await (loadLiveTests as any)(); } catch {}
        try { await (loadStats as any)(); } catch {}
      } else {
        alert('Error starting live test: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error starting live test:', error);
      alert('Error starting live test');
    }
  };

  const handleEndLiveTest = async (liveTestId: string) => {
    try {
      const response = await fetch('/api/supabase/live-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end-test',
          liveTestId
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Live test ended successfully!');
        loadLiveTests();
        loadStats();
      } else {
        alert('Error ending live test: ' + result.error);
      }
    } catch (error) {
      console.error('Error ending live test:', error);
      alert('Error ending live test');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-headline text-4xl font-bold text-gray-800 mb-2">
              Welcome, {teacherName || 'Teacher'}
            </h1>
            <p className="text-gray-600">
              Advanced Faculty Dashboard – real-time test management, study materials, and student analytics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            <Link href="/teacher-dashboard/create-test">
              <Button size="sm" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Test
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Real-time Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalTests}</p>
                  <p className="text-sm text-green-600">{stats.publishedTests} published</p>
                </div>
                <FileText className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Materials</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalMaterials}</p>
                  <p className="text-sm text-blue-600">PDF resources</p>
                </div>
                <BookOpen className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Live Tests</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeTests}</p>
                  <p className="text-sm text-orange-600">Active now</p>
                </div>
                <Activity className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                  <p className="text-sm text-purple-600">{stats.todaySubmissions} today</p>
                </div>
                <Users className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => updateState({ activeTab: value as TabValue })} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tests">Test Management</TabsTrigger>
            <TabsTrigger value="materials">Study Materials</TabsTrigger>
            <TabsTrigger value="live">Live Tests</TabsTrigger>
            <TabsTrigger value="results">Real-time Results</TabsTrigger>
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
                    Latest student submissions with real-time updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {recentResults.slice(0, 10).map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{result.test_name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Student: {result.student_id || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{result.submitted_at ? formatDate(result.submitted_at) : 'N/A'}</p>
                          <p className="text-xs text-blue-600">Time: {typeof result.time_taken === 'number' ? formatDuration(result.time_taken) : 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{typeof result.score === 'number' ? result.score : '-'}/{typeof result.max_marks === 'number' ? result.max_marks : '-'}</p>
                          {typeof result.percentage === 'number' ? (
                            <Badge 
                              variant={result.percentage >= 80 ? 'default' : result.percentage >= 60 ? 'secondary' : 'destructive'}
                            >
                              {result.percentage.toFixed(1)}%
                            </Badge>
                          ) : (
                            <Badge variant="secondary">N/A</Badge>
                          )}
                          {result.rank && (
                            <p className="text-xs text-gray-500">Rank: #{result.rank}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {recentResults.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No test results yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Active Live Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Active Live Tests
                  </CardTitle>
                  <CardDescription>
                    Currently running tests with participant count
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {liveTests.map((test) => (
                      <div key={test.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{(test as any).tests?.title ?? (test as any).title ?? 'Untitled'}</h4>
                            <p className="text-sm text-gray-600">{(test as any).tests?.subject ?? (test as any).subject ?? 'N/A'} - {(test as any).tests?.class_level ?? (test as any).class_level ?? 'N/A'}</p>
                          </div>
                          <Badge variant="default" className="bg-green-500">
                            Live
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <p>Participants: {(test as any).current_participants ?? 0}/{(test as any).max_participants ?? 0}</p>
                            <p>Ends: {formatDate((test as any).end_time)}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleEndLiveTest(test.id)}
                          >
                            <StopCircle className="h-4 w-4 mr-1" />
                            End Test
                          </Button>
                        </div>
                        <Progress 
                          value={(() => {
                            const current = test.current_participants ?? 0;
                            const max = test.max_participants ?? 1;
                            const percentage = (current / max) * 100;
                            return isNaN(percentage) ? 0 : Math.max(0, Math.min(100, percentage));
                          })()} 
                          className="mt-2"
                        />
                      </div>
                    ))}
                    {liveTests.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No active live tests</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Test Management Tab */}
          <TabsContent value="tests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your tests efficiently</CardDescription>
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
                        <Settings className="h-8 w-8 mb-2" />
                        Manage Tests
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Questions</span>
                    <span className="font-semibold">{stats.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="font-semibold">{typeof stats.averageScore === 'number' ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Published Tests</span>
                    <span className="font-semibold">{stats.publishedTests}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Study Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Study Material
                  </CardTitle>
                  <CardDescription>
                    Upload study materials for students to view and download
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleMaterialUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input
                        value={materialForm.title}
                        onChange={(e) => setMaterialForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter material title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={materialForm.description}
                        onChange={(e) => setMaterialForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Subject</label>
                        <Select 
                          value={materialForm.subject} 
                          onValueChange={(value) => setMaterialForm(prev => ({ ...prev, subject: value as Subject }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mathematics">Mathematics</SelectItem>
                            <SelectItem value="physics">Physics</SelectItem>
                            <SelectItem value="chemistry">Chemistry</SelectItem>
                            <SelectItem value="biology">Biology</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="history">History</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Class Level</label>
                        <Select 
                          value={materialForm.classLevel} 
                          onValueChange={(value) => setMaterialForm(prev => ({ ...prev, classLevel: value as ClassLevel }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9">Class 9</SelectItem>
                            <SelectItem value="10">Class 10</SelectItem>
                            <SelectItem value="11">Class 11</SelectItem>
                            <SelectItem value="12">Class 12</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">File *</label>
                      <Input
                        id="material-file"
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mov"
                        onChange={(e) => setMaterialForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Required: PDF, Word, PowerPoint, images, or videos (max 10MB)</p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={uploadingMaterial}
                    >
                      {uploadingMaterial ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FileUp className="h-4 w-4 mr-2" />
                          Upload Material
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Materials List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Uploaded Materials
                  </CardTitle>
                  <CardDescription>
                    Manage your study materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {(Array.isArray(studyMaterials) ? studyMaterials : []).map((material) => (
                      <div key={material.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{material.title}</h4>
                            <p className="text-sm text-gray-600">{material.subject} - Class {material.class_level}</p>
                            <p className="text-xs text-gray-500">{material.file_name || 'No filename'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {formatFileSize(material.file_size)}
                            </Badge>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteMaterial(material.id, material.title)}
                              className="h-8 w-8 p-0"
                              title="Delete material and free storage"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>Views: {(material as any).view_count ?? (material as any).views ?? 0}</span>
                          <span>{formatDate(material.created_at)}</span>
                        </div>
                      </div>
                    ))}
                    {(!Array.isArray(studyMaterials) || studyMaterials.length === 0) && (
                      <p className="text-center text-gray-500 py-8">No materials uploaded yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Live Tests Tab */}
          <TabsContent value="live" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Start Live Test Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Start Live Test
                  </CardTitle>
                  <CardDescription>
                    Start a real-time test session for students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStartLiveTest} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Test</label>
                      <Select 
                        value={liveTestForm.testId} 
                        onValueChange={(value) => setLiveTestForm(prev => ({ ...prev, testId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a test" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTests.map((test: any) => (
                            <SelectItem key={test.id} value={test.id}>
                              {test.title} - {test.subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Start Time</label>
                        <Input
                          type="datetime-local"
                          value={liveTestForm.startTime}
                          onChange={(e) => setLiveTestForm(prev => ({ ...prev, startTime: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">End Time</label>
                        <Input
                          type="datetime-local"
                          value={liveTestForm.endTime}
                          onChange={(e) => setLiveTestForm(prev => ({ ...prev, endTime: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Max Participants</label>
                      <Input
                        type="number"
                        value={liveTestForm.maxParticipants}
                        onChange={(e) => setLiveTestForm(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                        min="1"
                        max="500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Instructions</label>
                      <Textarea
                        value={(liveTestForm as any).instructions}
                        onChange={(e) => setLiveTestForm(prev => ({ ...prev, instructions: (e.target as HTMLTextAreaElement).value }))}
                        placeholder="Enter test instructions for students"
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Live Test
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Live Test Monitor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Live Test Monitor
                  </CardTitle>
                  <CardDescription>
                    Real-time monitoring of active tests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {liveTests.map((test) => (
                      <div key={test.id} className="p-4 border rounded-lg bg-green-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-green-800">{(test as any).tests?.title ?? (test as any).title ?? 'Untitled'}</h4>
                            <p className="text-sm text-green-600">{(test as any).tests?.subject ?? (test as any).subject ?? 'N/A'} - {(test as any).tests?.class_level ?? (test as any).class_level ?? 'N/A'}</p>
                          </div>
                          <Badge className="bg-green-500">
                            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                            LIVE
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Participants:</span>
                            <span className="font-semibold">{(test as any).current_participants ?? 0}/{(test as any).max_participants ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Started:</span>
                            <span>{formatDate((test as any).start_time)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ends:</span>
                            <span>{formatDate((test as any).end_time)}</span>
                          </div>
                        </div>

                        <Progress 
                          value={(Number.isFinite((((test as any).current_participants ?? 0) / Math.max(1, (test as any).max_participants ?? 0)) * 100) ? Math.max(0, Math.min(100, (((test as any).current_participants ?? 0) / Math.max(1, (test as any).max_participants ?? 0)) * 100)) : 0)} 
                          className="mt-3"
                        />

                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            Monitor
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleEndLiveTest(test.id)}
                          >
                            <StopCircle className="h-4 w-4 mr-1" />
                            End
                          </Button>
                        </div>
                      </div>
                    ))}
                    {liveTests.length === 0 && (
                      <div className="text-center py-8">
                        <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No live tests running</p>
                        <p className="text-sm text-gray-400">Start a test to see real-time monitoring</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Real-time Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Real-time Test Results & Rankings
                </CardTitle>
                <CardDescription>
                  Live updates of student performance with rankings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Results Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Rank</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Student ID</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Test Name</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Score</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Percentage</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Time Taken</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentResults.map((result, index) => (
                          <tr key={result.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge variant={index < 3 ? 'default' : 'secondary'}>
                                #{index + 1}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 font-medium">
                              {result.student_id}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {result.test_name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">
                              {result.score}/{result.max_marks}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge 
                                variant={typeof result.percentage === 'number' && result.percentage >= 80 ? 'default' : typeof result.percentage === 'number' && result.percentage >= 60 ? 'secondary' : 'destructive'}
                              >
                                {typeof result.percentage === 'number' ? result.percentage.toFixed(1) : 'N/A'}%
                              </Badge>
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