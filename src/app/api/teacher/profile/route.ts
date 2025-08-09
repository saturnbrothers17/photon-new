import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    // Map email to teacher name (works even without session for demo purposes)
    const teacherMap: Record<string, string> = {
      'jp7@photon': 'Jai Prakash Mishra',
      'jp7@photon.edu': 'Jai Prakash Mishra',
      'sp8@photon': 'Shiv Prakash Yadav',
      'sp8@photon.edu': 'Shiv Prakash Yadav',
      'mk6@photon': 'Mahavir Kesari',
      'mk6@photon.edu': 'Mahavir Kesari',
      'ak5@photon': 'AK Mishra',
      'ak5@photon.edu': 'AK Mishra'
    };

    console.log('🔍 Teacher profile API called');
    console.log('📧 Session user email:', session?.user?.email);
    
    if (!session) {
      console.log('❌ No session found');
      // For demo purposes, return a default teacher name
      return NextResponse.json({ name: 'Demo Teacher' });
    }

    const userEmail = session.user.email?.toLowerCase() || '';
    const name = teacherMap[userEmail] || session.user.email?.split('@')[0] || 'Teacher';
    
    console.log('✅ Mapped name:', name);

    return NextResponse.json({ name });
  } catch (error) {
    console.error('Teacher profile error:', error);
    return NextResponse.json({ name: 'Teacher' });
  }
}
