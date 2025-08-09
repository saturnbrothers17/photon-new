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

async function verifyTeachers() {
  console.log('🔍 Verifying teacher setup...\n');

  try {
    // Check user_profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'teacher');

    if (profileError) {
      console.error('❌ Error fetching teacher profiles:', profileError);
      return;
    }

    console.log('📊 Teacher Profiles in Database:');
    if (profiles.length === 0) {
      console.log('   No teacher profiles found.');
    } else {
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.name}`);
        console.log(`      • Email: ${profile.email}`);
        console.log(`      • Photon ID: ${profile.photon_id}`);
        console.log(`      • Subject: ${profile.subject || 'Not set'}`);
        console.log(`      • Department: ${profile.department || 'Not set'}`);
        console.log(`      • Active: ${profile.is_active ? 'Yes' : 'No'}`);
        console.log(`      • Created: ${new Date(profile.created_at).toLocaleDateString()}`);
        console.log('');
      });
    }

    // Check auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    console.log('🔐 Authentication Users:');
    const teacherEmails = ['sp8@photon.edu', 'mk6@photon.edu', 'ak5@photon.edu', 'jp7@photon'];
    const foundTeachers = authUsers.users.filter(user => 
      teacherEmails.includes(user.email)
    );

    if (foundTeachers.length === 0) {
      console.log('   No teacher auth users found.');
    } else {
      foundTeachers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`);
        console.log(`      • ID: ${user.id}`);
        console.log(`      • Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`      • Created: ${new Date(user.created_at).toLocaleDateString()}`);
        console.log('');
      });
    }

    // Check for missing teachers
    const expectedTeachers = [
      { name: 'Shiv Prakash Yadav', email: 'sp8@photon.edu', photon_id: 'sp8@photon' },
      { name: 'Mahavir Kesari', email: 'mk6@photon.edu', photon_id: 'mk6@photon' },
      { name: 'AK Mishra', email: 'ak5@photon.edu', photon_id: 'ak5@photon' }
    ];

    console.log('📋 Setup Status:');
    expectedTeachers.forEach(expected => {
      const hasAuth = foundTeachers.some(user => user.email === expected.email);
      const hasProfile = profiles.some(profile => profile.photon_id === expected.photon_id);
      
      console.log(`   ${expected.name}:`);
      console.log(`      • Auth User: ${hasAuth ? '✅' : '❌'}`);
      console.log(`      • Profile: ${hasProfile ? '✅' : '❌'}`);
      console.log(`      • Status: ${hasAuth && hasProfile ? '✅ Ready' : '⚠️  Incomplete'}`);
      console.log('');
    });

    // Summary
    const readyCount = expectedTeachers.filter(expected => {
      const hasAuth = foundTeachers.some(user => user.email === expected.email);
      const hasProfile = profiles.some(profile => profile.photon_id === expected.photon_id);
      return hasAuth && hasProfile;
    }).length;

    console.log(`📈 Summary: ${readyCount}/3 teachers are ready to login`);
    
    if (readyCount < 3) {
      console.log('\n📝 Next Steps:');
      console.log('1. Go to Supabase Dashboard → Authentication → Users');
      console.log('2. Create missing auth users manually');
      console.log('3. Or refer to TEACHER_SETUP_INSTRUCTIONS.md for detailed steps');
    } else {
      console.log('\n🎉 All teachers are set up and ready to login!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Test login function
async function testTeacherLogin(email, password) {
  console.log(`\n🧪 Testing login for ${email}...`);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.log(`❌ Login failed: ${error.message}`);
  } else {
    console.log(`✅ Login successful for ${email}`);
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.log(`⚠️  Profile not found: ${profileError.message}`);
    } else {
      console.log(`   Role: ${profile.role}`);
      console.log(`   Name: ${profile.name}`);
      console.log(`   Photon ID: ${profile.photon_id}`);
    }

    // Sign out
    await supabase.auth.signOut();
  }
}

// Run verification
verifyTeachers().catch(console.error);