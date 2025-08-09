// Cloud-based test storage system for cross-device access
export class CloudTestStorage {
  private isInitialized = false;
  private cloudAvailable = false;

  constructor() {
    this.initializeIfPossible();
  }

  private initializeIfPossible() {
    if (typeof window !== 'undefined') {
      const tokens = localStorage.getItem('googleDriveTokens');
      if (tokens) {
        try {
          this.isInitialized = true;
          this.cloudAvailable = true;
          console.log('✅ Cloud test storage initialized');
        } catch (error) {
          console.error('❌ Failed to initialize cloud storage:', error);
          this.cloudAvailable = false;
        }
      }
    }
  }

  // Check if cloud storage is available
  isCloudAvailable(): boolean {
    return this.cloudAvailable;
  }

  // Publish test (saves to local storage)
  async publishTestToCloud(testData: any, questions: any[]): Promise<string> {
    try {
      console.log('📤 Saving test:', testData.name);

      // Create test package
      const testPackage = {
        ...testData,
        questions: questions,
        publishedAt: new Date().toISOString(),
        publishedBy: 'PHOTON Faculty',
        version: '1.0',
        cloudId: `local_${Date.now()}`,
        accessLevel: 'student',
        metadata: {
          totalQuestions: questions.length,
          subjects: testData.subjects || [],
          estimatedDuration: testData.duration,
          maxMarks: testData.maxMarks || questions.reduce((sum, q) => sum + (q.marks || 1), 0)
        }
      };
      
      // Save to localStorage
      this.saveToLocalStorage(testPackage);
      
      console.log('✅ Test saved with ID:', testPackage.cloudId);
      return testPackage.cloudId;
    } catch (error) {
      console.error('❌ Failed to save test:', error);
      throw error;
    }
  }

  // Get all published tests from local storage
  async getPublishedTestsFromCloud(): Promise<any[]> {
    console.log('📥 Fetching tests from local storage...');
    const localTests = this.getLocalTests();
    console.log(`✅ Found ${localTests.length} tests in local storage`);
    return localTests;
  }

  // Download specific test data from local storage
  async downloadTestFromCloud(cloudId: string): Promise<any> {
    try {
      console.log('📥 Loading test from local storage:', cloudId);
      
      const tests = this.getLocalTests();
      const testData = tests.find(test => test.cloudId === cloudId);
      
      if (!testData) {
        throw new Error(`Test with ID ${cloudId} not found`);
      }
      
      console.log('✅ Test loaded from local storage');
      return testData;
    } catch (error) {
      console.error('❌ Failed to load test from local storage:', error);
      throw error;
    }
  }

  // Sync is a no-op in local storage mode
  async syncTests(): Promise<{ uploaded: number; downloaded: number }> {
    console.log('ℹ️ Sync not required in local storage mode');
    return { uploaded: 0, downloaded: 0 };
  }

  // Helper methods
  private getLocalTests(): any[] {
    try {
      const testsData = localStorage.getItem('tests');
      if (testsData) {
        const tests = JSON.parse(testsData);
        return tests.filter((test: any) => test.status === 'published' || test.status === 'scheduled' || test.status === 'live');
      }
    } catch (error) {
      console.error('Error reading local tests:', error);
    }
    return [];
  }

  private saveToLocalStorage(testData: any) {
    try {
      const existingTests = localStorage.getItem('tests');
      const tests = existingTests ? JSON.parse(existingTests) : [];
      
      // Check if test already exists
      const existingIndex = tests.findIndex((t: any) => t.id === testData.id || t.cloudId === testData.cloudId);
      
      if (existingIndex >= 0) {
        // Update existing test
        tests[existingIndex] = testData;
      } else {
        // Add new test
        tests.push(testData);
      }
      
      localStorage.setItem('tests', JSON.stringify(tests));
    } catch (error) {
      console.error('Error saving test to localStorage:', error);
    }
  }
  
  private isTestInLocalStorage(cloudId: string): boolean {
    try {
      const tests = this.getLocalTests();
      return tests.some((test: any) => test.cloudId === cloudId);
    } catch (error) {
      console.error('Error checking test in localStorage:', error);
      return false;
    }
  }


}

// Singleton instance
export const cloudTestStorage = new CloudTestStorage();