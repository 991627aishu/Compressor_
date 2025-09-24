const express = require("express");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

// POST /compress
router.post("/", upload.single("file"), (req, res) => {
  console.log('🗜️  File compression attempt started');
  console.log('👤 User:', req.user ? `ID: ${req.user.id}, Email: ${req.user.email}` : 'Anonymous');
  
  if (!req.file) {
    console.log('❌ No file uploaded for compression');
    return res.status(400).send("No file uploaded");
  }

  const targetSizeKB = req.body.targetSizeKB || 500; // default
  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  
  console.log(`📄 Compression details:`);
  console.log(`   📁 Original file: ${req.file.originalname}`);
  console.log(`   📏 File size: ${req.file.size} bytes`);
  console.log(`   🎯 Target size: ${targetSizeKB} KB`);
  console.log(`   📍 File path: ${filePath}`);
  console.log(`   🔤 File extension: ${ext}`);

  let script = null;
  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
    script = "compress_img.py";
    console.log('🖼️  Image compression selected');
  } else if (ext === ".pdf") {
    script = "compress_pdf.py";
    console.log('📄 PDF compression selected');
  } else {
    console.log('❌ Unsupported file type:', ext);
    return res.status(400).send("Unsupported file type");
  }

  console.log(`🐍 Starting Python compression script: ${script}`);
  const py = spawn("python", [
    path.join(__dirname, "..", "python", script),
    filePath,
    targetSizeKB
  ]);

  let output = "";
  py.stdout.on("data", data => {
    const dataStr = data.toString();
    output += dataStr;
    console.log('🐍 Python output:', dataStr.trim());
  });
  
  py.stderr.on("data", data => {
    console.error("❌ Python error:", data.toString());
  });

  py.on("close", code => {
    console.log(`🐍 Python script finished with code: ${code}`);
    console.log('📤 Full Python output:', output);
    
    const match = output.match(/FINAL_OUTPUT_PATH::(.+)/);
    if (!match) {
      console.log('❌ Compression failed - no output path found');
      return res.status(500).send("Compression failed");
    }

    const finalPath = match[1].trim();
    console.log('✅ Compression successful, output path:', finalPath);
    
    // Check if file exists
    if (fs.existsSync(finalPath)) {
      const stats = fs.statSync(finalPath);
      console.log(`📊 Compressed file size: ${stats.size} bytes`);
      res.download(finalPath, path.basename(finalPath));
    } else {
      console.log('❌ Compressed file not found at path:', finalPath);
      res.status(500).send("Compressed file not found");
    }
  });
});

module.exports = router;
