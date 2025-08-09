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

async function createSampleMaterials() {
  console.log('📚 Creating Sample Study Materials...\n');

  // Get teacher IDs for attribution
  const { data: teachers, error: teacherError } = await supabase
    .from('user_profiles')
    .select('id, name, email')
    .eq('role', 'teacher');

  if (teacherError) {
    console.log('⚠️  Could not fetch teachers, using default attribution');
  }

  const sampleMaterials = [
    {
      title: 'Mathematics - Algebra Basics',
      description: 'Fundamental concepts of algebra including linear equations, quadratic equations, and polynomial operations. Perfect for Class 10 students preparing for board exams.',
      subject: 'Mathematics',
      class_level: 'Class 10',
      file_url: 'https://example.com/sample-files/algebra-basics.pdf',
      content: 'This material covers: Linear equations in one variable, Linear equations in two variables, Quadratic equations, Arithmetic progressions, and Coordinate geometry basics.',
      is_active: true,
      created_by: teachers?.find(t => t.email === 'sp8@photon.edu')?.id || null
    },
    {
      title: 'Physics - Motion and Force',
      description: 'Complete guide to understanding motion, velocity, acceleration, and Newton\'s laws of motion. Includes solved examples and practice problems.',
      subject: 'Physics',
      class_level: 'Class 11',
      file_url: 'https://example.com/sample-files/motion-and-force.pdf',
      content: 'Topics covered: Kinematics, Dynamics, Newton\'s laws, Friction, Circular motion, and Work-energy theorem.',
      is_active: true,
      created_by: teachers?.find(t => t.email === 'mk6@photon.edu')?.id || null
    },
    {
      title: 'Chemistry - Periodic Table',
      description: 'Comprehensive study of the periodic table, atomic structure, and chemical bonding. Essential for understanding chemical reactions.',
      subject: 'Chemistry',
      class_level: 'Class 11',
      file_url: 'https://example.com/sample-files/periodic-table.pdf',
      content: 'Includes: Atomic structure, Periodic trends, Chemical bonding, Molecular geometry, and Intermolecular forces.',
      is_active: true,
      created_by: teachers?.find(t => t.email === 'ak5@photon.edu')?.id || null
    },
    {
      title: 'Mathematics - Calculus Introduction',
      description: 'Introduction to differential and integral calculus. Covers limits, derivatives, and basic integration techniques.',
      subject: 'Mathematics',
      class_level: 'Class 12',
      file_url: 'https://example.com/sample-files/calculus-intro.pdf',
      content: 'Topics: Limits and continuity, Differentiation rules, Applications of derivatives, Integration techniques, and Definite integrals.',
      is_active: true,
      created_by: teachers?.find(t => t.email === 'sp8@photon.edu')?.id || null
    },
    {
      title: 'Physics - Electromagnetic Induction',
      description: 'Study of electromagnetic induction, Faraday\'s laws, and AC circuits. Important for Class 12 physics.',
      subject: 'Physics',
      class_level: 'Class 12',
      file_url: 'https://example.com/sample-files/electromagnetic-induction.pdf',
      content: 'Covers: Faraday\'s law, Lenz\'s law, Self and mutual inductance, AC generators, and Transformers.',
      is_active: true,
      created_by: teachers?.find(t => t.email === 'mk6@photon.edu')?.id || null
    },
    {
      title: 'Chemistry - Organic Chemistry Basics',
      description: 'Introduction to organic chemistry including nomenclature, isomerism, and basic reactions.',
      subject: 'Chemistry',
      class_level: 'Class 12',
      file_url: 'https://example.com/sample-files/organic-chemistry.pdf',
      content: 'Topics: IUPAC nomenclature, Structural isomerism, Stereoisomerism, Reaction mechanisms, and Functional groups.',
      is_active: true,
      created_by: teachers?.find(t => t.email === 'ak5@photon.edu')?.id || null
    }
  ];

  console.log('📝 Creating materials...');
  
  for (const material of sampleMaterials) {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .insert([material])
        .select()
        .single();

      if (error) {
        console.log(`❌ Failed to create "${material.title}":`, error.message);
      } else {
        console.log(`✅ Created: ${data.title}`);
        console.log(`   Subject: ${data.subject} | Class: ${data.class_level}`);
      }
    } catch (error) {
      console.log(`❌ Error creating "${material.title}":`, error.message);
    }
  }

  // Verify creation
  console.log('\n🔍 Verifying created materials...');
  const { data: allMaterials, error: fetchError } = await supabase
    .from('study_materials')
    .select('*')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.log('❌ Could not fetch materials:', fetchError.message);
  } else {
    console.log(`✅ Total materials in database: ${allMaterials.length}`);
    
    // Group by subject
    const bySubject = allMaterials.reduce((acc, material) => {
      acc[material.subject] = (acc[material.subject] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Materials by subject:');
    Object.entries(bySubject).forEach(([subject, count]) => {
      console.log(`   ${subject}: ${count} materials`);
    });

    console.log('\n📋 Recent materials:');
    allMaterials.slice(0, 3).forEach((material, index) => {
      console.log(`   ${index + 1}. ${material.title}`);
      console.log(`      Subject: ${material.subject} | Class: ${material.class_level}`);
      console.log(`      Created: ${new Date(material.created_at).toLocaleDateString()}`);
      console.log('');
    });
  }

  console.log('\n🎉 Sample materials creation complete!');
  console.log('\n🚀 Next steps:');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. Go to Student Corner → Study Materials');
  console.log('3. You should see the sample materials');
  console.log('4. Test teacher upload functionality');
}

createSampleMaterials().catch(console.error);