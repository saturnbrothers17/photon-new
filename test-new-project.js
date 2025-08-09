const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with NEW project credentials
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

async function testNewProject() {
  console.log('🧪 Testing New Supabase Project...\n');

  console.log('🔍 Project Information:');
  console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`   Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...`);
  console.log('');

  // Test 1: Basic connectivity
  await testConnectivity();
  
  // Test 2: User creation (the main issue we're solving)
  await testUserCreation();
  
  // Test 3: Check migrated data
  await checkMigratedData();
  
  // Test 4: Test teacher login
  await testTeacherLogin();
  
  // Test 5: Test database operations
  await testDatabaseOperations();
}

async function testConnectivity() {
  console.log('1️⃣ Testing Basic Connectivity...');
  
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('❌ Cannot connect to new project:', error.message);
      console.log('   🔧 Check your environment variables');
      return false;
    } else {
      console.log('✅ Successfully connected to new project');
      console.log(`   Found ${users.users.length} users`);
      return true;
    }

  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

async function testUserCreation() {
  console.log('\n2️⃣ Testing User Creation (Main Issue)...');
  
  try {
    // This is the test that was failing in the old project
    const testEmail = `test-${Date.now()}@example.com`;
    
    console.log(`   Creating test user: ${testEmail}`);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true
    });

    if (error) {
      console.log('❌ User creation STILL FAILING:', error.message);
      console.log('   🚨 The new project has the same issue!');
      return false;
    } else {
      console.log('✅ User creation WORKING in new project!');
      console.log(`   Created user: ${data.user.email} (${data.user.id})`);
      
      // Clean up test user
      await supabase.auth.admin.deleteUser(data.user.id);
      console.log('   🧹 Cleaned up test user');
      
      return true;
    }

  } catch (error) {
    console.log('❌ User creation test error:', error.message);
    return false;
  }
}

async function checkMigratedData() {
  console.log('\n3️⃣ Checking Migrated Data...');
  
  try {
    // Check auth users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (!userError) {
      console.log(`✅ Auth users: ${users.users.length}`);
      users.users.forEach(user => {
        console.log(`   • ${user.email} (confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'})`);
      });
    }

    // Check user profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*');

    if (!profileError) {
      console.log(`✅ User profiles: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`   • ${profile.name} (${profile.role}) - ${profile.email}`);
      });
    } else {
      console.log('❌ Cannot access user_profiles:', profileError.message);
    }

    // Check study materials
    const { data: materials, error: materialError } = await supabase
      .from('study_materials')
      .select('count(*)');

    if (!materialError) {
      console.log(`✅ Study materials: ${materials[0]?.count || 0}`);
    } else {
      console.log('❌ Cannot access study_materials:', materialError.message);
    }

    // Check test results
    const { data: results, error: resultError } = await supabase
      .from('test_results')
      .select('count(*)');

    if (!resultError) {
      console.log(`✅ Test results: ${results[0]?.count || 0}`);
    } else {
      console.log('❌ Cannot access test_results:', resultError.message);
    }

  } catch (error) {
    console.log('❌ Data check error:', error.message);
  }
}

async function testTeacherLogin() {
  console.log('\n4️⃣ Testing Teacher Login...');
  
  const testCredentials = [
    { email: 'sp8@photon.edu', password: 'sp8@photon', name: 'Shiv Prakash Yadav' },
    { email: 'mk6@photon.edu', password: 'mk6@photon', name: 'Mahavir Kesari' },
    { email: 'ak5@photon.edu', password: 'ak5@photon', name: 'AK Mishra' }
  ];

  for (const cred of testCredentials) {
    try {
      console.log(`   Testing login: ${cred.email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });

      if (error) {
        console.log(`   ❌ Login failed for ${cred.name}: ${error.message}`);
      } else {
        console.log(`   ✅ Login successful for ${cred.name}`);
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profileError && profile) {
          console.log(`      Role: ${profile.role}, Photon ID: ${profile.photon_id}`);
        }

        // Sign out
        await supabase.auth.signOut();
      }

    } catch (error) {
      console.log(`   ❌ Login test error for ${cred.name}: ${error.message}`);
    }
  }
}

async function testDatabaseOperations() {
  console.log('\n5️⃣ Testing Database Operations...');
  
  try {
    // Test insert
    const { data: insertData, error: insertError } = await supabase
      .from('study_materials')
      .insert({
        title: 'Test Material',
        description: 'Migration test material',
        content: 'This is a test',
        subject: 'Test',
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
    } else {
      console.log('✅ Insert test successful');
      
      // Test update
      const { error: updateError } = await supabase
        .from('study_materials')
        .update({ description: 'Updated test material' })
        .eq('id', insertData.id);

      if (updateError) {
        console.log('❌ Update test failed:', updateError.message);
      } else {
        console.log('✅ Update test successful');
      }

      // Test delete (cleanup)
      const { error: deleteError } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', insertData.id);

      if (deleteError) {
        console.log('❌ Delete test failed:', deleteError.message);
      } else {
        console.log('✅ Delete test successful');
      }
    }

  } catch (error) {
    console.log('❌ Database operations test error:', error.message);
  }
}

// Run the test
testNewProject()
  .then(() => {
    console.log('\n🎯 New Project Test Complete!');
    console.log('\n📋 Summary:');
    console.log('If all tests passed, your migration was successful!');
    console.log('You can now use the new project for your application.');
    console.log('\n🚀 Next Steps:');
    console.log('1. Test your application with the new project');
    console.log('2. Have teachers reset their passwords if needed');
    console.log('3. Monitor for any issues');
    console.log('4. Consider deleting the old project once everything is stable');
  })
  .catch(console.error);