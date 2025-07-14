"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { AnimatePresence, motion } from 'framer-motion'; // Corrected import for motion and AnimatePresence

const PageLoader = () => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false); // State to control custom animation visibility

  const handleStart = () => {
    NProgress.start();
    setIsLoading(true); // Show custom animation when NProgress starts
  };

  const handleComplete = () => {
    NProgress.done();
    // Ensure the loader stays for a minimum duration if content loads too fast
    setTimeout(() => {
      setIsLoading(false); // Hide custom animation when NProgress completes
    }, 300); // Minimum display time for the loader
  };

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    // On initial load or pathname change
    handleStart();
    // Simulate content loading time or wait for actual data fetching completion
    // For now, we'll use a timeout to simulate completion
    const timer = setTimeout(() => {
      handleComplete();
    }, 500); // Adjust this value as needed for perceived loading time

    return () => {
      clearTimeout(timer);
      handleComplete(); // Clean up on unmount or component re-render
    };
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm"
        >
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* PHOTON Logo Placeholder - Replace with actual SVG/Image */}
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 22H22L12 2Z" fill="#3B82F6"/> {/* Blue triangle for P */}
              <text x="8" y="18" font-family="Arial" font-size="12" fill="white" font-weight="bold">P</text>
            </svg>

            {/* Yellow Circular Wave Animation */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-400 border-r-yellow-400"
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 1.5,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;

// CustomLoadingAnimation is now integrated directly into PageLoader
// so it's no longer a separate export. The previous CustomLoadingAnimation
// component is now the content rendered when isLoading is true within PageLoader.
