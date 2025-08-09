import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const teachers = [
      {
        email: 'sp8@photon',
        password: 'photon123',
        name: 'Shiv Prakash Yadav'
      },
      {
        email: 'mk6@photon', 
        password: 'photon123',
        name: 'Mahavir Kesari'
      },
      {
        email: 'ak5@photon',
        password: 'photon123', 
        name: 'AK Mishra'
      }
    ];

    const results = [];

    for (const teacher of teachers) {
      try {
        // Try to create the user
        const { data, error } = await supabase.auth.admin.createUser({
          email: teacher.email,
          password: teacher.password,
          email_confirm: true,
          user_metadata: {
            name: teacher.name,
            role: 'teacher'
          }
        });

        if (error) {
          results.push({
            email: teacher.email,
            status: 'error',
            message: error.message
          });
        } else {
          results.push({
            email: teacher.email,
            name: teacher.name,
            status: 'created',
            message: 'Teacher account created successfully'
          });
        }
      } catch (err: any) {
        results.push({
          email: teacher.email,
          status: 'error',
          message: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher setup completed',
      results
    });

  } catch (error: any) {
    console.error('Teacher setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup teachers', details: error.message },
      { status: 500 }
    );
  }
}
