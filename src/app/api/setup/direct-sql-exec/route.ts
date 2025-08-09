import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabaseUrl = 'https://decoyxbkcibyngpsrwdr.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY295eGJrY2lieW5ncHNyd2RyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ5OTg5OSwiZXhwIjoyMDcwMDc1ODk5fQ.2fsfenoF2MoDDIDNW6lNuJtAqgNw7CdVA8XkIyoR_QQ';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Execute direct SQL to create users
    const { data, error } = await supabaseAdmin.rpc('create_teachers_sql', {}, {
      count: 'exact'
    });

    if (error) {
      // If RPC doesn't exist, try raw SQL approach
      const sqlCommands = [
        `INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password, 
          email_confirmed_at, invited_at, confirmation_sent_at,
          raw_app_meta_data, raw_user_meta_data, is_super_admin,
          created_at, updated_at, confirmed_at
        ) VALUES (
          gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
          'authenticated', 'authenticated', 'sp8@photon',
          crypt('sp8@photon', gen_salt('bf')), now(), now(), now(),
          '{"provider": "email", "providers": ["email"]}',
          '{"name": "Shiv Prakash Yadav", "role": "teacher"}',
          false, now(), now(), now()
        ) ON CONFLICT (email) DO NOTHING;`,
        
        `INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password, 
          email_confirmed_at, invited_at, confirmation_sent_at,
          raw_app_meta_data, raw_user_meta_data, is_super_admin,
          created_at, updated_at, confirmed_at
        ) VALUES (
          gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
          'authenticated', 'authenticated', 'mk6@photon',
          crypt('mk6@photon', gen_salt('bf')), now(), now(), now(),
          '{"provider": "email", "providers": ["email"]}',
          '{"name": "Mahavir Kesari", "role": "teacher"}',
          false, now(), now(), now()
        ) ON CONFLICT (email) DO NOTHING;`,
        
        `INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password, 
          email_confirmed_at, invited_at, confirmation_sent_at,
          raw_app_meta_data, raw_user_meta_data, is_super_admin,
          created_at, updated_at, confirmed_at
        ) VALUES (
          gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
          'authenticated', 'authenticated', 'ak5@photon',
          crypt('ak5@photon', gen_salt('bf')), now(), now(), now(),
          '{"provider": "email", "providers": ["email"]}',
          '{"name": "AK Mishra", "role": "teacher"}',
          false, now(), now(), now()
        ) ON CONFLICT (email) DO NOTHING;`
      ];

      const results = [];
      for (let i = 0; i < sqlCommands.length; i++) {
        try {
          const { data: sqlData, error: sqlError } = await supabaseAdmin
            .rpc('exec_sql', { query: sqlCommands[i] });
          
          const teacherNames = ['Shiv Prakash Yadav', 'Mahavir Kesari', 'AK Mishra'];
          const teacherEmails = ['sp8@photon', 'mk6@photon', 'ak5@photon'];
          
          results.push({
            email: teacherEmails[i],
            name: teacherNames[i],
            status: sqlError ? 'error' : 'created',
            message: sqlError ? sqlError.message : 'Created via SQL'
          });
        } catch (err: any) {
          results.push({
            email: ['sp8@photon', 'mk6@photon', 'ak5@photon'][i],
            name: ['Shiv Prakash Yadav', 'Mahavir Kesari', 'AK Mishra'][i],
            status: 'error',
            message: err.message
          });
        }
      }

      return NextResponse.json({
        success: results.some(r => r.status === 'created'),
        message: 'SQL execution attempted',
        rpcError: error.message,
        results
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Teachers created via RPC function',
      data
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Direct SQL execution failed',
      details: error.message,
      recommendation: 'Manual creation in Supabase Dashboard required'
    }, { status: 500 });
  }
}
