/**
 * AUTHENTICATED SUPABASE CLIENT
 * 
 * Client that respects Row Level Security and user authentication
 */

import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side authenticated client
export const createAuthenticatedClient = () => {
  return createClientComponentClient<Database>();
};

// Server-side authenticated client (simplified for now)
export const createServerAuthenticatedClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

// Regular client for public operations
export const supabaseAuth = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper function to get current user with profile
export async function getCurrentUserWithProfile(client = supabaseAuth) {
  try {
    const { data: { user }, error: userError } = await client.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    // Get user profile
    const { data: profile, error: profileError } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'student',
        name: user.user_metadata?.name || user.email?.split('@')[0],
        photon_id: user.user_metadata?.photon_id || user.email?.split('@')[0]
      };
    }

    return {
      id: user.id,
      email: user.email,
      role: profile.role,
      name: profile.name,
      photon_id: profile.photon_id,
      subject: profile.subject,
      class_level: profile.class_level,
      department: profile.department,
      is_active: profile.is_active
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Helper function to check if user is teacher
export async function isTeacher(client = supabaseAuth) {
  const user = await getCurrentUserWithProfile(client);
  return user?.role === 'teacher';
}

// Helper function to check if user is student
export async function isStudent(client = supabaseAuth) {
  const user = await getCurrentUserWithProfile(client);
  return user?.role === 'student';
}

// Helper function to get user role
export async function getUserRole(client = supabaseAuth) {
  const user = await getCurrentUserWithProfile(client);
  return user?.role || 'student';
}

// Helper function to ensure user is authenticated
export async function requireAuth(client = supabaseAuth) {
  const user = await getCurrentUserWithProfile(client);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

// Helper function to ensure user is teacher
export async function requireTeacher(client = supabaseAuth) {
  const user = await requireAuth(client);
  if (user.role !== 'teacher') {
    throw new Error('Teacher access required');
  }
  return user;
}

// Helper function to ensure user is student
export async function requireStudent(client = supabaseAuth) {
  const user = await requireAuth(client);
  if (user.role !== 'student') {
    throw new Error('Student access required');
  }
  return user;
}

// Helper function to create user profile
export async function createUserProfile(
  userId: string,
  email: string,
  role: 'teacher' | 'student',
  additionalData: any = {},
  client = supabaseAuth
) {
  const { data, error } = await client
    .from('user_profiles')
    .insert([{
      id: userId,
      email,
      role,
      name: additionalData.name || email.split('@')[0],
      photon_id: additionalData.photon_id || email.split('@')[0],
      subject: additionalData.subject,
      class_level: additionalData.class_level,
      department: additionalData.department
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Helper function to update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    name: string;
    photon_id: string;
    subject: string;
    class_level: string;
    department: string;
  }>,
  client = supabaseAuth
) {
  const { data, error } = await client
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

console.log('🔐 Authenticated Supabase client initialized');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Using anon key for RLS');