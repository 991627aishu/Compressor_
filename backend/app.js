

// const express = require('express');
// const path = require('path');
// const compressRouter = require('./routes/compress');
// const cors = require('cors');

// const app = express();
// // Use the PORT environment variable or default to 3000
// const port = process.env.PORT || 3000;

// // Enable CORS (useful if frontend is hosted separately)
// app.use(cors());

// // Middleware to parse form data and JSON
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // Serve frontend static files
// app.use(express.static(path.join(__dirname, '..', 'frontend')));

// // Serve main HTML page
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
// });

// // Compression endpoint
// app.use('/compress', compressRouter);

// // ✅ NEW: Render status route
// app.get('/status', (req, res) => {
//   const currentTime = new Date().toLocaleString();
//   res.json({
//     message: 'Server is on',
//     time: currentTime
//   });
// });

// // Start server
// app.listen(port, () => {
//   console.log(`✅ Server running on http://localhost:${port}`);
// });










// const express = require('express');
// const path = require('path');
// const compressRouter = require('./routes/compress');
// const cors = require('cors');

// const app = express();
// // Use the PORT environment variable or default to 3000
// const port = process.env.PORT || 3000;

// // Enable CORS (useful if frontend is hosted separately)
// app.use(cors());

// // Middleware to parse form data and JSON
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // ✅ Log every request (method, URL, time)
// app.use((req, res, next) => {
//   console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
//   next();
// });

// // Serve frontend static files
// app.use(express.static(path.join(__dirname, '..', 'frontend')));

// // Serve main HTML page
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
// });

// // Compression endpoint
// app.use('/compress', compressRouter);

// // ✅ NEW: Render status route
// app.get('/status', (req, res) => {
//   const currentTime = new Date().toLocaleString();
//   res.json({
//     message: 'Server is on',
//     time: currentTime
//   });
// });

// // Start server
// app.listen(port, () => {
//   console.log(`✅ Server running on http://localhost:${port}`);
// });














const express = require('express');
const path = require('path');
const compressRouter = require('./routes/compress');
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');
const tempAuthRouter = require('./routes/temp-auth');
const properAuthRouter = require('./routes/proper-auth');
const authMiddleware = require('./middleware/auth');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const database = require('./database/database');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ Database connection with temporary fallback
let databaseConnected = false;

database.init()
  .then(() => {
    console.log('✅ Database initialized successfully');
    console.log('🔐 Email verification is ENABLED');
    databaseConnected = true;
  })
  .catch(err => {
    console.error('❌ Database initialization error:', err.message);
    databaseConnected = false;
    
    if (err.message.includes('ENOTFOUND')) {
      console.log('\n🚨 DATABASE URL NOT FOUND!');
      console.log('📝 Your Supabase database URL is invalid or the project doesn\'t exist');
      console.log('\n🔧 TEMPORARY SOLUTION ACTIVE:');
      console.log('   • Using temporary authentication (no database required)');
      console.log('   • Email verification will work for testing');
      console.log('   • Login/registration will work temporarily');
      console.log('\n🔧 PERMANENT FIX:');
      console.log('1. Go to: https://supabase.com');
      console.log('2. Create a new project');
      console.log('3. Get database URL from Settings → Database');
      console.log('4. Update your .env file with the correct URL');
      console.log('5. Restart server');
    } else {
      console.log('\n🚨 CRITICAL: Database connection failed!');
      console.log('📋 This means:');
      console.log('   • Registration will fail');
      console.log('   • Login will fail');
      console.log('   • Email verification is disabled');
      console.log('   • File uploads will work but user management won\'t');
      console.log('\n🔧 TO FIX THIS:');
      console.log('   1. Check your .env file in the backend/ directory');
      console.log('   2. Verify your DATABASE_URL is correct');
      console.log('   3. Restart the server');
    }
    
    console.log('\n📖 For detailed instructions, see: FIX_DATABASE_NOW.md');
    console.log('🧪 To test database: node test-db-connection.js');
    console.log('🧪 To test registration: node test-registration.js\n');
  });

// ✅ Upload folder path (only declare once)
const uploadDir = path.join(__dirname, 'uploads');

