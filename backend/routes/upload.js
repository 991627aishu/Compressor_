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
  console.log('📤 File upload attempt started');
  console.log('👤 User:', req.user ? `ID: ${req.user.id}, Email: ${req.user.email}` : 'Anonymous');
  
  if (!req.file) {
    console.log('❌ No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log(`📥 File uploaded successfully:`);
  console.log(`   📄 Original name: ${req.file.originalname}`);
  console.log(`   📁 Filename: ${req.file.filename}`);
  console.log(`   📏 Size: ${req.file.size} bytes`);
  console.log(`   🗂️  MIME type: ${req.file.mimetype}`);
  console.log(`   📍 Path: ${req.file.path}`);
  
  res.status(200).json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

module.exports = router;
