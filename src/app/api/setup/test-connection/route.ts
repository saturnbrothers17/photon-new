import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    // Test auth access
    const { data: authTest, error: authError } = await supabase.auth.getSession();

    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    };

    return NextResponse.json({
      connection: {
        success: !connectionError,
        error: connectionError?.message
      },
      auth: {
        success: !authError,
        error: authError?.message,
        session: !!authTest.session
      },
      environment: envCheck,
      diagnosis: {
        canConnectToDb: !connectionError,
        hasAuthAccess: !authError,
        hasServiceKey: envCheck.serviceKey,
        recommendation: !envCheck.serviceKey 
          ? "Missing SUPABASE_SERVICE_ROLE_KEY in environment variables"
          : connectionError 
            ? "Database connection issue"
            : authError
              ? "Auth configuration issue"
              : "Configuration appears correct"
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Connection test failed',
      details: error.message,
      recommendation: 'Check Supabase configuration and environment variables'
    }, { status: 500 });
  }
}
