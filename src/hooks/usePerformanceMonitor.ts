"use client";

import { useEffect, useRef, useCallback } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    
    // Log excessive re-renders
    if (renderCount.current > 10) {
      console.warn(`⚠️ ${componentName} has re-rendered ${renderCount.current} times. Possible performance issue.`);
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB threshold
        console.warn(`⚠️ High memory usage detected in ${componentName}: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
      }
    }

    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime.current;
      
      if (duration > 5000) { // Component was active for more than 5 seconds
        console.log(`📊 ${componentName} was active for ${Math.round(duration / 1000)}s with ${renderCount.current} renders`);
      }
    };
  });

  // Cleanup function (memoized to prevent infinite loops)
  const cleanup = useCallback(() => {
    renderCount.current = 0;
    startTime.current = Date.now();
  }, []);

  return { renderCount: renderCount.current, cleanup };
};