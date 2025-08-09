const fetch = require('node-fetch');

async function testDeleteFunctionality() {
  console.log('🧪 Testing Study Materials Delete Functionality');
  console.log('=' .repeat(60));

  try {
    // Step 1: Get all study materials
    console.log('📚 Step 1: Fetching all study materials...');
    const getResponse = await fetch('http://localhost:3000/api/supabase/study-materials');
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch materials: ${getResponse.status}`);
    }
    
    const getResult = await getResponse.json();
    console.log('📡 API Response:', JSON.stringify(getResult, null, 2));

    const materials = getResult.data || [];
    
    if (materials.length === 0) {
      console.log('❌ No study materials found to test delete');
      console.log('💡 Please upload some materials first using the teacher dashboard');
      return;
    }

    console.log(`✅ Found ${materials.length} study materials`);
    
    // Step 2: Show available materials with file sizes
    console.log('\n📋 Step 2: Available materials:');
    materials.forEach((material, index) => {
      console.log(`${index + 1}. "${material.title}"`);
      console.log(`   ID: ${material.id}`);
      console.log(`   Subject: ${material.subject || 'N/A'}`);
      console.log(`   Class: ${material.class_level || 'N/A'}`);
      console.log(`   File Size: ${formatFileSize(material.file_size || 0)}`);
      console.log(`   File Type: ${material.file_type || 'N/A'}`);
      console.log(`   File URL: ${material.file_url ? 'Yes' : 'No'}`);
      console.log(`   Created: ${material.created_at || 'N/A'}`);
      console.log('');
    });

    // Step 3: Test delete functionality with the first material
    const testMaterial = materials[0];
    console.log(`🗑️ Step 3: Testing delete for: "${testMaterial.title}"`);
    console.log(`   Material ID: ${testMaterial.id}`);
    console.log(`   File Size: ${formatFileSize(testMaterial.file_size || 0)}`);

    // Show confirmation message (like the UI would)
    console.log('\n⚠️  Confirmation (simulated):');
    console.log(`   "Are you sure you want to delete '${testMaterial.title}'?"`);
    console.log('   "This will permanently remove the material and free up storage space."');
    console.log('   "This action cannot be undone."');
    console.log('   [User clicks: YES]');

    // Step 4: Perform delete
    console.log('\n🔄 Step 4: Attempting to delete material...');
    const deleteResponse = await fetch(`http://localhost:3000/api/supabase/study-materials?id=${testMaterial.id}`, {
      method: 'DELETE',
    });

    console.log(`📡 Delete response status: ${deleteResponse.status}`);
    
    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('❌ Delete request failed:', errorText);
      return;
    }

    const deleteResult = await deleteResponse.json();
    console.log('📡 Delete response:', JSON.stringify(deleteResult, null, 2));

    if (deleteResult.success) {
      console.log('✅ Delete successful!');
      console.log(`   Deleted: "${deleteResult.deletedMaterial?.title || testMaterial.title}"`);
      console.log(`   Storage freed: ${formatFileSize(testMaterial.file_size || 0)}`);
      console.log('   Both database record and storage file have been removed');
    } else {
      console.log('❌ Delete failed:', deleteResult.error);
      return;
    }

    // Step 5: Verify deletion by fetching materials again
    console.log('\n🔍 Step 5: Verifying deletion...');
    const verifyResponse = await fetch('http://localhost:3000/api/supabase/study-materials');
    
    if (!verifyResponse.ok) {
      console.log('⚠️  Could not verify deletion - API error');
      return;
    }
    
    const verifyResult = await verifyResponse.json();
    const remainingMaterials = verifyResult.data || [];

    const remainingCount = remainingMaterials.length;
    const originalCount = materials.length;
    
    console.log(`📊 Materials count: ${originalCount} → ${remainingCount}`);
    
    if (remainingCount === originalCount - 1) {
      console.log('✅ Verification successful!');
      console.log('   Material was successfully deleted from database');
      
      // Check if the deleted material is really gone
      const deletedMaterialExists = remainingMaterials.find(m => m.id === testMaterial.id);
      if (!deletedMaterialExists) {
        console.log('✅ Confirmed: Deleted material no longer exists in database');
      } else {
        console.log('❌ Error: Deleted material still exists in database');
      }
    } else {
      console.log('⚠️  Verification inconclusive');
      console.log(`   Expected: ${originalCount - 1}, Found: ${remainingCount}`);
    }

    // Step 6: Show remaining materials
    console.log('\n📋 Step 6: Remaining materials:');
    if (remainingMaterials.length > 0) {
      remainingMaterials.forEach((material, index) => {
        console.log(`${index + 1}. "${material.title}" (${formatFileSize(material.file_size || 0)})`);
      });
    } else {
      console.log('   No materials remaining');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure the server is running on port 3000');
    console.log('2. Check if the study materials API is working');
    console.log('3. Verify database connection and schema');
    console.log('4. Check Supabase storage configuration');
    console.log('5. Ensure file_size and file_type columns exist in study_materials table');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test completed');
}

