'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, Trash2, Search, FileText, Download, 
  RefreshCw, AlertTriangle, CheckCircle, Upload
} from 'lucide-react';
import Link from 'next/link';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  subject: string;
  class_level: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  created_by: string;
  uploaded_by: string;
}

export default function ManageStudyMaterials() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchTerm, selectedSubject]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/supabase/study-materials');
      const result = await response.json();
      
      if (result.data) {
        setMaterials(result.data);
        console.log('📚 Loaded materials:', result.data.length);
      } else {
        console.error('❌ Error loading materials:', result.error);
        showMessage('error', 'Failed to load study materials');
      }
    } catch (error) {
      console.error('❌ Error loading materials:', error);
      showMessage('error', 'Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.subject.toLowerCase().includes(searchTerm.toLowerCase())
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

  const deleteMaterial = async (materialId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone and will free up storage space.`)) {
      return;
    }

    try {
      setDeleting(materialId);
      console.log('🗑️ Deleting material:', materialId);

      const response = await fetch(`/api/supabase/study-materials?id=${materialId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setMaterials(prev => prev.filter(m => m.id !== materialId));
        showMessage('success', `"${title}" deleted successfully. Storage space freed!`);
        console.log('✅ Material deleted successfully');
      } else {
        console.error('❌ Delete failed:', result.error);
        showMessage('error', result.error || 'Failed to delete material');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      showMessage('error', 'Failed to delete material');
    } finally {
      setDeleting(null);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown size';
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

  const getUniqueSubjects = () => {
    const subjects = materials.map(m => m.subject).filter(Boolean);
    return [...new Set(subjects)];
  };

  const getTotalStorageUsed = () => {
    const totalBytes = materials.reduce((sum, material) => sum + (material.file_size || 0), 0);
    return formatFileSize(totalBytes);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study materials...</p>
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
              Manage Study Materials
            </h1>
            <p className="text-gray-600">
              Upload, organize, and delete study materials to manage storage
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadMaterials} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/teacher-dashboard/upload-materials">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            </Link>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            {message.text}
          </div>
        )}

        {/* Storage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Materials</p>
                  <p className="text-3xl font-bold text-gray-900">{materials.length}</p>
                  <p className="text-sm text-blue-600">Files uploaded</p>
                </div>
                <FileText className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900">{getTotalStorageUsed()}</p>
                  <p className="text-sm text-green-600">Supabase storage</p>
                </div>
                <BookOpen className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subjects</p>
                  <p className="text-3xl font-bold text-gray-900">{getUniqueSubjects().length}</p>
                  <p className="text-sm text-orange-600">Categories</p>
                </div>
                <Badge className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filter Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search by title, description, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Subjects</option>
                  {getUniqueSubjects().map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Study Materials ({filteredMaterials.length})
            </CardTitle>
            <CardDescription>
              Click delete to remove materials and free up storage space
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMaterials.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {materials.length === 0 ? 'No study materials found' : 'No materials match your filters'}
                </p>
                <p className="text-sm text-gray-400">
                  {materials.length === 0 ? 'Upload some materials to get started' : 'Try adjusting your search or filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMaterials.map((material) => (
                  <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {material.title}
                          </h3>
                          <Badge variant="secondary">
                            {material.subject}
                          </Badge>
                          <Badge variant="outline">
                            {material.class_level}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">
                          {material.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📁 {formatFileSize(material.file_size)}</span>
                          <span>📅 {formatDate(material.created_at)}</span>
                          <span>👤 {material.uploaded_by}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {material.file_url && !material.file_url.includes('placeholder') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(material.file_url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMaterial(material.id, material.title)}
                          disabled={deleting === material.id}
                        >
                          {deleting === material.id ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage Management Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Storage Management Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Free Up Space:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Delete outdated or duplicate materials</li>
                  <li>• Remove large files that are no longer needed</li>
                  <li>• Compress images and documents before uploading</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Best Practices:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Use descriptive titles and subjects</li>
                  <li>• Organize materials by class level</li>
                  <li>• Regularly review and clean up old content</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}