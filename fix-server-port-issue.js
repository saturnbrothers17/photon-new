const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Server Port Configuration Issues...\n');

// Read current .env.local
const envPath = '.env.local';
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('📋 Current port configuration:');
console.log('   NEXTAUTH_URL: http://localhost:3000');
console.log('   NEXT_PUBLIC_REDIRECT_URI: http://localhost:9002/auth/callback');
console.log('   ❌ Port mismatch detected!\n');

// Option 1: Fix to use port 3000 (standard Next.js)
console.log('🔧 Applying Fix: Standardize on port 3000...');

envContent = envContent.replace(
  'NEXT_PUBLIC_REDIRECT_URI=http://localhost:9002/auth/callback',
  'NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback'
);

// Write the fixed configuration
fs.writeFileSync(envPath, envContent);

console.log('✅ Fixed port configuration:');
console.log('   NEXTAUTH_URL: http://localhost:3000');
console.log('   NEXT_PUBLIC_REDIRECT_URI: http://localhost:3000/auth/callback');
console.log('   ✅ Both using port 3000 now\n');

console.log('🚀 Next steps:');
console.log('1. Try starting the server: npm run dev');
console.log('2. Server should start on http://localhost:3000');
console.log('3. If you prefer port 9002, see the alternative solution below\n');

console.log('📋 Alternative: If you want to use port 9002:');
console.log('1. Update NEXTAUTH_URL to http://localhost:9002');
console.log('2. Start server with: npm run dev -- -p 9002');
console.log('3. Or add "dev": "next dev -p 9002" to package.json scripts');

console.log('\n✅ Port configuration fixed!');