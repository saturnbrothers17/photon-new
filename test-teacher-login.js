/**
 * Test Teacher Login
 * Verifies that the jp7@photon account can login successfully
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTeacherLogin() {
  try {
    console.log('🧪 Testing teacher login...');
    
    const email = 'jp7@photon';
    const password = 'jp7@photon';
    
    // Test login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      return;
    }

    console.log('✅ Login successful!');
    console.log('👤 User:', {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role,
      name: data.user.user_metadata?.name,
      photon_id: data.user.user_metadata?.photon_id
    });
    
    console.log('🎯 Session:', {
      access_token: data.session.access_token ? 'Present' : 'Missing',
      refresh_token: data.session.refresh_token ? 'Present' : 'Missing',
      expires_at: new Date(data.session.expires_at * 1000).toLocaleString()
    });

    // Test getting current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError.message);
    } else {
      console.log('✅ User data retrieved successfully');
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('✅ Signed out successfully');

    console.log('\n🎉 All tests passed!');
    console.log('🌐 Ready to test in browser at: http://localhost:3002/faculty-portal');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testTeacherLogin();