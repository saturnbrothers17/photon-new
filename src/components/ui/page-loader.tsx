"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import '@/styles/nprogress.css';

const PageLoader = () => {
  const pathname = usePathname();
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    // Configure NProgress for instant feedback
    NProgress.configure({ 
      showSpinner: false,
      speed: 20, // Even faster
      minimum: 0.9, // Start at 90% for near-instant completion
      trickleSpeed: 800, // Super fast trickle
      easing: 'linear',
    });

    // Skip on first load
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    // Instant progress bar
    NProgress.start();
    NProgress.done();

  }, [pathname]);

  // No blocking UI - navigation is instant
  return null;
};

export default PageLoader;
