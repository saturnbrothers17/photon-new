// 🚀 COMPREHENSIVE GOOGLE DRIVE DATA MANAGER
// Replaces localStorage with persistent Google Drive storage
'use client';

export interface DriveDataStructure {
  tests: any[];
  testResults: any[];
  studyMaterials: any[];
  studentProgress: any[];
  userSettings: any;
  lastSync: string;
  version: string;
}

export class GoogleDriveDataManager {
  private static instance: GoogleDriveDataManager;
  private isInitialized = false;
  private dataCache: DriveDataStructure | null = null;
  private readonly DATA_FILE_NAME = 'photon_coaching_data.json';
  private readonly BACKUP_FILE_NAME = 'photon_coaching_backup.json';

  private constructor() {}

  static getInstance(): GoogleDriveDataManager {
    if (!GoogleDriveDataManager.instance) {
      GoogleDriveDataManager.instance = new GoogleDriveDataManager();
    }
    return GoogleDriveDataManager.instance;
  }

  // 🔄 Initialize and load all data from Google Drive
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('🚀 Initializing Google Drive Data Manager...');
      
      // Load data from Google Drive
      await this.loadAllDataFromDrive();
      
      this.isInitialized = true;
      console.log('✅ Google Drive Data Manager initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive Data Manager:', error);
      // Initialize with empty data structure
      this.dataCache = this.createEmptyDataStructure();
      return false;
    }
  }

  // 📥 Load all data from Google Drive (OAuth)
  private async loadAllDataFromDrive(): Promise<void> {
    try {
      const response = await fetch('/api/drive/oauth/data/load', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          this.dataCache = result.data;
          console.log('📥 Data loaded from Google Drive:', Object.keys(result.data));
        } else {
          console.log('📝 No existing data found, creating new structure');
          this.dataCache = this.createEmptyDataStructure();
        }
      } else {
        console.log('📝 Failed to load data, creating new structure');
        this.dataCache = this.createEmptyDataStructure();
      }
    } catch (error) {
      console.log('📝 Error loading data, creating new structure:', error.message);
      this.dataCache = this.createEmptyDataStructure();
    }
  }

  // 💾 Save all data to Google Drive
  private async saveAllDataToDrive(): Promise<boolean> {
    if (!this.dataCache) return false;

    try {
      // Update sync timestamp
      this.dataCache.lastSync = new Date().toISOString();

      const response = await fetch('/api/drive/oauth/data/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: this.dataCache,
          fileName: this.DATA_FILE_NAME
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('💾 Data saved to Google Drive successfully');
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to save data to Google Drive:', error);
      return false;
    }
  }

  // 🏗️ Create empty data structure
  private createEmptyDataStructure(): DriveDataStructure {
    return {
      tests: [],
      testResults: [],
      studyMaterials: [],
      studentProgress: [],
      userSettings: {},
      lastSync: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // 📊 TEST MANAGEMENT
  async getTests(): Promise<any[]> {
    await this.ensureInitialized();
    return this.dataCache?.tests || [];
  }

  async saveTest(test: any): Promise<boolean> {
    await this.ensureInitialized();
    if (!this.dataCache) return false;

    // Add or update test
    const existingIndex = this.dataCache.tests.findIndex(t => t.id === test.id);
    if (existingIndex >= 0) {
      this.dataCache.tests[existingIndex] = test;
    } else {
      this.dataCache.tests.push(test);
    }

    return await this.saveAllDataToDrive();
  }

  async deleteTest(testId: number): Promise<boolean> {
    await this.ensureInitialized();
    if (!this.dataCache) return false;

    this.dataCache.tests = this.dataCache.tests.filter(t => t.id !== testId);
    return await this.saveAllDataToDrive();
  }

  // 📈 TEST RESULTS MANAGEMENT
  async getTestResults(): Promise<any[]> {
    await this.ensureInitialized();
    return this.dataCache?.testResults || [];
  }

  async saveTestResult(result: any): Promise<boolean> {
    await this.ensureInitialized();
    if (!this.dataCache) return false;

    // Add timestamp if not present
    if (!result.submittedAt) {
      result.submittedAt = new Date().toISOString();
    }

    this.dataCache.testResults.push(result);
    return await this.saveAllDataToDrive();
  }

  // 📚 STUDY MATERIALS MANAGEMENT
  async getStudyMaterials(): Promise<any[]> {
    await this.ensureInitialized();
    return this.dataCache?.studyMaterials || [];
  }

  async saveStudyMaterial(material: any): Promise<boolean> {
    await this.ensureInitialized();
    if (!this.dataCache) return false;

    const existingIndex = this.dataCache.studyMaterials.findIndex(m => m.id === material.id);
    if (existingIndex >= 0) {
      this.dataCache.studyMaterials[existingIndex] = material;
    } else {
      this.dataCache.studyMaterials.push(material);
    }

    return await this.saveAllDataToDrive();
  }

  // 📊 STUDENT PROGRESS MANAGEMENT
  async getStudentProgress(): Promise<any[]> {
    await this.ensureInitialized();
    return this.dataCache?.studentProgress || [];
  }

  async saveStudentProgress(progress: any): Promise<boolean> {
    await this.ensureInitialized();
    if (!this.dataCache) return false;

    const existingIndex = this.dataCache.studentProgress.findIndex(p => p.studentId === progress.studentId);
    if (existingIndex >= 0) {
      this.dataCache.studentProgress[existingIndex] = progress;
    } else {
      this.dataCache.studentProgress.push(progress);
    }

    return await this.saveAllDataToDrive();
  }

  // ⚙️ USER SETTINGS MANAGEMENT
  async getUserSettings(): Promise<any> {
    await this.ensureInitialized();
    return this.dataCache?.userSettings || {};
  }

  async saveUserSettings(settings: any): Promise<boolean> {
    await this.ensureInitialized();
    if (!this.dataCache) return false;

    this.dataCache.userSettings = { ...this.dataCache.userSettings, ...settings };
    return await this.saveAllDataToDrive();
  }

  // 🔄 SYNC AND BACKUP
  async forceSync(): Promise<boolean> {
    console.log('🔄 Force syncing with Google Drive...');
    await this.loadAllDataFromDrive();
    return await this.saveAllDataToDrive();
  }

  async createBackup(): Promise<boolean> {
    if (!this.dataCache) return false;

    try {
      const backupData = {
        ...this.dataCache,
        backupCreatedAt: new Date().toISOString()
      };

      const response = await fetch('/api/drive/data/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: backupData,
          fileName: this.BACKUP_FILE_NAME
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
      return false;
    }
  }

  // 📊 DATA STATISTICS
  getDataStats(): any {
    if (!this.dataCache) return null;

    return {
      totalTests: this.dataCache.tests.length,
      totalResults: this.dataCache.testResults.length,
      totalMaterials: this.dataCache.studyMaterials.length,
      lastSync: this.dataCache.lastSync,
      version: this.dataCache.version
    };
  }

  // 🔧 UTILITY METHODS
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // 🧹 CLEANUP AND MAINTENANCE
  async cleanup(): Promise<void> {
    // Remove old test results (older than 6 months)
    if (this.dataCache?.testResults) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      this.dataCache.testResults = this.dataCache.testResults.filter(result => {
        const resultDate = new Date(result.submittedAt || result.createdDate);
        return resultDate > sixMonthsAgo;
      });

      await this.saveAllDataToDrive();
    }
  }
}

// Export singleton instance
export const driveDataManager = GoogleDriveDataManager.getInstance();