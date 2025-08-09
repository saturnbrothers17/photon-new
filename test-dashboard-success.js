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

async function testDashboardSuccess() {
  console.log('🧪 Testing if Dashboard Method Worked...\n');

  try {
    // Check auth users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.log('❌ Cannot check auth users:', userError.message);
      return;
    }

    // Check user profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('created_at');

    if (profileError) {
      console.log('❌ Cannot check user profiles:', profileError.message);
      return;
    }

    // Expected teachers
    const expectedTeachers = [
      { name: 'JP7 Teacher', photon_id: 'jp7', email: 'jp7@photon' },
      { name: 'Shiv Prakash Yadav', photon_id: 'sp8@photon', email: 'sp8@photon.edu' },
      { name: 'Mahavir Kesari', photon_id: 'mk6@photon', email: 'mk6@photon.edu' },
      { name: 'AK Mishra', photon_id: 'ak5@photon', email: 'ak5@photon.edu' }
    ];

    console.log('📊 Current Status:');
    console.log(`   Auth Users: ${users.users.length}`);
    console.log(`   Teacher Profiles: ${profiles.length}`);
    console.log('');

    console.log('👥 Found Teachers:');
    profiles.forEach((profile, index) => {
      const hasAuth = users.users.some(u => u.email === profile.email);
      console.log(`   ${index + 1}. ${profile.name}`);
      console.log(`      • Email: ${profile.email}`);
      console.log(`      • Photon ID: ${profile.photon_id}`);
      console.log(`      • Auth User: ${hasAuth ? '✅' : '❌'}`);
      console.log(`      • Can Login: ${hasAuth ? '✅ Yes' : '❌ No'}`);
      console.log('');
    });

    // Check success status
    let successCount = 0;
    console.log('✅ Success Check:');
    
    expectedTeachers.forEach(expected => {
      const foundProfile = profiles.find(p => p.photon_id === expected.photon_id);
      const foundAuth = users.users.find(u => u.email === expected.email);
      const isReady = foundProfile && foundAuth;
      
      if (isReady) successCount++;
      
      console.log(`   ${expected.name}: ${isReady ? '✅ Ready' : '❌ Missing'}`);
    });

    console.log('');
    console.log(`📈 Overall Status: ${successCount}/4 teachers ready`);

    if (successCount === 4) {
      console.log('🎉 SUCCESS! All teachers are set up and ready!');
      console.log('');
      console.log('🔑 Login Credentials:');
      profiles.forEach(profile => {
        const password = profile.photon_id === 'jp7' ? 'jp7@photon' : profile.photon_id;
        console.log(`   ${profile.name}:`);
        console.log(`      Email: ${profile.email}`);
        console.log(`      Password: ${password}`);
        console.log('');
      });
      
      console.log('🚀 Next Steps:');
      console.log('1. Test teacher login in your application');
      console.log('2. Verify teacher dashboard access');
      console.log('3. Teachers can now create and manage tests');
      
    } else if (successCount > 1) {
      console.log('⚠️  Partial Success - Some teachers created');
      console.log('');
      console.log('📋 Missing Teachers:');
      expectedTeachers.forEach(expected => {
        const foundProfile = profiles.find(p => p.photon_id === expected.photon_id);
        const foundAuth = users.users.find(u => u.email === expected.email);
        
        if (!foundProfile || !foundAuth) {
          console.log(`   ${expected.name}: ${expected.email} / ${expected.photon_id}`);
        }
      });
      
      console.log('');
      console.log('🔧 Action Required:');
      console.log('Continue adding missing teachers via Supabase Dashboard');
      
    } else {
      console.log('❌ Dashboard method not used yet');
      console.log('');
      console.log('📋 Required Action:');
      console.log('1. Go to Supabase Dashboard → Authentication → Users');
      console.log('2. Click "Add user" for each teacher:');
      console.log('');
      expectedTeachers.slice(1).forEach(teacher => {
        console.log(`   ${teacher.name}:`);
        console.log(`      Email: ${teacher.email}`);
        console.log(`      Password: ${teacher.photon_id}`);
        console.log(`      Confirm email: ✅ Yes`);
        console.log('');
      });
    }

    // Test login capability
    if (successCount > 1) {
      console.log('🧪 Testing Login Capability...');
      await testLogin(profiles[0]);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

async function testLogin(profile) {
  try {
    const password = profile.photon_id === 'jp7' ? 'jp7@photon' : profile.photon_id;
    
    console.log(`   Testing login for: ${profile.email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: password
    });

    if (error) {
      console.log(`   ❌ Login failed: ${error.message}`);
    } else {
      console.log(`   ✅ Login successful!`);
      console.log(`   User ID: ${data.user.id}`);
      
      // Sign out
      await supabase.auth.signOut();
    }

  } catch (error) {
    console.log(`   ❌ Login test error: ${error.message}`);
  }
}

// Run the test
testDashboardSuccess().catch(console.error);