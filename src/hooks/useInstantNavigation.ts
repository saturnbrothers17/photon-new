'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useInstantNavigation() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch all internal links immediately on mount
    const prefetchAllLinks = () => {
      const links = document.querySelectorAll('a[href^="/"]');
      const uniqueHrefs = new Set<string>();
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !uniqueHrefs.has(href)) {
          uniqueHrefs.add(href);
          router.prefetch(href);
        }
      });
    };

    // Prefetch on hover with zero delay
    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/"]');
      
      if (link) {
        const href = link.getAttribute('href');
        if (href) {
          router.prefetch(href);
        }
      }
    };

    // Prefetch on focus for keyboard navigation
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && href.startsWith('/')) {
          router.prefetch(href);
        }
      }
    };

    // Add event listeners with capture phase for maximum speed
    document.addEventListener('mouseover', handleHover, true);
    document.addEventListener('focus', handleFocus, true);
    
    // Initial prefetch after a tiny delay
    const timeoutId = setTimeout(prefetchAllLinks, 10);

    // Re-run prefetch when DOM changes (for dynamically added links)
    const observer = new MutationObserver(() => {
      prefetchAllLinks();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      document.removeEventListener('mouseover', handleHover, true);
      document.removeEventListener('focus', handleFocus, true);
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [router]);
}
