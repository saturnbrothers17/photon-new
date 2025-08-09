'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { performanceCache } from '@/lib/performance-cache';

// Preload common routes and data for faster navigation
export default function NavigationOptimizer() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Extended list of routes to preload
    const commonRoutes = [
      '/',
      '/about',
      '/courses',
      '/faculty',
      '/fees',
      '/student-corner',
      '/student-corner/mock-tests',
      '/student-corner/mock-tests/take-test',
      '/teacher-dashboard',
      '/teacher-dashboard/create-test',
      '/teacher-dashboard/manage-tests',
      '/testimonials',
      '/contact'
    ];

    // Aggressive prefetching - start immediately
    const preloadRoutes = () => {
      // Prefetch all routes immediately for instant navigation
      commonRoutes.forEach(route => {
        router.prefetch(route);
      });

      // Also prefetch adjacent routes based on current path
      const currentIndex = commonRoutes.indexOf(pathname);
      if (currentIndex !== -1) {
        // Prefetch next and previous routes with higher priority
        if (currentIndex > 0) {
          router.prefetch(commonRoutes[currentIndex - 1]);
        }
        if (currentIndex < commonRoutes.length - 1) {
          router.prefetch(commonRoutes[currentIndex + 1]);
        }
      }
    };

    // Start prefetching immediately
    preloadRoutes();

    // Preload and cache common data
    const preloadData = async () => {
      try {
        // Cache test data with longer TTL
        const testsData = localStorage.getItem('tests');
        if (testsData) {
          const tests = JSON.parse(testsData);
          performanceCache.set('all_tests', tests, 5 * 60 * 1000); // 5 minute cache
        }

        // Cache user data
        const userData = localStorage.getItem('user');
        if (userData) {
          performanceCache.set('user_data', JSON.parse(userData), 5 * 60 * 1000);
        }

        // Cache results data
        const resultsData = localStorage.getItem('testResults');
        if (resultsData) {
          performanceCache.set('test_results', JSON.parse(resultsData), 5 * 60 * 1000);
        }

        // Preload images for faster rendering
        const preloadImages = [
          '/favicon.png',
          '/logo.png',
          // Add other common images here
        ];

        preloadImages.forEach(src => {
          const img = new Image();
          img.src = src;
        });

      } catch (error) {
        console.error('Error preloading data:', error);
      }
    };

    // Start data preloading immediately
    preloadData();

    // Setup intersection observer for link prefetching
    const setupLinkObserver = () => {
      const links = document.querySelectorAll('a[href^="/"]');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            const href = link.getAttribute('href');
            if (href) {
              router.prefetch(href);
            }
          }
        });
      }, {
        rootMargin: '50px' // Start prefetching when link is 50px away from viewport
      });

      links.forEach(link => observer.observe(link));

      return () => {
        links.forEach(link => observer.unobserve(link));
      };
    };

    // Setup link observer after a short delay
    const observerCleanup = setTimeout(() => {
      setupLinkObserver();
    }, 100);

    // Cleanup cache periodically
    const cleanupInterval = setInterval(() => {
      performanceCache.cleanup();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      clearInterval(cleanupInterval);
      clearTimeout(observerCleanup);
    };
  }, [router, pathname]);

  return null; // This component doesn't render anything
}