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

async function fixAuthConstraints() {
  console.log('🔧 Fixing Auth Database Constraints...\n');

  console.log('📋 Issue Summary:');
  console.log('- "Database error creating new user" for ALL user creation attempts');
  console.log('- This affects both admin.createUser() and auth.signUp()');
  console.log('- Existing user (jp7@photon) works fine');
  console.log('- Foreign key constraints are working correctly');
  console.log('');

  // Step 1: Check if it's a trigger issue
  await checkAndFixTriggers();
  
  // Step 2: Check if it's an RLS issue
  await checkAndFixRLS();
  
  // Step 3: Try to identify the specific constraint
  await identifySpecificConstraint();
  
  // Step 4: Test the fix
  await testFix();
}

async function checkAndFixTriggers() {
  console.log('1️⃣ Checking and Fixing Trigger Issues...');
  
  try {
    // The issue might be with the user profile creation trigger
    // Let's try to disable it temporarily and see if user creation works
    
    console.log('   Attempting to identify trigger issues...');
    
    // Check if the trigger exists and is causing problems
    const triggerCheckSQL = `
      SELECT trigger_name, event_manipulation, action_timing, action_statement
      FROM information_schema.triggers 
      WHERE event_object_schema = 'auth' 
      AND event_object_table = 'users';
    `;
    
    // Since we can't run raw SQL easily, let's try a different approach
    // Let's check if we can create a user profile manually for a non-existent user
    
    const testUserId = require('crypto').randomUUID();
    console.log(`   Testing profile creation with fake user ID: ${testUserId}`);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: testUserId,
        email: 'trigger-test@example.com',
        role: 'student',
        name: 'Trigger Test',
        photon_id: 'trigger-test'
      });

    if (error) {
      if (error.code === '23503') {
        console.log('   ✅ Foreign key constraint working correctly');
        console.log('   ❌ Issue is NOT with user_profiles trigger');
      } else {
        console.log('   ❌ Different constraint issue:', error.message);
      }
    } else {
      console.log('   ⚠️  Profile created without auth user (unexpected)');
      // Clean up
      await supabase.from('user_profiles').delete().eq('id', testUserId);
    }

  } catch (error) {
    console.log('   ❌ Trigger check error:', error.message);
  }
  
  console.log('');
}

async function checkAndFixRLS() {
  console.log('2️⃣ Checking RLS Policies on Auth Schema...');
  
  try {
    // The issue might be RLS policies on the auth.users table
    // Since we can't directly query auth schema policies, let's try a workaround
    
    console.log('   RLS on auth.users cannot be directly checked via API');
    console.log('   But we can test if service role bypasses RLS...');
    
    // Test if we can read from auth.users (we already know this works)
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('   ❌ Cannot read auth users:', error.message);
    } else {
      console.log('   ✅ Can read auth users (RLS not blocking reads)');
    }
    
    // The issue is likely NOT RLS since service role should bypass it
    console.log('   💡 Service role should bypass RLS, so this is likely not the issue');

  } catch (error) {
    console.log('   ❌ RLS check error:', error.message);
  }
  
  console.log('');
}

