'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, FileText, CheckCircle, AlertTriangle, 
  ArrowLeft, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function UploadMaterials() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'Mathematics',
    classLevel: 'Class 10'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setFormData(prev => ({
          ...prev,
          title: fileName
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      showMessage('error', 'Please select a file to upload');
      return;
    }

    if (!formData.title.trim()) {
      showMessage('error', 'Please enter a title');
      return;
    }

    try {
      setUploading(true);
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('subject', formData.subject);
      uploadFormData.append('classLevel', formData.classLevel);

      console.log('📤 Uploading material:', {
        title: formData.title,
        subject: formData.subject,
        classLevel: formData.classLevel,
        fileName: selectedFile.name,
        fileSize: selectedFile.size
      });

      const response = await fetch('/api/supabase/study-materials', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (result.success) {
        showMessage('success', `"${formData.title}" uploaded successfully!`);
        // Reset form
        setFormData({
          title: '',
          description: '',
          subject: 'Mathematics',
          classLevel: 'Class 10'
        });
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        console.error('❌ Upload failed:', result.error);
        showMessage('error', result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      showMessage('error', 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/teacher-dashboard/manage-materials">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Materials
            </Button>
          </Link>
          <div>
            <h1 className="font-headline text-4xl font-bold text-gray-800 mb-2">
              Upload Study Material
            </h1>
            <p className="text-gray-600">
              Add new educational content for students
            </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Material Details
              </CardTitle>
              <CardDescription>
                Fill in the information about your study material
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File *
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mov"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: PDF, Word, PowerPoint, Images, Videos
                  </p>
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        📁 {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter material title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the material content"
                    rows={3}
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Social Science">Social Science</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="General">General</option>
                  </select>
                </div>

                {/* Class Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Level *
                  </label>
                  <select
                    name="classLevel"
                    value={formData.classLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="General">General</option>
                  </select>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Material
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Upload Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Supported File Types:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• PDF documents (.pdf)</li>
                  <li>• Word documents (.doc, .docx)</li>
                  <li>• PowerPoint presentations (.ppt, .pptx)</li>
                  <li>• Images (.jpg, .jpeg, .png, .gif)</li>
                  <li>• Videos (.mp4, .webm, .mov)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Best Practices:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Use clear, descriptive titles</li>
                  <li>• Add detailed descriptions</li>
                  <li>• Select appropriate subject and class level</li>
                  <li>• Keep file sizes reasonable (under 50MB)</li>
                  <li>• Ensure content is educational and appropriate</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Storage Management:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Regularly review and delete old materials</li>
                  <li>• Compress large files before uploading</li>
                  <li>• Remove duplicate or outdated content</li>
                  <li>• Monitor storage usage in the management page</li>
                </ul>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Remember: You can delete materials anytime from the management page to free up storage space.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}