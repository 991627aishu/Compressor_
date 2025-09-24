// Proper Authentication Routes with Validation
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// File to store user data (temporary storage)
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const OTP_FILE = path.join(__dirname, '..', 'data', 'otps.json');

// Ensure data directory exists
const dataDir = path.dirname(USERS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load users from file
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

// Save users to file
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
}

// Load OTPs from file
function loadOTPs() {
  try {
    if (fs.existsSync(OTP_FILE)) {
      const data = fs.readFileSync(OTP_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading OTPs:', error);
  }
  return {};
}

// Save OTPs to file
function saveOTPs(otps) {
  try {
    fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving OTPs:', error);
    return false;
  }
}

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

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register route with proper validation
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile_number, address, password } = req.body;
    console.log('🔄 Registration attempt for:', email);

    // Validate required fields
    if (!name || !email || !mobile_number || !address || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Load existing users
    const users = loadUsers();

    // Check if user already exists (case-insensitive)
    const lowerEmail = email.toLowerCase().trim();
    for (const [storedEmail, userData] of Object.entries(users)) {
      if (storedEmail.toLowerCase().trim() === lowerEmail) {
        console.log('❌ User already exists:', storedEmail);
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 12);

    // Create user
    const userId = 'user_' + Date.now();
    const user = {
      id: userId,
      name: name,
      email: email,
      mobile_number: mobile_number,
      address: address,
      password: hashedPassword,
      is_email_verified: false,
      created_at: new Date().toISOString()
    };

    // Save user
    users[email] = user;
    saveUsers(users);

    console.log('✅ User registered successfully:', email);

    // Generate and send OTP
    const otp = generateOTP();
    const otpData = {
      email: email,
      otp: otp,
      type: 'verification',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      used: false
    };

    // Save OTP
    const otps = loadOTPs();
    otps[email + '_verification'] = otpData;
    saveOTPs(otps);

    console.log('🔐 OTP generated and saved:', otp);

    // Send email
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
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Email verification route
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('🔄 Email verification for:', email, 'OTP:', otp);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Load users and OTPs
    const users = loadUsers();
    const otps = loadOTPs();

    // Check if user exists
    if (!users[email]) {
      console.log('❌ User not found:', email);
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    // Check if already verified
    if (users[email].is_email_verified) {
      console.log('❌ Email already verified:', email);
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Get OTP data
    const otpKey = email + '_verification';
    const otpData = otps[otpKey];

    if (!otpData) {
      console.log('❌ No OTP found for:', email);
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.'
      });
    }

    // Check if OTP is expired
    const now = new Date();
    const expiresAt = new Date(otpData.expires_at);
    if (now > expiresAt) {
      console.log('❌ OTP expired for:', email);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Check if OTP is already used
    if (otpData.used) {
      console.log('❌ OTP already used for:', email);
      return res.status(400).json({
        success: false,
        message: 'Verification code has already been used. Please request a new one.'
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      console.log('❌ Invalid OTP for:', email, 'Expected:', otpData.otp, 'Got:', otp);
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.'
      });
    }

    // Mark OTP as used
    otpData.used = true;
    otps[otpKey] = otpData;
    saveOTPs(otps);

    // Update user verification status
    users[email].is_email_verified = true;
    users[email].verified_at = new Date().toISOString();
    saveUsers(users);

    console.log('✅ Email verified successfully for:', email);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during email verification'
    });
  }
});

