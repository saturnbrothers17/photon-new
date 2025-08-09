import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupTestData() {
  console.log('🧹 Starting cleanup of test data...');

  try {
    // Delete test study materials
    console.log('Deleting test study materials...');
    const { error: materialsError } = await supabase
      .from('study_materials')
      .delete()
      .or('title.ilike.%test%,description.ilike.%test%,title.ilike.%mock%');
    
    if (materialsError) {
      console.error('Error deleting materials:', materialsError);
    } else {
      console.log('✅ Test study materials deleted');
    }

    // Delete mock tests
    console.log('Deleting mock tests...');
    const { error: testsError } = await supabase
      .from('tests')
      .delete()
      .or('title.ilike.%mock%,title.ilike.%test%,description.ilike.%test%');
    
    if (testsError) {
      console.error('Error deleting tests:', testsError);
    } else {
      console.log('✅ Mock tests deleted');
    }

    // Delete test live sessions
    console.log('Deleting test live sessions...');
    const { error: liveError } = await supabase
      .from('live_tests')
      .delete()
      .or('title.ilike.%test%,title.ilike.%mock%');
    
    if (liveError) {
      console.error('Error deleting live tests:', liveError);
    } else {
      console.log('✅ Test live sessions deleted');
    }

    console.log('🎉 Cleanup completed successfully!');
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupTestData();
