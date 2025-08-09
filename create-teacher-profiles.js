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

async function createTeacherProfiles() {
  console.log('🚀 Creating teacher profiles in user_profiles table...\n');

  // Teacher data
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

  // Generate UUIDs for each teacher
  const { randomUUID } = require('crypto');
  
  for (const teacher of teachers) {
    try {
      // Generate a UUID for this teacher
      const teacherId = randomUUID();
      
      console.log(`📝 Creating profile for: ${teacher.name}`);

      // Insert directly into user_profiles table
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: teacherId,
          email: teacher.email,
          role: 'teacher',
          name: teacher.name,
          photon_id: teacher.photon_id,
          subject: teacher.subject,
          department: teacher.department,
          is_active: true
        }, {
          onConflict: 'photon_id'
        });

      if (error) {
        console.error(`❌ Error creating profile for ${teacher.name}:`, error);
      } else {
        console.log(`✅ Created profile for ${teacher.name} with ID: ${teacherId}`);
      }

    } catch (error) {
      console.error(`❌ Unexpected error for ${teacher.name}:`, error);
    }
  }

  // Verify the profiles were created
  console.log('\n🔍 Verifying teacher profiles...\n');
  
  const { data: profiles, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('role', 'teacher');

  if (fetchError) {
    console.error('❌ Error fetching profiles:', fetchError);
  } else {
    console.log('📊 Teacher profiles in database:');
    profiles.forEach(profile => {
      console.log(`   • ${profile.name} (${profile.photon_id}) - ${profile.email} [ID: ${profile.id}]`);
    });
  }

  console.log('\n📋 Next Steps:');
  console.log('Since we cannot create auth users programmatically due to database constraints,');
  console.log('you have two options:\n');
  
  console.log('Option 1 - Manual Creation in Supabase Dashboard:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to Authentication > Users');
  console.log('3. Click "Add user" and create each teacher with these details:\n');
  
  teachers.forEach(teacher => {
    console.log(`   Teacher: ${teacher.name}`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   Password: ${teacher.photon_id}`);
    console.log(`   Confirm email: Yes\n`);
  });

  console.log('Option 2 - Let teachers sign up themselves:');
  console.log('1. Teachers can go to your app\'s signup page');
  console.log('2. They should use these credentials:\n');
  
  teachers.forEach(teacher => {
    console.log(`   ${teacher.name}:`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   Password: ${teacher.photon_id}`);
    console.log(`   (The profile will be automatically linked)\n`);
  });

  console.log('✨ Teacher profiles are ready! They just need auth users to be created.');
}

// Run the script
createTeacherProfiles().catch(console.error);