'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, FileText, Clock, User, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

interface StudyMaterialsViewerProps {
  material: StudyMaterial | null;
  open: boolean;
  onClose: () => void;
}

export function StudyMaterialsViewer({ material, open, onClose }: StudyMaterialsViewerProps) {
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string>('');
  
  const supabase = createClientComponentClient();

  // Log material prop changes
  useEffect(() => {
    console.log('Material prop updated:', material);
  }, [material]);

  // Log fileUrl state changes
  useEffect(() => {
    console.log('File URL updated:', fileUrl);
  }, [fileUrl]);

  // Load file when dialog opens or material changes
  useEffect(() => {
    if (open && material) {
      loadFile();
    } else {
      // Reset states when dialog closes
      setFileUrl('');
      setError('');
      setLoading(true);
    }
  }, [open, material]);

  const loadFile = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading file for material:', material);
      
      // Check if material and file_url exist
      if (!material) {
        console.error('No material provided');
        setError('No study material selected');
        return;
      }
      
      if (!material.file_url) {
        console.error('No file_url found in material object');
        setError('This material does not have an associated file');
        return;
      }
      
      console.log('File path from material:', material.file_url);
      
      try {
        // Check if this is a placeholder file or real file
        if (material.file_url.startsWith('placeholder-')) {
          console.log('Placeholder file detected:', material.file_url);
          setError('File upload is coming soon. This is a placeholder material.');
          return;
        }
        
        // Check if file_url is already a full URL (from the API)
        if (material.file_url.startsWith('http')) {
          console.log('Using direct URL:', material.file_url);
          setFileUrl(material.file_url);
        } else {
          // Get the public URL for the file path
          console.log('Getting public URL for file path:', material.file_url);
          
          const { data } = supabase.storage
            .from('study-materials')
            .getPublicUrl(material.file_url);
          
          console.log('Generated public URL:', data.publicUrl);
          
          if (data?.publicUrl) {
            setFileUrl(data.publicUrl);
          } else {
            console.error('Failed to generate public URL for file:', material.file_url);
            throw new Error('Failed to generate public URL');
          }
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
        setError('Error accessing the file. Please try again later.');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setError('Failed to load the study material. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderViewer = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading material...</p>
          </div>
        </div>
      );
    }

    if (error || !fileUrl) {
      const errorMessage = error || 'No file available for viewing';
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error Loading Material</h3>
            <p className="mt-2 text-red-600 dark:text-red-300">{errorMessage}</p>
            <Button 
              variant="outline" 
              className="mt-4 text-red-600 border-red-300 dark:border-red-700 dark:text-red-300"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      );
    }

    const fileType = material?.file_type?.toLowerCase() || '';
    const isPdf = fileType.includes('pdf');
    const isImage = fileType.includes('image');
    const isVideo = fileType.includes('video');

    return (
      <div className="flex-1 overflow-auto">
        {isPdf && (
          <div className="w-full h-full">
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full min-h-[70vh] border-0"
              title={material?.title || 'PDF Viewer'}
            />
          </div>
        )}

        {isImage && (
          <div className="flex items-center justify-center p-4">
            <img 
              src={fileUrl} 
              alt={material?.title || 'Study Material'} 
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        )}

        {isVideo && (
          <div className="flex items-center justify-center p-4">
            <video 
              src={fileUrl} 
              controls
              controlsList="nodownload"
              className="max-w-full max-h-[80vh]"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {!isPdf && !isImage && !isVideo && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Preview not available for this file type</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                Open in new tab
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-6xl'} w-full`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <DialogTitle className="text-xl font-bold">{material?.title || 'Study Material'}</DialogTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
              {material?.subject && (
                <Badge variant="secondary" className="capitalize">
                  {material.subject}
                </Badge>
              )}
              {material?.topic && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {material.topic}
                </span>
              )}
              {material?.class_level && (
                <span className="flex items-center gap-1">
                  <span>Class {material.class_level}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen}
              className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="relative flex-1 overflow-hidden">
          {renderViewer()}
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {material?.uploaded_by && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Uploaded by {material.uploaded_by}</span>
                </div>
              )}
              {material?.created_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Uploaded on {new Date(material.created_at).toLocaleDateString()}</span>
                </div>
              )}
              <div className="ml-auto">
                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
                  View Only
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
