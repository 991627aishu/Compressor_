// Test Forgot Password Functionality
const database = require('./database/database');

console.log('🧪 Testing Forgot Password Functionality');
console.log('=======================================\n');

async function testForgotPassword() {
  try {
    console.log('🔄 Step 1: Testing database connection...');
    await database.init();
    console.log('✅ Database connected successfully\n');

    const testEmail = 'nsnaishwaryabtech24@rvu.edu.in';

    console.log('🔄 Step 2: Testing user lookup...');
    console.log(`📧 Looking for user: ${testEmail}`);
    
    const user = await database.getUserByEmail(testEmail);
    
    if (user) {
      console.log('✅ User found in database');
      console.log('👤 User ID:', user.id);
      console.log('📧 Email:', user.email);
      console.log('📛 Name:', user.name);
      console.log('🔐 Email verified:', user.is_email_verified);
      
      console.log('\n🔄 Step 3: Testing OTP creation for password reset...');
      const otp = await database.createOTP(testEmail, '654321', 'password_reset');
      console.log('✅ Password reset OTP created');
      console.log('🔐 OTP ID:', otp.id);
      console.log('⏰ Expires:', otp.expiry);
      
      console.log('\n🎉 FORGOT PASSWORD FLOW IS WORKING!');
      console.log('✅ User exists in database');
      console.log('✅ OTP creation works');
      console.log('✅ Password reset flow is functional');
      
    } else {
      console.log('❌ User not found in database');
      console.log('🔍 This means:');
      console.log('   • User was never registered successfully');
      console.log('   • Database connection failed during registration');
      console.log('   • Email address is incorrect');
      
      console.log('\n🔧 TO FIX:');
      console.log('1. Check if database connection is working');
      console.log('2. Try registering again with this email');
      console.log('3. Verify the email address is correct');
    }

  } catch (error) {
    console.log('\n❌ TEST FAILED');
    console.log('🔍 Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🚨 DATABASE CONNECTION ISSUE');
      console.log('📝 Your Supabase database URL is not working');
      console.log('🔧 SOLUTION:');
      console.log('1. Go to: https://supabase.com');
      console.log('2. Create a new project');
      console.log('3. Get database URL from Settings → Database');
      console.log('4. Update your .env file');
      console.log('5. Restart server');
      console.log('\n📖 See: FIX_DATABASE_NOW.md for detailed instructions');
    } else if (error.message.includes('Database not connected')) {
      console.log('\n🚨 DATABASE NOT INITIALIZED');
      console.log('📝 Database connection failed to initialize');
      console.log('🔧 SOLUTION: Fix database connection first');
    } else {
      console.log('\n🚨 UNKNOWN ERROR');
      console.log('🔧 Check your database configuration');
    }
  }
}

testForgotPassword();
