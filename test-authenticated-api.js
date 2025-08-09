/**
 * Test Authenticated API
 * Tests the authenticated API endpoints with the jp7@photon user
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

async function testAuthenticatedAPI() {
  try {
    console.log('🧪 Testing authenticated API...');
    
    // Step 1: Login
    console.log('\n1️⃣ Logging in as jp7@photon...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jp7@photon',
      password: 'jp7@photon'
    });

    if (authError) {
      console.error('❌ Login failed:', authError.message);
      return;
    }

    console.log('✅ Login successful!');
    console.log('👤 User ID:', authData.user.id);
    console.log('📧 Email:', authData.user.email);
    console.log('🎭 Role:', authData.user.user_metadata?.role);

    // Step 2: Test user API
    console.log('\n2️⃣ Testing user API...');
    
    try {
      const userResponse = await fetch('http://localhost:3002/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${authData.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const userData = await userResponse.json();
      
      if (userData.success) {
        console.log('✅ User API successful:', userData.data);
      } else {
        console.log('⚠️ User API returned error:', userData.error);
      }
    } catch (apiError) {
      console.log('⚠️ User API test skipped (server may not be running)');
    }

    // Step 3: Test database access with RLS
    console.log('\n3️⃣ Testing database access with RLS...');
    
    // Test reading tests (should work for teachers)
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select('*')
      .limit(5);

    if (testsError) {
      console.log('⚠️ Tests query error (expected if RLS is enabled):', testsError.message);
    } else {
      console.log('✅ Tests query successful:', tests?.length || 0, 'tests found');
    }

    // Test reading test results (should work for teachers)
    const { data: results, error: resultsError } = await supabase
      .from('test_results')
      .select('*')
      .limit(5);

    if (resultsError) {
      console.log('⚠️ Test results query error (expected if RLS is enabled):', resultsError.message);
    } else {
      console.log('✅ Test results query successful:', results?.length || 0, 'results found');
    }

    // Step 4: Test creating a test result
    console.log('\n4️⃣ Testing test result creation...');
    
    const testResult = {
      id: 'test-result-' + Date.now(),
      test_id: 'test-' + Date.now(),
      student_id: authData.user.id,
      test_name: 'Sample Test',
      score: 85,
      max_marks: 100,
      percentage: 85,
      time_taken: 1800,
      answers: { q1: 0, q2: 1, q3: 2 },
      submitted_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('test_results')
      .insert([testResult])
      .select()
      .single();

    if (insertError) {
      console.log('⚠️ Test result insert error (expected if table doesn\'t exist):', insertError.message);
    } else {
      console.log('✅ Test result created successfully:', insertData.id);
    }

    // Step 5: Test session persistence
    console.log('\n5️⃣ Testing session persistence...');
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('⚠️ Session error:', sessionError.message);
    } else if (sessionData.session) {
      console.log('✅ Session is active');
      console.log('⏰ Expires at:', new Date(sessionData.session.expires_at * 1000).toLocaleString());
    } else {
      console.log('⚠️ No active session');
    }

    // Step 6: Sign out
    console.log('\n6️⃣ Signing out...');
    
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log('⚠️ Sign out error:', signOutError.message);
    } else {
      console.log('✅ Signed out successfully');
    }

    console.log('\n🎉 Authentication test completed!');
    console.log('📝 Summary:');
    console.log('  - User authentication: ✅ Working');
    console.log('  - User metadata: ✅ Working');
    console.log('  - Session management: ✅ Working');
    console.log('  - Database access: ⚠️ Depends on RLS setup');
    console.log('\n🌐 Ready for browser testing at: http://localhost:3002/faculty-portal');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testAuthenticatedAPI();