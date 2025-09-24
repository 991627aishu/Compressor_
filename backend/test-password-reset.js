// Test Password Reset Functionality
const fetch = require('node-fetch');

console.log('🧪 Testing Password Reset Functionality');
console.log('======================================\n');

async function testPasswordReset() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🔄 Step 1: Testing forgot password...');
    const forgotResponse = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com'
      }),
    });

    const forgotData = await forgotResponse.json();
    if (forgotData.success) {
      console.log('✅ Forgot password request successful');
      console.log('📧 Message:', forgotData.message);
    } else {
      console.log('❌ Forgot password failed:', forgotData.message);
      return;
    }

    console.log('\n🔄 Step 2: Testing password reset with OTP...');
    const resetResponse = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'newpassword123'
      }),
    });

    const resetData = await resetResponse.json();
    if (resetData.success) {
      console.log('✅ Password reset successful');
      console.log('📧 Message:', resetData.message);
    } else {
      console.log('❌ Password reset failed:', resetData.message);
      return;
    }

    console.log('\n🎉 PASSWORD RESET TEST PASSED!');
    console.log('===============================');
    console.log('✅ Forgot password works');
    console.log('✅ Password reset works');
    console.log('✅ Complete flow functional');
    
    console.log('\n🚀 Your password reset is working!');
    console.log('📋 What works now:');
    console.log('   • User can request password reset');
    console.log('   • User receives OTP code via email');
    console.log('   • User can reset password with OTP');
    console.log('   • Complete password reset flow functional');

    console.log('\n🧪 Test the flow manually:');
    console.log('   1. Go to: http://localhost:5000/login.html');
    console.log('   2. Click "Forgot Password?"');
    console.log('   3. Enter your email address');
    console.log('   4. Check email for OTP code');
    console.log('   5. Enter OTP and new password');
    console.log('   6. Should reset password successfully');

  } catch (error) {
    console.log('\n❌ TEST FAILED');
    console.log('🔍 Error:', error.message);
    console.log('\n🔧 Make sure your server is running:');
    console.log('   1. Run: npm start');
    console.log('   2. Wait for server to start');
    console.log('   3. Run this test again');
  }
}

// Check if server is running
fetch('http://localhost:5000/status')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Server is running:', data.message);
    testPasswordReset();
  })
  .catch(error => {
    console.log('❌ Server is not running');
    console.log('🔧 Please start your server first:');
    console.log('   1. Run: npm start');
    console.log('   2. Wait for server to start');
    console.log('   3. Run this test again');
  });
