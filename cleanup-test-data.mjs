import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupTestData() {
  console.log('🧹 Starting cleanup of test data...');

  try {
    // Delete test study materials
    console.log('Deleting test study materials...');
    const { data: materials, error: materialsError } = await supabase
      .from('study_materials')
      .delete()
      .or('title.ilike.%test%,description.ilike.%test%,title.ilike.%mock%')
      .select();
    
    if (materialsError) {
      console.error('Error deleting materials:', materialsError);
    } else {
      console.log(`✅ Deleted ${materials?.length || 0} test study materials`);
    }

    // Delete mock tests
    console.log('Deleting mock tests...');
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .delete()
      .or('title.ilike.%mock%,title.ilike.%test%,description.ilike.%test%')
      .select();
    
    if (testsError) {
      console.error('Error deleting tests:', testsError);
    } else {
      console.log(`✅ Deleted ${tests?.length || 0} mock tests`);
    }

    // Delete test live sessions
    console.log('Deleting test live sessions...');
    const { data: liveSessions, error: liveError } = await supabase
      .from('live_tests')
      .delete()
      .or('title.ilike.%test%,title.ilike.%mock%')
      .select();
    
    if (liveError) {
      console.error('Error deleting live tests:', liveError);
    } else {
      console.log(`✅ Deleted ${liveSessions?.length || 0} test live sessions`);
    }

    console.log('🎉 Cleanup completed successfully!');
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupTestData();
