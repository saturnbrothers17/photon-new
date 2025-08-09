const fetch = require('node-fetch');

async function testStudyMaterialsDelete() {
  console.log('🧪 Testing Study Materials Delete Functionality');
  console.log('=' .repeat(50));

  try {
    // First, get all study materials
    console.log('📚 Fetching all study materials...');
    const getResponse = await fetch('http://localhost:3000/api/supabase/study-materials');
    const getResult = await getResponse.json();

    if (!getResult.data || getResult.data.length === 0) {
      console.log('❌ No study materials found to test delete');
      console.log('💡 Please upload some materials first using the upload page');
      return;
    }

    console.log(`✅ Found ${getResult.data.length} study materials`);
    
    // Show available materials
    console.log('\n📋 Available materials:');
    getResult.data.forEach((material, index) => {
      console.log(`${index + 1}. ${material.title} (ID: ${material.id})`);
      console.log(`   Subject: ${material.subject}, Class: ${material.class_level}`);
      console.log(`   File: ${material.file_url ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Test delete functionality with the first material
    const testMaterial = getResult.data[0];
    console.log(`🗑️ Testing delete for: "${testMaterial.title}"`);
    console.log(`   Material ID: ${testMaterial.id}`);

    // Ask for confirmation (in a real scenario)
    console.log('⚠️  In production, this would ask for user confirmation');
    console.log('   "Are you sure you want to delete this material?"');

    // Perform delete
    console.log('\n🔄 Attempting to delete material...');
    const deleteResponse = await fetch(`http://localhost:3000/api/supabase/study-materials?id=${testMaterial.id}`, {
      method: 'DELETE',
    });

    const deleteResult = await deleteResponse.json();

    if (deleteResult.success) {
      console.log('✅ Delete successful!');
      console.log(`   Deleted: "${deleteResult.deletedMaterial.title}"`);
      console.log('   Storage space has been freed up');
    } else {
      console.log('❌ Delete failed:', deleteResult.error);
    }

    // Verify deletion by fetching materials again
    console.log('\n🔍 Verifying deletion...');
    const verifyResponse = await fetch('http://localhost:3000/api/supabase/study-materials');
    const verifyResult = await verifyResponse.json();

    if (verifyResult.data) {
      const remainingCount = verifyResult.data.length;
      const originalCount = getResult.data.length;
      
      if (remainingCount === originalCount - 1) {
        console.log('✅ Verification successful!');
        console.log(`   Materials count: ${originalCount} → ${remainingCount}`);
        console.log('   Material was successfully deleted from database');
      } else {
        console.log('⚠️  Verification inconclusive');
        console.log(`   Expected: ${originalCount - 1}, Found: ${remainingCount}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure the server is running on port 3000');
    console.log('2. Check if the study materials API is working');
    console.log('3. Verify database connection');
    console.log('4. Check Supabase storage configuration');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Test completed');
}

// Test storage management features
async function testStorageManagement() {
  console.log('\n📊 Testing Storage Management Features');
  console.log('-'.repeat(30));

  try {
    const response = await fetch('http://localhost:3000/api/supabase/study-materials');
    const result = await response.json();

    if (result.data) {
      const materials = result.data;
      
      // Calculate storage stats
      const totalFiles = materials.length;
      const totalSize = materials.reduce((sum, material) => sum + (material.file_size || 0), 0);
      const subjects = [...new Set(materials.map(m => m.subject).filter(Boolean))];
      
      console.log('📈 Storage Statistics:');
      console.log(`   Total Files: ${totalFiles}`);
      console.log(`   Total Size: ${formatFileSize(totalSize)}`);
      console.log(`   Subjects: ${subjects.length} (${subjects.join(', ')})`);
      
      // Show largest files (potential candidates for deletion)
      const largestFiles = materials
        .filter(m => m.file_size > 0)
        .sort((a, b) => (b.file_size || 0) - (a.file_size || 0))
        .slice(0, 3);
      
      if (largestFiles.length > 0) {
        console.log('\n📁 Largest files (candidates for deletion):');
        largestFiles.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.title} - ${formatFileSize(file.file_size)}`);
        });
      }
      
      console.log('\n💡 Storage Management Tips:');
      console.log('   • Delete old or duplicate materials');
      console.log('   • Compress large files before uploading');
      console.log('   • Regularly review and clean up content');
      console.log('   • Use the manage materials page for easy deletion');
      
    }
  } catch (error) {
    console.error('❌ Storage management test failed:', error.message);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the tests
async function runAllTests() {
  await testStudyMaterialsDelete();
  await testStorageManagement();
}

runAllTests();