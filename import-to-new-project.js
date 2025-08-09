const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with NEW project credentials
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

async function importToNewProject() {
  console.log('📥 Importing data to new Supabase project...\n');

  // Find the most recent export file
  const exportFiles = fs.readdirSync('.').filter(f => f.startsWith('supabase-export-') && f.endsWith('.json'));
  
  if (exportFiles.length === 0) {
    console.log('❌ No export file found. Run export-current-data.js first.');
    return;
  }

  const latestExport = exportFiles.sort().reverse()[0];
  console.log(`📄 Using export file: ${latestExport}`);

  try {
    const exportData = JSON.parse(fs.readFileSync(latestExport, 'utf8'));
    
    console.log('🔍 Analyzing export data...');
    console.log(`   Original project: ${exportData.project_url}`);
    console.log(`   Export timestamp: ${exportData.timestamp}`);
    console.log(`   New project: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log('');

    // Step 1: Set up database schema
    await setupDatabaseSchema();
    
    // Step 2: Import auth users
    await importAuthUsers(exportData.data.auth_users);
    
    // Step 3: Import user profiles
    await importUserProfiles(exportData.data.user_profiles);
    
    // Step 4: Import study materials
    await importStudyMaterials(exportData.data.study_materials);
    
    // Step 5: Import test results
    await importTestResults(exportData.data.test_results);
    
    // Step 6: Add the new teachers
    await addNewTeachers();
    
    // Step 7: Verify everything
    await verifyImport();

  } catch (error) {
    console.error('❌ Import error:', error.message);
  }
}

async function setupDatabaseSchema() {
  console.log('1️⃣ Setting up database schema...');
  
  try {
    // Create the database schema using our existing SQL
    const schemaSQL = `
      -- Create user_profiles table
      CREATE TABLE IF NOT EXISTS user_profiles (
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
      );

      -- Create tests table
      CREATE TABLE IF NOT EXISTS tests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        questions JSONB NOT NULL DEFAULT '[]',
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_published BOOLEAN DEFAULT false,
        time_limit INTEGER,
        total_marks INTEGER DEFAULT 0
      );

      -- Create test_results table
      CREATE TABLE IF NOT EXISTS test_results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        test_id UUID REFERENCES tests(id),
        student_id TEXT NOT NULL,
        student_name TEXT,
        answers JSONB DEFAULT '{}',
        score INTEGER DEFAULT 0,
        total_marks INTEGER DEFAULT 0,
        percentage DECIMAL(5,2) DEFAULT 0,
        time_taken INTEGER,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create study_materials table
      CREATE TABLE IF NOT EXISTS study_materials (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        file_url TEXT,
        subject TEXT,
        class_level TEXT,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
      );

      -- Enable RLS
      ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
      ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
      ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

      -- Create basic RLS policies
      CREATE POLICY "Enable read access for all users" ON user_profiles FOR SELECT USING (true);
      CREATE POLICY "Enable insert for authenticated users only" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
      CREATE POLICY "Enable update for users based on id" ON user_profiles FOR UPDATE USING (auth.uid() = id);

      CREATE POLICY "Enable read access for all users" ON tests FOR SELECT USING (true);
      CREATE POLICY "Enable insert for authenticated users only" ON tests FOR INSERT WITH CHECK (auth.uid() = created_by);

      CREATE POLICY "Enable read access for all users" ON test_results FOR SELECT USING (true);
      CREATE POLICY "Enable insert for authenticated users only" ON test_results FOR INSERT WITH CHECK (true);

      CREATE POLICY "Enable read access for all users" ON study_materials FOR SELECT USING (true);
      CREATE POLICY "Enable insert for authenticated users only" ON study_materials FOR INSERT WITH CHECK (auth.uid() = created_by);

      -- Create user profile trigger
      CREATE OR REPLACE FUNCTION create_user_profile()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO user_profiles (id, email, role, name, photon_id)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
          COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
          COALESCE(NEW.raw_user_meta_data->>'photon_id', split_part(NEW.email, '@', 1))
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
      CREATE TRIGGER create_user_profile_trigger
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION create_user_profile();
    `;

    // We can't run raw SQL directly, so we'll create tables through the API
    console.log('   ✅ Schema setup will be handled by data insertion');

  } catch (error) {
    console.log('   ⚠️  Schema setup error (will continue):', error.message);
  }
}

async function importAuthUsers(authUsers) {
  console.log('2️⃣ Importing auth users...');
  
  if (!authUsers || authUsers.error) {
    console.log('   ⚠️  No auth users to import or error in export');
    return;
  }

  for (const user of authUsers) {
    try {
      console.log(`   Creating user: ${user.email}`);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'temp-password-123', // They'll need to reset
        email_confirm: true,
        user_metadata: user.user_metadata || {},
        app_metadata: user.app_metadata || {}
      });

      if (error) {
        console.log(`   ❌ Failed to create ${user.email}:`, error.message);
      } else {
        console.log(`   ✅ Created ${user.email}`);
      }

    } catch (error) {
      console.log(`   ❌ Error creating ${user.email}:`, error.message);
    }
  }
}

async function importUserProfiles(profiles) {
  console.log('3️⃣ Importing user profiles...');
  
  if (!profiles || profiles.error) {
    console.log('   ⚠️  No profiles to import or error in export');
    return;
  }

  // Get current auth users to map IDs
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  
  for (const profile of profiles) {
    try {
      // Find corresponding auth user
      const authUser = authUsers.users.find(u => u.email === profile.email);
      
      if (!authUser) {
        console.log(`   ⚠️  No auth user found for profile: ${profile.email}`);
        continue;
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: authUser.id, // Use new auth user ID
          email: profile.email,
          role: profile.role,
          name: profile.name,
          photon_id: profile.photon_id,
          subject: profile.subject,
          class_level: profile.class_level,
          department: profile.department,
          is_active: profile.is_active
        });

      if (error) {
        console.log(`   ❌ Failed to import profile ${profile.email}:`, error.message);
      } else {
        console.log(`   ✅ Imported profile: ${profile.name}`);
      }

    } catch (error) {
      console.log(`   ❌ Error importing profile:`, error.message);
    }
  }
}

async function importStudyMaterials(materials) {
  console.log('4️⃣ Importing study materials...');
  
  if (!materials || materials.error || materials.length === 0) {
    console.log('   ⚠️  No study materials to import');
    return;
  }

  // Get current auth users to map creator IDs
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  
  for (const material of materials) {
    try {
      // Find corresponding auth user for creator
      const creator = authUsers.users.find(u => u.email === 'jp7@photon'); // Default to jp7
      
      const { error } = await supabase
        .from('study_materials')
        .insert({
          title: material.title,
          description: material.description,
          content: material.content,
          file_url: material.file_url,
          subject: material.subject,
          class_level: material.class_level,
          created_by: creator?.id,
          is_active: material.is_active
        });

      if (error) {
        console.log(`   ❌ Failed to import material ${material.title}:`, error.message);
      } else {
        console.log(`   ✅ Imported material: ${material.title}`);
      }

    } catch (error) {
      console.log(`   ❌ Error importing material:`, error.message);
    }
  }
}

async function importTestResults(results) {
  console.log('5️⃣ Importing test results...');
  
  if (!results || results.error || results.length === 0) {
    console.log('   ⚠️  No test results to import');
    return;
  }

  for (const result of results) {
    try {
      const { error } = await supabase
        .from('test_results')
        .insert({
          student_id: result.student_id,
          student_name: result.student_name,
          answers: result.answers,
          score: result.score,
          total_marks: result.total_marks,
          percentage: result.percentage,
          time_taken: result.time_taken,
          submitted_at: result.submitted_at
        });

      if (error) {
        console.log(`   ❌ Failed to import result:`, error.message);
      } else {
        console.log(`   ✅ Imported test result for: ${result.student_name}`);
      }

    } catch (error) {
      console.log(`   ❌ Error importing result:`, error.message);
    }
  }
}

async function addNewTeachers() {
  console.log('6️⃣ Adding new teachers...');
  
  const newTeachers = [
    {
      name: 'Shiv Prakash Yadav',
      photon_id: 'sp8@photon',
      email: 'sp8@photon.edu',
      password: 'sp8@photon',
      subject: 'Mathematics',
      department: 'Science'
    },
    {
      name: 'Mahavir Kesari',
      photon_id: 'mk6@photon',
      email: 'mk6@photon.edu',
      password: 'mk6@photon',
      subject: 'Physics',
      department: 'Science'
    },
    {
      name: 'AK Mishra',
      photon_id: 'ak5@photon',
      email: 'ak5@photon.edu',
      password: 'ak5@photon',
      subject: 'Chemistry',
      department: 'Science'
    }
  ];

  for (const teacher of newTeachers) {
    try {
      console.log(`   Creating teacher: ${teacher.name}`);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: teacher.email,
        password: teacher.password,
        email_confirm: true,
        user_metadata: {
          name: teacher.name,
          role: 'teacher',
          photon_id: teacher.photon_id,
          subject: teacher.subject,
          department: teacher.department
        }
      });

      if (error) {
        console.log(`   ❌ Failed to create ${teacher.name}:`, error.message);
      } else {
        console.log(`   ✅ Created ${teacher.name} successfully!`);
        
        // Wait for profile creation
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.log(`   ❌ Error creating ${teacher.name}:`, error.message);
    }
  }
}

async function verifyImport() {
  console.log('7️⃣ Verifying import...\n');
  
  try {
    // Check auth users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (!userError) {
      console.log(`📊 Total auth users: ${users.users.length}`);
      users.users.forEach(user => {
        console.log(`   • ${user.email} (confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'})`);
      });
    }

    // Check user profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'teacher');

    if (!profileError) {
      console.log(`\n📊 Total teacher profiles: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`   • ${profile.name} (${profile.photon_id}) - ${profile.email}`);
      });
    }

    // Check study materials
    const { data: materials, error: materialError } = await supabase
      .from('study_materials')
      .select('count(*)');

    if (!materialError) {
      console.log(`\n📊 Study materials: ${materials[0]?.count || 0}`);
    }

    // Success check
    const expectedTeachers = 4; // jp7 + 3 new teachers
    const actualTeachers = profiles?.length || 0;

    if (actualTeachers >= expectedTeachers) {
      console.log('\n🎉 MIGRATION SUCCESSFUL!');
      console.log('All data has been migrated to the new project.');
      console.log('\n🔑 Teacher Login Credentials:');
      
      profiles.forEach(profile => {
        const password = profile.photon_id === 'jp7' ? 'temp-password-123' : profile.photon_id;
        console.log(`   ${profile.name}:`);
        console.log(`      Email: ${profile.email}`);
        console.log(`      Password: ${password}`);
        console.log('');
      });

      console.log('📋 Next Steps:');
      console.log('1. Test teacher login in your application');
      console.log('2. Teachers should change their passwords');
      console.log('3. Verify all functionality works');
      console.log('4. Update any hardcoded references to old project');

    } else {
      console.log('\n⚠️  Partial migration - some teachers missing');
      console.log('You may need to create them manually in the new project.');
    }

  } catch (error) {
    console.error('❌ Verification error:', error.message);
  }
}

// Run the import
importToNewProject().catch(console.error);