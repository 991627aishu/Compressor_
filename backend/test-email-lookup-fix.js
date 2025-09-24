// Test Email Lookup Fix
const fetch = require('node-fetch');

console.log('🧪 Testing Email Lookup Fix');
console.log('============================\n');

async function testEmailLookupFix() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🔄 Step 1: Testing forgot password with existing user...');
    
    // Test with the exact email from the screenshot
    const testEmail = 'nsnaishwaryabtech24@rvu.edu.in';
    
    const forgotResponse = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail
      }),
    });

    const forgotData = await forgotResponse.json();
    
    console.log('📧 Response status:', forgotResponse.status);
    console.log('📧 Response data:', forgotData);
    
    if (forgotData.success) {
      console.log('✅ SUCCESS! Forgot password now works');
      console.log('📧 Message:', forgotData.message);
    } else {
      console.log('❌ Still failing:', forgotData.message);
      console.log('🔍 Check server logs for more details');
    }

    console.log('\n🔄 Step 2: Testing case sensitivity...');
    
    // Test with different case
    const upperCaseEmail = testEmail.toUpperCase();
    
    const forgotResponse2 = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: upperCaseEmail
      }),
    });

    const forgotData2 = await forgotResponse2.json();
    
    console.log('📧 Response status (uppercase):', forgotResponse2.status);
    console.log('📧 Response data (uppercase):', forgotData2);
    
    if (forgotData2.success) {
      console.log('✅ SUCCESS! Case-insensitive lookup works');
    } else {
      console.log('❌ Case-insensitive lookup still failing');
    }

    console.log('\n🔄 Step 3: Testing with extra spaces...');
    
    // Test with extra spaces
    const spacedEmail = ' ' + testEmail + ' ';
    
    const forgotResponse3 = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: spacedEmail
      }),
    });

    const forgotData3 = await forgotResponse3.json();
    
    console.log('📧 Response status (spaced):', forgotResponse3.status);
    console.log('📧 Response data (spaced):', forgotData3);
    
    if (forgotData3.success) {
      console.log('✅ SUCCESS! Trimmed lookup works');
    } else {
      console.log('❌ Trimmed lookup still failing');
    }

    console.log('\n🎉 EMAIL LOOKUP FIX TEST COMPLETED!');
    console.log('====================================');
    
    if (forgotData.success && forgotData2.success && forgotData3.success) {
      console.log('✅ ALL TESTS PASSED!');
      console.log('✅ Forgot password now works correctly');
      console.log('✅ Case-insensitive lookup works');
      console.log('✅ Trimmed lookup works');
      console.log('✅ The issue has been completely fixed!');
    } else {
      console.log('❌ Some tests still failing');
      console.log('🔍 Check server logs for more details');
    }

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
    testEmailLookupFix();
  })
  .catch(error => {
    console.log('❌ Server is not running');
    console.log('🔧 Please start your server first:');
    console.log('   1. Run: npm start');
    console.log('   2. Wait for server to start');
    console.log('   3. Run this test again');
  });
