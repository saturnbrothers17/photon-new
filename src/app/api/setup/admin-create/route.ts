import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Use service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const teachers = [
      { email: 'sp8@photon', password: 'sp8@photon', name: 'Shiv Prakash Yadav' },
      { email: 'mk6@photon', password: 'mk6@photon', name: 'Mahavir Kesari' },
      { email: 'ak5@photon', password: 'ak5@photon', name: 'AK Mishra' }
    ];

    const results = [];

    for (const teacher of teachers) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
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
            name: teacher.name,
            status: 'error',
            message: error.message
          });
        } else {
          results.push({
            email: teacher.email,
            name: teacher.name,
            status: 'created',
            message: 'Teacher account created successfully',
            userId: data.user?.id
          });
        }
      } catch (err: any) {
        results.push({
          email: teacher.email,
          name: teacher.name,
          status: 'error',
          message: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin teacher creation completed',
      results
    });

  } catch (error: any) {
    console.error('Admin teacher creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create teachers with admin client', details: error.message },
      { status: 500 }
    );
  }
}
