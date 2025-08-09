const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function cleanupTestData() {
  console.log('🧹 Starting comprehensive test data cleanup...\n');

  try {
    // 1. Clean up test attempts and student answers first (due to foreign key constraints)
    console.log('1. Cleaning up student answers...');
    const { error: answersError } = await supabase
      .from('student_answers')
      .delete()
      .not('id', 'is', null); // Delete all records
    
    if (answersError) {
      console.log('   ⚠️  Could not delete student answers:', answersError.message);
    } else {
      console.log('   ✅ Student answers cleaned up');
    }

    // 2. Clean up test attempts
    console.log('2. Cleaning up test attempts...');
    const { error: attemptsError } = await supabase
      .from('test_attempts')
      .delete()
      .not('id', 'is', null);
    
    if (attemptsError) {
      console.log('   ⚠️  Could not delete test attempts:', attemptsError.message);
    } else {
      console.log('   ✅ Test attempts cleaned up');
    }

    // 3. Clean up questions
    console.log('3. Cleaning up questions...');
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .not('id', 'is', null);
    
    if (questionsError) {
      console.log('   ⚠️  Could not delete questions:', questionsError.message);
    } else {
      console.log('   ✅ Questions cleaned up');
    }

    // 4. Clean up tests
    console.log('4. Cleaning up tests...');
    const { error: testsError } = await supabase
      .from('tests')
      .delete()
      .not('id', 'is', null);
    
    if (testsError) {
      console.log('   ⚠️  Could not delete tests:', testsError.message);
    } else {
      console.log('   ✅ Tests cleaned up');
    }

    // 5. Clean up study materials (optional - comment out if you want to keep them)
    console.log('5. Cleaning up study materials...');
    const { error: materialsError } = await supabase
      .from('study_materials')
      .delete()
      .not('id', 'is', null);
    
    if (materialsError) {
      console.log('   ⚠️  Could not delete study materials:', materialsError.message);
    } else {
      console.log('   ✅ Study materials cleaned up');
    }

    console.log('\n🎉 Test data cleanup completed!');
    console.log('📊 Database has been reset to clean state');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

// Run the cleanup
if (require.main === module) {
  cleanupTestData().then(() => {
    console.log('\n✨ Cleanup script finished');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { cleanupTestData };
