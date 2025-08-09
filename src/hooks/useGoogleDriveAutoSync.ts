import { useCallback, useState } from 'react';

// Minimal stub for Google Drive auto-sync to unblock builds.
// Replace with real implementation when integrating Google Drive.
export function useGoogleDriveAutoSync() {
  const [isLoading, setIsLoading] = useState(false);

  const autoUploadTest = useCallback(async (testData: any) => {
    try {
      setIsLoading(true);
      // TODO: Implement Google Drive upload logic
      console.info('[useGoogleDriveAutoSync] Stub autoUploadTest called with:', testData?.title || testData?.name || 'Untitled');
      await Promise.resolve();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { autoUploadTest, isLoading };
}
