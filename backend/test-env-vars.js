// Test Environment Variables for Email Configuration
require('dotenv').config();

console.log('🧪 Testing Environment Variables for Email');
console.log('==========================================\n');

console.log('🔍 Checking Gmail configuration...');

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASS;

console.log('📧 GMAIL_USER:', gmailUser ? '✅ Set' : '❌ Not set');
console.log('🔐 GMAIL_APP_PASS:', gmailPass ? '✅ Set' : '❌ Not set');

if (gmailUser) {
  console.log('📧 Email address:', gmailUser);
} else {
  console.log('❌ GMAIL_USER not found in environment variables');
}

if (gmailPass) {
  console.log('🔐 App password length:', gmailPass.length, 'characters');
  if (gmailPass.length !== 16) {
    console.log('⚠️  Warning: App password should be 16 characters long');
  }
} else {
  console.log('❌ GMAIL_APP_PASS not found in environment variables');
}

console.log('\n🔍 Checking other environment variables...');
console.log('🗄️  DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('🌐 PORT:', process.env.PORT || '3000 (default)');

console.log('\n📋 Current .env file status:');
if (gmailUser && gmailPass) {
  console.log('✅ Gmail configuration looks good');
  console.log('🚀 You can now test email sending');
} else {
  console.log('❌ Gmail configuration is incomplete');
  console.log('\n🔧 TO FIX:');
  console.log('1. Open backend/.env file');
  console.log('2. Add these lines:');
  console.log('   GMAIL_USER=your-email@gmail.com');
  console.log('   GMAIL_APP_PASS=your-16-character-app-password');
  console.log('3. Save the file');
  console.log('4. Restart your server');
  console.log('\n📖 See EMAIL_SETUP_GUIDE.md for detailed instructions');
}

console.log('\n🧪 Next step: Run "node test-email-sending.js" to test email functionality');
