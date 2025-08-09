import { useState, useCallback, useEffect } from 'react';

export interface DriveFile {
  id: string;
  name: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
}

export const useGoogleDriveOAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokens, setTokens] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('googleDriveAuth') === 'true';
      const storedTokens = localStorage.getItem('googleDriveTokens');
      
      setIsAuthenticated(authStatus);
      if (storedTokens) {
        setTokens(JSON.parse(storedTokens));
      }
    }
  }, []);

  const handleError = (error: any, operation: string) => {
    console.error(`Google Drive OAuth ${operation} error:`, error);
    setError(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
  };

  const authenticate = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/google');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      window.location.href = result.authUrl;
    } catch (error) {
      handleError(error, 'authenticate');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBackup = useCallback(async (data?: any) => {
    if (!tokens) {
      throw new Error('Not authenticated');
    }

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

      const response = await fetch('/api/drive/oauth/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupData, tokens }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('✅ Backup created:', result.fileId);
      return result;
    } catch (error) {
      handleError(error, 'create backup');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [tokens]);

  const listFiles = useCallback(async (): Promise<DriveFile[]> => {
    if (!tokens) {
      return [];
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const tokensParam = encodeURIComponent(JSON.stringify(tokens));
      const response = await fetch(`/api/drive/oauth/backup?tokens=${tokensParam}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return result.files || [];
    } catch (error) {
      handleError(error, 'list files');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [tokens]);

  const signOut = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('googleDriveTokens');
      localStorage.removeItem('googleDriveAuth');
    }
    setIsAuthenticated(false);
    setTokens(null);
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
    isAuthenticated,
    
    // Actions
    authenticate,
    createBackup,
    listFiles,
    signOut,
    clearError,
    
    // Utilities
    formatFileSize
  };
};