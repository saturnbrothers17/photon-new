'use client';

import { useState, useEffect } from 'react';
import { useGoogleDriveOAuth, DriveFile } from '@/hooks/useGoogleDriveOAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudUpload, RefreshCw, AlertCircle, User, FolderOpen, CheckCircle } from 'lucide-react';

export default function GoogleDriveOAuth() {
  const {
    isLoading,
    error,
    isAuthenticated,
    authenticate,
    createBackup,
    listFiles,
    signOut,
    clearError,
    formatFileSize
  } = useGoogleDriveOAuth();

  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadDriveFiles();
    }
  }, [isAuthenticated]);

  const loadDriveFiles = async () => {
    try {
      const files = await listFiles();
      setDriveFiles(files);
    } catch (error) {
      console.error('Failed to load drive files:', error);
    }
  };

  const handleBackup = async () => {
    try {
      const result = await createBackup();
      setLastBackup(new Date().toLocaleString());
      await loadDriveFiles(); // Refresh the list
      alert(`Backup created successfully! File: ${result.fileName}`);
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Google Drive OAuth Integration
          </CardTitle>
          <CardDescription>
            Connect your personal Google Drive account (2TB storage) to backup and sync your test data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Why OAuth is Better:</span>
            </div>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Uses your personal 2TB Google Drive storage</li>
              <li>• No storage quota limitations</li>
              <li>• Files are stored in your own Drive account</li>
              <li>• You maintain full control over your data</li>
            </ul>
          </div>
          
          <Button onClick={authenticate} disabled={isLoading} className="w-full">
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Cloud className="h-4 w-4 mr-2" />
            )}
            Connect to Google Drive
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Google Drive Connected
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </CardTitle>
          <CardDescription>
            Your personal Google Drive account is connected and ready to use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Using your personal 2TB Google Drive storage
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5" />
            Backup & Sync Operations
          </CardTitle>
          <CardDescription>
            Backup your test data to your Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button 
              onClick={handleBackup} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CloudUpload className="h-4 w-4 mr-2" />
              )}
              Backup All Data
            </Button>
            
            <Button 
              variant="outline" 
              onClick={loadDriveFiles}
              disabled={isLoading}
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Files
            </Button>
          </div>
          
          {lastBackup && (
            <p className="text-sm text-gray-600">
              Last backup: {lastBackup}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Drive Files List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Files in Your Google Drive
            <Badge variant="secondary">{driveFiles.length}</Badge>
          </CardTitle>
          <CardDescription>
            Your test backup files stored in Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent>
          {driveFiles.length === 0 ? (
            <div className="text-center py-8">
              <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No backup files found</p>
              <Button onClick={handleBackup} disabled={isLoading}>
                <CloudUpload className="h-4 w-4 mr-2" />
                Create Your First Backup
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {driveFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{file.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Created: {new Date(file.createdTime).toLocaleDateString()}
                      </span>
                      {file.size && (
                        <span>
                          Size: {formatFileSize(parseInt(file.size))}
                        </span>
                      )}
                      {file.modifiedTime !== file.createdTime && (
                        <span>
                          Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Your Google Drive</p>
              <p className="text-gray-600">2 TB Available</p>
            </div>
            <div>
              <p className="font-medium">Backup Files</p>
              <p className="text-gray-600">{driveFiles.length} files</p>
            </div>
            <div>
              <p className="font-medium">Local Storage</p>
              <p className="text-gray-600">
                {(() => {
                  let total = 0;
                  for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                      total += localStorage[key].length;
                    }
                  }
                  return formatFileSize(total);
                })()}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Perfect Solution:</strong> Using OAuth with your personal Google Drive gives you 
              unlimited storage capacity for your coaching institute's needs!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}