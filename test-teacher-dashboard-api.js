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

async function testTeacherDashboardAPI() {
  console.log('🧪 Testing Teacher Dashboard API After Fix...\n');

  // Test 1: Check tests table structure
  await checkTestsTableStructure();
  
  // Test 2: Check if sample tests were created
  await checkSampleTests();
  
  // Test 3: Test the API endpoint logic directly
  await testAPILogicDirectly();
  
  // Test 4: Create a simple test if none exist
  await createSimpleTestIfNeeded();
}

async function checkTestsTableStructure() {
  console.log('1️⃣ Checking tests table structure...');
  
  try {
    // Try to select with all the columns the API expects
    const { data, error } = await supabase
      .from('tests')
      .select(`
        id,
        title,
        subject,
        description,
        duration_minutes,
        max_marks,
        is_active,
        created_at,
        created_by
      `)
      .limit(1);

    if (error) {
      console.log('❌ Tests table structure issue:', error.message);
      if (error.message.includes('column')) {
        console.log('   🔧 Missing columns detected - run the SQL fix script');
      }
      return false;
    } else {
      console.log('✅ Tests table structure is correct');
      if (data.length > 0) {
        console.log('   Sample test found:', data[0].title);
      }
      return true;
    }
  } catch (error) {
    console.log('❌ Tests table check error:', error.message);
    return false;
  }
}

async function checkSampleTests() {
  console.log('\n2️⃣ Checking sample tests...');
  
  try {
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Cannot fetch tests:', error.message);
      return;
    }

    console.log(`✅ Found ${tests.length} tests in database`);
    
    if (tests.length > 0) {
      console.log('\n📋 Available tests:');
      tests.forEach((test, index) => {
        console.log(`   ${index + 1}. ${test.title}`);
        console.log(`      Subject: ${test.subject || 'Not set'}`);
        console.log(`      Duration: ${test.duration_minutes || 'Not set'} minutes`);
        console.log(`      Max Marks: ${test.max_marks || 'Not set'}`);
        console.log(`      Active: ${test.is_active ? 'Yes' : 'No'}`);
        console.log(`      Questions: ${test.questions ? JSON.parse(test.questions).length : 0}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No tests found - will create sample test');
    }

  } catch (error) {
    console.log('❌ Sample tests check error:', error.message);
  }
}

async function testAPILogicDirectly() {
  console.log('\n3️⃣ Testing API logic directly...');
  
  try {
    // Simulate what the API does - get tests for a specific teacher
    const { data: teachers, error: teacherError } = await supabase
      .from('user_profiles')
      .select('id, email, name')
      .eq('role', 'teacher')
      .limit(1);

    if (teacherError || !teachers || teachers.length === 0) {
      console.log('❌ No teachers found for API test');
      return;
    }

    const teacher = teachers[0];
    console.log(`   Testing with teacher: ${teacher.name} (${teacher.email})`);

    // Get tests created by this teacher (simulating the API logic)
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select(`
        id,
        title,
        subject,
        description,
        duration_minutes,
        max_marks,
        is_active,
        created_at,
        created_by
      `)
      .eq('created_by', teacher.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (testsError) {
      console.log('❌ API logic test failed:', testsError.message);
      return;
    }

    console.log(`✅ API logic works - found ${tests.length} tests for this teacher`);
    
    // Transform data like the API does
    const availableTests = tests.map(test => ({
      id: test.id,
      title: test.title,
      subject: test.subject || 'General',
      class_level: '10',
      duration: test.duration_minutes || 60,
      total_questions: Math.floor((test.max_marks || 40) / 4),
      published: test.is_active,
      created_at: test.created_at
    }));

    console.log('   Transformed data sample:', availableTests[0] || 'No tests');

  } catch (error) {
    console.log('❌ API logic test error:', error.message);
  }
}

async function createSimpleTestIfNeeded() {
  console.log('\n4️⃣ Creating simple test if needed...');
  
  try {
    // Check if we have any tests
    const { data: existingTests, error: checkError } = await supabase
      .from('tests')
      .select('count(*)')
      .limit(1);

    if (checkError) {
      console.log('❌ Cannot check existing tests:', checkError.message);
      return;
    }

    // If no tests exist, create a simple one
    const { data: testCount } = await supabase
      .from('tests')
      .select('id')
      .limit(1);

    if (!testCount || testCount.length === 0) {
      console.log('   Creating a simple test...');
      
      // Get first teacher
      const { data: teachers } = await supabase
        .from('user_profiles')
        .select('id, name')
        .eq('role', 'teacher')
        .limit(1);

      if (teachers && teachers.length > 0) {
        const simpleTest = {
          title: 'Sample Test - Getting Started',
          description: 'A simple test to verify the system is working',
          subject: 'General',
          duration_minutes: 30,
          max_marks: 20,
          is_active: true,
          is_published: true,
          created_by: teachers[0].id,
          questions: JSON.stringify([
            {
              id: 1,
              question: 'What is 2 + 2?',
              options: ['3', '4', '5', '6'],
              correct_answer: 1,
              marks: 5
            },
            {
              id: 2,
              question: 'Which planet is closest to the Sun?',
              options: ['Venus', 'Mercury', 'Earth', 'Mars'],
              correct_answer: 1,
              marks: 5
            }
          ])
        };

        const { data, error } = await supabase
          .from('tests')
          .insert([simpleTest])
          .select()
          .single();

        if (error) {
          console.log('❌ Failed to create simple test:', error.message);
        } else {
          console.log('✅ Created simple test:', data.title);
        }
      }
    } else {
      console.log('✅ Tests already exist, no need to create more');
    }

  } catch (error) {
    console.log('❌ Simple test creation error:', error.message);
  }
}

// Run the tests
testTeacherDashboardAPI()
  .then(() => {
    console.log('\n🎯 Teacher Dashboard API Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. If you see missing columns, run the SQL fix script');
    console.log('2. Refresh your teacher dashboard page');
    console.log('3. The "Failed to fetch available tests" error should be resolved');
    console.log('\n🔄 Try refreshing http://localhost:9002/teacher-dashboard now');
  })
  .catch(console.error);