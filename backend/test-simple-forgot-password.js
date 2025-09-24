// Simple test for forgot password without node-fetch
const http = require('http');

console.log('🧪 Simple Forgot Password Test');
console.log('===============================\n');

function makeRequest(email) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email: email });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/auth/forgot-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const responseData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: responseData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            error: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testForgotPassword() {
  try {
    console.log('🔄 Testing forgot password with existing user...');
    
    const testEmail = 'nsnaishwaryabtech24@rvu.edu.in';
    console.log('📧 Testing with email:', testEmail);
    
    const result = await makeRequest(testEmail);
    
    console.log('📊 Response Status:', result.status);
    console.log('📊 Response Data:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ SUCCESS! Forgot password is working');
      console.log('📧 Message:', result.data.message);
    } else {
      console.log('❌ FAILED! Forgot password is not working');
      console.log('🔍 Error:', result.data.message || 'Unknown error');
      
      if (result.status === 404) {
        console.log('\n🔍 DEBUGGING INFO:');
        console.log('==================');
        console.log('Status 404 means "User not found"');
        console.log('This suggests the server is not finding the user');
        console.log('Possible causes:');
        console.log('1. Server is using wrong authentication system');
        console.log('2. Email lookup is still case-sensitive');
        console.log('3. File loading issue');
        console.log('4. Server needs restart');
      }
    }

    console.log('\n🔄 Testing with different case...');
    
    const upperEmail = testEmail.toUpperCase();
    console.log('📧 Testing with uppercase:', upperEmail);
    
    const result2 = await makeRequest(upperEmail);
    
    console.log('📊 Response Status (uppercase):', result2.status);
    console.log('📊 Response Data (uppercase):', JSON.stringify(result2.data, null, 2));
    
    if (result2.status === 200 && result2.data.success) {
      console.log('✅ SUCCESS! Case-insensitive lookup works');
    } else {
      console.log('❌ Case-insensitive lookup still failing');
    }

  } catch (error) {
    console.log('❌ TEST FAILED');
    console.log('🔍 Error:', error.message);
  }
}

testForgotPassword();
