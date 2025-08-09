const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
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

async function addTeachersViaSQL() {
  console.log('🚀 Adding teachers via direct SQL execution...\n');

  // SQL to create auth users and profiles
  const createTeachersSQL = `
    -- Create auth users with proper password hashing
    DO $$
    DECLARE
      user_id_1 UUID := gen_random_uuid();
      user_id_2 UUID := gen_random_uuid();
      user_id_3 UUID := gen_random_uuid();
    BEGIN
      -- Insert auth users
      INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, role
      ) VALUES 
      (
        user_id_1, '00000000-0000-0000-0000-000000000000', 'sp8@photon.edu',
        crypt('sp8@photon', gen_salt('bf')), NOW(), NOW(), NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Shiv Prakash Yadav", "role": "teacher", "photon_id": "sp8@photon"}',
        false, 'authenticated'
      ),
      (
        user_id_2, '00000000-0000-0000-0000-000000000000', 'mk6@photon.edu',
        crypt('mk6@photon', gen_salt('bf')), NOW(), NOW(), NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Mahavir Kesari", "role": "teacher", "photon_id": "mk6@photon"}',
        false, 'authenticated'
      ),
      (
        user_id_3, '00000000-0000-0000-0000-000000000000', 'ak5@photon.edu',
        crypt('ak5@photon', gen_salt('bf')), NOW(), NOW(), NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "AK Mishra", "role": "teacher", "photon_id": "ak5@photon"}',
        false, 'authenticated'
      )
      ON CONFLICT (email) DO NOTHING;

      -- Insert user profiles
      INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department, is_active)
      VALUES 
      (user_id_1, 'sp8@photon.edu', 'teacher', 'Shiv Prakash Yadav', 'sp8@photon', 'Mathematics', 'Science', true),
      (user_id_2, 'mk6@photon.edu', 'teacher', 'Mahavir Kesari', 'mk6@photon', 'Physics', 'Science', true),
      (user_id_3, 'ak5@photon.edu', 'teacher', 'AK Mishra', 'ak5@photon', 'Chemistry', 'Science', true)
      ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        name = EXCLUDED.name,
        photon_id = EXCLUDED.photon_id,
        subject = EXCLUDED.subject,
        department = EXCLUDED.department,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();

      RAISE NOTICE 'Successfully created 3 teachers';
    END $$;
  `;

  try {
    console.log('📝 Executing SQL to create teachers...');
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: createTeachersSQL 
    });

    if (error) {
      console.log('❌ SQL execution failed, trying alternative approach...');
      console.log('Error:', error.message);
      
      // Try alternative: Create profiles first, then let users sign up
      await createProfilesOnly();
    } else {
      console.log('✅ SQL executed successfully');
      console.log('Data:', data);
    }

  } catch (error) {
    console.log('❌ SQL execution error:', error.message);
    await createProfilesOnly();
  }

  // Verify results
  await verifySetup();
}

async function createProfilesOnly() {
  console.log('\n📝 Trying alternative: Creating profiles only...');
  
  const teachers = [
    {
      name: 'Shiv Prakash Yadav',
      photon_id: 'sp8@photon',
      email: 'sp8@photon.edu',
      subject: 'Mathematics',
      department: 'Science'
    },
    {
      name: 'Mahavir Kesari',
      photon_id: 'mk6@photon',
      email: 'mk6@photon.edu',
      subject: 'Physics',
      department: 'Science'
    },
    {
      name: 'AK Mishra',
      photon_id: 'ak5@photon',
      email: 'ak5@photon.edu',
      subject: 'Chemistry',
      department: 'Science'
    }
  ];

  // Create temporary profiles that will be linked when users sign up
  for (const teacher of teachers) {
    try {
      // Create a temporary UUID for the profile
      const tempId = require('crypto').randomUUID();
      
      const { error } = await supabase
        .from('teacher_temp_profiles')
        .upsert({
          temp_id: tempId,
          email: teacher.email,
          name: teacher.name,
          photon_id: teacher.photon_id,
          subject: teacher.subject,
          department: teacher.department,
          password_hint: teacher.photon_id
        });

      if (error && !error.message.includes('does not exist')) {
        console.log(`   ❌ Failed to create temp profile for ${teacher.name}`);
      } else {
        console.log(`   ✅ Prepared profile for ${teacher.name}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Temp profile creation skipped for ${teacher.name}`);
    }
  }

  console.log('\n📋 Manual Setup Required:');
  console.log('Since automatic creation failed, please:');
  console.log('1. Go to Supabase Dashboard → Authentication → Users');
  console.log('2. Click "Add user" for each teacher:');
  console.log('');
  
  teachers.forEach((teacher, index) => {
    console.log(`Teacher ${index + 1}: ${teacher.name}`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   Password: ${teacher.photon_id}`);
    console.log(`   Confirm email: ✅ Yes`);
    console.log('');
  });
}

async function verifySetup() {
  console.log('\n🔍 Verifying teacher setup...\n');

  try {
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('created_at');

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return;
    }

    console.log('📊 Current Teachers:');
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.name} (${profile.photon_id})`);
      console.log(`      Email: ${profile.email}`);
      console.log(`      Subject: ${profile.subject || 'Not set'}`);
      console.log('');
    });

    const expectedTeachers = ['jp7', 'sp8@photon', 'mk6@photon', 'ak5@photon'];
    const foundTeachers = profiles.map(p => p.photon_id);
    const readyCount = expectedTeachers.filter(id => foundTeachers.includes(id)).length;

    console.log(`📈 Status: ${readyCount}/4 teachers configured`);
    
    if (readyCount === 4) {
      console.log('🎉 All teachers are ready!');
    } else {
      console.log('⚠️  Manual setup required for remaining teachers');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run the script
addTeachersViaSQL().catch(console.error);