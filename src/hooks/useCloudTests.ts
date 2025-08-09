import { useState, useCallback, useEffect } from 'react';

export interface CloudTest {
  id: string;
  cloudId: string;
  name: string;
  type: string;
  status: string;
  duration?: string;
  totalQuestions: number;
  maxMarks?: number;
  subjects?: string[];
  createdTime: string;
  lastModified?: string;
  isCloudTest: boolean;
  questions?: any[];
  error?: string;
}

export const useCloudTests = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cloudTests, setCloudTests] = useState<CloudTest[]>([]);
  const [isCloudAvailable, setIsCloudAvailable] = useState(false);

  useEffect(() => {
    checkCloudAvailability();
  }, []);

  const checkCloudAvailability = () => {
    if (typeof window !== 'undefined') {
      const tokens = localStorage.getItem('googleDriveTokens');
      const isAuth = localStorage.getItem('googleDriveAuth') === 'true';
      setIsCloudAvailable(tokens !== null && isAuth);
    }
  };

  const handleError = (error: any, operation: string) => {
    console.error(`Cloud tests ${operation} error:`, error);
    setError(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
  };

  const getTokens = () => {
    if (typeof window === 'undefined') return null;
    const storedTokens = localStorage.getItem('googleDriveTokens');
    return storedTokens ? JSON.parse(storedTokens) : null;
  };

  // Fetch all published tests from cloud (for students)
  const fetchCloudTests = useCallback(async (): Promise<CloudTest[]> => {
    const tokens = getTokens();
    if (!tokens) {
      console.log('⚠️ No authentication tokens, using local tests only');
      return getLocalTests();
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📥 Fetching tests from cloud...');
      
      const tokensParam = encodeURIComponent(JSON.stringify(tokens));
      const response = await fetch(`/api/tests/cloud?tokens=${tokensParam}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const tests = result.tests || [];
      setCloudTests(tests);
      
      // Merge with local tests for complete list
      const localTests = getLocalTests();
      const allTests = [...tests, ...localTests.filter(local => 
        !tests.some((cloud: CloudTest) => cloud.id === local.id)
      )];

      console.log(`✅ Loaded ${tests.length} cloud tests, ${localTests.length} local tests`);
      return allTests;
    } catch (error) {
      handleError(error, 'fetch cloud tests');
      // Fallback to local tests
      return getLocalTests();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Publish test to cloud (for teachers)
  const publishTestToCloud = useCallback(async (testData: any, questions: any[]): Promise<string> => {
    const tokens = getTokens();
    if (!tokens) {
      throw new Error('Not authenticated with Google Drive');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📤 Publishing test to cloud:', testData.name);
      
      const response = await fetch('/api/tests/cloud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokens, testData, questions }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('✅ Test published to cloud:', result.fileId);
      
      // Show success notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Test Published to Cloud', {
            body: `${testData.name} is now available to all students across devices`,
            icon: '/favicon.ico'
          });
        }
      }
      
      return result.fileId;
    } catch (error) {
      handleError(error, 'publish test to cloud');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync local and cloud tests
  const syncTests = useCallback(async (): Promise<{ uploaded: number; downloaded: number }> => {
    const tokens = getTokens();
    if (!tokens) {
      throw new Error('Not authenticated with Google Drive');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Syncing tests between local and cloud...');
      
      let uploaded = 0;
      let downloaded = 0;

      // Get local tests that need to be uploaded
      const localTests = getLocalTests();
      for (const test of localTests) {
        if (!test.cloudId && test.status === 'published') {
          try {
            await publishTestToCloud(test, test.questions || []);
            uploaded++;
          } catch (error) {
            console.error('Failed to upload test:', test.name, error);
          }
        }
      }

      // Refresh cloud tests
      await fetchCloudTests();
      
      console.log(`✅ Sync complete: ${uploaded} uploaded, ${downloaded} downloaded`);
      return { uploaded, downloaded };
    } catch (error) {
      handleError(error, 'sync tests');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCloudTests, publishTestToCloud]);

  // Get local tests as fallback
  const getLocalTests = (): CloudTest[] => {
    try {
      const testsData = localStorage.getItem('tests');
      if (testsData) {
        const tests = JSON.parse(testsData);
        return tests
          .filter((test: any) => test.status === 'published' || test.status === 'scheduled' || test.status === 'live')
          .map((test: any) => ({
            ...test,
            isCloudTest: false,
            cloudId: test.cloudId || '',
            totalQuestions: test.totalQuestions || (test.questions?.length || 0)
          }));
      }
    } catch (error) {
      console.error('Error reading local tests:', error);
    }
    return [];
  };

  // Auto-publish test when created (for teachers)
  const autoPublishTest = useCallback(async (testData: any, questions: any[]) => {
    if (!isCloudAvailable) {
      console.log('⚠️ Cloud not available, test saved locally only');
      return null;
    }

    try {
      console.log('🔄 Auto-publishing test to cloud:', testData.name);
      const fileId = await publishTestToCloud(testData, questions);
      
      // Update local storage with cloud ID
      const existingTests = localStorage.getItem('tests');
      const tests = existingTests ? JSON.parse(existingTests) : [];
      const testIndex = tests.findIndex((t: any) => t.id === testData.id);
      
      if (testIndex >= 0) {
        tests[testIndex].cloudId = fileId;
        tests[testIndex].isCloudTest = true;
        localStorage.setItem('tests', JSON.stringify(tests));
      }
      
      return fileId;
    } catch (error) {
      console.error('Auto-publish failed:', error);
      // Don't throw error - test is still saved locally
      return null;
    }
  }, [isCloudAvailable, publishTestToCloud]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    cloudTests,
    isCloudAvailable,
    
    // Actions
    fetchCloudTests,
    publishTestToCloud,
    syncTests,
    autoPublishTest,
    getLocalTests,
    clearError,
    
    // Utilities
    checkCloudAvailability
  };
};