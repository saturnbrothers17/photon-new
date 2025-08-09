/**
 * Script to create teacher accounts in Supabase Auth
 * Run this script to add the missing teacher accounts
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const teachers = [
  {
    email: 'sp8@photon',
    password: 'photon123', // You can change these passwords
    name: 'Shiv Prakash Yadav'
  },
  {
    email: 'mk6@photon',
    password: 'photon123',
    name: 'Mahavir Kesari'
  },
  {
    email: 'ak5@photon',
    password: 'photon123',
    name: 'AK Mishra'
  }
];

async function createTeachers() {
  console.log('🏗️ Creating teacher accounts in Supabase...');
  
  for (const teacher of teachers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: teacher.email,
        password: teacher.password,
        email_confirm: true,
        user_metadata: {
          name: teacher.name,
          role: 'teacher'
        }
      });

      if (error) {
        console.error(`❌ Failed to create ${teacher.email}:`, error.message);
      } else {
        console.log(`✅ Created teacher account: ${teacher.email} (${teacher.name})`);
      }
    } catch (err) {
      console.error(`❌ Error creating ${teacher.email}:`, err.message);
    }
  }
  
  console.log('🎉 Teacher account setup complete!');
}

// Run the script
createTeachers().catch(console.error);
