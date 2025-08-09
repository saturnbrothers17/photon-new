import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'saveTest':
        return NextResponse.json({ success: true, fileId: 'demo-file-id' });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
