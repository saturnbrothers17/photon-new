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

async function finalAttempt() {
  console.log('🚀 Final attempt to add teachers...\n');

  // Try using the signup method instead of admin create
  const teachers = [
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

  for (const teacher of teachers) {
    console.log(`📝 Attempting signup for: ${teacher.name}`);
    
    try {
      // Try regular signup (this might work better than admin create)
      const { data, error } = await supabase.auth.signUp({
        email: teacher.email,
        password: teacher.password,
        options: {
          data: {
            name: teacher.name,
            role: 'teacher',
            photon_id: teacher.photon_id,
            subject: teacher.subject,
            department: teacher.department
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`   ⚠️  User already exists: ${teacher.email}`);
        } else {
          console.log(`   ❌ Signup failed: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Signup successful for ${teacher.name}`);
        
        // Sign out immediately
        await supabase.auth.signOut();
        
        // Wait a moment for profile creation
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.log(`   ❌ Unexpected error: ${error.message}`);
    }
  }

  // Final verification
  console.log('\n🔍 Final verification...\n');
  await checkFinalStatus();
}

async function checkFinalStatus() {
  try {
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('created_at');

    if (error) {
      console.error('❌ Error checking profiles:', error);
      return;
    }

    console.log('📊 Final Teacher Status:');
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.name}`);
      console.log(`      • Email: ${profile.email}`);
      console.log(`      • Photon ID: ${profile.photon_id}`);
      console.log(`      • Subject: ${profile.subject || 'Not set'}`);
      console.log('');
    });

    const targetTeachers = [
      { name: 'JP7 Teacher', photon_id: 'jp7' },
      { name: 'Shiv Prakash Yadav', photon_id: 'sp8@photon' },
      { name: 'Mahavir Kesari', photon_id: 'mk6@photon' },
      { name: 'AK Mishra', photon_id: 'ak5@photon' }
    ];

    console.log('✅ Setup Status Check:');
    let readyCount = 0;
    
    targetTeachers.forEach(target => {
      const found = profiles.find(p => p.photon_id === target.photon_id);
      if (found) {
        console.log(`   ${target.name}: ✅ Ready`);
        readyCount++;
      } else {
        console.log(`   ${target.name}: ❌ Missing`);
      }
    });

    console.log(`\n📈 Overall Status: ${readyCount}/4 teachers ready`);

    if (readyCount === 4) {
      console.log('🎉 SUCCESS! All teachers are set up and ready to login!');
      console.log('\n🔑 Login Credentials:');
      profiles.forEach(profile => {
        const password = profile.photon_id === 'jp7' ? 'jp7@photon' : profile.photon_id;
        console.log(`   ${profile.name}: ${profile.email} / ${password}`);
      });
    } else {
      console.log('\n📋 MANUAL SETUP REQUIRED');
      console.log('Some teachers could not be created automatically.');
      console.log('Please use the Supabase Dashboard method:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Navigate to Authentication → Users');
      console.log('3. Click "Add user" for missing teachers');
      console.log('\nMissing teachers:');
      
      targetTeachers.forEach(target => {
        const found = profiles.find(p => p.photon_id === target.photon_id);
        if (!found && target.photon_id !== 'jp7') {
          const email = target.photon_id.replace('@photon', '@photon.edu');
          console.log(`   ${target.name}: ${email} / ${target.photon_id}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Final verification failed:', error);
  }
}

// Run the final attempt
finalAttempt().catch(console.error);