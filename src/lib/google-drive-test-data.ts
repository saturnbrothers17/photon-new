// 🚀 GOOGLE DRIVE-BASED TEST DATA MANAGEMENT
// Replaces localStorage with persistent Google Drive storage
'use client';

import { performanceCache } from './performance-cache';
import { driveDataManager } from './google-drive-data-manager';

// Re-export interfaces from original file
export interface Test {
  id: number;
  name: string;
  type: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived' | 'live';
  students: number;
  date: string;
  time: string;
  duration: string;
  avgScore: string;
  totalQuestions: number;
  maxMarks: number;
  subjects: string[];
  createdDate: string;
  instructions?: string;
  difficulty?: string;
  registeredStudents?: number;
  syllabus?: string;
  isLive?: boolean;
  liveStartTime?: string;
}

export interface Question {
  id: number;
  testId: number;
  subject: string;
  questionNumber: number;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  negativeMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface OngoingTest {
  id: number;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  timeRemaining: string;
  progress: number;
  currentQuestion: number;
  totalQuestions: number;
  subjects: string[];
  status: string;
}

export interface CompletedTest {
  id: number;
  name: string;
  type: string;
  date: string;
  score: number;
  maxMarks: number;
  rank: number;
  percentile: number;
  subjects: string[];
  timeTaken: string;
  accuracy: number;
}

const isBrowser = typeof window !== 'undefined';

// 📊 TEST MANAGEMENT

// Get all tests from Google Drive
export const getAllTests = async (): Promise<Test[]> => {
  if (!isBrowser) return [];
  
  const cacheKey = 'all_tests_drive';
  const cached = performanceCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    await driveDataManager.initialize();
    const tests = await driveDataManager.getTests();
    
    // Cache for 2 minutes
    performanceCache.set(cacheKey, tests, 2 * 60 * 1000);
    console.log(`📊 Loaded ${tests.length} tests from Google Drive`);
    return tests;
  } catch (error) {
    console.error('❌ Error loading tests from Google Drive:', error);
    return [];
  }
};

