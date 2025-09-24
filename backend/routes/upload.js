// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const router = express.Router();

// const uploadPath = path.join(__dirname, '..', 'uploads');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = `${Date.now()}-${file.originalname}`;
//     cb(null, uniqueName);
//   }
// });

// const upload = multer({ storage });








const express = require('express');           // ✅ Import express
const router = express.Router();              // ✅ Define router
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// ✅ Ensure upload folder exists
const uploadPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ✅ Upload route
router.post('/', upload.single('file'), (req, res) => {
  const uploadTime = new Date().toLocaleString();
  console.log('📤 File upload attempt started');
  console.log('👤 User:', req.user ? `ID: ${req.user.id}, Email: ${req.user.email}` : 'Anonymous');
  
  if (!req.file) {
    console.log('❌ No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Calculate file size in human readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  console.log(`📥 File uploaded successfully at ${uploadTime}:`);
  console.log(`   📄 Original name: ${req.file.originalname}`);
  console.log(`   📁 Filename: ${req.file.filename}`);
  console.log(`   📏 Size: ${req.file.size} bytes (${formatFileSize(req.file.size)})`);
  console.log(`   🗂️  MIME type: ${req.file.mimetype}`);
  console.log(`   📍 Path: ${req.file.path}`);
  console.log(`   ⏰ Upload time: ${uploadTime}`);
  console.log(`   ⏳ Auto-delete in: 20 minutes`);
  
  res.status(200).json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    sizeFormatted: formatFileSize(req.file.size),
    mimetype: req.file.mimetype,
    uploadTime: uploadTime,
    autoDeleteIn: '20 minutes'
  });
});

module.exports = router;
