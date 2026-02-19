import nodemailer from 'nodemailer';

/**
 * Email service configuration
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize the email transporter
   */
  initializeTransporter() {
    // For development, use Ethereal (fake SMTP service)
    // For production, use your actual SMTP settings
    if (process.env.NODE_ENV === 'production') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Development mode - use Ethereal or console logging
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
          pass: process.env.ETHEREAL_PASS || 'ethereal.pass'
        }
      });
    }
  }

  /**
   * Generate a 6-digit OTP code
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP email
   * @param {string} email - Recipient email
   * @param {string} name - Recipient name
   * @param {string} otpCode - OTP code
   * @returns {Promise} Send result
   */
  async sendOTPEmail(email, name, otpCode) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@neokred.tech',
      to: email,
      subject: 'Your Login OTP - Perkle Product Hub',
      html: this.getOTPEmailTemplate(name, otpCode)
    };

    try {
      // Always use console logging for OTP in development or if NODE_ENV is not production
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 OTP Email (Development Mode)');
        console.log(`To: ${email}`);
        console.log(`Name: ${name}`);
        console.log(`OTP Code: ${otpCode}`);
        console.log('---');
        return { success: true, messageId: 'dev-mode' };
      }

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      // In development, still return success and log the OTP
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 OTP Email (Fallback - Email failed but logging OTP)');
        console.log(`To: ${email}`);
        console.log(`Name: ${name}`);
        console.log(`OTP Code: ${otpCode}`);
        console.log('---');
        return { success: true, messageId: 'dev-fallback' };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Get OTP email HTML template
   * @param {string} name - Recipient name
   * @param {string} otpCode - OTP code
   * @returns {string} HTML template
   */
  getOTPEmailTemplate(name, otpCode) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Login OTP</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-code { background: #667eea; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 8px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔐 Perkle Product Hub</h1>
            <p>Your One-Time Password</p>
        </div>
        <div class="content">
            <h2>Hello ${name || 'there'}!</h2>
            <p>You've requested to sign in to your Perkle Product Hub account. Please use the following OTP code to complete your login:</p>
            
            <div class="otp-code">${otpCode}</div>
            
            <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                    <li>This code is valid for <strong>10 minutes</strong> only</li>
                    <li>Do not share this code with anyone</li>
                    <li>If you didn't request this code, please ignore this email</li>
                </ul>
            </div>
            
            <p>If you're having trouble accessing your account, please contact your system administrator.</p>
            
            <p>Best regards,<br>The Perkle Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Neokred Technologies. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Validate email domain
   * @param {string} email - Email to validate
   * @returns {boolean} True if domain is allowed
   */
  validateEmailDomain(email) {
    const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || 'neokred.tech').split(',');
    const emailDomain = email.split('@')[1]?.toLowerCase();
    
    return allowedDomains.some(domain => 
      emailDomain === domain.trim().toLowerCase()
    );
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;