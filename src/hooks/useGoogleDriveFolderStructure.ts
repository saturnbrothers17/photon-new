import { useState, useEffect, useCallback } from 'react';
import { GoogleDriveFolderManager, FolderStructure } from '@/lib/google-drive-folder-manager';

interface UseGoogleDriveFoldersReturn {
  folderManager: GoogleDriveFolderManager | null;
  isLoading: boolean;
  error: string | null;
  folderStructure: any;
  saveTestResult: (testResult: any, studentId?: string) => Promise<any>;
  loadTestResults: (testId: string, studentId?: string) => Promise<any[]>;
  getStudentFolderPath: (studentId: string) => Promise<string[]>;
  createBackup: () => Promise<string>;
  ensureFolderStructure: () => Promise<void>;
}

export function useGoogleDriveFolderStructure(): UseGoogleDriveFoldersReturn {
  const [folderManager, setFolderManager] = useState<GoogleDriveFolderManager | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folderStructure, setFolderStructure] = useState<any>(null);

  useEffect(() => {
    const manager = new GoogleDriveFolderManager();
    setFolderManager(manager);
  }, []);

  const ensureFolderStructure = useCallback(async () => {
    if (!folderManager) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const structure = await folderManager.ensureFolderStructure();
      setFolderStructure(structure);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ensure folder structure');
    } finally {
      setIsLoading(false);
    }
  }, [folderManager]);

  const saveTestResult = useCallback(async (testResult: any, studentId?: string) => {
    if (!folderManager) {
      throw new Error('Folder manager not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const studentIdToUse = studentId || localStorage.getItem('studentId') || 'anonymous';
      
      // Get student folder structure
      const studentFolders = await folderManager.getStudentFolderStructure(studentIdToUse);
      
      // Save test result
      const result = await folderManager.saveFileToFolder(
        studentFolders.results,
        `test_result_${testResult.testId}_${Date.now()}.json`,
        testResult
      );

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save test result');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [folderManager]);

  const loadTestResults = useCallback(async (testId: string, studentId?: string) => {
    if (!folderManager) {
      throw new Error('Folder manager not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const studentIdToUse = studentId || localStorage.getItem('studentId') || 'anonymous';
      
      // Get student folder structure
      const studentFolders = await folderManager.getStudentFolderStructure(studentIdToUse);
      
      // Get test-specific folder
      const testFolders = await folderManager.getTestFolderStructure(testId, studentIdToUse);
      
      // Load results from both student and test folders
      const studentResults = await folderManager.getFilesFromFolder(studentFolders.results, 'test_result');
      const testResults = await folderManager.getFilesFromFolder(testFolders.results, 'test_result');
      
      return [...studentResults, ...testResults];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test results');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [folderManager]);

  const getStudentFolderPath = useCallback(async (studentId: string) => {
    if (!folderManager) {
      throw new Error('Folder manager not initialized');
    }

    try {
      const studentFolders = await folderManager.getStudentFolderStructure(studentId);
      return await folderManager.getFolderPath(studentFolders.studentRoot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get student folder path');
      throw err;
    }
  }, [folderManager]);

  const createBackup = useCallback(async () => {
    if (!folderManager) {
      throw new Error('Folder manager not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const backupFolderId = await folderManager.createBackupFolder();
      return backupFolderId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create backup');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [folderManager]);

  return {
    folderManager,
    isLoading,
    error,
    folderStructure,
    saveTestResult,
    loadTestResults,
    getStudentFolderPath,
    createBackup,
    ensureFolderStructure,
  };
}
