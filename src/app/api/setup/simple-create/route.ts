import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Direct approach using fetch to Supabase REST API
    const supabaseUrl = 'https://decoyxbkcibyngpsrwdr.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY295eGJrY2lieW5ncHNyd2RyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ5OTg5OSwiZXhwIjoyMDcwMDc1ODk5fQ.2fsfenoF2MoDDIDNW6lNuJtAqgNw7CdVA8XkIyoR_QQ';

    const teachers = [
      { email: 'sp8@photon', password: 'sp8@photon', name: 'Shiv Prakash Yadav' },
      { email: 'mk6@photon', password: 'mk6@photon', name: 'Mahavir Kesari' },
      { email: 'ak5@photon', password: 'ak5@photon', name: 'AK Mishra' }
    ];

    const results = [];

    for (const teacher of teachers) {
      try {
        // Use Supabase Auth Admin API directly
        const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            'apikey': serviceKey
          },
          body: JSON.stringify({
            email: teacher.email,
            password: teacher.password,
            email_confirm: true,
            user_metadata: {
              name: teacher.name,
              role: 'teacher'
            }
          })
        });

        if (response.ok) {
          const userData = await response.json();
          results.push({
            email: teacher.email,
            name: teacher.name,
            status: 'created',
            message: 'Successfully created via REST API',
            userId: userData.id
          });
        } else {
          const errorData = await response.text();
          results.push({
            email: teacher.email,
            name: teacher.name,
            status: 'error',
            message: `REST API Error: ${response.status} - ${errorData}`
          });
        }
      } catch (err: any) {
        results.push({
          email: teacher.email,
          name: teacher.name,
          status: 'error',
          message: `Network error: ${err.message}`
        });
      }
    }

    const successCount = results.filter(r => r.status === 'created').length;
    
    return NextResponse.json({
      success: successCount > 0,
      message: `REST API creation: ${successCount} out of ${teachers.length} accounts created`,
      results,
      summary: {
        total: teachers.length,
        created: successCount,
        failed: teachers.length - successCount
      }
    });

  } catch (error: any) {
    console.error('Simple create error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create users via REST API', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
