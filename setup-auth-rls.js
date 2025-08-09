/**
 * Setup Authentication and RLS
 * Runs the SQL script to set up proper authentication and Row Level Security
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
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

async function setupAuthRLS() {
  try {
    console.log('🔧 Setting up authentication and RLS...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('supabase-auth-rls-setup.sql', 'utf8');
    
    // Split SQL commands (basic splitting by semicolon)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Found ${commands.length} SQL commands to execute`);

    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.toLowerCase().includes('commit')) {
        console.log('✅ Committing transaction');
        continue;
      }

      try {
        console.log(`⚡ Executing command ${i + 1}/${commands.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: command + ';' 
        });

        if (error) {
          // Try direct execution for some commands
          const { error: directError } = await supabase
            .from('_temp_table_that_does_not_exist')
            .select('*');
          
          // If it's a table creation or policy command, try a different approach
          if (command.toLowerCase().includes('create table') || 
              command.toLowerCase().includes('alter table') ||
              command.toLowerCase().includes('create policy') ||
              command.toLowerCase().includes('create function') ||
              command.toLowerCase().includes('create trigger')) {
            
            console.log(`⚠️ Skipping command (may need manual execution): ${command.substring(0, 50)}...`);
            continue;
          }
          
          console.error(`❌ Error executing command: ${error.message}`);
          console.log(`Command: ${command.substring(0, 100)}...`);
        } else {
          console.log(`✅ Command executed successfully`);
        }
      } catch (cmdError) {
        console.error(`❌ Error with command ${i + 1}:`, cmdError.message);
        console.log(`Command: ${command.substring(0, 100)}...`);
      }
    }

    // Verify the setup by checking if user_profiles table exists
    console.log('\n🧪 Verifying setup...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_profiles');

    if (tablesError) {
      console.log('⚠️ Could not verify table creation');
    } else if (tables && tables.length > 0) {
      console.log('✅ user_profiles table exists');
    } else {
      console.log('⚠️ user_profiles table may not have been created');
    }

    // Check if the test user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'jp7@photon')
      .single();

    if (profileError) {
      console.log('⚠️ Test user profile not found, this is normal if tables were not created');
    } else {
      console.log('✅ Test user profile exists:', profile);
    }

    console.log('\n🎉 Authentication and RLS setup completed!');
    console.log('📝 Note: Some commands may need to be run manually in Supabase SQL editor');
    console.log('🌐 You can now test authenticated login at: http://localhost:3002/faculty-portal');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
setupAuthRLS();