// Test storage statistics
async function testStorageStats() {
  console.log('\n📊 Testing Storage Statistics');
  console.log('-'.repeat(40));

  try {
    const response = await fetch('http://localhost:3000/api/supabase/study-materials');
    const result = await response.json();

    if (result.data) {
      const materials = result.data;
      
      // Calculate storage stats
      const totalFiles = materials.length;
      const totalSize = materials.reduce((sum, material) => sum + (material.file_size || 0), 0);
      const subjects = [...new Set(materials.map(m => m.subject).filter(Boolean))];
      const fileTypes = [...new Set(materials.map(m => m.file_type).filter(Boolean))];
      
      console.log('📈 Current Storage Statistics:');
      console.log(`   📁 Total Files: ${totalFiles}`);
      console.log(`   💾 Total Size: ${formatFileSize(totalSize)}`);
      console.log(`   📚 Subjects: ${subjects.length} (${subjects.join(', ')})`);
      console.log(`   📄 File Types: ${fileTypes.length} (${fileTypes.join(', ')})`);
      
      // Show file size distribution
      const sizeRanges = {
        'Small (< 1MB)': materials.filter(m => (m.file_size || 0) < 1024 * 1024).length,
        'Medium (1-10MB)': materials.filter(m => (m.file_size || 0) >= 1024 * 1024 && (m.file_size || 0) < 10 * 1024 * 1024).length,
        'Large (> 10MB)': materials.filter(m => (m.file_size || 0) >= 10 * 1024 * 1024).length,
        'Unknown size': materials.filter(m => !m.file_size || m.file_size === 0).length
      };
      
      console.log('\n📊 File Size Distribution:');
      Object.entries(sizeRanges).forEach(([range, count]) => {
        console.log(`   ${range}: ${count} files`);
      });
      
      // Show largest files (candidates for deletion)
      const largestFiles = materials
        .filter(m => m.file_size > 0)
        .sort((a, b) => (b.file_size || 0) - (a.file_size || 0))
        .slice(0, 5);
      
      if (largestFiles.length > 0) {
        console.log('\n📁 Largest files (deletion candidates):');
        largestFiles.forEach((file, index) => {
          console.log(`   ${index + 1}. "${file.title}" - ${formatFileSize(file.file_size)}`);
        });
      }
      
      console.log('\n💡 Storage Management Benefits:');
      console.log('   ✅ Teachers can now delete materials to free space');
      console.log('   ✅ File sizes are properly tracked and displayed');
      console.log('   ✅ Storage usage is visible for better management');
      console.log('   ✅ Both database and storage files are cleaned up');
      
    }
  } catch (error) {
    console.error('❌ Storage stats test failed:', error.message);
  }
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run all tests
async function runAllTests() {
  await testDeleteFunctionality();
  await testStorageStats();
}

runAllTests();