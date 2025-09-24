// Debug User Lookup Issue
const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging User Lookup Issue');
console.log('==============================\n');

// Load users from file
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return {};
}

const users = loadUsers();

console.log('📋 All registered users:');
console.log('========================');
Object.keys(users).forEach(email => {
  const user = users[email];
  console.log(`📧 Email: "${email}"`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Verified: ${user.is_email_verified}`);
  console.log(`   Created: ${user.created_at}`);
  console.log('');
});

// Test the specific email from screenshots
const testEmail = 'nsnaishwaryabtech24@rvu.edu.in';
console.log(`🔍 Testing lookup for: "${testEmail}"`);
console.log('=====================================');

// Direct lookup
const directUser = users[testEmail];
if (directUser) {
  console.log('✅ Direct lookup SUCCESS');
  console.log(`   User found: ${directUser.name}`);
  console.log(`   Email verified: ${directUser.is_email_verified}`);
} else {
  console.log('❌ Direct lookup FAILED');
}

// Check for case sensitivity
console.log('\n🔍 Checking for case sensitivity issues...');
const lowerEmail = testEmail.toLowerCase();
const upperEmail = testEmail.toUpperCase();

console.log(`Lowercase: "${lowerEmail}"`);
console.log(`Uppercase: "${upperEmail}"`);

const lowerUser = users[lowerEmail];
const upperUser = users[upperEmail];

if (lowerUser) {
  console.log('✅ Lowercase lookup SUCCESS');
} else {
  console.log('❌ Lowercase lookup FAILED');
}

if (upperUser) {
  console.log('✅ Uppercase lookup SUCCESS');
} else {
  console.log('❌ Uppercase lookup FAILED');
}

// Check for similar emails
console.log('\n🔍 Checking for similar emails...');
const similarEmails = Object.keys(users).filter(email => 
  email.includes('nsnaishwary') || email.includes('aishwarya')
);

console.log('Similar emails found:');
similarEmails.forEach(email => {
  console.log(`   "${email}"`);
});

// Test exact match with trimming
console.log('\n🔍 Testing with trimming...');
const trimmedEmail = testEmail.trim();
const trimmedUser = users[trimmedEmail];

if (trimmedUser) {
  console.log('✅ Trimmed lookup SUCCESS');
} else {
  console.log('❌ Trimmed lookup FAILED');
}

// Check if the issue is in the forgot password logic
console.log('\n🔍 Simulating forgot password lookup...');
console.log('=======================================');

// Simulate the exact logic from proper-auth.js
const email = testEmail;
console.log(`Looking up email: "${email}"`);

const user = users[email];
console.log(`User object:`, user ? 'FOUND' : 'NOT FOUND');

if (!user) {
  console.log('❌ User not found - this explains the "User not found" error');
  console.log('🔍 Possible causes:');
  console.log('   1. Email case sensitivity');
  console.log('   2. Extra spaces or characters');
  console.log('   3. File loading issue');
  console.log('   4. Email modification during request');
} else {
  console.log('✅ User found - the issue might be elsewhere');
  console.log(`   User details: ${user.name} (${user.email})`);
}

console.log('\n🎯 RECOMMENDATION:');
console.log('==================');
console.log('The user exists in the file, so the issue is likely:');
console.log('1. Case sensitivity in email comparison');
console.log('2. Email being modified during the request');
console.log('3. File loading issue in the forgot password endpoint');

console.log('\n🔧 SOLUTION:');
console.log('============');
console.log('Add case-insensitive email lookup in proper-auth.js');
