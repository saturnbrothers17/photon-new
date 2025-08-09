const fs = require('fs');

console.log('🔧 Configuring Server for Port 9002...\n');

// Read current .env.local
const envPath = '.env.local';
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('📋 Updating configuration for port 9002...');

// Update NEXTAUTH_URL to match port 9002
envContent = envContent.replace(
  'NEXTAUTH_URL=http://localhost:3000',
  'NEXTAUTH_URL=http://localhost:9002'
);

// Ensure REDIRECT_URI is also on port 9002
envContent = envContent.replace(
  'NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback',
  'NEXT_PUBLIC_REDIRECT_URI=http://localhost:9002/auth/callback'
);

// Write the updated configuration
fs.writeFileSync(envPath, envContent);

console.log('✅ Updated configuration:');
console.log('   NEXTAUTH_URL: http://localhost:9002');
console.log('   NEXT_PUBLIC_REDIRECT_URI: http://localhost:9002/auth/callback');
console.log('   ✅ Both using port 9002 now\n');

// Create package.json script for port 9002
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add dev script for port 9002
  if (!packageJson.scripts) packageJson.scripts = {};
  packageJson.scripts['dev:9002'] = 'next dev -p 9002';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Added npm script: "dev:9002"');
}

console.log('\n🚀 Start server with any of these commands:');
console.log('1. npm run dev:9002');
console.log('2. npm run dev -- -p 9002');
console.log('3. npx next dev -p 9002');

console.log('\n📍 Server will be available at:');
console.log('   http://localhost:9002');
console.log('   Study Materials: http://localhost:9002/student-corner/study-materials');

console.log('\n✅ Port 9002 configuration complete!');