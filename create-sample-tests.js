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

async function createSampleTests() {
  console.log('📝 Creating Sample Tests for Teacher Dashboard...\n');

  // Get teachers for attribution
  const { data: teachers, error: teacherError } = await supabase
    .from('user_profiles')
    .select('id, name, email')
    .eq('role', 'teacher');

  if (teacherError) {
    console.log('❌ Cannot fetch teachers:', teacherError.message);
    return;
  }

  console.log(`Found ${teachers.length} teachers:`);
  teachers.forEach(t => console.log(`   • ${t.name} (${t.email})`));

  const sampleTests = [
    {
      title: 'Mathematics - Algebra Basics',
      description: 'Test covering basic algebraic concepts including linear equations and quadratic equations',
      subject: 'Mathematics',
      duration_minutes: 60,
      max_marks: 40,
      is_active: true,
      is_published: true,
      created_by: teachers.find(t => t.email === 'sp8@photon.edu')?.id || teachers[0]?.id,
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
        },
        {
          id: 3,
          question: 'Simplify: 3x + 2x - x',
          options: ['4x', '5x', '6x', '2x'],
          correct_answer: 0,
          marks: 4
        }
      ]
    },
    {
      title: 'Physics - Motion and Force',
      description: 'Understanding basic concepts of motion, velocity, acceleration and Newton\'s laws',
      subject: 'Physics',
      duration_minutes: 45,
      max_marks: 30,
      is_active: true,
      is_published: true,
      created_by: teachers.find(t => t.email === 'mk6@photon.edu')?.id || teachers[0]?.id,
      questions: [
        {
          id: 1,
          question: 'What is Newton\'s first law of motion?',
          options: ['F = ma', 'Every action has equal and opposite reaction', 'An object at rest stays at rest unless acted upon by force', 'None of the above'],
          correct_answer: 2,
          marks: 5
        },
        {
          id: 2,
          question: 'The SI unit of force is:',
          options: ['Joule', 'Newton', 'Watt', 'Pascal'],
          correct_answer: 1,
          marks: 5
        }
      ]
    },
    {
      title: 'Chemistry - Periodic Table',
      description: 'Test on periodic table trends, atomic structure and chemical bonding',
      subject: 'Chemistry',
      duration_minutes: 50,
      max_marks: 35,
      is_active: true,
      is_published: true,
      created_by: teachers.find(t => t.email === 'ak5@photon.edu')?.id || teachers[0]?.id,
      questions: [
        {
          id: 1,
          question: 'Which element has the atomic number 6?',
          options: ['Oxygen', 'Carbon', 'Nitrogen', 'Boron'],
          correct_answer: 1,
          marks: 5
        },
        {
          id: 2,
          question: 'What is the maximum number of electrons in the second shell?',
          options: ['2', '8', '18', '32'],
          correct_answer: 1,
          marks: 5
        }
      ]
    }
  ];

  console.log('\n📝 Creating tests...');

  for (const test of sampleTests) {
    try {
      const { data, error } = await supabase
        .from('tests')
        .insert([{
          ...test,
          questions: JSON.stringify(test.questions)
        }])
        .select()
        .single();

      if (error) {
        console.log(`❌ Failed to create "${test.title}":`, error.message);
      } else {
        console.log(`✅ Created: ${data.title}`);
        console.log(`   Subject: ${data.subject} | Duration: ${data.duration_minutes}min | Marks: ${data.max_marks}`);
      }
    } catch (error) {
      console.log(`❌ Error creating "${test.title}":`, error.message);
    }
  }

  // Verify creation
  console.log('\n🔍 Verifying created tests...');
  const { data: allTests, error: fetchError } = await supabase
    .from('tests')
    .select('*')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.log('❌ Could not fetch tests:', fetchError.message);
  } else {
    console.log(`✅ Total tests in database: ${allTests.length}`);
    
    console.log('\n📋 Available tests:');
    allTests.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.title}`);
      console.log(`      Subject: ${test.subject} | Duration: ${test.duration_minutes}min`);
      console.log(`      Questions: ${test.questions ? JSON.parse(test.questions).length : 0}`);
      console.log(`      Created: ${new Date(test.created_at).toLocaleDateString()}`);
      console.log('');
    });
  }

  console.log('\n🎉 Sample tests creation complete!');
  console.log('\n🚀 Next steps:');
  console.log('1. Refresh your teacher dashboard: http://localhost:9002/teacher-dashboard');
  console.log('2. Login as any teacher and check the "Available Tests" section');
  console.log('3. You should see the 3 sample tests listed');
}

createSampleTests().catch(console.error);