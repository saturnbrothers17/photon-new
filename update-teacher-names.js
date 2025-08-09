const { createClient } = require('@supabase/supabase-js');
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

async function updateTeacherNames() {
  console.log('📝 Updating Teacher Names in User Profiles...\n');

  // Current teacher data with proper full names
  const teacherUpdates = [
    {
      email: 'sp8@photon.edu',
      photon_id: 'sp8@photon',
      name: 'Shiv Prakash Yadav',
      subject: 'Mathematics',
      department: 'Science'
    },
    {
      email: 'mk6@photon.edu', 
      photon_id: 'mk6@photon',
      name: 'Mahavir Kesari',
      subject: 'Physics',
      department: 'Science'
    },
    {
      email: 'ak5@photon.edu',
      photon_id: 'ak5@photon', 
      name: 'AK Mishra',
      subject: 'Chemistry',
      department: 'Science'
    }
  ];

  console.log('🔍 Current teacher profiles:');
  
  // First, let's see current names
  const { data: currentProfiles, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('role', 'teacher')
    .order('created_at');

  if (fetchError) {
    console.log('❌ Cannot fetch current profiles:', fetchError.message);
    return;
  }

  currentProfiles.forEach(profile => {
    console.log(`   • ${profile.name} (${profile.photon_id}) - ${profile.email}`);
  });

  console.log('\n📝 Updating names...');

  // Update each teacher's profile
  for (const teacher of teacherUpdates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          name: teacher.name,
          subject: teacher.subject,
          department: teacher.department,
          updated_at: new Date().toISOString()
        })
        .eq('email', teacher.email)
        .select()
        .single();

      if (error) {
        console.log(`❌ Failed to update ${teacher.email}:`, error.message);
      } else {
        console.log(`✅ Updated: ${data.name} (${data.email})`);
      }
    } catch (error) {
      console.log(`❌ Error updating ${teacher.email}:`, error.message);
    }
  }

  // Also update the auth user metadata for consistency
  console.log('\n🔄 Updating auth user metadata...');
  
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (!authError) {
    for (const teacher of teacherUpdates) {
      const authUser = authUsers.users.find(u => u.email === teacher.email);
      
      if (authUser) {
        try {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            authUser.id,
            {
              user_metadata: {
                ...authUser.user_metadata,
                name: teacher.name,
                role: 'teacher',
                photon_id: teacher.photon_id,
                subject: teacher.subject,
                department: teacher.department
              }
            }
          );

          if (updateError) {
            console.log(`⚠️  Could not update auth metadata for ${teacher.email}:`, updateError.message);
          } else {
            console.log(`✅ Updated auth metadata for ${teacher.name}`);
          }
        } catch (error) {
          console.log(`⚠️  Auth metadata update error for ${teacher.email}:`, error.message);
        }
      }
    }
  }

  // Verify the updates
  console.log('\n🔍 Verifying updated profiles:');
  
  const { data: updatedProfiles, error: verifyError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('role', 'teacher')
    .order('created_at');

  if (verifyError) {
    console.log('❌ Cannot verify updates:', verifyError.message);
  } else {
    console.log('\n📊 Updated teacher profiles:');
    updatedProfiles.forEach(profile => {
      console.log(`   • ${profile.name} (${profile.photon_id})`);
      console.log(`     Email: ${profile.email}`);
      console.log(`     Subject: ${profile.subject}`);
      console.log(`     Department: ${profile.department}`);
      console.log('');
    });
  }

  console.log('🎉 Teacher name updates complete!');
  console.log('\n🚀 Next steps:');
  console.log('1. Teachers should logout and login again to see updated names');
  console.log('2. The welcome message will now show their full names');
  console.log('3. Test login with each teacher to verify');
  
  console.log('\n🔑 Login credentials (unchanged):');
  teacherUpdates.forEach(teacher => {
    console.log(`   ${teacher.name}: ${teacher.email} / ${teacher.photon_id}`);
  });
}

updateTeacherNames().catch(console.error);