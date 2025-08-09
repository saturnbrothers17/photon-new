import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Use the same configuration as the working jp7@photon account
    const supabaseUrl = 'https://decoyxbkcibyngpsrwdr.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Create client like a normal signup would
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const teachers = [
      { email: 'sp8@photon', password: 'sp8@photon', name: 'Shiv Prakash Yadav' },
      { email: 'mk6@photon', password: 'mk6@photon', name: 'Mahavir Kesari' },
      { email: 'ak5@photon', password: 'ak5@photon', name: 'AK Mishra' }
    ];

    type ResultEntry = {
      email: string;
      name: string;
      status: 'created' | 'error';
      message: string;
      needsConfirmation?: boolean;
    };

    const results: ResultEntry[] = [];

    for (const teacher of teachers) {
      try {
        // Try normal signup like jp7@photon would have been created
        const { data, error } = await supabase.auth.signUp({
          email: teacher.email,
          password: teacher.password,
          options: {
            data: {
              name: teacher.name,
              role: 'teacher'
            }
          }
        });

        if (error) {
          // If signup fails, try with service role
          const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY295eGJrY2lieW5ncHNyd2RyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ5OTg5OSwiZXhwIjoyMDcwMDc1ODk5fQ.2fsfenoF2MoDDIDNW6lNuJtAqgNw7CdVA8XkIyoR_QQ';
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

          // Try to manually confirm the user if it was created but not confirmed
          const userId = (data as any)?.user?.id as string | undefined;
          let adminError: any = null;
          if (userId) {
            const { data: adminData, error: updErr } = await supabaseAdmin.auth.admin.updateUserById(
              userId,
              { email_confirm: true }
            );
            adminError = updErr;
          } else {
            adminError = new Error('No user id available to confirm');
          }

          if (adminError) {
            results.push({
              email: teacher.email,
              name: teacher.name,
              status: 'error',
              message: `Signup error: ${error.message}, Admin error: ${adminError instanceof Error ? adminError.message : String(adminError)}`
            });
          } else {
            results.push({
              email: teacher.email,
              name: teacher.name,
              status: 'created',
              message: 'Created via signup and admin confirmation'
            });
          }
        } else {
          results.push({
            email: teacher.email,
            name: teacher.name,
            status: 'created',
            message: 'Created via normal signup',
            needsConfirmation: !data.user?.email_confirmed_at
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

    const successCount = results.filter(r => r.status === 'created').length;
    
    return NextResponse.json({
      success: successCount > 0,
      message: `Signup simulation: ${successCount} out of ${teachers.length} accounts processed`,
      results,
      note: 'If accounts were created but need confirmation, they may require email verification'
    });

  } catch (error: any) {
    console.error('Signup simulation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to simulate signup process', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
