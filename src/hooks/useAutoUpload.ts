import { useEffect, useCallback } from 'react';
import { useGoogleDriveAutoSync } from './useGoogleDriveAutoSync';

export const useAutoUpload = () => {
  const { autoUploadTest, isLoading } = useGoogleDriveAutoSync();

  // Listen for localStorage changes
  const handleStorageChange = useCallback(async (event: StorageEvent) => {
    if (event.key === 'tests' && event.newValue) {
      try {
        const tests = JSON.parse(event.newValue);
        const oldTests = event.oldValue ? JSON.parse(event.oldValue) : [];
        
        // Check if a new test was added
        if (tests.length > oldTests.length) {
          const newTest = tests[tests.length - 1];
          console.log('🔄 New test detected, auto-uploading:', newTest.name);
          
          // Auto-upload the new test
          await autoUploadTest(newTest);
        }
      } catch (error) {
        console.error('Auto-upload failed:', error);
      }
    }
  }, [autoUploadTest]);

  // Set up storage event listener
  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleStorageChange]);

  // Manual trigger for current tab (storage event doesn't fire in same tab)
  const triggerAutoUpload = useCallback(async (testData: any) => {
    try {
      console.log('🔄 Manually triggering auto-upload:', testData.name);
      await autoUploadTest(testData);
    } catch (error) {
      console.error('Manual auto-upload failed:', error);
    }
  }, [autoUploadTest]);

  return {
    triggerAutoUpload,
    isUploading: isLoading
  };
};