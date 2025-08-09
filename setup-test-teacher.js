/**
 * Setup Test Teacher Account
 * Creates a test teacher account with credentials: jp7@photon / jp7@photon
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupTestTeacher() {
  try {
    console.log('🔧 Setting up test teacher account...');
    
    const email = 'jp7@photon';
    const password = 'jp7@photon';
    
    // Create the user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'teacher',
        name: 'JP7 Teacher',
        photon_id: 'jp7',
        subject: 'Physics',
        department: 'Science'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ User already exists, updating password...');
        
        // Update existing user
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          authData?.user?.id || 'existing-user-id',
          {
            password: password,
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
          console.error('❌ Error updating user:', updateError.message);
          return;
        }
        
        console.log('✅ User updated successfully');
      } else {
        console.error('❌ Error creating user:', authError.message);
        return;
      }
    } else {
      console.log('✅ Test teacher account created successfully!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('👤 User ID:', authData.user.id);
    }

    // Test the login
    console.log('\n🧪 Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
    } else {
      console.log('✅ Login test successful!');
      console.log('🎯 Access token created');
      
      // Sign out after test
      await supabase.auth.signOut();
    }

    console.log('\n🎉 Setup complete!');
    console.log('📝 You can now login with:');
    console.log('   Email: jp7@photon');
    console.log('   Password: jp7@photon');
    console.log('🌐 Login URL: http://localhost:3002/faculty-portal');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
setupTestTeacher();