const jwt = require('jsonwebtoken');
const database = require('../database/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const authMiddleware = async (req, res, next) => {
  console.log('🔐 Authentication middleware triggered');
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No authorization token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    console.log('🎫 Token found, verifying...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified, user ID:', decoded.userId);
    
    const user = await database.getUserById(decoded.userId);
    
    if (!user) {
      console.log('❌ User not found for ID:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Check if email is verified for protected routes
    if (!user.is_email_verified) {
      console.log('❌ Email not verified for user:', user.email);
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before accessing this feature. Check your inbox for the verification code.',
        requires_verification: true,
        email: user.email
      });
    }

    console.log('✅ User authenticated and verified:', user.email);
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

module.exports = authMiddleware;
