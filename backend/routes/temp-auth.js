// Temporary Authentication Routes (Works without database)
const express = require('express');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

// Send email using Python script
const sendEmail = (email, otp, emailType) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '..', 'python', 'send_email.py');
    const python = spawn('python', [pythonScript, email, otp, emailType]);
    
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
        resolve(output);
      } else {
        reject(new Error(error || 'Failed to send email'));
      }
    });
  });
};

// Temporary email verification (works without database)
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('🔄 Temporary email verification for:', email, 'OTP:', otp);

    if (!email || !otp) {
      console.log('❌ Missing email or OTP');
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Accept any 6-digit OTP for testing
    if (otp.length === 6 && /^\d{6}$/.test(otp)) {
      console.log('✅ Temporary verification successful for:', email);
      console.log('🔐 OTP accepted:', otp);
      
      res.json({
        success: true,
        message: 'Email verified successfully (Temporary mode)'
      });
    } else {
      console.log('❌ Invalid OTP format:', otp);
      res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit code'
      });
    }

  } catch (error) {
    console.error('❌ Temporary verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during verification'
    });
  }
});

// Temporary registration (works without database)
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile_number, address, password } = req.body;
    console.log('🔄 Temporary registration for:', email);

    if (!name || !email || !mobile_number || !address || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Generate and send OTP for email verification
    console.log('📧 Generating OTP for email verification...');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 OTP generated:', otp);
    
    try {
      console.log('📤 Sending verification email...');
      await sendEmail(email, otp, 'verification');
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Continue with registration even if email fails
    }

    console.log('✅ Temporary registration successful for:', email);
    res.status(201).json({
      success: true,
      message: 'User registered successfully (Temporary mode). Please check your email for verification code.',
      user: {
        id: 'temp_' + Date.now(),
        name: name,
        email: email
      }
    });

  } catch (error) {
    console.error('❌ Temporary registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Temporary login (works without database)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔄 Temporary login for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Accept any email/password combination for testing
    console.log('✅ Temporary login successful for:', email);
    const token = generateToken('temp_' + Date.now(), email);
    
    res.json({
      success: true,
      message: 'Login successful (Temporary mode)',
      token: token,
      user: {
        id: 'temp_' + Date.now(),
        name: 'Test User',
        email: email,
        is_email_verified: true
      }
    });

  } catch (error) {
    console.error('❌ Temporary login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Temporary resend verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('🔄 Temporary resend verification for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log('✅ Temporary verification code sent to:', email);
    res.json({
      success: true,
      message: 'Verification code sent to your email (Temporary mode)'
    });

  } catch (error) {
    console.error('❌ Temporary resend error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during resend'
    });
  }
});

// Temporary forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('🔄 Temporary forgot password for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Generate and send OTP for password reset
    console.log('🔐 Generating OTP for password reset...');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 OTP generated:', otp);
    
    try {
      console.log('📤 Sending password reset email...');
      await sendEmail(email, otp, 'password_reset');
      console.log('✅ Password reset email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

    console.log('✅ Temporary password reset code sent to:', email);
    res.json({
      success: true,
      message: 'Password reset code sent to your email (Temporary mode)'
    });

  } catch (error) {
    console.error('❌ Temporary forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset'
    });
  }
});

// Temporary password reset with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log('🔄 Temporary password reset for:', email, 'OTP:', otp);

    if (!email || !otp || !newPassword) {
      console.log('❌ Missing email, OTP, or new password');
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      console.log('❌ Invalid OTP format:', otp);
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit code'
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Accept any valid OTP for temporary mode
    console.log('✅ Temporary password reset successful for:', email);
    console.log('🔐 New password set (temporary mode)');
    
    res.json({
      success: true,
      message: 'Password reset successfully (Temporary mode)'
    });

  } catch (error) {
    console.error('❌ Temporary password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset'
    });
  }
});

module.exports = router;
