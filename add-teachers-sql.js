const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin operations
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

async function addTeachersDirectly() {
  console.log('🚀 Adding teachers directly to user_profiles table...\n');

  // Teacher data - we'll create fake UUIDs for now and let them sign up normally
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

  // First, let's try to create users with a simpler approach
  for (const teacher of teachers) {
    try {
      console.log(`📝 Creating user: ${teacher.name}`);

      // Try creating user with minimal data
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: teacher.email,
        password: teacher.photon_id, // Use photon_id as password
        email_confirm: true
      });

      if (authError) {
        console.error(`❌ Auth error for ${teacher.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Created auth user for ${teacher.name}`);

      // Now create/update the profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          email: teacher.email,
          role: 'teacher',
          name: teacher.name,
          photon_id: teacher.photon_id,
          subject: teacher.subject,
          department: teacher.department,
          is_active: true
        });

      if (profileError) {
        console.error(`❌ Profile error for ${teacher.email}:`, profileError);
      } else {
        console.log(`✅ Created profile for ${teacher.name}`);
      }

    } catch (error) {
      console.error(`❌ Unexpected error for ${teacher.name}:`, error.message);
    }
  }

  // Verify results
  console.log('\n🔍 Verifying teachers in database...\n');
  
  const { data: profiles, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('role', 'teacher');

  if (fetchError) {
    console.error('❌ Error fetching teacher profiles:', fetchError);
  } else {
    console.log('📊 Current teachers in database:');
    profiles.forEach(profile => {
      console.log(`   • ${profile.name} (${profile.photon_id}) - ${profile.email}`);
    });
  }

  console.log('\n✨ Process completed!');
}

// Alternative: Create SQL file for manual execution
async function createSQLFile() {
  const sqlContent = `
-- Add teachers to Supabase manually
-- Run this in your Supabase SQL editor

-- First, let's check if the user_profiles table exists and has the right structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';

-- Insert teacher profiles (you'll need to create auth users first through Supabase dashboard)
-- Or use these INSERT statements after creating auth users

-- For now, let's create placeholder entries that can be updated when users sign up
INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department, is_active)
VALUES 
  (gen_random_uuid(), 'sp8@photon.edu', 'teacher', 'Shiv Prakash Yadav', 'sp8@photon', 'Mathematics', 'Science', true),
  (gen_random_uuid(), 'mk6@photon.edu', 'teacher', 'Mahavir Kesari', 'mk6@photon', 'Physics', 'Science', true),
  (gen_random_uuid(), 'ak5@photon.edu', 'teacher', 'AK Mishra', 'ak5@photon', 'Chemistry', 'Science', true)
ON CONFLICT (photon_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  subject = EXCLUDED.subject,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the insertion
SELECT * FROM user_profiles WHERE role = 'teacher';
`;

  require('fs').writeFileSync('add-teachers-manual.sql', sqlContent);
  console.log('📄 Created add-teachers-manual.sql file for manual execution');
}

// Run both approaches
addTeachersDirectly()
  .then(() => createSQLFile())
  .catch(console.error);