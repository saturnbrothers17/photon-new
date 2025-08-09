import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Execute raw SQL to create users
    const sqlQuery = `
      INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_sent_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        confirmed_at
      ) VALUES 
      (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'sp8@photon',
        crypt('sp8@photon', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Shiv Prakash Yadav", "role": "teacher"}',
        false,
        now(),
        now(),
        now()
      ),
      (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'mk6@photon',
        crypt('mk6@photon', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Mahavir Kesari", "role": "teacher"}',
        false,
        now(),
        now(),
        now()
      ),
      (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'ak5@photon',
        crypt('ak5@photon', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "AK Mishra", "role": "teacher"}',
        false,
        now(),
        now(),
        now()
      )
      ON CONFLICT (email) DO NOTHING;
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlQuery });

    if (error) {
      // Try alternative approach with individual inserts
      const teachers = [
        { email: 'sp8@photon', name: 'Shiv Prakash Yadav' },
        { email: 'mk6@photon', name: 'Mahavir Kesari' },
        { email: 'ak5@photon', name: 'AK Mishra' }
      ];

      const results = [];
      for (const teacher of teachers) {
        try {
          const { data: insertData, error: insertError } = await supabase
            .rpc('create_auth_user', {
              user_email: teacher.email,
              user_password: teacher.email,
              user_name: teacher.name
            });

          results.push({
            email: teacher.email,
            name: teacher.name,
            status: insertError ? 'error' : 'created',
            message: insertError ? insertError.message : 'Created successfully'
          });
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
        success: false,
        message: 'Raw SQL failed, tried RPC approach',
        sqlError: error.message,
        results
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Teachers created via raw SQL',
      data
    });

  } catch (error: any) {
    console.error('Raw SQL execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute raw SQL', details: error.message },
      { status: 500 }
    );
  }
}
