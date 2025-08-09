const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
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

async function diagnoseConstraintsSimple() {
  console.log('🔍 Simple Database Constraint Diagnosis...\n');

  // Key findings from previous diagnosis:
  console.log('📋 Key Issues Identified:');
  console.log('1. ❌ Service role has limited database access');
  console.log('2. ❌ Cannot access information_schema tables');
  console.log('3. ✅ Auth admin access works');
  console.log('4. ❌ Foreign key constraint: user_profiles.id must exist in auth.users');
  console.log('5. ✅ No email/photon_id conflicts');
  console.log('');

  // Test the core issue: Foreign key constraint
  await testForeignKeyConstraint();
  
  // Test auth user creation with minimal data
  await testMinimalAuthCreation();
  
  // Test if we can create auth users with different approach
  await testAlternativeAuthCreation();
  
  // Check current database state
  await checkCurrentState();
}

async function testForeignKeyConstraint() {
  console.log('1️⃣ Testing Foreign Key Constraint Issue...');
  
  try {
    // The error shows: user_profiles.id must reference auth.users.id
    // Let's confirm this by trying to create a profile with existing user ID
    
    const { data: existingUsers, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.log('❌ Cannot get existing users:', userError.message);
      return;
    }

    if (existingUsers.users.length > 0) {
      const existingUser = existingUsers.users[0];
      console.log(`✅ Found existing user: ${existingUser.email} (${existingUser.id})`);
      
      // Try to create a profile for this existing user
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: existingUser.id,
          email: 'test-profile@example.com',
          role: 'teacher',
          name: 'Test Profile',
          photon_id: 'test-profile-123'
        });

      if (error) {
        console.log('❌ Profile creation failed even with valid user ID:', error.message);
        console.log('   This suggests additional constraints or RLS issues');
      } else {
        console.log('✅ Profile creation works with valid user ID');
        
        // Clean up
        await supabase.from('user_profiles').delete().eq('id', existingUser.id).eq('photon_id', 'test-profile-123');
      }
    }

  } catch (error) {
    console.log('❌ Foreign key test error:', error.message);
  }
  
  console.log('');
}

async function testMinimalAuthCreation() {
  console.log('2️⃣ Testing Minimal Auth User Creation...');
  
  try {
    // Try creating with absolute minimal data
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'minimal-test@photon.edu',
      password: 'test123456',
      email_confirm: true
    });

    if (error) {
      console.log('❌ Minimal auth creation failed:', error.message);
      console.log('   Error details:', error);
      
      // Check if it's a specific database constraint
      if (error.message.includes('Database error')) {
        console.log('   🔍 This is a database-level constraint issue');
        console.log('   Possible causes:');
        console.log('   - Auth schema modifications');
        console.log('   - Missing required fields');
        console.log('   - Database triggers failing');
        console.log('   - RLS policies blocking insertion');
      }
    } else {
      console.log('✅ Minimal auth creation succeeded');
      console.log(`   Created user: ${data.user.email} (${data.user.id})`);
      
      // Clean up
      await supabase.auth.admin.deleteUser(data.user.id);
    }

  } catch (error) {
    console.log('❌ Minimal auth test error:', error.message);
  }
  
  console.log('');
}

async function testAlternativeAuthCreation() {
  console.log('3️⃣ Testing Alternative Auth Creation Methods...');
  
  // Method 1: Try with different email domain
  try {
    console.log('   Testing with .com domain...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test-alt@example.com',
      password: 'test123456',
      email_confirm: true
    });

    if (error) {
      console.log('   ❌ .com domain failed:', error.message);
    } else {
      console.log('   ✅ .com domain worked');
      await supabase.auth.admin.deleteUser(data.user.id);
    }
  } catch (error) {
    console.log('   ❌ .com domain error:', error.message);
  }

  // Method 2: Try signup instead of admin create
  try {
    console.log('   Testing signup method...');
    const { data, error } = await supabase.auth.signUp({
      email: 'test-signup@photon.edu',
      password: 'test123456'
    });

    if (error) {
      console.log('   ❌ Signup method failed:', error.message);
    } else {
      console.log('   ✅ Signup method worked');
      // Note: signup users might need email confirmation
    }
  } catch (error) {
    console.log('   ❌ Signup method error:', error.message);
  }
  
  console.log('');
}

async function checkCurrentState() {
  console.log('4️⃣ Checking Current Database State...');
  
  try {
    // Check current users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (!userError) {
      console.log(`📊 Current auth users: ${users.users.length}`);
      users.users.forEach(user => {
        console.log(`   ${user.email} (${user.id}) - Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      });
    }

    // Check current profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*');

    if (!profileError) {
      console.log(`📊 Current user profiles: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`   ${profile.name} (${profile.photon_id}) - Role: ${profile.role}`);
      });
    } else {
      console.log('❌ Cannot access user profiles:', profileError.message);
    }

    // Check if there are orphaned profiles
    if (!userError && !profileError) {
      const authIds = users.users.map(u => u.id);
      const profileIds = profiles.map(p => p.id);
      
      const orphanedProfiles = profileIds.filter(id => !authIds.includes(id));
      const missingProfiles = authIds.filter(id => !profileIds.includes(id));
      
      if (orphanedProfiles.length > 0) {
        console.log('⚠️  Orphaned profiles (no auth user):', orphanedProfiles.length);
      }
      
      if (missingProfiles.length > 0) {
        console.log('⚠️  Auth users without profiles:', missingProfiles.length);
      }
      
      if (orphanedProfiles.length === 0 && missingProfiles.length === 0) {
        console.log('✅ All profiles properly linked to auth users');
      }
    }

  } catch (error) {
    console.log('❌ State check error:', error.message);
  }
  
  console.log('');
}

// Run simple diagnosis
diagnoseConstraintsSimple()
  .then(() => {
    console.log('🎯 Simple Diagnosis Complete!');
    console.log('\n💡 Recommended Solutions:');
    console.log('1. If minimal auth creation fails: Check Supabase project settings');
    console.log('2. If foreign key constraint is the only issue: Create auth users first, then profiles');
    console.log('3. If RLS is blocking: Temporarily disable RLS or adjust policies');
    console.log('4. If database triggers fail: Check trigger functions');
    console.log('5. Consider using Supabase Dashboard as it bypasses API limitations');
  })
  .catch(console.error);