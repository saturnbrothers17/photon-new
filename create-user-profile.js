/**
 * Create User Profile for jp7@photon
 * Creates a user profile record for the test teacher
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUserProfile() {
  try {
    console.log('👤 Creating user profile for jp7@photon...');
    
    // First, get the user ID for jp7@photon
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error listing users:', usersError.message);
      return;
    }

    const jp7User = users.users.find(user => user.email === 'jp7@photon');
    
    if (!jp7User) {
      console.error('❌ User jp7@photon not found. Please run setup-test-teacher.js first');
      return;
    }

    console.log('✅ Found user:', jp7User.id);

    // Create or update user metadata
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      jp7User.id,
      {
        user_metadata: {
          role: 'teacher',
          name: 'JP7 Teacher',
          photon_id: 'jp7',
          subject: 'Physics',
          department: 'Science'
        }
      }
    );

    if (updateError) {
      console.error('❌ Error updating user metadata:', updateError.message);
    } else {
      console.log('✅ User metadata updated successfully');
    }

    // Try to create user_profiles table if it doesn't exist
    console.log('📝 Ensuring user_profiles table exists...');
    
    // Simple table creation (this might fail if table already exists, which is fine)
    try {
      const createTableSQL = `
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
      `;
      
      // We can't execute DDL directly, so we'll just log it
      console.log('📋 Table creation SQL (run this in Supabase SQL editor if needed):');
      console.log(createTableSQL);
      
    } catch (tableError) {
      console.log('⚠️ Table creation skipped (may already exist)');
    }

    // Try to insert/update the profile record
    console.log('👤 Creating profile record...');
    
    try {
      // Try to insert the profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .upsert([{
          id: jp7User.id,
          email: 'jp7@photon',
          role: 'teacher',
          name: 'JP7 Teacher',
          photon_id: 'jp7',
          subject: 'Physics',
          department: 'Science'
        }], {
          onConflict: 'id'
        })
        .select()
        .single();

      if (profileError) {
        console.log('⚠️ Profile table may not exist yet. User metadata has been set.');
        console.log('📋 Profile creation SQL (run this in Supabase SQL editor):');
        console.log(`
          INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department)
          VALUES (
            '${jp7User.id}',
            'jp7@photon',
            'teacher',
            'JP7 Teacher',
            'jp7',
            'Physics',
            'Science'
          )
          ON CONFLICT (id) DO UPDATE SET
            role = 'teacher',
            name = 'JP7 Teacher',
            photon_id = 'jp7',
            subject = 'Physics',
            department = 'Science',
            updated_at = NOW();
        `);
      } else {
        console.log('✅ Profile created/updated successfully:', profileData);
      }
    } catch (profileError) {
      console.log('⚠️ Could not create profile record directly');
    }

    // Test authentication
    console.log('\n🧪 Testing authentication...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jp7@photon',
      password: 'jp7@photon'
    });

    if (authError) {
      console.error('❌ Authentication test failed:', authError.message);
    } else {
      console.log('✅ Authentication successful!');
      console.log('👤 User data:', {
        id: authData.user.id,
        email: authData.user.email,
        role: authData.user.user_metadata?.role,
        name: authData.user.user_metadata?.name
      });
      
      // Sign out
      await supabase.auth.signOut();
    }

    console.log('\n🎉 Setup completed!');
    console.log('📝 User jp7@photon is ready for testing');
    console.log('🌐 Test login at: http://localhost:3002/faculty-portal');
    console.log('📧 Email: jp7@photon');
    console.log('🔑 Password: jp7@photon');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
createUserProfile();