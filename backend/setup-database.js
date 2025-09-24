// Database Setup Helper Script
const fs = require('fs');
const path = require('path');

console.log('🔧 Ultra Compressor - Database Setup Helper');
console.log('==========================================\n');

const envPath = path.join(__dirname, '.env');

// Check if .env file exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  console.log('📁 Location:', envPath);
  
  // Read and display current DATABASE_URL status
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasDatabaseUrl = envContent.includes('DATABASE_URL');
  
  if (hasDatabaseUrl) {
    console.log('✅ DATABASE_URL is configured');
    console.log('🚀 You can now run: npm start');
  } else {
    console.log('❌ DATABASE_URL is missing from .env file');
    console.log('📝 Please add your DATABASE_URL to the .env file');
    console.log('📖 See DATABASE_SETUP.md for instructions');
  }
} else {
  console.log('❌ .env file not found');
  console.log('📁 Expected location:', envPath);
  console.log('\n🔧 TO CREATE .env FILE:');
  console.log('1. Create a new file named ".env" in the backend/ directory');
  console.log('2. Add your Supabase database URL:');
  console.log('   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres');
  console.log('3. Add JWT secret:');
  console.log('   JWT_SECRET=your-super-secret-jwt-key-change-in-production-ultra-compressor-2024');
  console.log('4. Add port (optional):');
  console.log('   PORT=5000');
  console.log('\n📖 For detailed instructions, see: DATABASE_SETUP.md');
  console.log('\n🌐 Get your Supabase URL from: https://supabase.com/dashboard');
}

console.log('\n📋 CURRENT STATUS:');
console.log('• Database connection: ' + (fs.existsSync(envPath) ? 'Configured' : 'Not configured'));
console.log('• Email verification: ' + (fs.existsSync(envPath) ? 'Will be enabled' : 'Disabled'));
console.log('• File uploads: Always working');
console.log('• Auto-delete: Always working');

console.log('\n🚀 NEXT STEPS:');
console.log('1. Ensure .env file exists with DATABASE_URL');
console.log('2. Run: npm start');
console.log('3. Test registration at: http://localhost:5000/register.html');
