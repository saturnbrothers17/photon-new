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

    const results = [];

    for (const teacher of teachers) {
      try {
        console.log(`Creating teacher: ${teacher.name} (${teacher.email})`);
        
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
          console.error(`Error creating ${teacher.email}:`, error);
          results.push({
            email: teacher.email,
            name: teacher.name,
            status: 'error',
            message: error.message
          });
        } else {
          console.log(`Successfully created ${teacher.email}`);
          results.push({
            email: teacher.email,
            name: teacher.name,
            status: 'created',
            message: 'Teacher account created successfully',
            userId: data.user?.id
          });
        }
      } catch (err: any) {
        console.error(`Exception creating ${teacher.email}:`, err);
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
      message: `Created ${successCount} out of ${teachers.length} teacher accounts`,
      results,
      summary: {
        total: teachers.length,
        created: successCount,
        failed: teachers.length - successCount
      }
    });

  } catch (error: any) {
    console.error('Service key teacher creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create teachers with service key', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
