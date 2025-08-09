import { useState, useCallback } from 'react';
import { googleDriveService } from '@/lib/google-drive';

export interface DriveFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
}

export const useGoogleDrive = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return googleDriveService.isAuthenticated();
    }
    return false;
  });

  const handleError = (error: any, operation: string) => {
    console.error(`Google Drive ${operation} error:`, error);
    setError(`Failed to ${operation}: ${error.message}`);
  };

  const saveTest = useCallback(async (testData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fileId = await googleDriveService.saveTest(testData);
      console.log('Test saved to Drive with ID:', fileId);
      return fileId;
    } catch (error) {
      handleError(error, 'save test');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTest = useCallback(async (fileId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const testData = await googleDriveService.loadTest(fileId);
      return testData;
    } catch (error) {
      handleError(error, 'load test');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listTests = useCallback(async (): Promise<DriveFile[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const files = await googleDriveService.listTests();
      return files;
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
      await googleDriveService.deleteTest(fileId);
      console.log('Test deleted from Drive:', fileId);
    } catch (error) {
      handleError(error, 'delete test');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const backupToCloud = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const backupId = await googleDriveService.backupLocalStorage();
      console.log('Backup created with ID:', backupId);
      return backupId;
    } catch (error) {
      handleError(error, 'backup data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticate = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/google');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      window.location.href = result.authUrl;
    } catch (error) {
      handleError(error, 'authenticate');
    }
  }, []);

  const signOut = useCallback(() => {
    try {
      googleDriveService.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      handleError(error, 'sign out');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    isAuthenticated,
    
    // Actions
    saveTest,
    loadTest,
    listTests,
    deleteTest,
    backupToCloud,
    clearError,
    
    // Auth actions
    authenticate,
    signOut
  };
};