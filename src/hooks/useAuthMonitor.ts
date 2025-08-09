'use client';

import { useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAuthMonitor() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      router.push('/faculty-portal');
      toast.info('You have been logged out for security');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [supabase, router]);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let isTabActive = true;

    // Auto-logout after 15 minutes of inactivity
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (isTabActive) {
          handleLogout();
        }
      }, 15 * 60 * 1000); // 15 minutes
    };

    // Monitor user activity
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Monitor tab visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabActive = false;
        // Log out immediately when tab becomes hidden
        handleLogout();
      } else {
        isTabActive = true;
        resetInactivityTimer();
      }
    };

    // Monitor page unload (browser/tab close)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Attempt to sign out when closing
      navigator.sendBeacon('/api/auth/logout', '');
      handleLogout();
    };

    // Monitor browser/tab close
    const handleUnload = () => {
      navigator.sendBeacon('/api/auth/logout', '');
    };

    // Add event listeners
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keypress', handleActivity);
    document.addEventListener('click', handleActivity);
    document.addEventListener('scroll', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    // Start inactivity timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keypress', handleActivity);
      document.removeEventListener('click', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [handleLogout]);

  return { handleLogout };
}
