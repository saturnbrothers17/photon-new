const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Starting Study Materials Test...');

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

async function simpleTest() {
  console.log('📚 Testing Study Materials System...');
  console.log('Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  try {
    // Test 1: Check table access
    console.log('\n1️⃣ Testing table access...');
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Table access failed:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ Table access successful');
      console.log(`Found ${data.length} existing materials`);
      if (data.length > 0) {
        console.log('Sample material:', data[0]);
      }
    }

    // Test 2: Check storage buckets
    console.log('\n2️⃣ Testing storage access...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Storage access failed:', bucketError.message);
    } else {
      console.log('✅ Storage access successful');
      console.log('Available buckets:', buckets.map(b => b.name));
      
      const hasMaterialsBucket = buckets.some(b => b.name === 'study-materials');
      console.log('study-materials bucket exists:', hasMaterialsBucket);
    }

    // Test 3: Try to create a test material
    console.log('\n3️⃣ Testing material creation...');
    const testMaterial = {
      title: 'Test Material - ' + Date.now(),
      description: 'Test description',
      subject: 'Mathematics',
      file_path: 'test/sample.pdf',
      file_type: 'application/pdf',
      file_size: 1024,
      tags: ['Class 10'],
      is_public: true,
      uploaded_by: 'test@teacher.com'
    };

    const { data: newMaterial, error: createError } = await supabase
      .from('study_materials')
      .insert([testMaterial])
      .select()
      .single();

    if (createError) {
      console.log('❌ Material creation failed:', createError.message);
    } else {
      console.log('✅ Material creation successful');
      console.log('Created material ID:', newMaterial.id);
      
      // Clean up
      await supabase.from('study_materials').delete().eq('id', newMaterial.id);
      console.log('✅ Test material cleaned up');
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    console.log('Stack:', error.stack);
  }

  console.log('\n🎯 Test Complete!');
}

simpleTest();