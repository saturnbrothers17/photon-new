// Test Firebase connection and save a sample test
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBGfBqkU6FN9i_EOmVHDwDDPtfT5G3rxvQ",
  authDomain: "photon-coaching-institute.firebaseapp.com",
  projectId: "photon-coaching-institute",
  storageBucket: "photon-coaching-institute.firebasestorage.app",
  messagingSenderId: "17157646362",
  appId: "1:17157646362:web:ae1b88bb5f1acc5920c9a3",
  measurementId: "G-Z1S23C18TY"
};

async function testFirebase() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Create a test document
    const testData = {
      id: "1",
      name: "Sample JEE Main Test - Firebase",
      type: "JEE Main",
      status: "published",
      totalQuestions: 90,
      maxMarks: 300,
      subjects: ["Physics", "Chemistry", "Mathematics"],
      createdDate: new Date().toISOString(),
      duration: "3 hours",
      difficulty: "Medium"
    };
    
    console.log('💾 Saving test to Firebase...');
    const docRef = await addDoc(collection(db, 'tests'), testData);
    console.log('✅ Test saved with ID:', docRef.id);
    
    // Read back the data
    console.log('📥 Reading tests from Firebase...');
    const querySnapshot = await getDocs(collection(db, 'tests'));
    const tests = [];
    querySnapshot.forEach((doc) => {
      tests.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Found ${tests.length} tests in Firebase:`);
    tests.forEach(test => {
      console.log(`  - ${test.name} (${test.type})`);
    });
    
    console.log('🎉 Firebase test completed successfully!');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
  }
}

testFirebase();