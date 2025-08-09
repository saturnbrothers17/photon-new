import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    
    const supabase = createRouteHandlerClient({ cookies });

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'teacher'
        }
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Teacher account created for ${name}`,
      user: data.user 
    });

  } catch (error: any) {
    console.error('Teacher signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create teacher account', details: error.message },
      { status: 500 }
    );
  }
}
