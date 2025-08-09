'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, FileText, Clock, User, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styles from './StudyMaterialsViewer.module.css';
import { createPortal } from 'react-dom';

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
  material: StudyMaterial;
  open: boolean;
  onClose: () => void;
}

export function StudyMaterialsViewer({ material, open, onClose }: StudyMaterialsViewerProps) {
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string>('');
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  
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
        // Get the public URL for the file
        console.log('Getting public URL for file:', material.file_url);
        
        // The getPublicUrl method doesn't actually make a network request,
        // it just generates a URL string, so there's no error to catch here
        const { data } = supabase.storage
          .from('study-materials')
          .getPublicUrl(material.file_url);
        
        console.log('Generated public URL:', data.publicUrl);
        
        if (data?.publicUrl) {
          setFileUrl(data.publicUrl);
        } else {
          console.error('Failed to generate public URL for file:', material.file_url);
          setError('Failed to generate public URL');
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

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        setIsFullscreen(true);
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn('Fullscreen toggle error:', e);
      setIsFullscreen((v) => !v);
    }
  };

  // Disable right-click context menu to prevent saving
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Disable keyboard shortcuts for saving/printing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+S, Ctrl+P, etc.
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        return false;
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Disable text selection
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.userSelect = 'auto';
    };
  }, [open]);

  // Keep state in sync with browser fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // When entering fullscreen, request browser fullscreen for the overlay container
  useEffect(() => {
    if (isFullscreen && fullscreenContainerRef.current) {
      // Try requesting browser fullscreen (best UX); fallback is the overlay itself
      fullscreenContainerRef.current.requestFullscreen?.().catch(() => {
        /* ignore - overlay still covers tab */
      });
    }
  }, [isFullscreen]);

  const renderViewer = (inPortal: boolean = false) => {
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

    // Render based on file type
    if (material.file_type?.includes('pdf')) {
      return (
        <div 
          className={inPortal ? styles.portalContainer : (isFullscreen ? styles.fullscreen : styles.viewerContainer)}
          onContextMenu={handleContextMenu}
        >
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className={styles.pdfViewer}
            title={material.title}
          />
          <div className={styles.pdfOverlay} />
        </div>
      );
    }

    // Office documents (doc, docx, ppt, xls) via Office web viewer
    const ext = material.file_url?.split('.').pop()?.toLowerCase();
    const isOfficeDoc =
      material.file_type?.includes('msword') ||
      material.file_type?.includes('officedocument') ||
      ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext || '');
    if (isOfficeDoc) {
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
      return (
        <div 
          className={inPortal ? styles.portalContainer : (isFullscreen ? styles.fullscreen : styles.viewerContainer)}
          onContextMenu={handleContextMenu}
        >
          <iframe
            src={officeUrl}
            className={styles.pdfViewer}
            title={material.title}
          />
          <div className={styles.pdfOverlay} />
        </div>
      );
    }

    if (material.file_type?.includes('image')) {
      return (
        <div 
          className={inPortal ? styles.portalContainer : (isFullscreen ? styles.fullscreen : '')}
          onContextMenu={handleContextMenu}
        >
          <img
            src={fileUrl}
            alt={material.title}
            className={`${styles.imageViewer} ${inPortal || isFullscreen ? 'max-w-full max-h-full' : 'w-full h-auto'}`}
            draggable={false}
          />
        </div>
      );
    }

    if (material.file_type?.includes('video')) {
      return (
        <div 
          className={inPortal ? styles.portalVideo : (isFullscreen ? styles.fullscreenVideo : '')}
          onContextMenu={handleContextMenu}
        >
          <video
            src={fileUrl}
            controls
            controlsList="nodownload"
            className={`${styles.videoViewer} ${inPortal || isFullscreen ? 'max-w-full max-h-full' : 'w-full h-auto'}`}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Default viewer for other file types
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            This file type cannot be previewed directly
          </p>
        </div>
      </div>
    );
  };

return (
  <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold mb-2">{material.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Badge variant="secondary" className="capitalize">
                  {material.subject}
                </Badge>
                {material.topic && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {material.topic}
                  </span>
                )}
                {material.class_level && (
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
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-6 pt-4 flex-1 overflow-auto">
          {/* Notice about viewing only */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              This material is for viewing only. Downloads are disabled to protect content.
            </p>
          </div>
          
          <div className="w-full">
            {renderViewer()}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {isFullscreen && createPortal(
      <div
        ref={fullscreenContainerRef}
        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex flex-col"
      >
        <div className="flex items-center justify-between p-3 text-white border-b border-white/10">
          <div className="font-semibold truncate pr-4">{material.title}</div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8 text-white hover:bg-white/10"
              title="Exit fullscreen"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-white hover:bg-white/10"
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {renderViewer(true)}
        </div>
      </div>,
      document.body
    )}
  </>
);
}
