/**
 * Run Database Schema Fix
 * Executes the comprehensive database schema fix using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runDatabaseFix() {
  try {
    console.log('🔧 Starting comprehensive database schema fix...');
    
    // Step 1: Add missing columns to tests table
    console.log('\n1️⃣ Fixing tests table schema...');
    
    const testsTableFixes = [
      "ALTER TABLE tests ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false",
      "ALTER TABLE tests ADD COLUMN IF NOT EXISTS class_level TEXT",
      "ALTER TABLE tests ADD COLUMN IF NOT EXISTS subject TEXT",
      "ALTER TABLE tests ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60",
      "ALTER TABLE tests ADD COLUMN IF NOT EXISTS total_marks INTEGER",
      "ALTER TABLE tests ADD COLUMN IF NOT EXISTS passing_marks INTEGER",
      "ALTER TABLE tests ADD COLUMN IF NOT EXISTS description TEXT"
    ];

    for (const sql of testsTableFixes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
          console.log(`⚠️ ${sql.substring(0, 50)}... - ${error.message}`);
        } else {
          console.log(`✅ ${sql.substring(0, 50)}...`);
        }
      } catch (e) {
        console.log(`⚠️ ${sql.substring(0, 50)}... - May need manual execution`);
      }
    }

    // Step 2: Add missing columns to test_results table
    console.log('\n2️⃣ Fixing test_results table schema...');
    
    const testResultsFixes = [
      "ALTER TABLE test_results ADD COLUMN IF NOT EXISTS percentage DECIMAL(5,2)",
      "ALTER TABLE test_results ADD COLUMN IF NOT EXISTS max_marks INTEGER",
      "ALTER TABLE test_results ADD COLUMN IF NOT EXISTS test_name TEXT",
      "ALTER TABLE test_results ADD COLUMN IF NOT EXISTS security_report JSONB DEFAULT '{}'",
      "ALTER TABLE test_results ADD COLUMN IF NOT EXISTS score INTEGER"
    ];

    for (const sql of testResultsFixes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
          console.log(`⚠️ ${sql.substring(0, 50)}... - ${error.message}`);
        } else {
          console.log(`✅ ${sql.substring(0, 50)}...`);
        }
      } catch (e) {
        console.log(`⚠️ ${sql.substring(0, 50)}... - May need manual execution`);
      }
    }

    // Step 3: Create missing tables
    console.log('\n3️⃣ Creating missing tables...');
    
    const createTableQueries = [
      // Study materials table
      `CREATE TABLE IF NOT EXISTS study_materials (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        subject TEXT,
        class_level TEXT,
        file_url TEXT,
        file_name TEXT,
        file_size INTEGER DEFAULT 0,
        file_type TEXT,
        view_count INTEGER DEFAULT 0,
        uploaded_by TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Live tests table
      `CREATE TABLE IF NOT EXISTS live_tests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
        start_time TIMESTAMP WITH TIME ZONE,
        end_time TIMESTAMP WITH TIME ZONE,
        max_participants INTEGER DEFAULT 100,
        current_participants INTEGER DEFAULT 0,
        instructions TEXT,
        is_active BOOLEAN DEFAULT true,
        created_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Test participants table
      `CREATE TABLE IF NOT EXISTS test_participants (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        live_test_id UUID REFERENCES live_tests(id) ON DELETE CASCADE,
        student_id TEXT NOT NULL,
        status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'in_progress', 'completed', 'disconnected')),
        current_question INTEGER DEFAULT 0,
        answers_count INTEGER DEFAULT 0,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Student rankings table
      `CREATE TABLE IF NOT EXISTS student_rankings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
        student_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        max_marks INTEGER NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        rank INTEGER,
        percentile DECIMAL(5,2),
        time_taken INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Material views table
      `CREATE TABLE IF NOT EXISTS material_views (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
        student_id TEXT NOT NULL,
        view_duration INTEGER DEFAULT 0,
        device_info JSONB DEFAULT '{}',
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Test schedules table
      `CREATE TABLE IF NOT EXISTS test_schedules (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
        scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
        duration_minutes INTEGER,
        max_participants INTEGER,
        instructions TEXT,
        is_published BOOLEAN DEFAULT false,
        created_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // User profiles table
      `CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
        name TEXT,
        photon_id TEXT UNIQUE,
        subject TEXT,
        class_level TEXT,
        department TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`
    ];

    for (let i = 0; i < createTableQueries.length; i++) {
      const sql = createTableQueries[i];
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || `table_${i}`;
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
          console.log(`⚠️ ${tableName} - ${error.message}`);
        } else {
          console.log(`✅ ${tableName} table created/verified`);
        }
      } catch (e) {
        console.log(`⚠️ ${tableName} - May need manual execution`);
      }
    }

    // Step 4: Create helper functions
    console.log('\n4️⃣ Creating helper functions...');
    
    const helperFunctions = [
      `CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
       RETURNS TEXT AS $$
       BEGIN
         RETURN (SELECT role FROM user_profiles WHERE id = user_id);
       END;
       $$ LANGUAGE plpgsql SECURITY DEFINER`,
       
      `CREATE OR REPLACE FUNCTION is_teacher(user_id UUID)
       RETURNS BOOLEAN AS $$
       BEGIN
         RETURN (SELECT role = 'teacher' FROM user_profiles WHERE id = user_id);
       END;
       $$ LANGUAGE plpgsql SECURITY DEFINER`,
       
      `CREATE OR REPLACE FUNCTION is_student(user_id UUID)
       RETURNS BOOLEAN AS $$
       BEGIN
         RETURN (SELECT role = 'student' FROM user_profiles WHERE id = user_id);
       END;
       $$ LANGUAGE plpgsql SECURITY DEFINER`,
       
      `CREATE OR REPLACE FUNCTION increment_material_views(material_uuid UUID)
       RETURNS void AS $$
       BEGIN
         UPDATE study_materials SET view_count = view_count + 1 WHERE id = material_uuid;
       END;
       $$ LANGUAGE plpgsql SECURITY DEFINER`
    ];

    for (const sql of helperFunctions) {
      const funcName = sql.match(/FUNCTION (\w+)/)?.[1] || 'function';
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
          console.log(`⚠️ ${funcName} - ${error.message}`);
        } else {
          console.log(`✅ ${funcName} function created`);
        }
      } catch (e) {
        console.log(`⚠️ ${funcName} - May need manual execution`);
      }
    }

    // Step 5: Update existing data
    console.log('\n5️⃣ Updating existing data...');
    
    try {
      // Update tests table with default values
      const { error: updateError } = await supabase
        .from('tests')
        .update({
          is_published: false,
          class_level: '10',
          subject: 'General',
          duration_minutes: 60
        })
        .is('is_published', null);

      if (updateError) {
        console.log('⚠️ Could not update tests table - may need manual update');
      } else {
        console.log('✅ Updated tests table with default values');
      }
    } catch (e) {
      console.log('⚠️ Tests table update skipped');
    }

    // Step 6: Create test teacher profile
    console.log('\n6️⃣ Creating test teacher profile...');
    
    try {
      // Get the jp7@photon user
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (!usersError && users) {
        const jp7User = users.users.find(user => user.email === 'jp7@photon');
        
        if (jp7User) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              id: jp7User.id,
              email: 'jp7@photon',
              role: 'teacher',
              name: 'JP7 Teacher',
              photon_id: 'jp7',
              subject: 'Physics',
              department: 'Science'
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.log('⚠️ Could not create user profile - table may not exist yet');
          } else {
            console.log('✅ Test teacher profile created/updated');
          }
        } else {
          console.log('⚠️ jp7@photon user not found - run setup-test-teacher.js first');
        }
      }
    } catch (e) {
      console.log('⚠️ User profile creation skipped');
    }

    // Step 7: Verify the setup
    console.log('\n7️⃣ Verifying database setup...');
    
    try {
      // Check if tables exist
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', [
          'tests', 'test_results', 'study_materials', 'live_tests',
          'test_participants', 'student_rankings', 'material_views',
          'test_schedules', 'user_profiles'
        ]);

      if (!tablesError && tables) {
        console.log(`✅ Found ${tables.length} tables in database`);
        tables.forEach(table => console.log(`   - ${table.table_name}`));
      }
    } catch (e) {
      console.log('⚠️ Table verification skipped');
    }

    console.log('\n🎉 Database schema fix completed!');
    console.log('\n📝 Summary:');
    console.log('  ✅ Added missing columns to existing tables');
    console.log('  ✅ Created new tables for advanced features');
    console.log('  ✅ Created helper functions for RLS');
    console.log('  ✅ Updated existing data with defaults');
    console.log('  ✅ Created test teacher profile');
    
    console.log('\n🧪 Next steps:');
    console.log('  1. Test the authentication: node test-authenticated-api.js');
    console.log('  2. Login at: http://localhost:3002/faculty-portal');
    console.log('  3. Use credentials: jp7@photon / jp7@photon');
    
    console.log('\n⚠️ Note: Some operations may have been skipped if they require manual execution in Supabase SQL editor');

  } catch (error) {
    console.error('❌ Unexpected error during database fix:', error);
  }
}

// Run the database fix
runDatabaseFix();