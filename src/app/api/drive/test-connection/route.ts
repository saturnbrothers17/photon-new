import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Google Drive connection...');

    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`,
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Test basic connection
    const aboutResponse = await drive.about.get({
      fields: 'user, storageQuota'
    });

    console.log('✅ Google Drive connection successful');
    console.log('User:', aboutResponse.data.user?.displayName);
    console.log('Email:', aboutResponse.data.user?.emailAddress);

    return NextResponse.json({ 
      success: true, 
      message: 'Google Drive connection successful',
      user: aboutResponse.data.user,
      storageQuota: aboutResponse.data.storageQuota
    });

  } catch (error: any) {
    console.error('❌ Google Drive connection failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}