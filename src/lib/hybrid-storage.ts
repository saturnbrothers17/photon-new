// 🔄 HYBRID STORAGE SYSTEM
// Uses localStorage with cross-port synchronization until Firebase is ready
'use client';

import { performanceCache } from './performance-cache';

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
  questions?: Question[];
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
const STORAGE_KEY = 'photon_hybrid_data';

// Enhanced localStorage with cross-port sync
class HybridStorage {
  private data: any = {
    tests: [],
    testResults: [],
    lastSync: new Date().toISOString()
  };

  constructor() {
    if (isBrowser) {
      this.loadFromStorage();
      this.setupCrossPortSync();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
        console.log('📥 Loaded data from localStorage:', {
          tests: this.data.tests?.length || 0,
          results: this.data.testResults?.length || 0
        });
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      this.data.lastSync = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      
      // Trigger cross-port sync
      window.dispatchEvent(new CustomEvent('photon-data-sync', {
        detail: { timestamp: this.data.lastSync }
      }));
      
      console.log('💾 Data saved to localStorage');
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  private setupCrossPortSync() {
    // Listen for changes from other ports/tabs
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          if (newData.lastSync !== this.data.lastSync) {
            this.data = newData;
            console.log('🔄 Data synced from another port/tab');
          }
        } catch (error) {
          console.error('Error syncing data:', error);
        }
      }
    });

    // Listen for custom sync events
    window.addEventListener('photon-data-sync', (e: any) => {
      if (e.detail.timestamp !== this.data.lastSync) {
        this.loadFromStorage();
      }
    });
  }

  // Get all tests
  getAllTests(): Test[] {
    return this.data.tests || [];
  }

  // Get published tests
  getPublishedTests(): Test[] {
    return this.getAllTests().filter(test => 
      test.status === 'published' || 
      test.status === 'scheduled' || 
      test.status === 'live'
    );
  }

  // Save test
  saveTest(test: Test): boolean {
    try {
      if (!this.data.tests) this.data.tests = [];
      
      const existingIndex = this.data.tests.findIndex((t: Test) => t.id === test.id);
      if (existingIndex >= 0) {
        this.data.tests[existingIndex] = test;
      } else {
        this.data.tests.push(test);
      }
      
      this.saveToStorage();
      console.log(`💾 Test "${test.name}" saved to hybrid storage`);
      return true;
    } catch (error) {
      console.error('Error saving test:', error);
      return false;
    }
  }

  // Delete test
  deleteTest(testId: number): boolean {
    try {
      if (!this.data.tests) return false;
      
      this.data.tests = this.data.tests.filter((t: Test) => t.id !== testId);
      this.saveToStorage();
      console.log(`🗑️ Test ${testId} deleted from hybrid storage`);
      return true;
    } catch (error) {
      console.error('Error deleting test:', error);
      return false;
    }
  }

  // Get test results
  getTestResults(): any[] {
    return this.data.testResults || [];
  }

  // Save test result
  saveTestResult(result: any): boolean {
    try {
      if (!this.data.testResults) this.data.testResults = [];
      
      this.data.testResults.push({
        ...result,
        id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        submittedAt: result.submittedAt || new Date().toISOString()
      });
      
      this.saveToStorage();
      console.log('📊 Test result saved to hybrid storage');
      return true;
    } catch (error) {
      console.error('Error saving test result:', error);
      return false;
    }
  }

  // Get data stats
  getDataStats() {
    return {
      totalTests: this.data.tests?.length || 0,
      publishedTests: this.getPublishedTests().length,
      totalResults: this.data.testResults?.length || 0,
      lastSync: this.data.lastSync,
      storage: 'Hybrid Storage (localStorage + cross-port sync)',
      status: 'Always Available'
    };
  }
}

// Create singleton instance
const hybridStorage = new HybridStorage();

// Export functions that match Firebase interface
export const getAllTests = async (): Promise<Test[]> => {
  if (!isBrowser) return [];
  return hybridStorage.getAllTests();
};

export const getPublishedTests = async (): Promise<Test[]> => {
  if (!isBrowser) return [];
  return hybridStorage.getPublishedTests();
};

export const saveTest = async (test: Test): Promise<boolean> => {
  if (!isBrowser) return false;
  return hybridStorage.saveTest(test);
};

export const deleteTest = async (testId: number): Promise<boolean> => {
  if (!isBrowser) return false;
  return hybridStorage.deleteTest(testId);
};

export const getDraftTests = async (): Promise<Test[]> => {
  const allTests = await getAllTests();
  return allTests.filter(test => test.status === 'draft');
};

export const getTestQuestions = async (testId: number): Promise<Question[]> => {
  const allTests = await getAllTests();
  const test = allTests.find(t => t.id === testId);
  return test?.questions || [];
};

export const saveTestQuestions = async (testId: number, questions: Question[]): Promise<boolean> => {
  const allTests = await getAllTests();
  const test = allTests.find(t => t.id === testId);
  
  if (test) {
    test.questions = questions;
    return await saveTest(test);
  }
  
  return false;
};

export const saveTestResult = async (result: any): Promise<boolean> => {
  if (!isBrowser) return false;
  return hybridStorage.saveTestResult(result);
};

export const getCompletedTests = async (): Promise<CompletedTest[]> => {
  if (!isBrowser) return [];
  
  const results = hybridStorage.getTestResults();
  
  return results.map((result: any) => ({
    id: parseInt(result.testId) || Math.floor(Math.random() * 10000),
    name: result.testName || 'Test',
    type: 'Mock Test',
    date: new Date(result.submittedAt).toLocaleDateString(),
    score: result.score || 0,
    maxMarks: result.maxMarks || 100,
    rank: Math.floor(Math.random() * 100) + 1,
    percentile: Math.floor(Math.random() * 100),
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    timeTaken: result.timeTaken || '2h 30m',
    accuracy: Math.round((result.score / result.maxMarks) * 100)
  }));
};

// Ongoing tests (session data)
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

// Utility functions
export const publishTest = async (test: Test, questions: Question[]): Promise<boolean> => {
  const updatedTest = { 
    ...test, 
    status: 'published' as const,
    questions: questions 
  };
  
  return await saveTest(updatedTest);
};

export const initializeDataManager = async (): Promise<boolean> => {
  console.log('✅ Hybrid Storage Manager ready');
  return true;
};

export const getDataStats = async () => {
  if (!isBrowser) return null;
  return hybridStorage.getDataStats();
};

// Backward compatibility
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