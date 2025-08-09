import { useState, useCallback, useEffect } from 'react';
import { useOptimizedData } from './useOptimizedData';
import { performanceCache } from '@/lib/performance-cache';

export interface SeamlessTest {
  id: string;
  cloudId?: string;
  name: string;
  type: string;
  status: string;
  duration?: string;
  totalQuestions: number;
  maxMarks?: number;
  subjects?: string[];
  createdTime: string;
  lastModified?: string;
  isCloudTest?: boolean;
  questions?: any[];
  source: 'local' | 'cloud' | 'seamless_cloud';
}

export interface StorageStats {
  connected: boolean;
  totalTests: number;
  totalSize: number;
  lastSync?: string;
  status: string;
}

export const useSeamlessCloud = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tests, setTests] = useState<SeamlessTest[]>([]);
  const [stats, setStats] = useState<StorageStats>({
    connected: false,
    totalTests: 0,
    totalSize: 0,
    status: 'Initializing...'
  });

  const handleError = (error: any, operation: string) => {
    console.error(`Seamless cloud ${operation} error:`, error);
    setError(`${operation} failed: ${error.message || 'Unknown error'}`);
  };

  // Optimized test fetching with caching
  const {
    data: cachedTests,
    loading: testsLoading,
    error: testsError,
    refresh: refreshTests
  } = useOptimizedData(
    'seamless_tests',
    async () => {
      console.log('📥 Fetching tests (cached)...');
      
      const response = await fetch('/api/seamless/tests');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const cloudTests = result.tests || [];
      const localTests = getLocalTests();
      const allTests = [...cloudTests];
      
      // Add local tests that aren't in cloud
      localTests.forEach(localTest => {
        if (!cloudTests.some((cloudTest: any) => cloudTest.id === localTest.id)) {
          allTests.push({ ...localTest, source: 'local' });
        }
      });

      console.log(`✅ Loaded ${allTests.length} tests (cached)`);
      return allTests;
    },
    [],
    2 * 60 * 1000 // 2 minutes cache
  );

  // Legacy fetchTests method for compatibility
  const fetchTests = useCallback(async (): Promise<SeamlessTest[]> => {
    if (cachedTests) {
      setTests(cachedTests);
      return cachedTests;
    }
    
    const freshTests = await refreshTests();
    if (freshTests) {
      setTests(freshTests);
      return freshTests;
    }
    
    // Fallback to local tests
    const localTests = getLocalTests();
    setTests(localTests);
    return localTests;
  }, [cachedTests, refreshTests]);

  // Seamlessly publish test (no authentication required)
  const publishTest = useCallback(async (testData: any, questions: any[] = []): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📤 Seamlessly publishing test:', testData.name);
      
      const response = await fetch('/api/seamless/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testData, questions }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('✅ Test seamlessly published:', result.message);
      
      // Refresh tests list
      await fetchTests();
      
      return result.cloudId;
    } catch (error) {
      handleError(error, 'publish test');
      // Don't throw error - system should continue working
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTests]);

  // Seamlessly create backup (no authentication required)
  const createBackup = useCallback(async (data?: any): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('💾 Seamlessly creating backup...');
      
      // Get all localStorage data if no specific data provided
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

      const response = await fetch('/api/seamless/backup', {
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

      console.log('✅ Backup seamlessly created:', result.message);
      return result.backupId;
    } catch (error) {
      handleError(error, 'create backup');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get storage statistics
  const getStats = useCallback(async (): Promise<StorageStats> => {
    try {
      const response = await fetch('/api/seamless/backup');
      const result = await response.json();
      
      if (result.success) {
        const newStats = result.stats;
        setStats(newStats);
        return newStats;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorStats = {
        connected: false,
        totalTests: 0,
        totalSize: 0,
        status: 'Connection Error'
      };
      setStats(errorStats);
      return errorStats;
    }
  }, []);

  // Auto-publish test when created (seamless)
  const autoPublishTest = useCallback(async (testData: any, questions: any[] = []) => {
    try {
      console.log('🔄 Auto-publishing test seamlessly:', testData.name);
      const cloudId = await publishTest(testData, questions);
      
      // Update local storage with cloud ID if successful
      if (cloudId) {
        const existingTests = localStorage.getItem('tests');
        const tests = existingTests ? JSON.parse(existingTests) : [];
        const testIndex = tests.findIndex((t: any) => t.id === testData.id);
        
        if (testIndex >= 0) {
          tests[testIndex].cloudId = cloudId;
          tests[testIndex].isCloudTest = true;
          tests[testIndex].source = 'seamless_cloud';
          localStorage.setItem('tests', JSON.stringify(tests));
        }
      }
      
      return cloudId;
    } catch (error) {
      console.error('Auto-publish failed:', error);
      // Don't throw error - test is still saved locally
      return null;
    }
  }, [publishTest]);

  // Get local tests as fallback
  const getLocalTests = (): SeamlessTest[] => {
    try {
      const testsData = localStorage.getItem('tests');
      if (testsData) {
        const tests = JSON.parse(testsData);
        return tests
          .filter((test: any) => test.status === 'published' || test.status === 'scheduled' || test.status === 'live')
          .map((test: any) => ({
            ...test,
            isCloudTest: false,
            source: 'local' as const,
            totalQuestions: test.totalQuestions || (test.questions?.length || 0)
          }));
      }
    } catch (error) {
      console.error('Error reading local tests:', error);
    }
    return [];
  };

  // Update tests when cached data changes
  useEffect(() => {
    if (cachedTests) {
      setTests(cachedTests);
    }
  }, [cachedTests]);

  // Update loading and error states
  useEffect(() => {
    setIsLoading(testsLoading);
    if (testsError) {
      setError(testsError);
    }
  }, [testsLoading, testsError]);

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
    tests,
    stats,
    
    // Actions
    fetchTests,
    publishTest,
    createBackup,
    getStats,
    autoPublishTest,
    getLocalTests,
    clearError,
    
    // Utilities
    formatFileSize
  };
};