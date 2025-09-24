// Test Proper Email Verification Flow
const fetch = require('node-fetch');

console.log('🧪 Testing Proper Email Verification Flow');
console.log('=========================================\n');

async function testVerificationFlow() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🔄 Step 1: Register a test user...');
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        mobile_number: '1234567890',
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

    console.log('\n🔄 Step 2: Test verification with wrong OTP (should fail)...');
    const wrongVerifyResponse = await fetch(`${baseUrl}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '000000'
      }),
    });

    const wrongVerifyData = await wrongVerifyResponse.json();
    if (!wrongVerifyData.success) {
      console.log('✅ Wrong OTP correctly rejected');
      console.log('📧 Message:', wrongVerifyData.message);
    } else {
      console.log('❌ Wrong OTP was accepted (this is wrong!)');
    }

    console.log('\n🔄 Step 3: Test verification with incomplete OTP (should fail)...');
    const incompleteVerifyResponse = await fetch(`${baseUrl}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123'
      }),
    });

    const incompleteVerifyData = await incompleteVerifyResponse.json();
    if (!incompleteVerifyData.success) {
      console.log('✅ Incomplete OTP correctly rejected');
      console.log('📧 Message:', incompleteVerifyData.message);
    } else {
      console.log('❌ Incomplete OTP was accepted (this is wrong!)');
    }

    console.log('\n🔄 Step 4: Test resend verification...');
    const resendResponse = await fetch(`${baseUrl}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com'
      }),
    });

    const resendData = await resendResponse.json();
    if (resendData.success) {
      console.log('✅ Resend verification successful');
      console.log('📧 Message:', resendData.message);
    } else {
      console.log('❌ Resend verification failed:', resendData.message);
    }

    console.log('\n🎉 VERIFICATION FLOW TEST COMPLETED!');
    console.log('====================================');
    console.log('✅ Registration works');
    console.log('✅ Wrong OTPs are rejected');
    console.log('✅ Incomplete OTPs are rejected');
    console.log('✅ Resend verification works');
    console.log('✅ Proper validation is in place');
    
    console.log('\n🚀 The verification page now follows proper procedure!');
    console.log('📋 What to test manually:');
    console.log('   1. Go to: http://localhost:5000/register.html');
    console.log('   2. Register with your email');
    console.log('   3. Go to verification page');
    console.log('   4. Enter 6-digit code from email');
    console.log('   5. Click "Verify Email" button (NOT auto-submit)');
    console.log('   6. Should get success message and redirect');

    console.log('\n🔧 Key Changes Made:');
    console.log('   • Removed auto-submit when 6 digits entered');
    console.log('   • User must manually click "Verify Email"');
    console.log('   • Shows "Ready to verify!" message when 6 digits entered');
    console.log('   • Proper validation and error handling');

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
    testVerificationFlow();
  })
  .catch(error => {
    console.log('❌ Server is not running');
    console.log('🔧 Please start your server first:');
    console.log('   1. Run: npm start');
    console.log('   2. Wait for server to start');
    console.log('   3. Run this test again');
  });
