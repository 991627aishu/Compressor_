// Test Database Connection Script
const database = require('./database/database');

console.log('🧪 Testing Database Connection');
console.log('=============================\n');

console.log('🔄 Attempting to connect to database...');

database.init()
  .then(() => {
    console.log('✅ SUCCESS: Database connection working!');
    console.log('🎉 Your .env file is configured correctly');
    console.log('🚀 You can now run: npm start');
    console.log('\n📋 What works now:');
    console.log('• User registration');
    console.log('• Email verification');
    console.log('• Login with email verification');
    console.log('• File uploads with auto-delete');
    console.log('• All protected routes');
    
    // Test a simple database operation
    return database.getUserByEmail('test@example.com');
  })
  .then(() => {
    console.log('\n✅ Database operations working correctly');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n❌ FAILED: Database connection error');
    console.log('🔍 Error details:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🚨 DIAGNOSIS: Invalid database URL');
      console.log('📝 The Supabase URL in your .env file is incorrect');
      console.log('🔧 SOLUTION:');
      console.log('1. Go to https://supabase.com');
      console.log('2. Create a new project');
      console.log('3. Get your database URL from Settings → Database');
      console.log('4. Update your .env file with the correct URL');
      console.log('5. Run this test again');
    } else if (error.message.includes('password')) {
      console.log('\n🚨 DIAGNOSIS: Authentication failed');
      console.log('📝 Wrong password in DATABASE_URL');
      console.log('🔧 SOLUTION: Check your database password in .env file');
    } else if (error.message.includes('Connection string')) {
      console.log('\n🚨 DIAGNOSIS: Malformed connection string');
      console.log('📝 DATABASE_URL format is incorrect');
      console.log('🔧 SOLUTION: Use the format from Supabase dashboard');
    } else {
      console.log('\n🚨 DIAGNOSIS: Unknown database error');
      console.log('🔧 SOLUTION: Check FIX_DATABASE_NOW.md for help');
    }
    
    console.log('\n📖 For detailed help, see: FIX_DATABASE_NOW.md');
    process.exit(1);
  });