// Save test to Google Drive
export const saveTest = async (test: Test): Promise<boolean> => {
  if (!isBrowser) return false;
  try {
    await driveDataManager.initialize();
    const success = await driveDataManager.saveTest(test);
    
    if (success) {
      // Update cache
      const tests = await driveDataManager.getTests();
      performanceCache.set('all_tests_drive', tests, 2 * 60 * 1000);
      console.log(`💾 Test "${test.name}" saved to Google Drive`);
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error saving test to Google Drive:', error);
    return false;
  }
};

// Delete test from Google Drive
export const deleteTest = async (testId: number): Promise<boolean> => {
  if (!isBrowser) return false;
  try {
    await driveDataManager.initialize();
    const success = await driveDataManager.deleteTest(testId);
    
    if (success) {
      // Update cache
      const tests = await driveDataManager.getTests();
      performanceCache.set('all_tests_drive', tests, 2 * 60 * 1000);
      console.log(`🗑️ Test ${testId} deleted from Google Drive`);
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error deleting test from Google Drive:', error);
    return false;
  }
};

// Get published tests (available to students)
export const getPublishedTests = async (): Promise<Test[]> => {
  const allTests = await getAllTests();
  return allTests.filter(test => 
    test.status === 'published' || 
    test.status === 'scheduled' || 
    test.status === 'live'
  );
};

// Get draft tests (teacher only)
export const getDraftTests = async (): Promise<Test[]> => {
  const allTests = await getAllTests();
  return allTests.filter(test => test.status === 'draft');
};

// 📝 QUESTION MANAGEMENT

// Get questions for a specific test
export const getTestQuestions = async (testId: number): Promise<Question[]> => {
  if (!isBrowser) return [];
  
  const cacheKey = `test_questions_${testId}`;
  const cached = performanceCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    await driveDataManager.initialize();
    const allData = await driveDataManager.getTests();
    const test = allData.find((t: any) => t.id === testId);
    const questions = test?.questions || [];
    
    // Cache for 5 minutes
    performanceCache.set(cacheKey, questions, 5 * 60 * 1000);
    return questions;
  } catch (error) {
    console.error('❌ Error loading questions from Google Drive:', error);
    return [];
  }
};

// Save questions for a test
export const saveTestQuestions = async (testId: number, questions: Question[]): Promise<boolean> => {
  if (!isBrowser) return false;
  try {
    await driveDataManager.initialize();
    const tests = await driveDataManager.getTests();
    const testIndex = tests.findIndex((t: any) => t.id === testId);
    
    if (testIndex >= 0) {
      tests[testIndex].questions = questions;
      const success = await driveDataManager.saveTest(tests[testIndex]);
      
      if (success) {
        // Clear cache
        performanceCache.set(`test_questions_${testId}`, questions, 5 * 60 * 1000);
        console.log(`💾 Questions for test ${testId} saved to Google Drive`);
      }
      
      return success;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error saving questions to Google Drive:', error);
    return false;
  }
};

// 📈 TEST RESULTS MANAGEMENT

// Save test result
export const saveTestResult = async (result: any): Promise<boolean> => {
  if (!isBrowser) return false;
  try {
    await driveDataManager.initialize();
    const success = await driveDataManager.saveTestResult(result);
    
    if (success) {
      console.log(`📊 Test result saved to Google Drive`);
      // Clear completed tests cache
      performanceCache.set('completed_tests_drive', null, 0);
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error saving test result to Google Drive:', error);
    return false;
  }
};

// Get completed tests
export const getCompletedTests = async (): Promise<CompletedTest[]> => {
  if (!isBrowser) return [];
  
  const cacheKey = 'completed_tests_drive';
  const cached = performanceCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    await driveDataManager.initialize();
    const results = await driveDataManager.getTestResults();
    
    // Convert results to CompletedTest format
    const completedTests: CompletedTest[] = results.map((result: any) => ({
      id: result.testId || result.id,
      name: result.testName || 'Test',
      type: result.testType || 'Mock Test',
      date: new Date(result.submittedAt || result.createdDate).toLocaleDateString(),
      score: result.score || 0,
      maxMarks: result.maxMarks || 100,
      rank: result.rank || Math.floor(Math.random() * 100) + 1,
      percentile: result.percentile || Math.floor(Math.random() * 100),
      subjects: result.subjects || ['Physics', 'Chemistry', 'Mathematics'],
      timeTaken: result.timeTaken || '2h 30m',
      accuracy: result.accuracy || Math.round((result.score / result.maxMarks) * 100)
    }));
    
    // Cache for 5 minutes
    performanceCache.set(cacheKey, completedTests, 5 * 60 * 1000);
    return completedTests;
  } catch (error) {
    console.error('❌ Error loading completed tests from Google Drive:', error);
    return [];
  }
};

// 🔄 ONGOING TESTS (temporary, can use localStorage for session data)
export const getOngoingTests = (): OngoingTest[] => {
  if (!isBrowser) return [];
  try {
    const tests = localStorage.getItem('photon_ongoing_tests');
    return tests ? JSON.parse(tests) : [];
  } catch (error) {
    console.error('Error loading ongoing tests:', error);
    return [];
  }
};

export const saveOngoingTest = (test: OngoingTest): boolean => {
  if (!isBrowser) return false;
  try {
    const existingTests = getOngoingTests();
    const updatedTests = [...existingTests, test];
    localStorage.setItem('photon_ongoing_tests', JSON.stringify(updatedTests));
    return true;
  } catch (error) {
    console.error('Error saving ongoing test:', error);
    return false;
  }
};

// 🔧 UTILITY FUNCTIONS

// Publish a test (make it available to students)
export const publishTest = async (test: Test, questions: Question[]): Promise<boolean> => {
  if (!isBrowser) return false;
  try {
    // Update test status
    const updatedTest = { ...test, status: 'published' as const };
    
    // Save test with questions
    await driveDataManager.initialize();
    updatedTest.questions = questions;
    const success = await driveDataManager.saveTest(updatedTest);
    
    if (success) {
      console.log(`🚀 Test "${test.name}" published to Google Drive`);
      // Clear caches
      performanceCache.set('all_tests_drive', null, 0);
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error publishing test to Google Drive:', error);
    return false;
  }
};

// Initialize Google Drive data manager
export const initializeDataManager = async (): Promise<boolean> => {
  if (!isBrowser) return false;
  try {
    const success = await driveDataManager.initialize();
    if (success) {
      console.log('✅ Google Drive Data Manager initialized');
    }
    return success;
  } catch (error) {
    console.error('❌ Failed to initialize Google Drive Data Manager:', error);
    return false;
  }
};

// Force sync with Google Drive
export const forceSyncWithDrive = async (): Promise<boolean> => {
  if (!isBrowser) return false;
  try {
    await driveDataManager.initialize();
    const success = await driveDataManager.forceSync();
    
    if (success) {
      // Clear all caches to force fresh data
      performanceCache.clear();
      console.log('🔄 Force sync with Google Drive completed');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error during force sync:', error);
    return false;
  }
};

// Get data statistics
export const getDataStats = async () => {
  if (!isBrowser) return null;
  try {
    await driveDataManager.initialize();
    return driveDataManager.getDataStats();
  } catch (error) {
    console.error('❌ Error getting data stats:', error);
    return null;
  }
};

// Backward compatibility - sync functions that return promises
export const getAllTestsSync = (): Test[] => {
  console.warn('⚠️ getAllTestsSync is deprecated. Use getAllTests() instead.');
  return [];
};

export const getPublishedTestsSync = (): Test[] => {
  console.warn('⚠️ getPublishedTestsSync is deprecated. Use getPublishedTests() instead.');
  return [];
};

export const getCompletedTestsSync = (): CompletedTest[] => {
  console.warn('⚠️ getCompletedTestsSync is deprecated. Use getCompletedTests() instead.');
  return [];
};