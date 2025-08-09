import { useState, useCallback } from 'react';

export interface DriveFile {
  id: string;
  name: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
}

export interface FolderInfo {
  folder: {
    id: string;
    name: string;
    createdTime: string;
    modifiedTime: string;
  };
  fileCount: number;
  totalSize: number;
  files: DriveFile[];
}

export const useGoogleDriveAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: any, operation: string) => {
    console.error(`Google Drive API ${operation} error:`, error);
    setError(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
  };

  const saveTest = useCallback(async (testData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/drive/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('Test saved to Drive with ID:', result.fileId);
      return result.fileId;
    } catch (error) {
      handleError(error, 'save test');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listTests = useCallback(async (): Promise<DriveFile[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/drive/test');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return result.tests || [];
    } catch (error) {
      handleError(error, 'list tests');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTest = useCallback(async (fileId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/drive/test?fileId=${fileId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('Test deleted from Drive:', fileId);
    } catch (error) {
      handleError(error, 'delete test');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBackup = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Collect localStorage data if no specific data provided
      const backupData = data || (() => {
        const localData: { [key: string]: string | null } = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            localData[key] = localStorage.getItem(key);
          }
        }
        return localData;
      })();

      const response = await fetch('/api/drive/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backupData),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('Backup created with ID:', result.fileId);
      return result.fileId;
    } catch (error) {
      handleError(error, 'create backup');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFolderInfo = useCallback(async (): Promise<FolderInfo | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/drive/backup');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        folder: result.folder,
        fileCount: result.fileCount,
        totalSize: result.totalSize,
        files: result.files
      };
    } catch (error) {
      handleError(error, 'get folder info');
      return null;
    } finally {
      setIsLoading(false);
    }
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
    
    // Actions
    saveTest,
    listTests,
    deleteTest,
    createBackup,
    getFolderInfo,
    clearError,
    
    // Utilities
    formatFileSize
  };
};