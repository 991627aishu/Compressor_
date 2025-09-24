const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { spawn } = require('child_process');
const path = require('path');
const database = require('../database/database');
const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

// Register route
router.post('/register', async (req, res) => {
  console.log('📝 Registration attempt started');
  try {
    const { name, email, mobile_number, address, password } = req.body;
    console.log('👤 Registration data:', { name, email, mobile_number, address, password: '[REDACTED]' });

    // Validate required fields
    if (!name || !email || !mobile_number || !address || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const existingUser = await database.getUserByEmail(email);
    if (existingUser) {
      console.log('❌ User already exists with email:', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    console.log('✅ Email is available');

    // Create new user
    console.log('👤 Creating new user...');
    const user = await database.createUser({
      name,
      email,
      mobile_number,
      address,
      password
    });
    console.log('✅ User created successfully with ID:', user.id);

    // Generate and send OTP for email verification
    console.log('📧 Generating OTP for email verification...');
    const otp = generateOTP();
    await database.createOTP(email, otp, 'verification');
    console.log('🔐 OTP created and stored in database');
    
    try {
      console.log('📤 Sending verification email...');
      await sendEmail(email, otp, 'verification');
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Continue with registration even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification code.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.message.includes('connection timeout') || error.message.includes('Connection terminated')) {
      errorMessage = 'Database connection timeout. Please try again in a moment.';
    } else if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      errorMessage = 'User with this email already exists.';
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      errorMessage = 'Invalid data provided. Please check your information.';
    } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  console.log('🔐 Login attempt started');
  try {
    const { email, password } = req.body;
    console.log('👤 Login attempt for email:', email);

    // Find user by email
    console.log('🔍 Looking up user in database...');
    const user = await database.getUserByEmail(email);
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    console.log('✅ User found with ID:', user.id);

    // Check password
    console.log('🔐 Verifying password...');
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    console.log('✅ Password verified successfully');

    // Update last login
    console.log('📅 Updating last login timestamp...');
    await database.updateUserLastLogin(user.id);

    // Generate token
    console.log('🎫 Generating JWT token...');
    const token = generateToken(user.id);
    console.log('✅ JWT token generated successfully');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_email_verified: user.is_email_verified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.message.includes('connection timeout') || error.message.includes('Connection terminated')) {
      errorMessage = 'Database connection timeout. Please try again in a moment.';
    } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await database.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify email with OTP
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Verify OTP
    const otpRecord = await database.verifyOTP(email, otp, 'verification');
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    await database.markOTPAsUsed(email, otp, 'verification');

    // Update user email verification status
    await database.updateEmailVerification(email);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during email verification'
    });
  }
});

// Send forgot password OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const user = await database.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate and send OTP
    const otp = generateOTP();
    await database.createOTP(email, otp, 'password_reset');
    
    try {
      await sendEmail(email, otp, 'password_reset');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email'
      });
    }

    res.json({
      success: true,
      message: 'Password reset code sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset'
    });
  }
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    // Verify OTP
    const otpRecord = await database.verifyOTP(email, otp, 'password_reset');
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    await database.markOTPAsUsed(email, otp, 'password_reset');

    // Update password
    await database.updatePassword(email, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset'
    });
  }
});

// Resend verification OTP
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const user = await database.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.is_email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate and send new OTP
    const otp = generateOTP();
    await database.createOTP(email, otp, 'verification');
    
    try {
      await sendEmail(email, otp, 'verification');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during resend verification'
    });
  }
});

// Logout route (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
