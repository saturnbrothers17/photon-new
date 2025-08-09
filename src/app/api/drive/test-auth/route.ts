import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔧 Testing Google Drive Service Account authentication...');
    
    const { googleDriveServiceAccount } = await import('@/lib/google-drive-service-account');
    
    console.log('📋 Running authentication test...');
    const isAuthenticated = await googleDriveServiceAccount.testAuth();
    
    if (isAuthenticated) {
      console.log('✅ Authentication test passed');
      return NextResponse.json({ 
        success: true, 
        message: 'Google Drive Service Account is working correctly',
        authenticated: true
      });
    } else {
      console.log('❌ Authentication test failed');
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication test failed',
        authenticated: false
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error('❌ Error testing authentication:', error);
    return NextResponse.json({ 
      success: false, 
      message: `Authentication test error: ${error.message}`,
      authenticated: false,
      error: error.stack
    }, { status: 500 });
  }
}