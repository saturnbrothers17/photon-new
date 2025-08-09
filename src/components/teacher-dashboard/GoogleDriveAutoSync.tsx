'use client';

import { useState, useEffect } from 'react';
import { useGoogleDriveAutoSync, FolderStructure } from '@/hooks/useGoogleDriveAutoSync';
import { useGoogleDriveOAuth } from '@/hooks/useGoogleDriveOAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Cloud, 
  CloudUpload, 
  RefreshCw, 
  AlertCircle, 
  FolderOpen, 
  CheckCircle, 
  Settings,
  FileText,
  BookOpen,
  Users,
  BarChart3,
  Database,
  Zap,
  Bell,
  Folder
} from 'lucide-react';

export default function GoogleDriveAutoSync() {
  const { isAuthenticated } = useGoogleDriveOAuth();
  const {
    isLoading,
    error,
    lastSync,
    initializeFolders,
    uploadTest,
    uploadStudyMaterial,
    uploadStudentData,
    uploadAnalytics,
    createBackup,
    syncAll,
    getFolderStructure,
    requestNotificationPermission,
    clearError,
    formatFileSize
  } = useGoogleDriveAutoSync();

  const [folderStructure, setFolderStructure] = useState<FolderStructure | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadFolderStructure();
      checkNotificationPermission();
    }
  }, [isAuthenticated]);

  const loadFolderStructure = async () => {
    try {
      const structure = await getFolderStructure();
      setFolderStructure(structure);
    } catch (error) {
      console.error('Failed to load folder structure:', error);
    }
  };

  const checkNotificationPermission = async () => {
    const hasPermission = await requestNotificationPermission();
    setNotificationsEnabled(hasPermission);
  };

  const handleInitializeFolders = async () => {
    try {
      await initializeFolders();
      await loadFolderStructure();
      alert('Folder structure initialized successfully!');
    } catch (error) {
      console.error('Failed to initialize folders:', error);
    }
  };

  const handleSyncAll = async () => {
    try {
      const result = await syncAll();
      await loadFolderStructure();
      alert(`Sync completed! ${result?.uploadedFiles || 0} files uploaded.`);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleTestUpload = async () => {
    try {
      // Get test data from localStorage
      const testsData = localStorage.getItem('tests');
      if (!testsData) {
        alert('No test data found');
        return;
      }

      const tests = JSON.parse(testsData);
      if (tests.length === 0) {
        alert('No tests to upload');
        return;
      }

      // Upload the latest test
      const latestTest = tests[tests.length - 1];
      await uploadTest(latestTest);
      await loadFolderStructure();
      alert(`Test "${latestTest.name}" uploaded successfully!`);
    } catch (error) {
      console.error('Test upload failed:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      await createBackup();
      await loadFolderStructure();
      alert('System backup created successfully!');
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Google Drive Auto-Sync
          </CardTitle>
          <CardDescription>
            Please connect to Google Drive first to enable automatic synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Connect to Google Drive to get started</p>
          </div>
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

      {/* Auto-Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            PHOTON Auto-Sync System
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          </CardTitle>
          <CardDescription>
            Automatically organize and backup your coaching institute data to Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              <Badge variant={notificationsEnabled ? 'default' : 'secondary'}>
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Auto-Sync</span>
              </div>
              <Badge variant={autoSyncEnabled ? 'default' : 'secondary'}>
                {autoSyncEnabled ? 'Active' : 'Manual'}
              </Badge>
            </div>
          </div>

          {lastSync && (
            <p className="text-sm text-gray-600">
              Last sync: {lastSync}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Initialize folders and sync your data to Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button 
              onClick={handleInitializeFolders}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Folder className="h-4 w-4" />
              Setup Folders
            </Button>
            
            <Button 
              onClick={handleTestUpload}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Upload Latest Test
            </Button>
            
            <Button 
              onClick={handleCreateBackup}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Create Backup
            </Button>
          </div>

          <Button 
            onClick={handleSyncAll}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Sync All Data
          </Button>
        </CardContent>
      </Card>

      {/* Folder Structure */}
      {folderStructure && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              PHOTON Drive Structure
              <Badge variant="secondary">{folderStructure.totalFiles} files</Badge>
            </CardTitle>
            <CardDescription>
              Organized folder structure in your Google Drive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Root folder info */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-800">{folderStructure.root}</h3>
                  <Badge className="bg-blue-100 text-blue-800">
                    {formatFileSize(folderStructure.totalSize)}
                  </Badge>
                </div>
                <p className="text-sm text-blue-600">
                  Main folder containing all PHOTON coaching institute data
                </p>
              </div>

              {/* Folder grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(folderStructure.folders).map(([key, folder]) => {
                  const getIcon = (folderKey: string) => {
                    switch (folderKey) {
                      case 'TESTS': return <FileText className="h-5 w-5 text-blue-600" />;
                      case 'STUDY_MATERIALS': return <BookOpen className="h-5 w-5 text-green-600" />;
                      case 'STUDENT_DATA': return <Users className="h-5 w-5 text-purple-600" />;
                      case 'ANALYTICS': return <BarChart3 className="h-5 w-5 text-orange-600" />;
                      case 'BACKUPS': return <Database className="h-5 w-5 text-red-600" />;
                      case 'QUESTION_BANKS': return <BookOpen className="h-5 w-5 text-indigo-600" />;
                      default: return <Folder className="h-5 w-5 text-gray-600" />;
                    }
                  };

                  return (
                    <div key={key} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        {getIcon(key)}
                        <h4 className="font-medium text-sm">{folder.name}</h4>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Files:</span>
                          <span>{folder.fileCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{formatFileSize(folder.totalSize)}</span>
                        </div>
                        {folder.error && (
                          <div className="text-red-500 text-xs">
                            {folder.error}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                variant="outline" 
                onClick={loadFolderStructure}
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Structure
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Sync Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Automatic Organization:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Tests sorted by type and subject</li>
                <li>• Study materials by subject</li>
                <li>• Student data securely stored</li>
                <li>• Analytics reports organized</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Smart Features:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Automatic folder creation</li>
                <li>• Duplicate prevention</li>
                <li>• File metadata tracking</li>
                <li>• Instant notifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}