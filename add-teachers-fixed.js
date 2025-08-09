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

// Teacher data to add - using proper email format
const teachers = [
  {
    name: 'Shiv Prakash Yadav',
    photon_id: 'sp8@photon',
    email: 'sp8@photon.edu',  // Using .edu domain for proper email format
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

async function addTeachers() {
  console.log('🚀 Starting to add teachers to Supabase...\n');

  for (const teacher of teachers) {
    try {
      console.log(`📝 Adding teacher: ${teacher.name} (${teacher.photon_id})`);

      // Create user in Supabase Auth with proper email format
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
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

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User ${teacher.email} already exists, updating profile...`);
          
          // Get existing user
          const { data: existingUsers, error: getUserError } = await supabase.auth.admin.listUsers();
          if (getUserError) {
            console.error(`❌ Error getting existing users:`, getUserError);
            continue;
          }

          const existingUser = existingUsers.users.find(u => u.email === teacher.email);
          if (existingUser) {
            // Update user profile
            const { error: updateError } = await supabase
              .from('user_profiles')
              .upsert({
                id: existingUser.id,
                email: teacher.email,
                role: 'teacher',
                name: teacher.name,
                photon_id: teacher.photon_id,
                subject: teacher.subject,
                department: teacher.department,
                is_active: true,
                updated_at: new Date().toISOString()
              });

            if (updateError) {
              console.error(`❌ Error updating profile for ${teacher.email}:`, updateError);
            } else {
              console.log(`✅ Updated profile for ${teacher.name}`);
            }
          }
        } else {
          console.error(`❌ Error creating user ${teacher.email}:`, authError);
        }
        continue;
      }

      console.log(`✅ Successfully created user: ${teacher.name}`);

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the profile with correct photon_id (since the trigger might not set it correctly)
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
        console.error(`❌ Error creating/updating profile for ${teacher.email}:`, profileError);
      } else {
        console.log(`✅ Profile created/updated for ${teacher.name}`);
      }

      console.log(`🎉 Successfully added teacher: ${teacher.name}\n`);

    } catch (error) {
      console.error(`❌ Unexpected error adding ${teacher.name}:`, error);
    }
  }

  // Verify all teachers were added
  console.log('🔍 Verifying teachers in database...\n');
  
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

  console.log('\n✨ Teacher addition process completed!');
  console.log('\n📋 Login Instructions:');
  console.log('Teachers can now login to the teacher dashboard using:');
  teachers.forEach(teacher => {
    console.log(`   • Email: ${teacher.email} | Password: ${teacher.password} | Photon ID: ${teacher.photon_id}`);
  });
}

// Run the script
addTeachers().catch(console.error);