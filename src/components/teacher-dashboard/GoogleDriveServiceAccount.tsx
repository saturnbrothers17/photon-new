'use client';

import { useState, useEffect } from 'react';
import { useGoogleDriveAPI, DriveFile, FolderInfo } from '@/hooks/useGoogleDriveAPI';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudUpload, Download, Trash2, RefreshCw, AlertCircle, Server, FolderOpen } from 'lucide-react';

export default function GoogleDriveServiceAccount() {
  const {
    isLoading,
    error,
    saveTest,
    listTests,
    deleteTest,
    createBackup,
    getFolderInfo,
    clearError,
    formatFileSize
  } = useGoogleDriveAPI();

  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [folderInfo, setFolderInfo] = useState<FolderInfo | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    loadDriveData();
  }, []);

  const loadDriveData = async () => {
    try {
      const [files, info] = await Promise.all([
        listTests(),
        getFolderInfo()
      ]);
      setDriveFiles(files);
      setFolderInfo(info);
    } catch (error) {
      console.error('Failed to load drive data:', error);
    }
  };

  const handleBackup = async () => {
    try {
      const backupId = await createBackup(null); // null means backup all localStorage
      setLastBackup(new Date().toLocaleString());
      await loadDriveData(); // Refresh the data
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (confirm(`Are you sure you want to delete "${fileName}" from Google Drive?`)) {
      try {
        await deleteTest(fileId);
        await loadDriveData(); // Refresh the data
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleSaveCurrentTest = async () => {
    try {
      // Get current test data from localStorage
      const testsData = localStorage.getItem('tests');
      if (!testsData) {
        alert('No test data found in localStorage');
        return;
      }

      const tests = JSON.parse(testsData);
      if (tests.length === 0) {
        alert('No tests to save');
        return;
      }

      // Save the most recent test
      const latestTest = tests[tests.length - 1];
      await saveTest(latestTest);
      await loadDriveData(); // Refresh the data
      alert('Test saved to Google Drive successfully!');
    } catch (error) {
      console.error('Failed to save test:', error);
      alert('Failed to save test to Google Drive');
    }
  };

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

      {/* Service Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Google Drive Service Account
          </CardTitle>
          <CardDescription>
            Server-to-server integration with your Google Drive (2TB storage)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Cloud className="h-3 w-3 mr-1" />
              Connected
            </Badge>
            <span className="text-sm text-gray-600">
              No user authentication required
            </span>
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
            Backup your test data to Google Drive
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
              onClick={handleSaveCurrentTest} 
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              <Cloud className="h-4 w-4 mr-2" />
              Save Latest Test
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={loadDriveData}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          
          {lastBackup && (
            <p className="text-sm text-gray-600">
              Last backup: {lastBackup}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Folder Information */}
      {folderInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Drive Folder Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Folder Name</p>
                <p className="text-gray-600">{folderInfo.folder.name}</p>
              </div>
              <div>
                <p className="font-medium">Total Files</p>
                <p className="text-gray-600">{folderInfo.fileCount}</p>
              </div>
              <div>
                <p className="font-medium">Storage Used</p>
                <p className="text-gray-600">{formatFileSize(folderInfo.totalSize)}</p>
              </div>
              <div>
                <p className="font-medium">Created</p>
                <p className="text-gray-600">
                  {new Date(folderInfo.folder.createdTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="text-center py-8">
              <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No files found in Google Drive</p>
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
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement download/restore functionality
                        console.log('Download file:', file.id);
                        alert('Download functionality coming soon!');
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id, file.name)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isLoading}
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

      {/* Storage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Capacity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Google Drive Total</p>
              <p className="text-gray-600">2 TB Available</p>
            </div>
            <div>
              <p className="font-medium">Used by Tests</p>
              <p className="text-gray-600">
                {folderInfo ? formatFileSize(folderInfo.totalSize) : 'Loading...'}
              </p>
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
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Unlimited capacity:</strong> With 2TB available, you can store millions of tests 
              and never worry about running out of space!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}