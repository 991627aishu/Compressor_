

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
const authMiddleware = require('./middleware/auth');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const database = require('./database/database');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ Database connection
database.init()
  .then(() => console.log('✅ Database initialized successfully'))
  .catch(err => console.error('❌ Database initialization error:', err));

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

// ✅ Routes
app.use('/auth', authRouter);
app.use('/compress', authMiddleware, compressRouter); // Protect compression routes
app.use('/upload', authMiddleware, uploadRouter); // Protect upload routes
app.get('/status', (req, res) => {
  const currentTime = new Date().toLocaleString();
  res.json({ message: 'Server is on', time: currentTime });
});

// ✅ Cron job to auto-delete files and cleanup expired OTPs
cron.schedule('*/10 * * * *', () => {
  console.log('🕒 Cron job is running...');
  console.log('📁 Scanning folder:', uploadDir);

  // Clean up expired OTPs
  database.cleanupExpiredOTPs()
    .then(() => console.log('🧹 Cleaned up expired OTPs'))
    .catch(err => console.error('❌ Error cleaning up OTPs:', err));

  // Clean up old files
  fs.readdir(uploadDir, (err, files) => {
    if (err) return console.error('❌ Error reading upload dir:', err);

    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return console.error('❌ Error stating file:', err);

        const now = Date.now();
        const age = (now - stats.mtimeMs) / 1000;

        if (age > 600) { // 600 seconds = 10 minutes
          fs.unlink(filePath, err => {
            if (err) console.error('❌ Error deleting file:', err);
            else console.log(`🧹 Deleted: ${file}`);
          });
        }
      });
    });
  });
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});




















