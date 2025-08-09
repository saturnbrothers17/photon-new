const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase configuration in environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanupTestData() {
  console.log('🧹 Starting comprehensive test data cleanup...\n');

  const tables = [
    { name: 'student_answers', description: 'Student test answers' },
    { name: 'test_attempts', description: 'Test attempt records' },
    { name: 'questions', description: 'Test questions' },
    { name: 'tests', description: 'Test definitions' },
    { name: 'study_materials', description: 'Uploaded study materials' },
    { name: 'test_results', description: 'Test results and scores' }
  ];

  let totalDeleted = 0;

  for (const table of tables) {
    try {
      console.log(`🗑️  Cleaning ${table.name} (${table.description})...`);
      
      // First, count records
      const { count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (count > 0) {
        // Delete all records
        const { error, data } = await supabase
          .from(table.name)
          .delete()
          .neq('id', '');
        
        if (error) {
          console.log(`   ⚠️  ${table.name}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table.name}: deleted ${count} records`);
          totalDeleted += count;
        }
      } else {
        console.log(`   ℹ️  ${table.name}: already empty`);
      }
    } catch (error) {
      console.log(`   ❌ ${table.name}: ${error.message}`);
    }
  }

  console.log(`\n🎉 Cleanup completed!`);
  console.log(`📊 Total records deleted: ${totalDeleted}`);
  console.log('💾 Database space has been freed up');
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  cleanupTestData()
    .then(() => {
      console.log('\n✨ Script finished successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupTestData };
