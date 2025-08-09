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

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints and Database Tables...\n');

  // Test 1: Check if tests table exists
  await checkTestsTable();
  
  // Test 2: Check if other required tables exist
  await checkRequiredTables();
  
  // Test 3: Test API endpoints directly
  await testAPIDirectly();
  
  // Test 4: Create sample test data if missing
  await createSampleTestData();
}

async function checkTestsTable() {
  console.log('1️⃣ Checking tests table...');
  
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Tests table error:', error.message);
      if (error.message.includes('does not exist')) {
        console.log('   🔧 Tests table does not exist - needs to be created');
        return false;
      }
    } else {
      console.log('✅ Tests table exists');
      console.log(`   Found ${data.length} test records`);
      if (data.length > 0) {
        console.log('   Sample columns:', Object.keys(data[0]));
      }
      return true;
    }
  } catch (error) {
    console.log('❌ Tests table check error:', error.message);
    return false;
  }
}

async function checkRequiredTables() {
  console.log('\n2️⃣ Checking other required tables...');
  
  const tables = [
    'user_profiles',
    'study_materials', 
    'test_results',
    'live_tests',
    'test_participants',
    'student_rankings'
  ];

  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('count(*)')
        .limit(1);

      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: exists`);
      }
    } catch (error) {
      console.log(`❌ ${tableName}: ${error.message}`);
    }
  }
}

async function testAPIDirectly() {
  console.log('\n3️⃣ Testing API endpoints...');
  
  const endpoints = [
    '/api/tests/available',
    '/api/supabase/study-materials',
    '/api/supabase/test-results',
    '/api/supabase/tests'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`   Testing ${endpoint}...`);
      
      const response = await fetch(`http://localhost:9002${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${endpoint}: Working (${response.status})`);
        if (Array.isArray(data)) {
          console.log(`      Returned ${data.length} items`);
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ ${endpoint}: Failed (${response.status})`);
        console.log(`      Error: ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint}: Network error - ${error.message}`);
    }
  }
}

async function createSampleTestData() {
  console.log('\n4️⃣ Creating sample test data...');
  
  try {
    // Get a teacher ID for attribution
    const { data: teachers, error: teacherError } = await supabase
      .from('user_profiles')
      .select('id, email, name')
      .eq('role', 'teacher')
      .limit(1);

    if (teacherError || !teachers || teachers.length === 0) {
      console.log('⚠️  No teachers found, cannot create sample tests');
      return;
    }

    const teacher = teachers[0];
    console.log(`   Using teacher: ${teacher.name} (${teacher.email})`);

    // Create sample tests
    const sampleTests = [
      {
        title: 'Mathematics - Algebra Test',
        description: 'Basic algebra concepts and problem solving',
        subject: 'Mathematics',
        duration_minutes: 60,
        max_marks: 40,
        is_active: true,
        created_by: teacher.id,
        questions: [
          {
            id: 1,
            question: 'Solve for x: 2x + 5 = 15',
            options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 2.5'],
            correct_answer: 0,
            marks: 4
          },
          {
            id: 2,
            question: 'What is the value of x² when x = 3?',
            options: ['6', '9', '12', '15'],
            correct_answer: 1,
            marks: 4
          }
        ]
      },
      {
        title: 'Physics - Motion and Force',
        description: 'Understanding basic concepts of motion and Newton\'s laws',
        subject: 'Physics',
        duration_minutes: 45,
        max_marks: 30,
        is_active: true,
        created_by: teacher.id,
        questions: [
          {
            id: 1,
            question: 'What is Newton\'s first law of motion?',
            options: ['F = ma', 'Every action has equal and opposite reaction', 'An object at rest stays at rest unless acted upon by force', 'None of the above'],
            correct_answer: 2,
            marks: 5
          }
        ]
      }
    ];

    for (const test of sampleTests) {
      const { data, error } = await supabase
        .from('tests')
        .insert([test])
        .select()
        .single();

      if (error) {
        console.log(`   ❌ Failed to create "${test.title}":`, error.message);
      } else {
        console.log(`   ✅ Created test: ${data.title}`);
      }
    }

  } catch (error) {
    console.log('❌ Sample data creation error:', error.message);
  }
}

// Run the tests
testAPIEndpoints()
  .then(() => {
    console.log('\n🎯 API Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('- Check above results for any missing tables');
    console.log('- API endpoints tested against running server');
    console.log('- Sample test data created if possible');
    console.log('\n🔄 Try refreshing the teacher dashboard now');
  })
  .catch(console.error);