import { track } from '@vercel/analytics';

// Custom analytics events for PHOTON coaching platform
export const analytics = {
  // Student events
  student: {
    testStarted: (testId: string, testName: string) => {
      track('test_started', {
        test_id: testId,
        test_name: testName,
        user_type: 'student'
      });
    },
    
    testCompleted: (testId: string, testName: string, score: number, duration: number) => {
      track('test_completed', {
        test_id: testId,
        test_name: testName,
        score: score,
        duration_minutes: duration,
        user_type: 'student'
      });
    },
    
    materialViewed: (materialId: string, materialName: string, subject: string) => {
      track('material_viewed', {
        material_id: materialId,
        material_name: materialName,
        subject: subject,
        user_type: 'student'
      });
    },
    
    questionSolved: (subject: string, difficulty: string, isCorrect: boolean) => {
      track('question_solved', {
        subject: subject,
        difficulty: difficulty,
        is_correct: isCorrect,
        user_type: 'student'
      });
    },
    
    aiHelpUsed: (questionType: string, subject: string) => {
      track('ai_help_used', {
        question_type: questionType,
        subject: subject,
        user_type: 'student'
      });
    }
  },

  // Teacher events
  teacher: {
    testCreated: (testName: string, subject: string, questionCount: number) => {
      track('test_created', {
        test_name: testName,
        subject: subject,
        question_count: questionCount,
        user_type: 'teacher'
      });
    },
    
    materialUploaded: (materialName: string, subject: string, fileSize: number) => {
      track('material_uploaded', {
        material_name: materialName,
        subject: subject,
        file_size_mb: Math.round(fileSize / (1024 * 1024)),
        user_type: 'teacher'
      });
    },
    
    dashboardViewed: (section: string) => {
      track('dashboard_viewed', {
        section: section,
        user_type: 'teacher'
      });
    },
    
    studentResultsViewed: (testId: string) => {
      track('student_results_viewed', {
        test_id: testId,
        user_type: 'teacher'
      });
    },
    
    aiExtractionUsed: (documentType: string, questionsExtracted: number) => {
      track('ai_extraction_used', {
        document_type: documentType,
        questions_extracted: questionsExtracted,
        user_type: 'teacher'
      });
    }
  },

  // General platform events
  platform: {
    pageView: (pageName: string, userType?: string) => {
      track('page_view', {
        page_name: pageName,
        user_type: userType || 'anonymous'
      });
    },
    
    searchPerformed: (query: string, results: number, userType: string) => {
      track('search_performed', {
        query: query,
        results_count: results,
        user_type: userType
      });
    },
    
    errorOccurred: (errorType: string, errorMessage: string, page: string) => {
      track('error_occurred', {
        error_type: errorType,
        error_message: errorMessage,
        page: page
      });
    },
    
    featureUsed: (featureName: string, userType: string) => {
      track('feature_used', {
        feature_name: featureName,
        user_type: userType
      });
    }
  },

  // Performance tracking
  performance: {
    slowPageLoad: (pageName: string, loadTime: number) => {
      track('slow_page_load', {
        page_name: pageName,
        load_time_ms: loadTime
      });
    },
    
    apiError: (endpoint: string, errorCode: number, errorMessage: string) => {
      track('api_error', {
        endpoint: endpoint,
        error_code: errorCode,
        error_message: errorMessage
      });
    }
  }
};

// Utility function to track page views automatically
export const trackPageView = (pageName: string, userType?: string) => {
  analytics.platform.pageView(pageName, userType);
};

// Utility function to track errors
export const trackError = (error: Error, context: string) => {
  analytics.platform.errorOccurred(
    error.name,
    error.message,
    context
  );
};