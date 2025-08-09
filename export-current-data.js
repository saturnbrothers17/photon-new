const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
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

async function exportCurrentData() {
  console.log('📦 Exporting current Supabase data for migration...\n');

  const exportData = {
    timestamp: new Date().toISOString(),
    project_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    export_reason: 'Critical Supabase project issue - user creation failing',
    data: {}
  };

  try {
    // Export auth users
    console.log('1️⃣ Exporting auth users...');
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.log('❌ Cannot export auth users:', userError.message);
      exportData.data.auth_users = { error: userError.message };
    } else {
      exportData.data.auth_users = users.users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      }));
      console.log(`✅ Exported ${users.users.length} auth users`);
    }

    // Export user profiles
    console.log('2️⃣ Exporting user profiles...');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*');

    if (profileError) {
      console.log('❌ Cannot export user profiles:', profileError.message);
      exportData.data.user_profiles = { error: profileError.message };
    } else {
      exportData.data.user_profiles = profiles;
      console.log(`✅ Exported ${profiles.length} user profiles`);
    }

    // Export tests
    console.log('3️⃣ Exporting tests...');
    const { data: tests, error: testError } = await supabase
      .from('tests')
      .select('*');

    if (testError) {
      console.log('❌ Cannot export tests:', testError.message);
      exportData.data.tests = { error: testError.message };
    } else {
      exportData.data.tests = tests;
      console.log(`✅ Exported ${tests?.length || 0} tests`);
    }

    // Export test results
    console.log('4️⃣ Exporting test results...');
    const { data: results, error: resultError } = await supabase
      .from('test_results')
      .select('*');

    if (resultError) {
      console.log('❌ Cannot export test results:', resultError.message);
      exportData.data.test_results = { error: resultError.message };
    } else {
      exportData.data.test_results = results;
      console.log(`✅ Exported ${results?.length || 0} test results`);
    }

    // Export study materials
    console.log('5️⃣ Exporting study materials...');
    const { data: materials, error: materialError } = await supabase
      .from('study_materials')
      .select('*');

    if (materialError) {
      console.log('❌ Cannot export study materials:', materialError.message);
      exportData.data.study_materials = { error: materialError.message };
    } else {
      exportData.data.study_materials = materials;
      console.log(`✅ Exported ${materials?.length || 0} study materials`);
    }

    // Save export file
    const filename = `supabase-export-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    
    console.log(`\n📄 Export saved to: ${filename}`);
    console.log('📊 Export Summary:');
    console.log(`   Auth Users: ${exportData.data.auth_users?.length || 'Error'}`);
    console.log(`   User Profiles: ${exportData.data.user_profiles?.length || 'Error'}`);
    console.log(`   Tests: ${exportData.data.tests?.length || 'Error'}`);
    console.log(`   Test Results: ${exportData.data.test_results?.length || 'Error'}`);
    console.log(`   Study Materials: ${exportData.data.study_materials?.length || 'Error'}`);

    console.log('\n🚀 Next Steps:');
    console.log('1. Create new Supabase project');
    console.log('2. Update .env.local with new project credentials');
    console.log('3. Run: node import-to-new-project.js');
    console.log('4. Test user creation in new project');

    return filename;

  } catch (error) {
    console.error('❌ Export error:', error.message);
    
    // Save partial export
    const filename = `supabase-export-partial-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`📄 Partial export saved to: ${filename}`);
  }
}

// Run export
exportCurrentData().catch(console.error);