import { GoogleDriveAutoSync } from './google-drive-auto-sync';

// Cloud-based test storage system for cross-device access
export class CloudTestStorage {
  private autoSync: GoogleDriveAutoSync | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeIfPossible();
  }

  private initializeIfPossible() {
    if (typeof window !== 'undefined') {
      const tokens = localStorage.getItem('googleDriveTokens');
      if (tokens) {
        try {
          this.autoSync = new GoogleDriveAutoSync(JSON.parse(tokens));
          this.isInitialized = true;
          console.log('✅ Cloud test storage initialized');
        } catch (error) {
          console.error('❌ Failed to initialize cloud storage:', error);
        }
      }
    }
  }

  // Check if cloud storage is available
  isCloudAvailable(): boolean {
    return this.isInitialized && this.autoSync !== null;
  }

  // Publish test to cloud (called by teachers)
  async publishTestToCloud(testData: any, questions: any[]): Promise<string> {
    if (!this.autoSync) {
      throw new Error('Cloud storage not initialized. Please connect to Google Drive first.');
    }

    try {
      console.log('📤 Publishing test to cloud:', testData.name);

      // Create comprehensive test package
      const testPackage = {
        ...testData,
        questions: questions,
        publishedAt: new Date().toISOString(),
        publishedBy: 'PHOTON Faculty',
        version: '1.0',
        cloudId: `test_${testData.id}_${Date.now()}`,
        accessLevel: 'student',
        metadata: {
          totalQuestions: questions.length,
          subjects: testData.subjects || [],
          estimatedDuration: testData.duration,
          maxMarks: testData.maxMarks || questions.reduce((sum, q) => sum + (q.marks || 1), 0)
        }
      };

      // Upload to Google Drive
      const fileId = await this.autoSync.uploadTest(testPackage);
      
      // Also save to localStorage for local access
      this.saveToLocalStorage(testPackage);
      
      console.log('✅ Test published to cloud with ID:', fileId);
      return fileId;
    } catch (error) {
      console.error('❌ Failed to publish test to cloud:', error);
      throw error;
    }
  }

  // Get all published tests from cloud (called by students)
  async getPublishedTestsFromCloud(): Promise<any[]> {
    if (!this.autoSync) {
      console.log('⚠️ Cloud storage not available, using local storage');
      return this.getLocalTests();
    }

    try {
      console.log('📥 Fetching tests from cloud...');

      // Get test files from Google Drive
      const testFiles = await this.autoSync.listFolderContents(['PHOTON Coaching Institute', 'PHOTON Tests']);
      
      const tests = [];
      for (const file of testFiles) {
        try {
          // For now, we'll use the file metadata
          // In a full implementation, you'd download and parse each file
          const testData = {
            id: file.id,
            name: file.name.replace('.json', '').replace(/test_\d+_\d+/, ''),
            cloudId: file.id,
            createdTime: file.createdTime,
            modifiedTime: file.modifiedTime,
            size: file.size,
            status: 'published',
            type: this.extractTestType(file.name),
            isCloudTest: true
          };
          tests.push(testData);
        } catch (error) {
          console.error('Error processing test file:', file.name, error);
        }
      }

      console.log(`✅ Found ${tests.length} tests in cloud`);
      
      // Merge with local tests
      const localTests = this.getLocalTests();
      const allTests = [...tests, ...localTests];
      
      return allTests;
    } catch (error) {
      console.error('❌ Failed to fetch tests from cloud:', error);
      // Fallback to local storage
      return this.getLocalTests();
    }
  }

  // Download specific test data from cloud
  async downloadTestFromCloud(cloudId: string): Promise<any> {
    if (!this.autoSync) {
      throw new Error('Cloud storage not available');
    }

    try {
      console.log('📥 Downloading test from cloud:', cloudId);
      
      // This would download the actual test file content
      // For now, we'll return a placeholder
      const testData = await this.autoSync.loadTest(cloudId);
      
      console.log('✅ Test downloaded from cloud');
      return testData;
    } catch (error) {
      console.error('❌ Failed to download test from cloud:', error);
      throw error;
    }
  }

  // Sync tests between local and cloud
  async syncTests(): Promise<{ uploaded: number; downloaded: number }> {
    if (!this.autoSync) {
      throw new Error('Cloud storage not available');
    }

    try {
      console.log('🔄 Syncing tests between local and cloud...');

      let uploaded = 0;
      let downloaded = 0;

      // Upload local tests that aren't in cloud
      const localTests = this.getLocalTests();
      for (const test of localTests) {
        if (!test.cloudId) {
          try {
            await this.publishTestToCloud(test, test.questions || []);
            uploaded++;
          } catch (error) {
            console.error('Failed to upload test:', test.name, error);
          }
        }
      }

      // Download cloud tests that aren't local
      const cloudTests = await this.getPublishedTestsFromCloud();
      for (const test of cloudTests) {
        if (test.isCloudTest && !this.isTestInLocalStorage(test.cloudId)) {
          try {
            const fullTestData = await this.downloadTestFromCloud(test.cloudId);
            this.saveToLocalStorage(fullTestData);
            downloaded++;
          } catch (error) {
            console.error('Failed to download test:', test.name, error);
          }
        }
      }

      console.log(`✅ Sync complete: ${uploaded} uploaded, ${downloaded} downloaded`);
      return { uploaded, downloaded };
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
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
        tests[existingIndex] = testData;
      } else {
        tests.push(testData);
      }
      
      localStorage.setItem('tests', JSON.stringify(tests));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private isTestInLocalStorage(cloudId: string): boolean {
    const localTests = this.getLocalTests();
    return localTests.some(test => test.cloudId === cloudId);
  }

  private extractTestType(filename: string): string {
    if (filename.includes('jee_main')) return 'JEE Main';
    if (filename.includes('jee_advanced')) return 'JEE Advanced';
    if (filename.includes('neet')) return 'NEET';
    if (filename.includes('chapter')) return 'Chapter Test';
    return 'Mock Test';
  }
}

// Singleton instance
export const cloudTestStorage = new CloudTestStorage();