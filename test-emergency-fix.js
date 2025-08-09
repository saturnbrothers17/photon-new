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

async function testEmergencyFix() {
  console.log('🧪 Testing Emergency SQL Fix Results...\n');

  try {
    // Check if emergency fix worked
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.log('❌ Cannot check auth users:', userError.message);
      return;
    }

    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'teacher');

    if (profileError) {
      console.log('❌ Cannot check user profiles:', profileError.message);
      return;
    }

    console.log('📊 Current Status After Emergency Fix:');
    console.log(`   Total Auth Users: ${users.users.length}`);
    console.log(`   Total Teacher Profiles: ${profiles.length}`);
    console.log('');

    // Check specific teachers
    const expectedTeachers = [
      { name: 'JP7 Teacher', email: 'jp7@photon', photon_id: 'jp7' },
      { name: 'Shiv Prakash Yadav', email: 'sp8@photon.edu', photon_id: 'sp8@photon' },
      { name: 'Mahavir Kesari', email: 'mk6@photon.edu', photon_id: 'mk6@photon' },
      { name: 'AK Mishra', email: 'ak5@photon.edu', photon_id: 'ak5@photon' }
    ];

    console.log('👥 Teacher Status Check:');
    let successCount = 0;

    expectedTeachers.forEach(expected => {
      const hasAuth = users.users.some(u => u.email === expected.email);
      const hasProfile = profiles.some(p => p.photon_id === expected.photon_id);
      const isReady = hasAuth && hasProfile;
      
      if (isReady) successCount++;
      
      console.log(`   ${expected.name}:`);
      console.log(`      Auth User: ${hasAuth ? '✅' : '❌'}`);
      console.log(`      Profile: ${hasProfile ? '✅' : '❌'}`);
      console.log(`      Status: ${isReady ? '✅ Ready' : '❌ Missing'}`);
      console.log('');
    });

    console.log(`📈 Overall Result: ${successCount}/4 teachers ready`);

    if (successCount === 4) {
      console.log('🎉 EMERGENCY FIX SUCCESSFUL!');
      console.log('All teachers have been created via direct SQL injection.');
      console.log('');
      console.log('🔑 Login Information:');
      console.log('⚠️  All new teachers have the same password as jp7@photon');
      console.log('They should change their passwords after first login.');
      console.log('');
      
      profiles.forEach(profile => {
        console.log(`   ${profile.name}:`);
        console.log(`      Email: ${profile.email}`);
        console.log(`      Password: jp7@photon (same as existing teacher)`);
        console.log(`      Photon ID: ${profile.photon_id}`);
        console.log('');
      });

      // Test login capability
      console.log('🧪 Testing Login Capability...');
      await testLogin('sp8@photon.edu', 'jp7@photon');

    } else if (successCount > 1) {
      console.log('⚠️  Partial Success - Some teachers created');
      console.log('You may need to run the emergency SQL script again.');
      
    } else {
      console.log('❌ Emergency fix did not work');
      console.log('');
      console.log('🆘 CRITICAL SITUATION - Recommended Actions:');
      console.log('1. Contact Supabase Support immediately');
      console.log('2. Create new Supabase project');
      console.log('3. Export data: node export-current-data.js');
      console.log('4. Migrate to new project');
    }

    // Check if normal user creation is now working
    console.log('\n🔬 Testing if normal user creation is now working...');
    await testNormalUserCreation();

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

async function testLogin(email, password) {
  try {
    console.log(`   Testing login: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log(`   ❌ Login failed: ${error.message}`);
    } else {
      console.log(`   ✅ Login successful!`);
      console.log(`   User: ${data.user.email} (${data.user.id})`);
      
      // Sign out
      await supabase.auth.signOut();
    }

  } catch (error) {
    console.log(`   ❌ Login test error: ${error.message}`);
  }
}

async function testNormalUserCreation() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test-normal-creation@example.com',
      password: 'test123456',
      email_confirm: true
    });

    if (error) {
      console.log('   ❌ Normal user creation still failing:', error.message);
      console.log('   💡 The emergency fix worked, but underlying issue remains');
    } else {
      console.log('   ✅ Normal user creation is now working!');
      console.log('   🎉 The emergency fix resolved the underlying issue');
      
      // Clean up test user
      await supabase.auth.admin.deleteUser(data.user.id);
    }

  } catch (error) {
    console.log('   ❌ Normal creation test error:', error.message);
  }
}

// Run the test
testEmergencyFix().catch(console.error);