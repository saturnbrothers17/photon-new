// Standalone script to seed demo tests
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Demo test data
const demoTests = [
  {
    id: 'demo-test-1',
    name: 'Demo Physics Test - Mechanics',
    type: 'Mock Test',
    status: 'live',
    totalQuestions: 10,
    maxMarks: 40,
    subjects: ['Physics'],
    createdDate: new Date().toISOString(),
    duration: '2h 0m',
    date: '2025-08-06',
    time: '14:00',
    registeredStudents: 150,
    difficulty: 'Medium',
    instructions: 'Read all questions carefully. Attempt all questions. Use proper units.',
    syllabus: 'Mechanics: Laws of Motion, Work Energy Power, Rotational Motion',
    questions: [
      {
        id: 1,
        question: 'A car accelerates uniformly from rest to 20 m/s in 5 seconds. What is its acceleration?',
        options: ['2 m/s²', '4 m/s²', '5 m/s²', '10 m/s²'],
        correctAnswer: '4 m/s²',
        subject: 'Physics',
        marks: 4,
        explanation: 'Using v = u + at, where v = 20 m/s, u = 0, t = 5s. So a = (v-u)/t = 20/5 = 4 m/s²'
      },
      {
        id: 2,
        question: 'The work done by a force is maximum when the angle between force and displacement is:',
        options: ['0°', '45°', '90°', '180°'],
        correctAnswer: '0°',
        subject: 'Physics',
        marks: 4,
        explanation: 'Work = F·s·cosθ. Maximum when cosθ = 1, i.e., θ = 0°'
      }
    ]
  },
  {
    id: 'demo-test-2',
    name: 'Demo Chemistry Test - Organic Chemistry',
    type: 'Mock Test',
    status: 'published',
    totalQuestions: 8,
    maxMarks: 32,
    subjects: ['Chemistry'],
    createdDate: new Date().toISOString(),
    duration: '1h 30m',
    date: '2025-08-07',
    time: '10:00',
    registeredStudents: 120,
    difficulty: 'Easy',
    instructions: 'Focus on concepts. Show all steps. Use IUPAC nomenclature.',
    syllabus: 'Organic Chemistry: Hydrocarbons, Functional Groups, Reactions',
    questions: [
      {
        id: 1,
        question: 'The general formula for alkanes is:',
        options: ['CnH2n', 'CnH2n+2', 'CnH2n-2', 'CnHn'],
        correctAnswer: 'CnH2n+2',
        subject: 'Chemistry',
        marks: 4,
        explanation: 'Alkanes are saturated hydrocarbons with single bonds only, following CnH2n+2'
      }
    ]
  }
];

async function seedTests() {
  console.log('Starting demo test seeding...');
  
  try {
    for (const test of demoTests) {
      console.log(`Seeding: ${test.name}`);
      await setDoc(doc(db, 'tests', test.id), test);
      console.log(`✓ Seeded: ${test.name}`);
    }
    
    console.log('✅ All demo tests seeded successfully!');
    
    // Verify seeding
    const testsCollection = collection(db, 'tests');
    const snapshot = await getDocs(testsCollection);
    console.log(`📊 Total tests in database: ${snapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error seeding tests:', error);
  }
}

// Run seeding
seedTests();
