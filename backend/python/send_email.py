import smtplib
import sys
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(to_email, otp, email_type, from_email, from_password):
    """
    Connects to the Gmail SMTP server and sends a one-time password.
    """
    try:
        # Create an SMTP session
        s = smtplib.SMTP('smtp.gmail.com', 587)
        s.starttls()  # Start TLS for security

        # Login to your email account using the app password
        s.login(from_email, from_password)

        # Create message based on type
        if email_type == 'verification':
            subject = "Email Verification - Ultra Compressor"
            message_body = f"""Hello!

Thank you for registering with Ultra Compressor!

Your email verification code is: {otp}

This code will expire in 10 minutes.

Please enter this code to verify your email address and complete your registration.

If you didn't create an account with us, please ignore this email.

Best regards,
Ultra Compressor Team
"""
        elif email_type == 'password_reset':
            subject = "Password Reset - Ultra Compressor"
            message_body = f"""Hello!

You requested a password reset for your Ultra Compressor account.

Your password reset code is: {otp}

This code will expire in 10 minutes.

Please enter this code to reset your password.

If you didn't request this password reset, please ignore this email and your password will remain unchanged.

Best regards,
Ultra Compressor Team
"""
        else:
            subject = "Your One-Time Password - Ultra Compressor"
            message_body = f"""Hello!

Your OTP code is: {otp}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
Ultra Compressor Team
"""

        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"Ultra Compressor <{from_email}>"
        msg['To'] = to_email
        msg['Subject'] = subject

        # Add body to email
        msg.attach(MIMEText(message_body, 'plain'))

        # Send the email
        s.sendmail(from_email, to_email, msg.as_string())
        print("Email sent successfully.")  # This output can be seen by the Node.js server

    except smtplib.SMTPAuthenticationError:
        print("Authentication error: Check your GMAIL_USER and GMAIL_APP_PASS in the .env file.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An error occurred while sending email: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        s.quit()  # Always close the SMTP session

# This block runs when the script is executed directly from the command line
if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python send_email.py <recipient_email> <otp> <email_type>", file=sys.stderr)
        sys.exit(1)
        
    to_email = sys.argv[1]
    otp = sys.argv[2]
    email_type = sys.argv[3]
    
    # Get credentials securely from environment variables
    from_email = os.getenv('GMAIL_USER')
    from_password = os.getenv('GMAIL_APP_PASS')
    
    if not from_email or not from_password:
        print("Fatal: GMAIL_USER or GMAIL_APP_PASS are not set in environment variables.", file=sys.stderr)
        sys.exit(1)
        
    send_email(to_email, otp, email_type, from_email, from_password)
