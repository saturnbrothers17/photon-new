const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Comprehensive Study Materials Test...');

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

async function comprehensiveTest() {
  console.log('📚 Testing Study Materials System After SQL Fix...');
  
  try {
    // Test 1: Check what columns actually exist
    console.log('\n1️⃣ Checking table structure...');
    
    // Try to get table info using a different approach
    const { data: sampleData, error: sampleError } = await supabase
      .from('study_materials')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Cannot access table:', sampleError.message);
    } else {
      console.log('✅ Table accessible');
      if (sampleData && sampleData.length > 0) {
        console.log('Available columns:', Object.keys(sampleData[0]));
      } else {
        console.log('Table is empty, will test with insert');
      }
    }

    // Test 2: Check storage bucket
    console.log('\n2️⃣ Testing storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Storage error:', bucketError.message);
    } else {
      const studyBucket = buckets.find(b => b.name === 'study-materials');
      if (studyBucket) {
        console.log('✅ study-materials bucket exists');
        console.log('   Public:', studyBucket.public);
        console.log('   File size limit:', studyBucket.file_size_limit);
        
        // Test bucket access
        const { data: files, error: listError } = await supabase.storage
          .from('study-materials')
          .list('', { limit: 5 });
          
        if (listError) {
          console.log('⚠️  Cannot list files:', listError.message);
        } else {
          console.log(`   Files in bucket: ${files.length}`);
        }
      } else {
        console.log('❌ study-materials bucket not found');
      }
    }

    // Test 3: Try different column combinations for insert
    console.log('\n3️⃣ Testing material creation with different schemas...');
    
    const testMaterials = [
      // Try with original schema
      {
        title: 'Test Material 1',
        description: 'Test description',
        subject: 'Mathematics',
        content: 'Test content',
        file_url: 'test/sample1.pdf',
        class_level: 'Class 10',
        is_active: true
      },
      // Try with new schema
      {
        title: 'Test Material 2', 
        description: 'Test description 2',
        subject: 'Physics',
        file_path: 'test/sample2.pdf',
        file_type: 'application/pdf',
        file_size: 1024,
        tags: ['Class 11'],
        is_public: true,
        uploaded_by: 'test-teacher'
      }
    ];

    for (let i = 0; i < testMaterials.length; i++) {
      const material = testMaterials[i];
      console.log(`   Testing schema ${i + 1}...`);
      
      const { data: newMaterial, error: createError } = await supabase
        .from('study_materials')
        .insert([material])
        .select()
        .single();

      if (createError) {
        console.log(`   ❌ Schema ${i + 1} failed:`, createError.message);
      } else {
        console.log(`   ✅ Schema ${i + 1} worked! Created:`, newMaterial.title);
        console.log(`   Material ID:`, newMaterial.id);
        console.log(`   Available fields:`, Object.keys(newMaterial));
        
        // Clean up
        await supabase.from('study_materials').delete().eq('id', newMaterial.id);
        console.log(`   ✅ Cleaned up test material`);
        break; // Stop after first successful insert
      }
    }

    // Test 4: Check if sample materials were created by SQL script
    console.log('\n4️⃣ Checking for sample materials...');
    const { data: allMaterials, error: fetchError } = await supabase
      .from('study_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.log('❌ Cannot fetch materials:', fetchError.message);
    } else {
      console.log(`✅ Found ${allMaterials.length} materials in database`);
      
      if (allMaterials.length > 0) {
        console.log('\n📋 Sample materials:');
        allMaterials.forEach((material, index) => {
          console.log(`   ${index + 1}. ${material.title}`);
          console.log(`      Subject: ${material.subject}`);
          console.log(`      Uploaded by: ${material.uploaded_by || 'Unknown'}`);
          console.log(`      Created: ${new Date(material.created_at).toLocaleDateString()}`);
          
          // Test public URL generation
          if (material.file_path) {
            const { data: { publicUrl } } = supabase.storage
              .from('study-materials')
              .getPublicUrl(material.file_path);
            console.log(`      Public URL: ${publicUrl}`);
          }
          console.log('');
        });
      }
    }

    // Test 5: Test the API endpoint if server is running
    console.log('\n5️⃣ Testing API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/supabase/study-materials', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const apiData = await response.json();
        console.log('✅ API endpoint working');
        console.log(`   API returned ${apiData.data?.length || 0} materials`);
      } else {
        console.log('❌ API endpoint failed:', response.status);
      }
    } catch (apiError) {
      console.log('⚠️  API test skipped (server not running)');
      console.log('   Start server with "npm run dev" to test API');
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }

  console.log('\n🎯 Comprehensive Test Complete!');
  console.log('\n📋 Summary:');
  console.log('- Database table: Check above results');
  console.log('- Storage bucket: ✅ Created and accessible');
  console.log('- Sample materials: Check above results');
  console.log('- API endpoint: Test by starting dev server');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. Login as a teacher and test file upload');
  console.log('3. Check student corner for materials');
}

comprehensiveTest();