async function identifySpecificConstraint() {
  console.log('3️⃣ Identifying Specific Database Constraint...');
  
  try {
    console.log('   Based on the error pattern, possible causes:');
    console.log('   1. Missing required fields in auth.users table');
    console.log('   2. Custom constraints added to auth schema');
    console.log('   3. Database triggers failing on auth.users');
    console.log('   4. Instance-level configuration issues');
    console.log('');
    
    // Let's check what fields are required by looking at the existing user
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (!error && users.users.length > 0) {
      const existingUser = users.users[0];
      console.log('   📊 Existing user structure:');
      console.log(`   - ID: ${existingUser.id}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - Created: ${existingUser.created_at}`);
      console.log(`   - Confirmed: ${existingUser.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`   - Phone: ${existingUser.phone || 'None'}`);
      console.log(`   - Provider: ${existingUser.app_metadata?.provider || 'Unknown'}`);
      console.log(`   - Providers: ${existingUser.app_metadata?.providers?.join(', ') || 'Unknown'}`);
      console.log('');
      
      // Check if there are any unusual fields that might be required
      console.log('   🔍 Full user metadata:');
      console.log('   App metadata:', JSON.stringify(existingUser.app_metadata, null, 2));
      console.log('   User metadata:', JSON.stringify(existingUser.user_metadata, null, 2));
    }

  } catch (error) {
    console.log('   ❌ Constraint identification error:', error.message);
  }
  
  console.log('');
}

async function testFix() {
  console.log('4️⃣ Testing Potential Fixes...');
  
  try {
    // Fix attempt 1: Try creating user with exact same structure as existing user
    console.log('   Fix Attempt 1: Matching existing user structure...');
    
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users[0];
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'fix-test-1@photon.edu',
      password: 'test123456',
      email_confirm: true,
      phone_confirm: false,
      user_metadata: existingUser.user_metadata || {},
      app_metadata: {
        provider: 'email',
        providers: ['email']
      }
    });

    if (error) {
      console.log('   ❌ Fix attempt 1 failed:', error.message);
    } else {
      console.log('   ✅ Fix attempt 1 succeeded!');
      console.log('   🎉 User creation is now working!');
      
      // Clean up test user
      await supabase.auth.admin.deleteUser(data.user.id);
      
      // Now try creating the actual teachers
      await createTeachersWithFix();
      return;
    }

    // Fix attempt 2: Try with minimal required fields only
    console.log('   Fix Attempt 2: Minimal required fields...');
    
    const { data: data2, error: error2 } = await supabase.auth.admin.createUser({
      email: 'fix-test-2@photon.edu',
      password: 'test123456',
      email_confirm: true
    });

    if (error2) {
      console.log('   ❌ Fix attempt 2 failed:', error2.message);
      console.log('   💡 This appears to be a deeper database configuration issue');
      console.log('   🔧 Recommended: Check Supabase project settings or contact support');
    } else {
      console.log('   ✅ Fix attempt 2 succeeded!');
      await supabase.auth.admin.deleteUser(data2.user.id);
      await createTeachersWithFix();
    }

  } catch (error) {
    console.log('   ❌ Fix test error:', error.message);
  }
  
  console.log('');
}

async function createTeachersWithFix() {
  console.log('5️⃣ Creating Teachers with Working Method...');
  
  const teachers = [
    {
      name: 'Shiv Prakash Yadav',
      photon_id: 'sp8@photon',
      email: 'sp8@photon.edu',
      password: 'sp8@photon',
      subject: 'Mathematics',
      department: 'Science'
    },
    {
      name: 'Mahavir Kesari',
      photon_id: 'mk6@photon',
      email: 'mk6@photon.edu',
      password: 'mk6@photon',
      subject: 'Physics',
      department: 'Science'
    },
    {
      name: 'AK Mishra',
      photon_id: 'ak5@photon',
      email: 'ak5@photon.edu',
      password: 'ak5@photon',
      subject: 'Chemistry',
      department: 'Science'
    }
  ];

  for (const teacher of teachers) {
    try {
      console.log(`   Creating: ${teacher.name}...`);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: teacher.email,
        password: teacher.password,
        email_confirm: true,
        user_metadata: {
          name: teacher.name,
          role: 'teacher',
          photon_id: teacher.photon_id,
          subject: teacher.subject,
          department: teacher.department
        },
        app_metadata: {
          provider: 'email',
          providers: ['email']
        }
      });

      if (error) {
        console.log(`   ❌ Failed to create ${teacher.name}:`, error.message);
      } else {
        console.log(`   ✅ Created ${teacher.name} successfully!`);
        
        // Wait for profile creation trigger
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.log(`   ❌ Error creating ${teacher.name}:`, error.message);
    }
  }
  
  // Final verification
  console.log('\n🔍 Final Verification...');
  const { data: finalUsers } = await supabase.auth.admin.listUsers();
  const { data: finalProfiles } = await supabase.from('user_profiles').select('*').eq('role', 'teacher');
  
  console.log(`📊 Total auth users: ${finalUsers.users.length}`);
  console.log(`📊 Total teacher profiles: ${finalProfiles.length}`);
  
  if (finalProfiles.length >= 4) {
    console.log('🎉 SUCCESS! All teachers have been created!');
    console.log('\n🔑 Login Credentials:');
    finalProfiles.forEach(profile => {
      const password = profile.photon_id === 'jp7' ? 'jp7@photon' : profile.photon_id;
      console.log(`   ${profile.name}: ${profile.email} / ${password}`);
    });
  }
}

// Run the fix
fixAuthConstraints().catch(console.error);