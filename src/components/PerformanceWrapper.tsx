'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Preload critical resources
export function PerformanceWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Preconnect to external domains
    const preconnectLinks = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    preconnectLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Enable instant page loads with prefetching
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Prefetch visible links
        const links = document.querySelectorAll('a[href^="/"]');
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const link = entry.target as HTMLAnchorElement;
              const href = link.getAttribute('href');
              if (href) {
                // Prefetch the page
                const linkEl = document.createElement('link');
                linkEl.rel = 'prefetch';
                linkEl.href = href;
                document.head.appendChild(linkEl);
                observer.unobserve(link);
              }
            }
          });
        });

        links.forEach(link => observer.observe(link));

        return () => {
          links.forEach(link => observer.unobserve(link));
        };
      });
    }
  }, []);

  return <>{children}</>;
}

// Lazy load heavy components
export const LazyStudyMaterialsViewer = dynamic(
  () => import('@/components/student-corner/StudyMaterialsViewer'),
  { 
    loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />,
    ssr: false 
  }
);

export const LazyPowerfulQuestionExtractor = dynamic(
  () => import('@/components/teacher-dashboard/PowerfulQuestionExtractor'),
  { 
    loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />,
    ssr: false 
  }
);

// Resource hints for critical assets
export function ResourceHints() {
  return (
    <>
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </>
  );
}
