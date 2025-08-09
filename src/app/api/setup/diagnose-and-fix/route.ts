import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabaseUrl = 'https://decoyxbkcibyngpsrwdr.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY295eGJrY2lieW5ncHNyd2RyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ5OTg5OSwiZXhwIjoyMDcwMDc1ODk5fQ.2fsfenoF2MoDDIDNW6lNuJtAqgNw7CdVA8XkIyoR_QQ';

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

    // First, check if users already exist
    type ResultEntry = {
      email: string;
      name: string;
      status: 'already_exists' | 'created' | 'error';
      message?: string;
      attempts?: string[];
      userId?: string;
      created_at?: string;
    };

    const existingUsers: ResultEntry[] = [];
    for (const teacher of teachers) {
      try {
        const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
        if (!error && users) {
          const existingUser = users.users.find(u => u.email === teacher.email);
          if (existingUser) {
            existingUsers.push({
              email: teacher.email,
              name: teacher.name,
              status: 'already_exists',
              userId: existingUser.id,
              created_at: existingUser.created_at
            });
          }
        }
      } catch (err) {
        console.log(`Error checking existing user ${teacher.email}:`, err);
      }
    }

    // Try to create missing users
    const results: ResultEntry[] = [...existingUsers];
    const missingTeachers = teachers.filter(t => !existingUsers.find(e => e.email === t.email));

    for (const teacher of missingTeachers) {
      try {
        // Try with different approaches
        let createResult = null;
        let createError = null;

        // Approach 1: Standard admin create
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
          createResult = data;
          createError = error;
        } catch (err: any) {
          createError = err;
        }

        // Approach 2: If first approach fails, try without user_metadata
        if (createError) {
          try {
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
              email: teacher.email,
              password: teacher.password,
              email_confirm: true
            });
            createResult = data;
            createError = error;
          } catch (err: any) {
            createError = err;
          }
        }

        if (createError) {
          results.push({
            email: teacher.email,
            name: teacher.name,
            status: 'error',
            message: createError.message || 'Unknown error',
            attempts: ['admin_create_with_metadata', 'admin_create_without_metadata']
          });
        } else {
          results.push({
            email: teacher.email,
            name: teacher.name,
            status: 'created',
            message: 'Teacher account created successfully',
            userId: createResult?.user?.id
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

    const successCount = results.filter(r => r.status === 'created' || r.status === 'already_exists').length;
    
    return NextResponse.json({
      success: successCount === teachers.length,
      message: `${successCount} out of ${teachers.length} teacher accounts are ready`,
      results,
      summary: {
        total: teachers.length,
        ready: successCount,
        already_existed: existingUsers.length,
        newly_created: results.filter(r => r.status === 'created').length,
        failed: results.filter(r => r.status === 'error').length
      }
    });

  } catch (error: any) {
    console.error('Diagnostic teacher creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed diagnostic teacher creation', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
