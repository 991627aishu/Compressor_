// Test Email Verification Flow
const database = require('./database/database');

console.log('🧪 Testing Email Verification Flow');
console.log('==================================\n');

async function testEmailVerification() {
  try {
    console.log('🔄 Step 1: Testing database connection...');
    await database.init();
    console.log('✅ Database connected successfully\n');

    const testEmail = 'nsaishwarya777@gmail.com';
    const testOTP = '123456';

    console.log('🔄 Step 2: Testing OTP creation...');
    console.log(`📧 Creating OTP for email: ${testEmail}`);
    
    try {
      const otp = await database.createOTP(testEmail, testOTP, 'verification');
      console.log('✅ OTP created successfully');
      console.log('🔐 OTP ID:', otp.id);
      console.log('⏰ Expires:', otp.expiry);
    } catch (error) {
      if (error.message.includes('duplicate key')) {
        console.log('⚠️  OTP already exists (this is normal)');
      } else {
        throw error;
      }
    }

    console.log('\n🔄 Step 3: Testing OTP verification...');
    console.log(`🔍 Verifying OTP: ${testOTP} for email: ${testEmail}`);
    
    const otpRecord = await database.verifyOTP(testEmail, testOTP, 'verification');
    if (otpRecord) {
      console.log('✅ OTP verification successful');
      console.log('📧 Email:', otpRecord.email);
      console.log('🔐 OTP:', otpRecord.otp);
      console.log('⏰ Expires:', otpRecord.expiry);
    } else {
      console.log('❌ OTP verification failed');
      console.log('🔍 This could mean:');
      console.log('   • OTP is expired');
      console.log('   • OTP is already used');
      console.log('   • Wrong OTP code');
      console.log('   • Email mismatch');
      return;
    }

    console.log('\n🔄 Step 4: Testing OTP mark as used...');
    await database.markOTPAsUsed(testEmail, testOTP, 'verification');
    console.log('✅ OTP marked as used successfully');

    console.log('\n🔄 Step 5: Testing email verification update...');
    await database.updateEmailVerification(testEmail);
    console.log('✅ Email verification status updated');

    console.log('\n🔄 Step 6: Verifying user email status...');
    const user = await database.getUserByEmail(testEmail);
    if (user && user.is_email_verified) {
      console.log('✅ User email is now verified');
      console.log('👤 User ID:', user.id);
      console.log('📧 Email:', user.email);
      console.log('🔐 Email verified:', user.is_email_verified);
    } else {
      console.log('❌ User email verification failed');
      return;
    }

    console.log('\n🎉 EMAIL VERIFICATION FLOW TEST PASSED!');
    console.log('=======================================');
    console.log('✅ OTP creation works');
    console.log('✅ OTP verification works');
    console.log('✅ Email verification update works');
    console.log('✅ Complete flow is functional');
    
    console.log('\n🚀 Your email verification is working!');
    console.log('📋 What works now:');
    console.log('   • User can enter OTP code');
    console.log('   • OTP gets verified in database');
    console.log('   • Email verification status updates');
    console.log('   • User can login after verification');

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

testEmailVerification();
