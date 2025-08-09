import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Temporary hardcoded teacher credentials
    const tempTeachers = {
      'sp8@photon': { password: 'sp8@photon', name: 'Shiv Prakash Yadav', id: 'temp-sp8' },
      'mk6@photon': { password: 'mk6@photon', name: 'Mahavir Kesari', id: 'temp-mk6' },
      'ak5@photon': { password: 'ak5@photon', name: 'AK Mishra', id: 'temp-ak5' }
    };

    const teacher = tempTeachers[email as keyof typeof tempTeachers];
    
    if (teacher && teacher.password === password) {
      // Create a temporary session-like response
      return NextResponse.json({
        success: true,
        user: {
          id: teacher.id,
          email: email,
          user_metadata: {
            name: teacher.name,
            role: 'teacher'
          }
        },
        session: {
          access_token: `temp-token-${teacher.id}`,
          user: {
            id: teacher.id,
            email: email,
            user_metadata: {
              name: teacher.name,
              role: 'teacher'
            }
          }
        }
      });
    }

    // If not a temp teacher, try normal Supabase auth
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message },
      { status: 500 }
    );
  }
}
