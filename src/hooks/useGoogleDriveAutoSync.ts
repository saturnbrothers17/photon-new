import { useState, useCallback } from 'react';

export interface SyncResult {
  success: boolean;
  action: string;
  fileId?: string;
  message: string;
  uploadedFiles?: number;
  details?: any[];
}

export interface FolderStructure {
  root: string;
  folders: {
    [key: string]: {
      name: string;
      fileCount: number;
      files: any[];
      totalSize: number;
      error?: string;
    };
  };
  totalFiles: number;
  totalSize: number;
}

export const useGoogleDriveAutoSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleError = (error: any, operation: string) => {
    console.error(`Auto-sync ${operation} error:`, error);
    setError(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
  };

  const getTokens = () => {
    if (typeof window === 'undefined') return null;
    const storedTokens = localStorage.getItem('googleDriveTokens');
    return storedTokens ? JSON.parse(storedTokens) : null;
  };

  const performSync = useCallback(async (action: string, data?: any): Promise<SyncResult | null> => {
    const tokens = getTokens();
    if (!tokens) {
      throw new Error('Not authenticated with Google Drive');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/drive/auto-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokens, action, data }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`✅ ${action} completed:`, result.message);
      setLastSync(new Date().toLocaleString());
      return result;
    } catch (error) {
      handleError(error, action);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializeFolders = useCallback(async () => {
    return await performSync('initialize');
  }, [performSync]);

  const uploadTest = useCallback(async (testData: any) => {
    return await performSync('upload_test', testData);
  }, [performSync]);

  const uploadStudyMaterial = useCallback(async (materialData: any) => {
    return await performSync('upload_study_material', materialData);
  }, [performSync]);

  const uploadStudentData = useCallback(async (studentData: any) => {
    return await performSync('upload_student_data', studentData);
  }, [performSync]);

  const uploadAnalytics = useCallback(async (analyticsData: any) => {
    return await performSync('upload_analytics', analyticsData);
  }, [performSync]);

  const createBackup = useCallback(async (backupData?: any) => {
    // Get all localStorage data if no specific data provided
    const data = backupData || (() => {
      const localData: { [key: string]: string | null } = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          localData[key] = localStorage.getItem(key);
        }
      }
      return localData;
    })();

    return await performSync('create_backup', data);
  }, [performSync]);

  const syncAll = useCallback(async () => {
    // Get all localStorage data
    const allData: { [key: string]: string | null } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allData[key] = localStorage.getItem(key);
      }
    }

    return await performSync('sync_all', allData);
  }, [performSync]);

  const getFolderStructure = useCallback(async (): Promise<FolderStructure | null> => {
    const tokens = getTokens();
    if (!tokens) {
      throw new Error('Not authenticated with Google Drive');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const tokensParam = encodeURIComponent(JSON.stringify(tokens));
      const response = await fetch(`/api/drive/auto-sync?tokens=${tokensParam}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return result.folderStructure;
    } catch (error) {
      handleError(error, 'get folder structure');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const autoUploadTest = useCallback(async (testData: any) => {
    try {
      console.log('🔄 Auto-uploading test:', testData.name);
      const result = await uploadTest(testData);
      
      // Show success notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Test Uploaded to Google Drive', {
            body: `${testData.name} has been automatically uploaded to your Google Drive`,
            icon: '/favicon.ico'
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Auto-upload failed:', error);
      throw error;
    }
  }, [uploadTest]);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    // State
    isLoading,
    error,
    lastSync,
    
    // Actions
    initializeFolders,
    uploadTest,
    uploadStudyMaterial,
    uploadStudentData,
    uploadAnalytics,
    createBackup,
    syncAll,
    getFolderStructure,
    autoUploadTest,
    
    // Utilities
    requestNotificationPermission,
    clearError,
    formatFileSize
  };
};