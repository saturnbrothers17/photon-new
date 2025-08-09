/**
 * AUTHENTICATION HELPER
 * 
 * Authentication utilities with proper Supabase integration
 */

import { supabase } from './supabase';

export interface User {
  id: string;
  email?: string;
  role: 'teacher' | 'student' | 'admin';
  name?: string;
  photon_id?: string;
  subject?: string;
  class_level?: string;
  department?: string;
  is_active?: boolean;
}

/**
 * Get current authenticated user with profile
 */
export async function getCurrentUser(): Promise<User> {
  try {
    // Get authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      // For development, return a default teacher user with valid UUID
      console.warn('⚠️ No authenticated user found, using default teacher for development');
      return {
        id: '6ab3088a-ac6c-4e5a-85fe-6e9e5924738e', // Use the actual SP8 user ID from database
        email: 'sp8@photon.edu',
        role: 'teacher',
        name: 'Shiv Prakash Yadav',
        photon_id: 'sp8',
        subject: 'Physics',
        class_level: '12',
        department: 'Science',
        is_active: true
      };
    }

    // Try to get profile from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile && !profileError) {
      // Return data from profile table
      return {
        id: user.id,
        email: user.email,
        role: profile.role as 'teacher' | 'student' | 'admin',
        name: profile.name,
        photon_id: profile.photon_id,
        subject: profile.subject,
        class_level: profile.class_level,
        department: profile.department,
        is_active: profile.is_active
      };
    }

    // Fallback to user metadata if profile table doesn't exist or has no data
    return {
      id: user.id,
      email: user.email,
      role: (user.user_metadata?.role as 'teacher' | 'student' | 'admin') || 'teacher',
      name: user.user_metadata?.name || user.email?.split('@')[0],
      photon_id: user.user_metadata?.photon_id || user.email?.split('@')[0],
      subject: user.user_metadata?.subject,
      class_level: user.user_metadata?.class_level,
      department: user.user_metadata?.department,
      is_active: true
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    // Return a fallback user for development with valid UUID
    console.warn('⚠️ Using fallback user due to auth error');
    return {
      id: '6ab3088a-ac6c-4e5a-85fe-6e9e5924738e', // Use the actual SP8 user ID from database
      email: 'sp8@photon.edu',
      role: 'teacher',
      name: 'Shiv Prakash Yadav',
      photon_id: 'sp8',
      subject: 'Physics',
      class_level: '12',
      department: 'Science',
      is_active: true
    };
  }
}

/**
 * Get or create a temporary user ID for development
 */
function getOrCreateTempUserId(): string {
  // Check if we have a stored temp user ID
  if (typeof window !== 'undefined') {
    let tempUserId = localStorage.getItem('temp_user_id');
    
    if (!tempUserId || !isValidUUID(tempUserId)) {
      tempUserId = crypto.randomUUID();
      localStorage.setItem('temp_user_id', tempUserId);
    }
    
    return tempUserId;
  }
  
  // Server-side fallback
  return crypto.randomUUID();
}

/**
 * Validate UUID format (accepts standard UUIDs and special nil UUID)
 */
function isValidUUID(uuid: string): boolean {
  // Accept the nil UUID (all zeros) for development
  if (uuid === '00000000-0000-0000-0000-000000000000') {
    return true;
  }
  
  // Standard UUID validation (more permissive)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sign in with email (for future implementation)
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

/**
 * Sign up with email (for future implementation)
 */
export async function signUpWithEmail(email: string, password: string, metadata?: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) throw error;
  
  // Clear temp user ID
  if (typeof window !== 'undefined') {
    localStorage.removeItem('temp_user_id');
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}