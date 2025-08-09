import { NextRequest, NextResponse } from 'next/server';
import { createServerAuthenticatedClient } from '@/lib/supabase-auth';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerAuthenticatedClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      
      // Return basic user info if profile not found
      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'student',
          name: user.user_metadata?.name || user.email?.split('@')[0],
          photon_id: user.user_metadata?.photon_id || user.email?.split('@')[0]
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: profile.role,
        name: profile.name,
        photon_id: profile.photon_id,
        subject: profile.subject,
        class_level: profile.class_level,
        department: profile.department,
        is_active: profile.is_active
      }
    });

  } catch (error: any) {
    console.error('❌ User API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerAuthenticatedClient();
    const body = await request.json();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Update user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        name: body.name,
        subject: body.subject,
        class_level: body.class_level,
        department: body.department
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('❌ User Update API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}