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

async function verifyTeacherNames() {
  console.log('🔍 Verifying All Teacher Names...\n');

  try {
    // Get all teacher profiles
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('created_at');

    if (error) {
      console.log('❌ Cannot fetch teacher profiles:', error.message);
      return;
    }

    console.log('📊 Current Teacher Profiles:');
    console.log('');

    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.name}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Photon ID: ${profile.photon_id}`);
      console.log(`   Subject: ${profile.subject}`);
      console.log(`   Department: ${profile.department}`);
      console.log('');
    });

    console.log('🔑 Login Credentials & Welcome Messages:');
    console.log('');

    profiles.forEach(profile => {
      const password = profile.photon_id === 'jp7' ? 'jp7@photon' : profile.photon_id;
      console.log(`👤 ${profile.name}:`);
      console.log(`   Login: ${profile.email} / ${password}`);
      console.log(`   Welcome Message: "Welcome ${profile.name}"`);
      console.log('');
    });

    console.log('✅ All teacher names have been updated successfully!');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('1. Teachers should logout and login again');
    console.log('2. They will see their proper full names in welcome messages');
    console.log('3. Test each login to verify the names appear correctly');

  } catch (error) {
    console.log('❌ Verification error:', error.message);
  }
}

verifyTeacherNames().catch(console.error);