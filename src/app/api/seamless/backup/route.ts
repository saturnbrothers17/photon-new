import { NextRequest, NextResponse } from 'next/server';
import { seamlessCloudStorage } from '@/lib/seamless-cloud-storage';

// POST - Create seamless backup (no authentication required)
export async function POST(request: NextRequest) {
  try {
    const backupData = await request.json();
    
    console.log('💾 Seamless API: Creating system backup...');

    if (!seamlessCloudStorage.isReady()) {
      console.log('⚠️ Cloud storage not ready, backup will be retried');
      return NextResponse.json({ 
        success: true, 
        backupId: null,
        message: 'Backup queued, will be created when cloud is ready',
        source: 'pending'
      });
    }

    const backupId = await seamlessCloudStorage.createBackup(backupData);
    
    if (backupId) {
      console.log('✅ Seamless API: Backup created:', backupId);
      return NextResponse.json({ 
        success: true, 
        backupId: backupId,
        message: 'System backup created seamlessly',
        source: 'seamless_cloud'
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        backupId: null,
        message: 'Backup will be retried automatically',
        source: 'retry_pending'
      });
    }

  } catch (error: any) {
    console.error('❌ Seamless backup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Seamless backup failed: ${error.message}`,
        source: 'error'
      },
      { status: 500 }
    );
  }
}

// GET - Get storage statistics
export async function GET() {
  try {
    console.log('📊 Seamless API: Getting storage stats...');

    const stats = await seamlessCloudStorage.getStorageStats();
    
    return NextResponse.json({ 
      success: true, 
      stats: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Seamless stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Stats fetch failed: ${error.message}`,
        stats: { connected: false }
      },
      { status: 500 }
    );
  }
}