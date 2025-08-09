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

// Teacher data to add
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

async function addTeachersWithRetry() {
  console.log('🚀 Starting to add 3 new teachers to Supabase...\n');

  for (const teacher of newTeachers) {
    console.log(`📝 Processing: ${teacher.name} (${teacher.photon_id})`);
    
    let success = false;
    
    // Method 1: Try creating auth user with admin API
    try {
      console.log(`   Attempting to create auth user...`);
      
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
          console.log(`   ⚠️  User already exists, checking profile...`);
          
          // Get existing user and update profile
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users.users.find(u => u.email === teacher.email);
          
          if (existingUser) {
            // Update profile
            const { error: profileError } = await supabase
              .from('user_profiles')
              .upsert({
                id: existingUser.id,
                email: teacher.email,
                role: 'teacher',
                name: teacher.name,
                photon_id: teacher.photon_id,
                subject: teacher.subject,
                department: teacher.department,
                is_active: true
              });

            if (!profileError) {
              console.log(`   ✅ Updated existing profile for ${teacher.name}`);
              success = true;
            } else {
              console.log(`   ❌ Profile update failed:`, profileError.message);
            }
          }
        } else {
          console.log(`   ❌ Auth creation failed:`, authError.message);
        }
      } else {
        console.log(`   ✅ Auth user created successfully`);
        
        // Wait for trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify and update profile
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

        if (!profileError) {
          console.log(`   ✅ Profile created/updated for ${teacher.name}`);
          success = true;
        } else {
          console.log(`   ❌ Profile creation failed:`, profileError.message);
        }
      }
    } catch (error) {
      console.log(`   ❌ Unexpected error:`, error.message);
    }

    if (success) {
      console.log(`🎉 Successfully added: ${teacher.name}\n`);
    } else {
      console.log(`❌ Failed to add: ${teacher.name}\n`);
    }
  }

  // Final verification
  console.log('🔍 Verifying all teachers...\n');
  await verifyTeachers();
}

async function verifyTeachers() {
  try {
    // Check user_profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('created_at');

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
      return;
    }

    console.log('📊 Current Teachers in Database:');
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.name}`);
      console.log(`      • Email: ${profile.email}`);
      console.log(`      • Photon ID: ${profile.photon_id}`);
      console.log(`      • Subject: ${profile.subject || 'Not set'}`);
      console.log(`      • Active: ${profile.is_active ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Check auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (!authError) {
      const teacherEmails = profiles.map(p => p.email);
      const authTeachers = authUsers.users.filter(u => teacherEmails.includes(u.email));
      
      console.log('🔐 Authentication Status:');
      profiles.forEach(profile => {
        const hasAuth = authTeachers.some(u => u.email === profile.email);
        console.log(`   ${profile.name}: ${hasAuth ? '✅ Can Login' : '❌ Cannot Login'}`);
      });
    }

    // Summary
    const expectedTeachers = ['jp7', 'sp8@photon', 'mk6@photon', 'ak5@photon'];
    const foundTeachers = profiles.map(p => p.photon_id);
    const readyCount = expectedTeachers.filter(id => foundTeachers.includes(id)).length;

    console.log(`\n📈 Summary: ${readyCount}/4 teachers are set up`);
    
    if (readyCount === 4) {
      console.log('🎉 All teachers are ready to login!');
      console.log('\n🔑 Login Credentials:');
      profiles.forEach(profile => {
        const password = profile.photon_id === 'jp7' ? 'jp7@photon' : profile.photon_id;
        console.log(`   ${profile.name}: ${profile.email} / ${password}`);
      });
    } else {
      console.log('⚠️  Some teachers still need setup');
    }

  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

// Run the script
addTeachersWithRetry().catch(console.error);