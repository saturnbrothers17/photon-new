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

async function updateJP7Name() {
  console.log('📝 Updating JP7 Teacher Name to "Jai Prakash Mishra"...\n');

  try {
    // Update user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        name: 'Jai Prakash Mishra',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'jp7@photon')
      .select()
      .single();

    if (error) {
      console.log('❌ Failed to update JP7 profile:', error.message);
      return;
    }

    console.log('✅ Updated profile: Jai Prakash Mishra (jp7@photon)');

    // Update auth user metadata
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (!authError) {
      const jp7User = authUsers.users.find(u => u.email === 'jp7@photon');
      
      if (jp7User) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          jp7User.id,
          {
            user_metadata: {
              ...jp7User.user_metadata,
              name: 'Jai Prakash Mishra'
            }
          }
        );

        if (updateError) {
          console.log('⚠️  Could not update auth metadata:', updateError.message);
        } else {
          console.log('✅ Updated auth metadata for Jai Prakash Mishra');
        }
      }
    }

    console.log('\n🎉 JP7 name update complete!');
    console.log('Now all teachers have their proper full names:');
    console.log('   • Jai Prakash Mishra (jp7@photon)');
    console.log('   • Shiv Prakash Yadav (sp8@photon.edu)');
    console.log('   • Mahavir Kesari (mk6@photon.edu)');
    console.log('   • AK Mishra (ak5@photon.edu)');

  } catch (error) {
    console.log('❌ Error updating JP7 name:', error.message);
  }
}

updateJP7Name().catch(console.error);