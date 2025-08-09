import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveFolderManager } from '@/lib/google-drive-folder-manager';

const folderManager = new GoogleDriveFolderManager();

export async function POST(request: NextRequest) {
  try {
    const { action, data, folderPath, fileName, studentId, testId } = await request.json();

    switch (action) {
      case 'saveTestResult':
        return await saveTestResult(data, studentId);
      case 'saveStudentProfile':
        return await saveStudentProfile(data, studentId);
      case 'saveTestData':
        return await saveTestData(data, testId);
      case 'saveAssignment':
        return await saveAssignment(data, studentId);
      case 'saveAnalytics':
        return await saveAnalytics(data, testId);
      case 'saveExtractedQuestions':
        return await saveExtractedQuestions(data, testId);
      case 'createFolderStructure':
        return await createFolderStructure();
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in Google Drive data API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const studentId = searchParams.get('studentId') || 'anonymous';
    const testId = searchParams.get('testId') || 'latest';
    const folderPath = searchParams.get('folderPath');

    switch (action) {
      case 'getTestResults':
        return await getTestResults(studentId, testId);
      case 'getStudentData':
        return await getStudentData(studentId);
      case 'getTestData':
        return await getTestData(testId);
      case 'getFolderStructure':
        return await getFolderStructure();
      case 'getFolderPath':
        return await getFolderPath(folderPath || undefined);
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in Google Drive data API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

async function saveTestResult(testResult: any, studentId?: string) {
  const studentIdToUse = studentId || 'anonymous';
  
  // Ensure folder structure exists
  await folderManager.ensureFolderStructure();
  
  // Get student folder structure
  const studentFolders = await folderManager.getStudentFolderStructure(studentIdToUse);
  
  // Save test result
  const result = await folderManager.saveFileToFolder(
    studentFolders.results,
    `test_result_${testResult.testId}_${Date.now()}.json`,
    testResult
  );

  return NextResponse.json({ 
    success: true, 
    data: result,
    folderPath: `CoachingInstituteData/Students/${studentIdToUse}/Results`
  });
}

async function saveStudentProfile(profile: any, studentId: string) {
  await folderManager.ensureFolderStructure();
  
  const studentFolders = await folderManager.getStudentFolderStructure(studentId);
  
  const result = await folderManager.saveFileToFolder(
    studentFolders.studentRoot,
    `profile_${studentId}.json`,
    profile
  );

  return NextResponse.json({ 
    success: true, 
    data: result,
    folderPath: `CoachingInstituteData/Students/${studentId}`
  });
}

async function saveTestData(testData: any, testId: string | null) {
  await folderManager.ensureFolderStructure();
  
  const testFolders = await folderManager.getTestFolderStructure(testId || '');
  
  const result = await folderManager.saveFileToFolder(
    testFolders.testRoot,
    `test_${testId || ''}.json`,
    testData
  );

  return NextResponse.json({ 
    success: true, 
    data: result,
    folderPath: `CoachingInstituteData/Tests/${testId || ''}`
  });
}

async function saveAssignment(assignment: any, studentId: string) {
  await folderManager.ensureFolderStructure();
  
  const studentFolders = await folderManager.getStudentFolderStructure(studentId);
  
  const result = await folderManager.saveFileToFolder(
    studentFolders.assignments,
    `assignment_${assignment.id}_${Date.now()}.json`,
    assignment
  );

  return NextResponse.json({ 
    success: true, 
    data: result,
    folderPath: `CoachingInstituteData/Students/${studentId}/Assignments`
  });
}

async function saveAnalytics(analytics: any, testId: string) {
  await folderManager.ensureFolderStructure();
  
  const testFolders = await folderManager.getTestFolderStructure(testId);
  
  const result = await folderManager.saveFileToFolder(
    testFolders.analytics,
    `analytics_${testId}_${Date.now()}.json`,
    analytics
  );

  return NextResponse.json({ 
    success: true, 
    data: result,
    folderPath: `CoachingInstituteData/Analytics/${testId}`
  });
}

async function saveExtractedQuestions(questions: any, testId: string) {
  await folderManager.ensureFolderStructure();
  
  const testFolders = await folderManager.getTestFolderStructure(testId);
  
  const result = await folderManager.saveFileToFolder(
    testFolders.questions,
    `extracted_questions_${testId}_${Date.now()}.json`,
    questions
  );

  return NextResponse.json({ 
    success: true, 
    data: result,
    folderPath: `CoachingInstituteData/Tests/${testId}/Questions`
  });
}

async function createFolderStructure() {
  const structure = await folderManager.ensureFolderStructure();
  
  return NextResponse.json({ 
    success: true, 
    structure,
    message: 'Folder structure created successfully'
  });
}

async function getTestResults(studentId: string, testId: string) {
  const studentFolders = await folderManager.getStudentFolderStructure(studentId);
  const testFolders = await folderManager.getTestFolderStructure(testId);
  
  const studentResults = await folderManager.getFilesFromFolder(studentFolders.results, 'test_result');
  const testResults = await folderManager.getFilesFromFolder(testFolders.results, 'test_result');
  
  return NextResponse.json({ 
    success: true, 
    results: [...studentResults, ...testResults],
    folderPath: `CoachingInstituteData/Students/${studentId}/Results`
  });
}

async function getStudentData(studentId: string) {
  const studentFolders = await folderManager.getStudentFolderStructure(studentId);
  
  const profile = await folderManager.getFilesFromFolder(studentFolders.studentRoot, 'profile');
  const results = await folderManager.getFilesFromFolder(studentFolders.results, 'test_result');
  const assignments = await folderManager.getFilesFromFolder(studentFolders.assignments, 'assignment');
  const performance = await folderManager.getFilesFromFolder(studentFolders.performance, 'performance');
  
  return NextResponse.json({ 
    success: true, 
    data: {
      profile,
      results,
      assignments,
      performance
    },
    folderPath: `CoachingInstituteData/Students/${studentId}`
  });
}

async function getTestData(testId: string) {
  const testFolders = await folderManager.getTestFolderStructure(testId);
  
  const testData = await folderManager.getFilesFromFolder(testFolders.testRoot, 'test');
  const questions = await folderManager.getFilesFromFolder(testFolders.questions, 'question');
  const results = await folderManager.getFilesFromFolder(testFolders.results, 'test_result');
  const analytics = await folderManager.getFilesFromFolder(testFolders.analytics, 'analytics');
  
  return NextResponse.json({ 
    success: true, 
    data: {
      test: testData,
      questions,
      results,
      analytics
    },
    folderPath: `CoachingInstituteData/Tests/${testId}`
  });
}

async function getFolderStructure() {
  const structure = await folderManager.ensureFolderStructure();
  
  return NextResponse.json({ 
    success: true, 
    structure,
    folderPaths: {
      root: 'CoachingInstituteData',
      students: 'CoachingInstituteData/Students',
      teachers: 'CoachingInstituteData/Teachers',
      tests: 'CoachingInstituteData/Tests',
      results: 'CoachingInstituteData/Results',
      materials: 'CoachingInstituteData/StudyMaterials',
      analytics: 'CoachingInstituteData/Analytics',
      backups: 'CoachingInstituteData/Backups'
    }
  });
}

async function getFolderPath(folderPath?: string) {
  if (!folderPath) {
    return NextResponse.json({ 
      success: false, 
      error: 'Folder path is required' 
    }, { status: 400 });
  }

  const path = await folderManager.getFolderPath(folderPath);
  
  return NextResponse.json({ 
    success: true, 
    path
  });
}
