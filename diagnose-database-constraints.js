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

async function diagnoseDatabaseConstraints() {
  console.log('🔍 Diagnosing Database Constraints and Issues...\n');

  // Test 1: Check service role permissions
  await checkServiceRolePermissions();
  
  // Test 2: Check auth schema and constraints
  await checkAuthSchema();
  
  // Test 3: Check user_profiles table constraints
  await checkUserProfilesConstraints();
  
  // Test 4: Check triggers and functions
  await checkTriggersAndFunctions();
  
  // Test 5: Check RLS policies
  await checkRLSPolicies();
  
  // Test 6: Test direct database operations
  await testDirectDatabaseOperations();
  
  // Test 7: Check for conflicting data
  await checkConflictingData();
}

async function checkServiceRolePermissions() {
  console.log('1️⃣ Checking Service Role Permissions...');
  
  try {
    // Test basic database access
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.log('❌ Service role cannot access user_profiles:', error.message);
    } else {
      console.log('✅ Service role has basic database access');
    }

    // Test auth admin access
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Service role cannot access auth admin:', authError.message);
    } else {
      console.log('✅ Service role has auth admin access');
      console.log(`   Current users count: ${users.users.length}`);
    }

  } catch (error) {
    console.log('❌ Service role permission error:', error.message);
  }
  
  console.log('');
}

