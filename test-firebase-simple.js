// Simple Firebase test using our exact configuration
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection } from 'firebase/firestore';

// Use exact same config as our app
const firebaseConfig = {
  apiKey: "AIzaSyBGfBqkU6FN9i_EOmVHDwDDPtfT5G3rxvQ",
  authDomain: "photon-coaching-institute.firebaseapp.com",
  projectId: "photon-coaching-institute",
  storageBucket: "photon-coaching-institute.firebasestorage.app",
  messagingSenderId: "17157646362",
  appId: "1:17157646362:web:ae1b88bb5f1acc5920c9a3",
  measurementId: "G-Z1S23C18TY"
};

async function testFirebaseSimple() {
  try {
    console.log('🔥 Testing Firebase with exact app configuration...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized');
    console.log('📊 Project ID:', firebaseConfig.projectId);
    
    // Try to write a simple document
    const testData = {
      name: "Firebase Connection Test",
      timestamp: new Date().toISOString(),
      status: "testing"
    };
    
    console.log('💾 Attempting to save test document...');
    
    // Use setDoc with a specific document ID
    await setDoc(doc(db, 'tests', 'connection-test'), testData);
    
    console.log('✅ Document saved successfully!');
    
    // Try to read back
    console.log('📥 Reading documents from tests collection...');
    const querySnapshot = await getDocs(collection(db, 'tests'));
    
    console.log(`✅ Found ${querySnapshot.size} documents in tests collection`);
    
    querySnapshot.forEach((doc) => {
      console.log(`  - Document ID: ${doc.id}`);
      console.log(`  - Data:`, doc.data());
    });
    
    console.log('🎉 Firebase test completed successfully!');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('');
      console.log('🔧 Troubleshooting steps:');
      console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/photon-coaching-institute/firestore');
      console.log('2. Click "Rules" tab');
      console.log('3. Make sure rules allow read/write access');
      console.log('4. Check that the database is in "test mode" or has proper rules');
    }
  }
}

testFirebaseSimple();