// ✅ Enable CORS
app.use(cors());

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Enhanced logging middleware for all requests
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  console.log(`\n🌐 [${timestamp}] ${method} ${url}`);
  console.log(`📍 IP: ${ip}`);
  console.log(`🖥️  User-Agent: ${userAgent}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((method === 'POST' || method === 'PUT') && req.body) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields from logs
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.newPassword) sanitizedBody.newPassword = '[REDACTED]';
    console.log(`📦 Request Body:`, JSON.stringify(sanitizedBody, null, 2));
  }
  
  // Log query parameters
  if (Object.keys(req.query).length > 0) {
    console.log(`🔍 Query Params:`, JSON.stringify(req.query, null, 2));
  }
  
  // Log headers (excluding sensitive ones)
  const sanitizedHeaders = { ...req.headers };
  if (sanitizedHeaders.authorization) sanitizedHeaders.authorization = '[REDACTED]';
  if (sanitizedHeaders.cookie) sanitizedHeaders.cookie = '[REDACTED]';
  console.log(`📋 Headers:`, JSON.stringify(sanitizedHeaders, null, 2));
  
  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(data) {
    console.log(`📤 Response (${res.statusCode}):`, JSON.stringify(data, null, 2));
    return originalJson.call(this, data);
  };
  
  next();
});

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ✅ Routes with proper authentication
if (databaseConnected) {
  console.log('🔐 Using full authentication with database');
  app.use('/auth', authRouter);
  app.use('/compress', authMiddleware, compressRouter); // Protect compression routes
  app.use('/upload', authMiddleware, uploadRouter); // Protect upload routes
} else {
  console.log('🔧 Using proper authentication with file storage (no database)');
  app.use('/auth', properAuthRouter);
  // Allow file uploads without authentication in file-based mode
  app.use('/upload', uploadRouter);
  app.use('/compress', compressRouter);
}
app.get('/status', (req, res) => {
  const currentTime = new Date().toLocaleString();
  res.json({ message: 'Server is on', time: currentTime });
});

// ✅ Manual cleanup endpoint for testing
app.get('/cleanup', (req, res) => {
  console.log('🧹 Manual cleanup triggered');
  cleanupOldFiles();
  res.json({ message: 'Cleanup process initiated', time: new Date().toLocaleString() });
});

// ✅ Upload directory status endpoint
app.get('/uploads/status', (req, res) => {
  const uploadStatus = {
    directory: uploadDir,
    exists: fs.existsSync(uploadDir),
    files: [],
    totalFiles: 0,
    totalSize: 0,
    filesToDelete: 0
  };

  if (!uploadStatus.exists) {
    return res.json(uploadStatus);
  }

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading upload directory', details: err.message });
    }

    if (files.length === 0) {
      uploadStatus.message = 'No files in upload directory';
      return res.json(uploadStatus);
    }

    let processedFiles = 0;
    const now = Date.now();

    files.forEach((file) => {
      const filePath = path.join(uploadDir, file);
      
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        if (!stats.isFile()) return;

        const age = (now - stats.mtimeMs) / 1000;
        const ageMinutes = Math.round(age / 60);
        const isExpired = age > 1200; // 20 minutes

        uploadStatus.files.push({
          name: file,
          size: stats.size,
          age: ageMinutes,
          isExpired: isExpired,
          uploadedAt: new Date(stats.mtimeMs).toLocaleString()
        });

        uploadStatus.totalSize += stats.size;
        uploadStatus.totalFiles++;
        
        if (isExpired) {
          uploadStatus.filesToDelete++;
        }

        processedFiles++;
        if (processedFiles === files.length) {
          uploadStatus.totalSizeFormatted = formatFileSize(uploadStatus.totalSize);
          res.json(uploadStatus);
        }
      });
    });
  });
});

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ✅ Enhanced auto-delete functionality for uploaded files
function cleanupOldFiles() {
  console.log('🕒 Starting file cleanup process...');
  console.log('📁 Scanning folder:', uploadDir);

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    console.log('📁 Upload directory does not exist, skipping cleanup');
    return;
  }

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('❌ Error reading upload directory:', err);
      return;
    }

    if (files.length === 0) {
      console.log('📁 No files to clean up');
      return;
    }

    console.log(`📊 Found ${files.length} files to check`);
    let deletedCount = 0;
    let errorCount = 0;

    files.forEach((file, index) => {
      const filePath = path.join(uploadDir, file);
      
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`❌ Error getting stats for ${file}:`, err);
          errorCount++;
          return;
        }

        // Check if it's a file (not a directory)
        if (!stats.isFile()) {
          return;
        }

        const now = Date.now();
        const age = (now - stats.mtimeMs) / 1000; // Age in seconds
        const ageMinutes = Math.round(age / 60);

        console.log(`📄 File: ${file}, Age: ${ageMinutes} minutes`);

        if (age > 1200) { // 1200 seconds = 20 minutes
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`❌ Error deleting file ${file}:`, err);
              errorCount++;
            } else {
              console.log(`✅ Successfully deleted: ${file} (${ageMinutes} minutes old)`);
              deletedCount++;
            }

            // Check if this was the last file to process
            if (index === files.length - 1) {
              console.log(`🧹 Cleanup completed: ${deletedCount} files deleted, ${errorCount} errors`);
            }
          });
        } else {
          console.log(`⏰ File ${file} is still fresh (${ageMinutes} minutes old), keeping it`);
          
          // Check if this was the last file to process
          if (index === files.length - 1) {
            console.log(`🧹 Cleanup completed: ${deletedCount} files deleted, ${errorCount} errors`);
          }
        }
      });
    });
  });
}

// ✅ Cron job to auto-delete files every 5 minutes and cleanup expired OTPs
cron.schedule('*/5 * * * *', () => {
  console.log('\n🕒 ===== CRON JOB EXECUTION =====');
  console.log(`⏰ Current time: ${new Date().toLocaleString()}`);
  
  // Clean up expired OTPs
  database.cleanupExpiredOTPs()
    .then(() => console.log('✅ Cleaned up expired OTPs'))
    .catch(err => console.error('❌ Error cleaning up OTPs:', err));

  // Clean up old files
  cleanupOldFiles();
  
  console.log('🕒 ===== CRON JOB COMPLETED =====\n');
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});




















