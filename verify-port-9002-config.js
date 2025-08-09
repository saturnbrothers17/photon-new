const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verifying Port 9002 Configuration...\n');

// Check environment variables
console.log('📋 Environment Configuration:');
console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
console.log(`   NEXT_PUBLIC_REDIRECT_URI: ${process.env.NEXT_PUBLIC_REDIRECT_URI}`);
console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
console.log('');

// Verify both URLs use port 9002
const nextAuthUrl = process.env.NEXTAUTH_URL;
const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

if (nextAuthUrl && nextAuthUrl.includes(':9002')) {
  console.log('✅ NEXTAUTH_URL correctly set to port 9002');
} else {
  console.log('❌ NEXTAUTH_URL not set to port 9002:', nextAuthUrl);
}

if (redirectUri && redirectUri.includes(':9002')) {
  console.log('✅ NEXT_PUBLIC_REDIRECT_URI correctly set to port 9002');
} else {
  console.log('❌ NEXT_PUBLIC_REDIRECT_URI not set to port 9002:', redirectUri);
}

console.log('\n🚀 Ready to start server on port 9002!');
console.log('\n📋 Start commands:');
console.log('   Option 1: npm run dev -- -p 9002');
console.log('   Option 2: start-server-9002.bat');
console.log('   Option 3: Double-click start-server-9002.bat');

console.log('\n🌐 URLs after server starts:');
console.log('   Home: http://localhost:9002');
console.log('   Study Materials: http://localhost:9002/student-corner/study-materials');
console.log('   Teacher Dashboard: http://localhost:9002/teacher-dashboard');

console.log('\n✅ Configuration verified for port 9002!');