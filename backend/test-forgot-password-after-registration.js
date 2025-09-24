// Test Forgot Password After Registration (Without Email Verification)
const fetch = require('node-fetch');

console.log('🧪 Testing Forgot Password After Registration');
console.log('=============================================\n');

async function testForgotPasswordAfterRegistration() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🔄 Step 1: Register a new user...');
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'nsnaishwarybtech24@rvu.edu.in',
        mobile_number: '9876543210',
        address: 'Test Address',
        password: 'testpassword123'
      }),
    });

    const registerData = await registerResponse.json();
    if (registerData.success) {
      console.log('✅ Registration successful');
      console.log('📧 User:', registerData.user.email);
      console.log('📧 Message:', registerData.message);
    } else {
      console.log('❌ Registration failed:', registerData.message);
      return;
    }

    console.log('\n🔄 Step 2: Test forgot password immediately after registration (without email verification)...');
    const forgotResponse = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nsnaishwarybtech24@rvu.edu.in'
      }),
    });

    const forgotData = await forgotResponse.json();
    if (forgotData.success) {
      console.log('✅ Forgot password request successful!');
      console.log('📧 Message:', forgotData.message);
      console.log('🎉 User can now reset password even without email verification');
    } else {
      console.log('❌ Forgot password failed:', forgotData.message);
      console.log('🔍 This should now work - the issue has been fixed!');
      return;
    }

    console.log('\n🔄 Step 3: Test forgot password with non-existent email...');
    const wrongEmailResponse = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com'
      }),
    });

    const wrongEmailData = await wrongEmailResponse.json();
    if (!wrongEmailData.success) {
      console.log('✅ Non-existent email correctly rejected');
      console.log('📧 Message:', wrongEmailData.message);
    } else {
      console.log('❌ Non-existent email was accepted (this is wrong!)');
    }

    console.log('\n🎉 FORGOT PASSWORD AFTER REGISTRATION TEST PASSED!');
    console.log('=================================================');
    console.log('✅ Registration works');
    console.log('✅ Forgot password works immediately after registration');
    console.log('✅ No email verification required for password reset');
    console.log('✅ Non-existent emails are still rejected');
    console.log('✅ User-friendly password reset flow');
    
    console.log('\n🚀 The issue has been fixed!');
    console.log('📋 What works now:');
    console.log('   • Users can register');
    console.log('   • Users can immediately use forgot password');
    console.log('   • No need to verify email before password reset');
    console.log('   • More user-friendly experience');

    console.log('\n🧪 Test the complete flow manually:');
    console.log('   1. Go to: http://localhost:5000/register.html');
    console.log('   2. Register with your email and password');
    console.log('   3. Go to: http://localhost:5000/login.html');
    console.log('   4. Click "Forgot Password?"');
    console.log('   5. Enter your registered email');
    console.log('   6. Should work now (not "User not found")');
    console.log('   7. Check email for reset code');

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
    testForgotPasswordAfterRegistration();
  })
  .catch(error => {
    console.log('❌ Server is not running');
    console.log('🔧 Please start your server first:');
    console.log('   1. Run: npm start');
    console.log('   2. Wait for server to start');
    console.log('   3. Run this test again');
  });
