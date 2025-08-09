/**
 * SUPABASE ADMIN CLIENT
 * 
 * Admin client that bypasses Row Level Security for server-side operations
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create admin client that bypasses RLS
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  }
});

console.log('🔧 Supabase Admin client initialized');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Using service key:', supabaseServiceKey ? 'Yes' : 'No');

// Test the admin client connection
supabaseAdmin.from('tests').select('count').limit(1).then(({ data, error }) => {
  if (error) {
    console.error('❌ Admin client connection failed:', error);
  } else {
    console.log('✅ Admin client connection successful');
  }
});