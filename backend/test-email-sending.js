// Test Email Sending Functionality
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

console.log('🧪 Testing Email Sending Functionality');
console.log('=====================================\n');

async function testEmailSending() {
  console.log('🔍 Checking environment variables...');
  
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASS;
  
  if (!gmailUser || !gmailPass) {
    console.log('❌ Gmail credentials not found');
    console.log('🔧 Please check your .env file:');
    console.log('   GMAIL_USER=your-email@gmail.com');
    console.log('   GMAIL_APP_PASS=your-16-character-app-password');
    return;
  }
  
  console.log('✅ Gmail credentials found');
  console.log('📧 From email:', gmailUser);
  console.log('🔐 App password length:', gmailPass.length, 'characters');
  
  // Test email sending
  console.log('\n🔄 Testing email sending...');
  
  const testEmail = 'test@example.com'; // You can change this to your email
  const testOTP = '123456';
  const emailType = 'verification';
  
  console.log('📤 Sending test email to:', testEmail);
  console.log('🔐 OTP code:', testOTP);
  console.log('📧 Email type:', emailType);
  
  const pythonScript = path.join(__dirname, 'python', 'send_email.py');
  
  return new Promise((resolve, reject) => {
    const python = spawn('python', [pythonScript, testEmail, testOTP, emailType], {
      env: {
        ...process.env,
        GMAIL_USER: gmailUser,
        GMAIL_APP_PASS: gmailPass
      }
    });
    
    let output = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Email sent successfully!');
        console.log('📤 Output:', output.trim());
        console.log('\n🎉 Email functionality is working!');
        console.log('📋 What this means:');
        console.log('   • Gmail credentials are correct');
        console.log('   • Python script is working');
        console.log('   • Email sending is functional');
        console.log('   • Verification emails will be sent');
        console.log('   • Password reset emails will be sent');
        
        console.log('\n🧪 Test the complete flow:');
        console.log('1. Go to: http://localhost:5000/register.html');
        console.log('2. Register with your email');
        console.log('3. Check your inbox for verification code');
        console.log('4. Enter code on verification page');
        console.log('5. Should redirect to login page');
        
        resolve();
      } else {
        console.log('❌ Email sending failed!');
        console.log('🔍 Error code:', code);
        console.log('📝 Error message:', error.trim());
        
        if (error.includes('Authentication error')) {
          console.log('\n🚨 GMAIL AUTHENTICATION ERROR');
          console.log('🔧 SOLUTION:');
          console.log('1. Enable 2-Factor Authentication on Gmail');
          console.log('2. Generate App Password (not regular password)');
          console.log('3. Update GMAIL_APP_PASS in .env file');
          console.log('4. Restart server');
        } else if (error.includes('GMAIL_USER or GMAIL_APP_PASS are not set')) {
          console.log('\n🚨 ENVIRONMENT VARIABLES NOT SET');
          console.log('🔧 SOLUTION:');
          console.log('1. Check .env file exists in backend/ directory');
          console.log('2. Make sure variables are named exactly:');
          console.log('   GMAIL_USER=your-email@gmail.com');
          console.log('   GMAIL_APP_PASS=your-16-character-app-password');
          console.log('3. Restart server');
        } else {
          console.log('\n🚨 UNKNOWN ERROR');
          console.log('🔧 Check your Gmail configuration');
          console.log('📖 See EMAIL_SETUP_GUIDE.md for help');
        }
        
        reject(new Error(error));
      }
    });
  });
}

// Test Python availability first
console.log('🐍 Checking Python availability...');
const pythonTest = spawn('python', ['--version']);

pythonTest.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Python is available');
    testEmailSending().catch(error => {
      console.error('Test failed:', error.message);
    });
  } else {
    console.log('❌ Python is not available');
    console.log('🔧 SOLUTION:');
    console.log('1. Install Python 3.x from https://python.org');
    console.log('2. Make sure "python" command works in terminal');
    console.log('3. On Windows, you might need to use "python3" instead');
    console.log('4. Restart your server after installing Python');
  }
});

pythonTest.on('error', (error) => {
  console.log('❌ Python is not installed or not in PATH');
  console.log('🔧 SOLUTION:');
  console.log('1. Install Python 3.x from https://python.org');
  console.log('2. Add Python to your system PATH');
  console.log('3. Restart your server');
});