async function checkAuthSchema() {
  console.log('2️⃣ Checking Auth Schema and Constraints...');
  
  try {
    // Check auth.users table structure
    const { data, error } = await supabase.rpc('get_table_info', {
      table_schema: 'auth',
      table_name: 'users'
    });

    if (error) {
      console.log('❌ Cannot access auth.users schema info:', error.message);
      
      // Try alternative approach
      const { data: altData, error: altError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'auth')
        .eq('table_name', 'users');

      if (altError) {
        console.log('❌ Cannot access auth schema at all:', altError.message);
      } else {
        console.log('✅ Auth schema accessible via information_schema');
        console.log('   Key columns found:', altData?.map(c => c.column_name).join(', '));
      }
    } else {
      console.log('✅ Auth schema accessible');
      console.log('   Schema info:', data);
    }

    // Check for auth constraints
    const { data: constraints, error: constraintError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_schema', 'auth')
      .eq('table_name', 'users');

    if (!constraintError && constraints) {
      console.log('📋 Auth constraints:');
      constraints.forEach(c => {
        console.log(`   ${c.constraint_name}: ${c.constraint_type}`);
      });
    }

  } catch (error) {
    console.log('❌ Auth schema check error:', error.message);
  }
  
  console.log('');
}

async function checkUserProfilesConstraints() {
  console.log('3️⃣ Checking User Profiles Constraints...');
  
  try {
    // Check table structure
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_profiles');

    if (columnError) {
      console.log('❌ Cannot access user_profiles schema:', columnError.message);
    } else {
      console.log('✅ User profiles table structure:');
      columns.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
    }

    // Check constraints
    const { data: constraints, error: constraintError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_profiles');

    if (!constraintError && constraints) {
      console.log('📋 User profiles constraints:');
      constraints.forEach(c => {
        console.log(`   ${c.constraint_name}: ${c.constraint_type}`);
      });
    }

    // Check foreign key constraints specifically
    const { data: fkConstraints, error: fkError } = await supabase
      .from('information_schema.referential_constraints')
      .select('constraint_name, unique_constraint_name')
      .eq('constraint_schema', 'public');

    if (!fkError && fkConstraints) {
      console.log('🔗 Foreign key constraints:');
      fkConstraints.forEach(fk => {
        console.log(`   ${fk.constraint_name} -> ${fk.unique_constraint_name}`);
      });
    }

  } catch (error) {
    console.log('❌ User profiles constraint check error:', error.message);
  }
  
  console.log('');
}

async function checkTriggersAndFunctions() {
  console.log('4️⃣ Checking Triggers and Functions...');
  
  try {
    // Check for triggers on auth.users
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_timing')
      .eq('event_object_schema', 'auth')
      .eq('event_object_table', 'users');

    if (!triggerError && triggers) {
      console.log('🔧 Auth triggers:');
      triggers.forEach(t => {
        console.log(`   ${t.trigger_name}: ${t.action_timing} ${t.event_manipulation}`);
      });
    } else {
      console.log('⚠️  No auth triggers found or cannot access');
    }

    // Check for user profile creation function
    const { data: functions, error: functionError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .eq('routine_schema', 'public')
      .like('routine_name', '%user_profile%');

    if (!functionError && functions) {
      console.log('⚙️  User profile functions:');
      functions.forEach(f => {
        console.log(`   ${f.routine_name}: ${f.routine_type}`);
      });
    }

  } catch (error) {
    console.log('❌ Trigger/function check error:', error.message);
  }
  
  console.log('');
}

async function checkRLSPolicies() {
  console.log('5️⃣ Checking RLS Policies...');
  
  try {
    // Check if RLS is enabled on user_profiles
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .eq('tablename', 'user_profiles');

    if (!rlsError && rlsStatus) {
      console.log('🔒 RLS Status:');
      rlsStatus.forEach(table => {
        console.log(`   ${table.tablename}: ${table.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
      });
    }

    // Check policies
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, roles')
      .eq('schemaname', 'public')
      .eq('tablename', 'user_profiles');

    if (!policyError && policies) {
      console.log('📜 RLS Policies:');
      policies.forEach(p => {
        console.log(`   ${p.policyname}: ${p.cmd} for ${p.roles}`);
      });
    }

  } catch (error) {
    console.log('❌ RLS check error:', error.message);
  }
  
  console.log('');
}

async function testDirectDatabaseOperations() {
  console.log('6️⃣ Testing Direct Database Operations...');
  
  try {
    // Test 1: Try to insert a simple record into user_profiles (should fail due to FK)
    const testId = require('crypto').randomUUID();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: testId,
        email: 'test@example.com',
        role: 'teacher',
        name: 'Test User',
        photon_id: 'test123'
      });

    if (error) {
      console.log('❌ Direct insert failed (expected):', error.message);
      console.log('   Error code:', error.code);
      console.log('   Error details:', error.details);
    } else {
      console.log('⚠️  Direct insert succeeded (unexpected)');
      
      // Clean up
      await supabase.from('user_profiles').delete().eq('id', testId);
    }

    // Test 2: Check if we can query auth.users directly
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(1);

    if (authError) {
      console.log('❌ Cannot query auth.users directly:', authError.message);
    } else {
      console.log('✅ Can query auth.users directly');
    }

  } catch (error) {
    console.log('❌ Direct operation test error:', error.message);
  }
  
  console.log('');
}

async function checkConflictingData() {
  console.log('7️⃣ Checking for Conflicting Data...');
  
  const testEmails = ['sp8@photon.edu', 'mk6@photon.edu', 'ak5@photon.edu'];
  
  try {
    // Check if emails already exist in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (!authError) {
      console.log('📧 Email conflict check:');
      testEmails.forEach(email => {
        const exists = authUsers.users.find(u => u.email === email);
        console.log(`   ${email}: ${exists ? '❌ EXISTS' : '✅ Available'}`);
      });
    }

    // Check if photon_ids already exist in user_profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('photon_id, email')
      .in('photon_id', ['sp8@photon', 'mk6@photon', 'ak5@photon']);

    if (!profileError) {
      console.log('🆔 Photon ID conflict check:');
      ['sp8@photon', 'mk6@photon', 'ak5@photon'].forEach(id => {
        const exists = profiles?.find(p => p.photon_id === id);
        console.log(`   ${id}: ${exists ? '❌ EXISTS' : '✅ Available'}`);
      });
    }

  } catch (error) {
    console.log('❌ Conflict check error:', error.message);
  }
  
  console.log('');
}

// Run diagnosis
diagnoseDatabaseConstraints()
  .then(() => {
    console.log('🎯 Diagnosis Complete!');
    console.log('\nNext steps based on findings:');
    console.log('1. Check the output above for specific constraint violations');
    console.log('2. Look for foreign key constraint errors');
    console.log('3. Verify RLS policies are not blocking operations');
    console.log('4. Check if triggers are causing issues');
    console.log('5. Run the fix script based on identified issues');
  })
  .catch(console.error);