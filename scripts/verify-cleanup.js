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

async function verifyCleanup() {
  console.log('🔍 Verifying test data cleanup...\n');

  const tables = [
    { name: 'student_answers', description: 'Student test answers' },
    { name: 'test_attempts', description: 'Test attempt records' },
    { name: 'questions', description: 'Test questions' },
    { name: 'tests', description: 'Test definitions' },
    { name: 'study_materials', description: 'Uploaded study materials' },
    { name: 'test_results', description: 'Test results and scores' }
  ];

  let totalRecords = 0;
  let hasData = false;

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${table.name}: Error - ${error.message}`);
      } else {
        console.log(`   📊 ${table.name}: ${count} records found`);
        totalRecords += count;
        if (count > 0) {
          hasData = true;
        }
      }
    } catch (error) {
      console.log(`   ❌ ${table.name}: ${error.message}`);
    }
  }

  console.log(`\n📈 Summary:`);
  console.log(`   Total records across all test tables: ${totalRecords}`);
  
  if (totalRecords === 0) {
    console.log(`   ✅ SUCCESS: All test data has been successfully cleaned!`);
    console.log(`   🎉 Teacher dashboard should now show no test results.`);
  } else {
    console.log(`   ⚠️  WARNING: Some test data still exists.`);
    console.log(`   🔧 Consider running the cleanup script again.`);
  }

  // Check for any potential data sources
  console.log(`\n🔍 Additional checks:`);
  
  // Check if there are any other tables that might contain test data
  try {
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (!tablesError && tablesData) {
      const testRelatedTables = tablesData.filter(table => 
        table.table_name.includes('test') || 
        table.table_name.includes('answer') || 
        table.table_name.includes('question') ||
        table.table_name.includes('student')
      );

      if (testRelatedTables.length > 0) {
        console.log(`   📋 Found potentially test-related tables:`);
        testRelatedTables.forEach(table => {
          console.log(`      - ${table.table_name}`);
        });
      }
    }
  } catch (error) {
    console.log(`   ℹ️  Could not check table schema: ${error.message}`);
  }

  console.log(`\n✅ Verification completed!`);
  
  if (totalRecords === 0) {
    console.log(`\n🎯 Next steps:`);
    console.log(`   1. Clear browser cache using: scripts/clear-browser-cache.html`);
    console.log(`   2. Refresh the teacher dashboard page`);
    console.log(`   3. Test results should now be empty`);
  }
}

// Run verification
verifyCleanup().catch(console.error);
