const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testAuthUserAPI() {
  console.log('🧪 Testing Auth User API Response...\n');

  try {
    // First, let's see what the user_profiles table actually contains
    console.log('1️⃣ Checking user_profiles table data:');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'sp8@photon.edu')
      .single();

    if (profileError) {
      console.log('❌ Cannot fetch profile:', profileError.message);
    } else {
      console.log('✅ Profile data for sp8@photon.edu:');
      console.log(`   Name: "${profiles.name}"`);
      console.log(`   Email: "${profiles.email}"`);
      console.log(`   Photon ID: "${profiles.photon_id}"`);
      console.log(`   Role: "${profiles.role}"`);
    }

    // Check auth user metadata
    console.log('\n2️⃣ Checking auth user metadata:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (!authError) {
      const sp8User = authUsers.users.find(u => u.email === 'sp8@photon.edu');
      if (sp8User) {
        console.log('✅ Auth user metadata for sp8@photon.edu:');
        console.log(`   Name in metadata: "${sp8User.user_metadata?.name}"`);
        console.log(`   Full metadata:`, sp8User.user_metadata);
      } else {
        console.log('❌ Auth user not found');
      }
    }

    // Test the API endpoint directly
    console.log('\n3️⃣ Testing API endpoint directly:');
    
    // We can't test the authenticated endpoint directly without a session,
    // but we can simulate what it should return
    console.log('The API should return profile.name from user_profiles table');
    console.log('If the frontend is still showing "sp8", it might be:');
    console.log('1. Browser cache issue');
    console.log('2. Session not refreshed');
    console.log('3. Frontend using wrong field');

    console.log('\n🔧 Solutions to try:');
    console.log('1. Hard refresh the browser (Ctrl+F5)');
    console.log('2. Clear browser cache');
    console.log('3. Logout and login again');
    console.log('4. Check browser developer tools for API response');

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testAuthUserAPI().catch(console.error);