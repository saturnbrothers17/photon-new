import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const testData = await request.json();
    
    // Insert test
    const { data: test, error } = await supabase
      .from('tests')
      .insert({
        ...testData,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating test:', error);
      return new NextResponse(error.message, { status: 500 });
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error('Error in test creation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    // Get all published tests
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tests:', error);
      return new NextResponse(error.message, { status: 500 });
    }

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
