import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics, trackPageView } from '@/lib/analytics';

// Hook to automatically track page views
export const usePageTracking = (userType?: string) => {
  const pathname = usePathname();

  useEffect(() => {
    // Extract page name from pathname
    const pageName = pathname === '/' ? 'home' : pathname.slice(1).replace(/\//g, '_');
    trackPageView(pageName, userType);
  }, [pathname, userType]);
};

// Hook to provide analytics functions
export const useAnalytics = () => {
  return {
    // Student analytics
    trackTestStart: analytics.student.testStarted,
    trackTestComplete: analytics.student.testCompleted,
    trackMaterialView: analytics.student.materialViewed,
    trackQuestionSolved: analytics.student.questionSolved,
    trackAiHelp: analytics.student.aiHelpUsed,

    // Teacher analytics
    trackTestCreation: analytics.teacher.testCreated,
    trackMaterialUpload: analytics.teacher.materialUploaded,
    trackDashboardView: analytics.teacher.dashboardViewed,
    trackResultsView: analytics.teacher.studentResultsViewed,
    trackAiExtraction: analytics.teacher.aiExtractionUsed,

    // Platform analytics
    trackSearch: analytics.platform.searchPerformed,
    trackFeatureUse: analytics.platform.featureUsed,
    trackError: analytics.platform.errorOccurred,

    // Performance analytics
    trackSlowLoad: analytics.performance.slowPageLoad,
    trackApiError: analytics.performance.apiError
  };
};