// Test the hybrid storage system
import { getAllTests, saveTest, getPublishedTests } from './src/lib/hybrid-storage.js';

async function testHybridStorage() {
  try {
    console.log('🔄 Testing Hybrid Storage System...');
    
    // Create a test
    const testData = {
      id: 1,
      name: "JEE Main Mock Test - Hybrid Storage",
      type: "JEE Main",
      status: "published",
      students: 0,
      date: new Date().toLocaleDateString(),
      time: "10:00 AM",
      duration: "3 hours",
      avgScore: "0",
      totalQuestions: 90,
      maxMarks: 300,
      subjects: ["Physics", "Chemistry", "Mathematics"],
      createdDate: new Date().toISOString(),
      difficulty: "Medium",
      registeredStudents: 0
    };
    
    console.log('💾 Saving test to hybrid storage...');
    const saveResult = await saveTest(testData);
    console.log('Save result:', saveResult);
    
    console.log('📥 Loading all tests...');
    const allTests = await getAllTests();
    console.log(`Found ${allTests.length} tests:`, allTests.map(t => t.name));
    
    console.log('📚 Loading published tests...');
    const publishedTests = await getPublishedTests();
    console.log(`Found ${publishedTests.length} published tests:`, publishedTests.map(t => t.name));
    
    console.log('✅ Hybrid storage test completed successfully!');
    
  } catch (error) {
    console.error('❌ Hybrid storage test failed:', error);
  }
}

testHybridStorage();