// Login route with proper password validation
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔄 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Load users
    const users = loadUsers();
    const user = users[email];

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.is_email_verified) {
      console.log('❌ Email not verified for:', email);
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification code.',
        requires_verification: true,
        email: user.email
      });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Login successful for:', email);

    // Generate token
    const token = generateToken(user.id, user.email);

    // Update last login
    users[email].last_login = new Date().toISOString();
    saveUsers(users);

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_email_verified: user.is_email_verified
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Resend verification OTP
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('🔄 Resend verification for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Load users
    const users = loadUsers();
    const user = users[email];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    if (user.is_email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpData = {
      email: email,
      otp: otp,
      type: 'verification',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      used: false
    };

    // Save OTP
    const otps = loadOTPs();
    otps[email + '_verification'] = otpData;
    saveOTPs(otps);

    console.log('🔐 New OTP generated:', otp);

    // Send email
    try {
      await sendEmail(email, otp, 'verification');
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });

  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during resend verification'
    });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('🔄 Forgot password request for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Load users
    const users = loadUsers();
    console.log('📋 Available users in system:', Object.keys(users));
    console.log('🔍 Looking for email:', `"${email}"`);
    
    // Try exact match first
    let user = users[email];
    
    // If not found, try case-insensitive lookup
    if (!user) {
      console.log('🔍 Exact match failed, trying case-insensitive lookup...');
      const lowerEmail = email.toLowerCase().trim();
      for (const [storedEmail, userData] of Object.entries(users)) {
        if (storedEmail.toLowerCase().trim() === lowerEmail) {
          user = userData;
          console.log('✅ Case-insensitive match found:', storedEmail);
          break;
        }
      }
    }
    
    if (!user) {
      console.log('❌ User not found for forgot password:', email);
      console.log('📋 Available emails:', Object.keys(users));
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    // Allow password reset even if email is not verified
    // This is more user-friendly as users might need to reset password before verification
    console.log('✅ User found for password reset:', email);
    console.log('📧 Email verification status:', user.is_email_verified ? 'Verified' : 'Not verified');

    // Generate reset OTP
    const otp = generateOTP();
    const otpData = {
      email: email,
      otp: otp,
      type: 'password_reset',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      used: false
    };

    // Save OTP
    const otps = loadOTPs();
    otps[email + '_password_reset'] = otpData;
    saveOTPs(otps);

    console.log('🔐 Password reset OTP generated:', otp);

    // Send email
    try {
      await sendEmail(email, otp, 'password_reset');
      console.log('✅ Password reset email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Password reset code sent to your email'
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during forgot password'
    });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log('🔄 Password reset for:', email, 'OTP:', otp);

    if (!email || !otp || !newPassword) {
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

    // Load users and OTPs
    const users = loadUsers();
    const otps = loadOTPs();

    // Check if user exists
    if (!users[email]) {
      console.log('❌ User not found:', email);
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    // Get OTP data
    const otpKey = email + '_password_reset';
    const otpData = otps[otpKey];

    if (!otpData) {
      console.log('❌ No password reset OTP found for:', email);
      return res.status(400).json({
        success: false,
        message: 'No password reset code found. Please request a new one.'
      });
    }

    // Check if OTP is expired
    const now = new Date();
    const expiresAt = new Date(otpData.expires_at);
    if (now > expiresAt) {
      console.log('❌ Password reset OTP expired for:', email);
      return res.status(400).json({
        success: false,
        message: 'Password reset code has expired. Please request a new one.'
      });
    }

    // Check if OTP is already used
    if (otpData.used) {
      console.log('❌ Password reset OTP already used for:', email);
      return res.status(400).json({
        success: false,
        message: 'Password reset code has already been used. Please request a new one.'
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      console.log('❌ Invalid password reset OTP for:', email, 'Expected:', otpData.otp, 'Got:', otp);
      return res.status(400).json({
        success: false,
        message: 'Invalid password reset code. Please check and try again.'
      });
    }

    // Mark OTP as used
    otpData.used = true;
    otps[otpKey] = otpData;
    saveOTPs(otps);

    // Update user password
    const hashedPassword = bcrypt.hashSync(newPassword, 12);
    users[email].password = hashedPassword;
    users[email].password_reset_at = new Date().toISOString();
    saveUsers(users);

    console.log('✅ Password reset successful for:', email);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset'
    });
  }
});

module.exports = router;
