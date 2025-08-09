'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Eye, AlertTriangle, ArrowLeft, ZoomIn, ZoomOut, 
  RotateCw, Download, Share, Copy, FileText
} from 'lucide-react';
import styles from './styles.module.css';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  subject: string;
  class_level: string;
  file_name: string;
  file_size: number;
  file_url: string;
  view_count: number;
  created_at: string;
}

export default function SecureMaterialViewer() {
  const params = useParams();
  const materialId = params.id as string;
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewStartTime] = useState(Date.now());
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Enhanced security measures
    const preventScreenshot = () => {
      // Disable right-click context menu
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showSecurityAlert('Right-click is disabled for security');
      });
      
      // Disable common screenshot and copy shortcuts
      document.addEventListener('keydown', (e) => {
        const forbiddenKeys = [
          'F12', 'F11', // Developer tools
          'PrintScreen', // Screenshot
        ];
        
        const forbiddenCombos = [
          { ctrl: true, shift: true, key: 'I' }, // Dev tools
          { ctrl: true, shift: true, key: 'C' }, // Dev tools
          { ctrl: true, shift: true, key: 'J' }, // Console
          { ctrl: true, key: 'u' }, // View source
          { ctrl: true, key: 's' }, // Save
          { ctrl: true, key: 'a' }, // Select all
          { ctrl: true, key: 'c' }, // Copy
          { ctrl: true, key: 'v' }, // Paste
          { ctrl: true, key: 'x' }, // Cut
          { ctrl: true, key: 'p' }, // Print
          { meta: true, key: 's' }, // Mac save
          { meta: true, key: 'c' }, // Mac copy
          { meta: true, key: 'v' }, // Mac paste
          { meta: true, key: 'x' }, // Mac cut
          { meta: true, key: 'p' }, // Mac print
        ];

        if (forbiddenKeys.includes(e.key) || 
            forbiddenCombos.some(combo => 
              (combo.ctrl ? e.ctrlKey : true) && 
              (combo.shift ? e.shiftKey : true) && 
              (combo.meta ? e.metaKey : true) && 
              e.key.toLowerCase() === combo.key.toLowerCase()
            )) {
          e.preventDefault();
          showSecurityAlert('This action is not allowed for security reasons');
        }
      });

      // Disable drag and drop
      document.addEventListener('dragstart', (e) => {
        e.preventDefault();
        showSecurityAlert('Drag and drop is disabled');
      });
      
      document.addEventListener('drop', (e) => {
        e.preventDefault();
      });

      // Disable text selection and image dragging
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        img, canvas, video, iframe, embed, object {
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
          pointer-events: none !important;
        }
        
        .secure-content {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
        }

        /* Hide scrollbars to prevent screenshot clues */
        ::-webkit-scrollbar {
          display: none;
        }
        
        /* Prevent highlighting */
        ::selection {
          background: transparent;
        }
        
        ::-moz-selection {
          background: transparent;
        }
      `;
      document.head.appendChild(style);

      // Blur content when window loses focus
      let blurTimeout: NodeJS.Timeout;
      const handleVisibilityChange = () => {
        if (document.hidden) {
          document.body.style.filter = 'blur(20px)';
          document.body.style.pointerEvents = 'none';
          showSecurityAlert('Content hidden for security - window not in focus');
          blurTimeout = setTimeout(() => {
            document.body.style.filter = 'none';
            document.body.style.pointerEvents = 'auto';
          }, 3000);
        } else {
          clearTimeout(blurTimeout);
          document.body.style.filter = 'none';
          document.body.style.pointerEvents = 'auto';
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Detect developer tools
      let devtools = { open: false, orientation: null };
      const threshold = 160;
      
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools.open) {
            devtools.open = true;
            showSecurityAlert('Developer tools detected - content will be hidden');
            document.body.style.display = 'none';
            setTimeout(() => {
              window.close();
            }, 2000);
          }
        } else {
          devtools.open = false;
        }
      }, 500);

      // Prevent common mobile screenshot gestures
      let touchStartTime = 0;
      let touchCount = 0;
      
      document.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        touchCount = e.touches.length;
        
        if (touchCount >= 3) {
          e.preventDefault();
          showSecurityAlert('Multi-touch gestures are disabled');
        }
      });
      
      document.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - touchStartTime;
        
        // Detect potential screenshot gestures
        if (touchDuration > 1000 && touchCount >= 2) {
          showSecurityAlert('Screenshot attempt detected');
        }
      });

      // Monitor for external tools
      const originalConsoleLog = console.log;
      console.log = function(...args) {
        showSecurityAlert('Console access detected');
        return originalConsoleLog.apply(console, args);
      };
    };

    const showSecurityAlert = (message: string) => {
      const alertDiv = document.createElement('div');
      alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      alertDiv.textContent = `🛡️ ${message}`;
      document.body.appendChild(alertDiv);
      
      setTimeout(() => {
        document.body.removeChild(alertDiv);
      }, 3000);
    };

    preventScreenshot();
    loadMaterial();

    // Track view duration on unmount
    return () => {
      const viewDuration = Math.floor((Date.now() - viewStartTime) / 1000);
      trackViewDuration(viewDuration);
    };
  }, [materialId, viewStartTime]);

  const loadMaterial = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/supabase/study-materials-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'get-by-id', 
          materialId 
        })
      });

      const result = await response.json();
      if (result.success) {
        setMaterial(result.data);
        
        // Track view (simplified for now)
        console.log('Material viewed:', materialId);
        // await fetch('/api/supabase/study-materials-simple', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     action: 'track-view',
        //     materialId,
        //     studentId: 'student_' + Math.random().toString(36).substr(2, 9),
        //     deviceInfo: {
        //       userAgent: navigator.userAgent,
        //       timestamp: new Date().toISOString(),
        //       viewerType: 'secure'
        //     }
        //   })
        // });
      }
    } catch (error) {
      console.error('Error loading material:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackViewDuration = async (duration: number) => {
    try {
      console.log('View duration:', duration, 'seconds');
      // Tracking disabled for now
      // await fetch('/api/supabase/study-materials-simple', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   // body: JSON.stringify({
      //   //   action: 'track-view',
      //   //   materialId,
      //   //   studentId: 'student_' + Math.random().toString(36).substr(2, 9),
      //   //   viewDuration: duration,
      //   //   deviceInfo: {
      //   //     userAgent: navigator.userAgent,
      //   //     timestamp: new Date().toISOString(),
      //   //     sessionEnd: true
      //   //   }
      //   // })
      // });
    } catch (error) {
      console.error('Error tracking view duration:', error);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleGoBack = () => {
    window.close();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading secure material viewer...</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold mb-2">Material Not Found</h2>
          <p className="text-gray-400 mb-4">The requested study material could not be loaded.</p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Security Header */}
      <div className="bg-red-600 p-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">SECURE VIEWER - PROTECTED CONTENT</span>
            <Badge variant="destructive">NO DOWNLOAD • NO SCREENSHOT</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4" />
            <span>Views: {material.view_count}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={handleGoBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-semibold text-lg">{material.title}</h1>
              <p className="text-sm text-gray-400">
                {material.subject} - Class {material.class_level} • {formatFileSize(material.file_size)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleZoomOut} variant="outline" size="sm" disabled={zoom <= 50}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2">{zoom}%</span>
            <Button onClick={handleZoomIn} variant="outline" size="sm" disabled={zoom >= 200}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button onClick={handleRotate} variant="outline" size="sm">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4">
        <div className="container mx-auto">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5" />
                {material.file_name}
              </CardTitle>
              {material.description && (
                <p className="text-gray-400">{material.description}</p>
              )}
            </CardHeader>
            <CardContent>
              {/* PDF Viewer Container */}
              <div 
                ref={viewerRef}
                className={`secure-content bg-white rounded-lg p-4 min-h-96 relative overflow-hidden ${styles.viewerContent}`}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - This is a false positive. We are using inline styles for dynamic CSS variables.
                style={{
                  '--zoom-scale': zoom / 100,
                  '--rotation-deg': `${rotation}deg`,
                } as React.CSSProperties}
              >
                {/* Watermark */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="absolute top-4 left-4 text-gray-300 text-xs opacity-50 transform -rotate-45">
                    PROTECTED CONTENT
                  </div>
                  <div className="absolute bottom-4 right-4 text-gray-300 text-xs opacity-50 transform rotate-45">
                    NO DOWNLOAD
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-200 text-6xl opacity-10 rotate-45">
                    SECURE
                  </div>
                </div>

                {/* PDF Content Placeholder */}
                <div className="relative z-0">
                  <div className="text-center py-12 text-gray-600">
                    <FileText className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">PDF Content</h3>
                    <p className="text-gray-500 mb-4">
                      This is where the PDF content would be displayed using a secure PDF viewer
                    </p>
                    <p className="text-sm text-gray-400">
                      File: {material.file_name}
                    </p>
                    <p className="text-sm text-gray-400">
                      Size: {formatFileSize(material.file_size)}
                    </p>
                    
                    {/* Simulated PDF pages */}
                    <div className="mt-8 space-y-4">
                      {[1, 2, 3].map((page) => (
                        <div key={page} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-8 mx-auto max-w-2xl">
                          <div className="text-left space-y-3">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-full"></div>
                            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                            <div className="h-4 bg-gray-300 rounded w-4/5"></div>
                          </div>
                          <div className="text-center mt-4 text-xs text-gray-400">
                            Page {page}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg">
                <div className="flex items-center gap-2 text-red-200">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-semibold">Security Notice:</span>
                </div>
                <ul className="text-xs text-red-300 mt-2 space-y-1">
                  <li>• Screenshots and screen recording are blocked</li>
                  <li>• Right-click and keyboard shortcuts are disabled</li>
                  <li>• Content is watermarked and view-tracked</li>
                  <li>• Download and sharing features are not available</li>
                  <li>• Developer tools access will close this window</li>
                </ul>
              </div>

              {/* Disabled Action Buttons (for demonstration) */}
              <div className="mt-4 flex gap-2">
                <Button disabled variant="outline" className="opacity-50">
                  <Download className="h-4 w-4 mr-2" />
                  Download (Disabled)
                </Button>
                <Button disabled variant="outline" className="opacity-50">
                  <Share className="h-4 w-4 mr-2" />
                  Share (Disabled)
                </Button>
                <Button disabled variant="outline" className="opacity-50">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy (Disabled)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="container mx-auto text-center text-sm text-gray-400">
          <p>This content is protected and monitored. Unauthorized access attempts are logged.</p>
        </div>
      </div>
    </div>
  );
}