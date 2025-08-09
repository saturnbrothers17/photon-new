#!/usr/bin/env node

/**
 * SETUP TEACHER USER SCRIPT
 * 
 * Creates a teacher user with email jp7@photon and password jp7@photon
 * for testing the faculty portal login system.
 * 
 * Usage: node scripts/setup-teacher-user.js
 */

const { createClient } = require('@supabase/supabase-js');

// Create admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env.local file and ensure these are set:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupTeacherUser() {
  console.log('🚀 Setting up teacher user for testing...');
  
  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ Error checking existing users:', checkError);
      return;
    }

    const existingTeacher = existingUser.users.find(user => user.email === 'jp7@photon');
    
    if (existingTeacher) {
      console.log('✅ User jp7@photon already exists:', {
        id: existingTeacher.id,
        email: existingTeacher.email,
        role: existingTeacher.user_metadata?.role || 'teacher'
      });
      
      // Update password to ensure it's jp7@photon
      console.log('🔧 Updating password...');
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingTeacher.id,
        { password: 'jp7@photon' }
      );
      
      if (updateError) {
        console.error('❌ Error updating password:', updateError);
      } else {
        console.log('✅ Password updated successfully');
      }
      
      return;
    }

    // Create new teacher user
    console.log('📝 Creating new teacher user...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'jp7@photon',
      password: 'jp7@photon',
      email_confirm: true,
      user_metadata: {
        role: 'teacher',
        name: 'JP Teacher',
        display_name: 'JP'
      }
    });

    if (createError) {
      console.error('❌ Error creating teacher user:', createError);
      return;
    }

    console.log('✅ Teacher user created successfully:', {
      id: newUser.user.id,
      email: newUser.user.email,
      role: newUser.user.user_metadata?.role
    });

    // Create a sample test for the new teacher
    console.log('📚 Creating sample test for teacher...');
    const { error: testError } = await supabaseAdmin
      .from('tests')
      .insert([
        {
          title: 'Sample Physics Test',
          description: 'A sample test for the new teacher account',
          subject: 'Physics',
          class_level: '12',
          duration: 60,
          total_marks: 100,
          passing_marks: 35,
          is_published: true,
          created_by: newUser.user.id,
          created_at: new Date().toISOString()
        }
      ]);

    if (testError) {
      console.error('❌ Error creating sample test:', testError);
    } else {
      console.log('✅ Sample test created successfully');
    }

    console.log('\n🎉 Setup complete!');
    console.log('📧 Login: jp7@photon');
    console.log('🔑 Password: jp7@photon');
    console.log('🔗 Faculty Portal: http://localhost:3000/faculty-portal');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the setup
setupTeacherUser();
