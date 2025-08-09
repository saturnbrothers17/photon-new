/**
 * TEST AUTH ENDPOINT
 * 
 * Simple endpoint to test authentication and UUID generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      message: 'Authentication working correctly'
    });
  } catch (error: any) {
    console.error('❌ Auth test error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}