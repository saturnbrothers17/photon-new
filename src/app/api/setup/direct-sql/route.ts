import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const teachers = [
      { email: 'sp8@photon', password: 'sp8@photon', name: 'Shiv Prakash Yadav' },
      { email: 'mk6@photon', password: 'mk6@photon', name: 'Mahavir Kesari' },
      { email: 'ak5@photon', password: 'ak5@photon', name: 'AK Mishra' }
    ];

    const results = [];

    for (const teacher of teachers) {
      try {
        const userId = uuidv4();
        const now = new Date().toISOString();
        
        // Hash the password (simple approach - in production use proper bcrypt)
        const hashedPassword = `$2a$10$${Buffer.from(teacher.password).toString('base64')}`;

        // Insert directly into auth.users table
        const { data, error } = await supabase.rpc('create_teacher_user', {
          user_id: userId,
          user_email: teacher.email,
          user_password: hashedPassword,
          user_name: teacher.name,
          created_time: now
        });

        if (error) {
          // Fallback: Try using raw SQL
          const { data: sqlData, error: sqlError } = await supabase
            .from('auth.users')
            .insert({
              id: userId,
              instance_id: '00000000-0000-0000-0000-000000000000',
              aud: 'authenticated',
              role: 'authenticated',
              email: teacher.email,
              encrypted_password: hashedPassword,
              email_confirmed_at: now,
              invited_at: now,
              confirmation_token: '',
              confirmation_sent_at: now,
              recovery_token: '',
              recovery_sent_at: null,
              email_change_token_new: '',
              email_change: '',
              email_change_sent_at: null,
              last_sign_in_at: null,
              raw_app_meta_data: { provider: 'email', providers: ['email'] },
              raw_user_meta_data: { name: teacher.name, role: 'teacher' },
              is_super_admin: false,
              created_at: now,
              updated_at: now,
              phone: null,
              phone_confirmed_at: null,
              phone_change: '',
              phone_change_token: '',
              phone_change_sent_at: null,
              confirmed_at: now,
              email_change_token_current: '',
              email_change_confirm_status: 0,
              banned_until: null,
              reauthentication_token: '',
              reauthentication_sent_at: null,
              is_sso_user: false,
              deleted_at: null
            });

          if (sqlError) {
            results.push({
              email: teacher.email,
              name: teacher.name,
              status: 'error',
              message: `SQL Error: ${sqlError.message}`
            });
          } else {
            results.push({
              email: teacher.email,
              name: teacher.name,
              status: 'created',
              message: 'User created via SQL'
            });
          }
        } else {
          results.push({
            email: teacher.email,
            name: teacher.name,
            status: 'created',
            message: 'User created via RPC'
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
      message: 'Direct SQL teacher creation attempted',
      results
    });

  } catch (error: any) {
    console.error('Direct SQL setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create teachers via SQL', details: error.message },
      { status: 500 }
    );
  }
}
