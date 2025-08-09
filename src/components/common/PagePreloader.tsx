'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

interface PagePreloaderProps {
  children: React.ReactNode;
  preloadData?: () => Promise<void>;
}

export default function PagePreloader({ children, preloadData }: PagePreloaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        // Preload data if provided
        if (preloadData) {
          await preloadData();
        }
        
        // Minimum loading time for smooth UX (prevents flash)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load page');
        setIsLoading(false);
      }
    };

    loadPage();
  }, [preloadData]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ Error loading page</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}