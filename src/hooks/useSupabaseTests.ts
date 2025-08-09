/**
 * SUPABASE TESTS HOOK
 * 
 * React hook for managing tests with Supabase
 * Replaces all Google Drive hooks with real-time Supabase functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { supabaseDataManager, TestWithQuestions, CreateTestData, TestFilters } from '@/lib/supabase-data-manager';
import { getCurrentUser } from '@/lib/auth-helper';

export interface UseSupabaseTestsReturn {
  tests: TestWithQuestions[];
  loading: boolean;
  error: string | null;
  createTest: (testData: CreateTestData) => Promise<string>;
  updateTest: (testId: string, updates: Partial<CreateTestData>) => Promise<void>;
  deleteTest: (testId: string) => Promise<void>;
  publishTest: (testId: string) => Promise<void>;
  unpublishTest: (testId: string) => Promise<void>;
  refreshTests: () => Promise<void>;
  getTestById: (testId: string) => Promise<TestWithQuestions | null>;
  getTestStatistics: (testId: string) => Promise<any>;
}

export function useSupabaseTests(filters?: TestFilters): UseSupabaseTestsReturn {
  const [tests, setTests] = useState<TestWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tests
  const loadTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading tests with Supabase...');
      
      const fetchedTests = await supabaseDataManager.getAllTests(filters);
      setTests(fetchedTests);
      
      console.log(`✅ Loaded ${fetchedTests.length} tests`);
    } catch (err: any) {
      console.error('❌ Error loading tests:', err);
      setError(err.message || 'Failed to load tests');
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create test
  const createTest = useCallback(async (testData: CreateTestData): Promise<string> => {
    try {
      console.log('🚀 Creating test:', testData.title);
      
      const response = await fetch('/api/supabase/tests?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create test');
      }

      // Refresh tests list
      await loadTests();
      
      console.log('✅ Test created successfully:', result.data.testId);
      return result.data.testId;
    } catch (err: any) {
      console.error('❌ Error creating test:', err);
      throw err;
    }
  }, [loadTests]);

  // Update test
  const updateTest = useCallback(async (testId: string, updates: Partial<CreateTestData>): Promise<void> => {
    try {
      console.log('🔄 Updating test:', testId);
      
      const response = await fetch(`/api/supabase/tests?action=update&testId=${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update test');
      }

      // Refresh tests list
      await loadTests();
      
      console.log('✅ Test updated successfully');
    } catch (err: any) {
      console.error('❌ Error updating test:', err);
      throw err;
    }
  }, [loadTests]);

  // Delete test
  const deleteTest = useCallback(async (testId: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting test:', testId);
      
      const response = await fetch(`/api/supabase/tests?testId=${testId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete test');
      }

      // Remove from local state immediately for better UX
      setTests(prevTests => prevTests.filter(test => test.id !== testId));
      
      console.log('✅ Test deleted successfully');
    } catch (err: any) {
      console.error('❌ Error deleting test:', err);
      throw err;
    }
  }, []);

  // Publish test
  const publishTest = useCallback(async (testId: string): Promise<void> => {
    try {
      console.log('📢 Publishing test:', testId);
      
      const response = await fetch(`/api/supabase/tests?action=publish&testId=${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to publish test');
      }

      // Update local state
      setTests(prevTests => 
        prevTests.map(test => 
          test.id === testId ? { ...test, published: true } : test
        )
      );
      
      console.log('✅ Test published successfully');
    } catch (err: any) {
      console.error('❌ Error publishing test:', err);
      throw err;
    }
  }, []);

  // Unpublish test
  const unpublishTest = useCallback(async (testId: string): Promise<void> => {
    try {
      console.log('📝 Unpublishing test:', testId);
      
      const response = await fetch(`/api/supabase/tests?action=unpublish&testId=${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to unpublish test');
      }

      // Update local state
      setTests(prevTests => 
        prevTests.map(test => 
          test.id === testId ? { ...test, published: false } : test
        )
      );
      
      console.log('✅ Test unpublished successfully');
    } catch (err: any) {
      console.error('❌ Error unpublishing test:', err);
      throw err;
    }
  }, []);

  // Get test by ID
  const getTestById = useCallback(async (testId: string): Promise<TestWithQuestions | null> => {
    try {
      console.log('🔄 Fetching test by ID:', testId);
      
      const response = await fetch(`/api/supabase/tests?action=get-by-id&testId=${testId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch test');
      }

      console.log('✅ Test fetched successfully');
      return result.data;
    } catch (err: any) {
      console.error('❌ Error fetching test:', err);
      throw err;
    }
  }, []);

  // Get test statistics
  const getTestStatistics = useCallback(async (testId: string) => {
    try {
      console.log('📊 Fetching test statistics:', testId);
      
      const response = await fetch(`/api/supabase/tests?action=statistics&testId=${testId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch statistics');
      }

      console.log('✅ Test statistics fetched successfully');
      return result.data;
    } catch (err: any) {
      console.error('❌ Error fetching test statistics:', err);
      throw err;
    }
  }, []);

  // Refresh tests
  const refreshTests = useCallback(async () => {
    await loadTests();
  }, [loadTests]);

  // Load tests on mount and when filters change
  useEffect(() => {
    loadTests();
  }, [loadTests]);

  // Set up real-time subscription
  useEffect(() => {
    console.log('🔄 Setting up real-time subscription...');
    
    const unsubscribe = supabaseDataManager.subscribeToTests((payload) => {
      console.log('🔄 Real-time update received:', payload);
      
      // Refresh tests when changes occur
      loadTests();
    });

    return () => {
      console.log('🔄 Cleaning up real-time subscription...');
      unsubscribe();
    };
  }, [loadTests]);

  return {
    tests,
    loading,
    error,
    createTest,
    updateTest,
    deleteTest,
    publishTest,
    unpublishTest,
    refreshTests,
    getTestById,
    getTestStatistics
  };
}

// Hook for published tests (for students)
export function usePublishedTests() {
  const [tests, setTests] = useState<TestWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPublishedTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading published tests...');
      
      const response = await fetch('/api/supabase/tests?action=get-published');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load published tests');
      }

      setTests(result.data);
      console.log(`✅ Loaded ${result.data.length} published tests`);
    } catch (err: any) {
      console.error('❌ Error loading published tests:', err);
      setError(err.message || 'Failed to load published tests');
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublishedTests();
  }, [loadPublishedTests]);

  // Set up real-time subscription for published tests
  useEffect(() => {
    const unsubscribe = supabaseDataManager.subscribeToTests((payload) => {
      // Only refresh if it's a published test change
      if (payload.new?.published || payload.old?.published || payload.new?.is_published || payload.old?.is_published) {
        loadPublishedTests();
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadPublishedTests]);

  return {
    tests,
    loading,
    error,
    refreshTests: loadPublishedTests
  };
}