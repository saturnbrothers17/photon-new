import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveAutoSync } from '@/lib/google-drive-auto-sync';

// POST - Initialize folder structure and upload data
export async function POST(request: NextRequest) {
  try {
    const { tokens, action, data } = await request.json();
    
    if (!tokens) {
      return NextResponse.json(
        { success: false, error: 'Authentication tokens required' },
        { status: 401 }
      );
    }

    console.log(`🚀 Auto-sync action: ${action}`);
    const autoSync = new GoogleDriveAutoSync(tokens);

    let result;
    
    switch (action) {
      case 'initialize':
        await autoSync.initializeFolderStructure();
        result = { message: 'Folder structure initialized successfully' };
        break;

      case 'upload_test':
        if (!data) {
          throw new Error('Test data is required');
        }
        const testFileId = await autoSync.uploadTest(data);
        result = { fileId: testFileId, message: 'Test uploaded successfully' };
        break;

      case 'upload_study_material':
        if (!data) {
          throw new Error('Study material data is required');
        }
        const materialFileId = await autoSync.uploadStudyMaterial(data);
        result = { fileId: materialFileId, message: 'Study material uploaded successfully' };
        break;

      case 'upload_student_data':
        if (!data) {
          throw new Error('Student data is required');
        }
        const studentFileId = await autoSync.uploadStudentData(data);
        result = { fileId: studentFileId, message: 'Student data uploaded successfully' };
        break;

      case 'upload_analytics':
        if (!data) {
          throw new Error('Analytics data is required');
        }
        const analyticsFileId = await autoSync.uploadAnalyticsReport(data);
        result = { fileId: analyticsFileId, message: 'Analytics report uploaded successfully' };
        break;

      case 'create_backup':
        if (!data) {
          throw new Error('Backup data is required');
        }
        const backupFileId = await autoSync.createSystemBackup(data);
        result = { fileId: backupFileId, message: 'System backup created successfully' };
        break;

      case 'sync_all':
        // Sync all localStorage data
        await autoSync.initializeFolderStructure();
        
        // Get all localStorage data
        const allData = data || {};
        const results = [];

        // Upload tests if available
        if (allData.tests) {
          const tests = JSON.parse(allData.tests);
          for (const test of tests) {
            try {
              const fileId = await autoSync.uploadTest(test);
              results.push({ type: 'test', name: test.name, fileId });
            } catch (error) {
              console.error(`Failed to upload test ${test.name}:`, error);
            }
          }
        }

        // Create complete backup
        const backupId = await autoSync.createSystemBackup(allData);
        results.push({ type: 'backup', name: 'Complete System Backup', fileId: backupId });

        result = { 
          message: 'All data synced successfully', 
          uploadedFiles: results.length,
          details: results 
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return NextResponse.json({ 
      success: true, 
      action,
      ...result 
    });

  } catch (error: any) {
    console.error('❌ Auto-sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Auto-sync failed: ${error.message}`,
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

// GET - Get folder structure and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokensParam = searchParams.get('tokens');
    
    if (!tokensParam) {
      return NextResponse.json(
        { success: false, error: 'Authentication tokens required' },
        { status: 401 }
      );
    }

    const tokens = JSON.parse(decodeURIComponent(tokensParam));
    const autoSync = new GoogleDriveAutoSync(tokens);

    const folderStructure = await autoSync.getFolderStructure();

    return NextResponse.json({ 
      success: true, 
      folderStructure 
    });

  } catch (error: any) {
    console.error('❌ Error getting folder structure:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to get folder structure: ${error.message}` 
      },
      { status: 500 }
    );
  }
}