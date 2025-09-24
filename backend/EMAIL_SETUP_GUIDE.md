# 📧 Email Setup Guide - Fix Email Verification & Password Reset

## 🚨 Current Issue: Emails Not Being Sent

### **Problem**
- Verification emails not reaching your inbox
- Password reset emails not being sent
- Email sending functionality not working

### **Root Cause**
The email system needs proper Gmail configuration with App Password.

## 🔧 **COMPLETE EMAIL FIX**

### **Step 1: Enable Gmail App Password**

1. **Go to your Google Account**: https://myaccount.google.com
2. **Click Security** (left sidebar)
3. **Enable 2-Factor Authentication** (if not already enabled)
4. **Go to App Passwords**:
   - Click "App passwords"
   - Select "Mail" and "Other (custom name)"
   - Enter: "Ultra Compressor"
   - Click "Generate"
5. **Copy the 16-character password** (like: `abcd efgh ijkl mnop`)

### **Step 2: Update Your .env File**

Update your `backend/.env` file with correct Gmail credentials:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASS=your-16-character-app-password

# Database Configuration (if you have it)
DATABASE_URL=your-database-url

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production-ultra-compressor-2024

# Server Configuration
PORT=5000
```

**Important Notes:**
- Use your actual Gmail address for `GMAIL_USER`
- Use the 16-character App Password (not your regular Gmail password)
- Remove spaces from the App Password when copying

### **Step 3: Test Email Functionality**

Create a test script to verify email sending:

```bash
# Test email sending
node test-email-sending.js
```

## 🧪 **Testing Steps**

### **Test 1: Check Environment Variables**
```bash
node test-env-vars.js
```

### **Test 2: Test Email Sending**
```bash
node test-email-sending.js
```

### **Test 3: Test Complete Flow**
1. Register at: http://localhost:5000/register.html
2. Check your email inbox (and spam folder)
3. Enter the OTP code on verification page
4. Should redirect to login page

## 📋 **Common Issues & Solutions**

### **Issue 1: "Authentication error"**
**Solution**: 
- Make sure 2FA is enabled on Gmail
- Use App Password, not regular password
- Check .env file has correct credentials

### **Issue 2: "GMAIL_USER or GMAIL_APP_PASS not set"**
**Solution**:
- Check .env file exists in backend/ directory
- Make sure variable names are exactly `GMAIL_USER` and `GMAIL_APP_PASS`
- Restart server after updating .env

### **Issue 3: Emails in spam folder**
**Solution**:
- Check spam/junk folder
- Add sender email to contacts
- Mark as "Not Spam" if found

### **Issue 4: Python not found**
**Solution**:
- Install Python 3.x
- Make sure `python` command works in terminal
- On Windows, might need to use `python3` instead

## 🚀 **Quick Fix (5 minutes)**

1. **Enable Gmail App Password** (2 min)
2. **Update .env file** (1 min)
3. **Restart server** (30 sec)
4. **Test email sending** (1.5 min)

## 📧 **Expected Email Content**

### **Verification Email**
```
Subject: Email Verification - Ultra Compressor

Hello!

Thank you for registering with Ultra Compressor!

Your email verification code is: 123456

This code will expire in 10 minutes.

Please enter this code to verify your email address and complete your registration.

If you didn't create an account with us, please ignore this email.

Best regards,
Ultra Compressor Team
```

### **Password Reset Email**
```
Subject: Password Reset - Ultra Compressor

Hello!

You requested a password reset for your Ultra Compressor account.

Your password reset code is: 654321

This code will expire in 10 minutes.

Please enter this code to reset your password.

If you didn't request this password reset, please ignore this email.

Best regards,
Ultra Compressor Team
```

## ✅ **After Fix - What Will Work**

- ✅ Verification emails sent to your inbox
- ✅ Password reset emails sent to your inbox
- ✅ Email verification page works
- ✅ Password reset page works
- ✅ Complete user flow functional

## 🆘 **If Still Not Working**

### **Check Server Console**
Look for these messages:
```
📤 Sending verification email...
✅ Verification email sent successfully
```

### **Check Python Script**
Test directly:
```bash
cd backend/python
python send_email.py test@example.com 123456 verification
```

### **Verify Environment Variables**
```bash
node test-env-vars.js
```
