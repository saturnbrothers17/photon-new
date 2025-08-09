'use client';

import { useState, useEffect } from 'react';
import { useGoogleDrive, DriveFile } from '@/hooks/useGoogleDrive';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudUpload, Download, Trash2, RefreshCw, AlertCircle } from 'lucide-react';

export default function GoogleDriveSync() {
  const {
    isLoading,
    error,
    isAuthenticated,
    saveTest,
    listTests,
    deleteTest,
    backupToCloud,
    clearError,
    authenticate,
    signOut
  } = useGoogleDrive();

  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadDriveFiles();
    }
  }, [isAuthenticated]);

  const loadDriveFiles = async () => {
    try {
      const files = await listTests();
      setDriveFiles(files);
    } catch (error) {
      console.error('Failed to load drive files:', error);
    }
  };

  const handleBackup = async () => {
    try {
      const backupId = await backupToCloud();
      setLastBackup(new Date().toLocaleString());
      await loadDriveFiles(); // Refresh the list
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (confirm(`Are you sure you want to delete "${fileName}" from Google Drive?`)) {
      try {
        await deleteTest(fileId);
        await loadDriveFiles(); // Refresh the list
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const formatFileSize = (sizeBytes: number) => {
    if (sizeBytes < 1024) return `${sizeBytes} B`;
    if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Google Drive Integration
          </CardTitle>
          <CardDescription>
            Connect to Google Drive to backup and sync your test data across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={authenticate} className="w-full">
            <Cloud className="h-4 w-4 mr-2" />
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

      {/* Backup Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5" />
            Backup & Sync
          </CardTitle>
          <CardDescription>
            Backup your local test data to Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
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
              Backup Now
            </Button>
            <Button 
              variant="outline" 
              onClick={loadDriveFiles}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
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
            <Cloud className="h-5 w-5" />
            Files in Google Drive
            <Badge variant="secondary">{driveFiles.length}</Badge>
          </CardTitle>
          <CardDescription>
            Your test files stored in Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent>
          {driveFiles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No files found in Google Drive
            </p>
          ) : (
            <div className="space-y-2">
              {driveFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{file.name}</h4>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(file.createdTime).toLocaleDateString()}
                      {file.modifiedTime !== file.createdTime && (
                        <span className="ml-2">
                          Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement download/restore functionality
                        console.log('Download file:', file.id);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id, file.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Info & Account */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Storage Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Google Drive Available</p>
                <p className="text-gray-600">2 TB (Unlimited for your use case)</p>
              </div>
              <div>
                <p className="font-medium">Local Storage Used</p>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Google Drive</p>
                  <p className="text-sm text-gray-600">
                    {isAuthenticated ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
                  {isAuthenticated ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              {isAuthenticated && (
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="w-full text-red-600 hover:text-red-700"
                >
                  Disconnect Google Drive
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}