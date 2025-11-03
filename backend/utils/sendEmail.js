import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
  try {
    // Enhanced transporter configuration for production
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // Use 587 for production
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD // MUST be App Password
      },
      // Production-specific settings
      tls: {
        rejectUnauthorized: false // Important for some hosting environments
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000,
      socketTimeout: 60000,
      debug: true, // Enable debug to see what's happening
      logger: true
    });

    // Verify connection with better error handling
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    const otpMatch = options.message.match(/\b\d{4,6}\b/);
    const otp = otpMatch ? otpMatch[0] : '';

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: #f0f0f0; 
            margin: 0; 
            padding: 20px;
          }
          .email-container { 
            max-width: 500px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 8px; 
            padding: 20px;
            border: 2px solid #000000;
          }
          .header { 
            text-align: center; 
            color: #000000; 
            margin-bottom: 20px;
          }
          .content { 
            color: #333333; 
            line-height: 1.5;
          }
          .otp-container { 
            background: #000000; 
            color: #00ff00; 
            padding: 25px; 
            text-align: center; 
            margin: 25px 0; 
            border-radius: 8px;
            border: 2px solid #00ff00;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
          }
          .footer { 
            text-align: center; 
            color: #666666; 
            margin-top: 20px; 
            font-size: 12px;
          }
          .note {
            background: #f8f8f8;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #00ff00;
            margin: 15px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h2>🏢 SocietyPro</h2>
            <h3>${options.subject}</h3>
          </div>
          
          <div class="content">
            <p>${options.message.replace(otp, '').replace(/\n/g, '<br>')}</p>
            
            ${otp ? `
            <div class="otp-container">
              ${otp}
            </div>
            ` : ''}
            
            <div class="note">
              <strong>Note:</strong> This OTP is valid for 10 minutes. Do not share it with anyone.
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} SocietyPro</p>
            <p>This is an automated message</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `SocietyPro <${process.env.EMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: htmlTemplate,
      // Add priority headers
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    console.log('📧 Attempting to send email to:', options.email);
    console.log('🔧 Using email service:', process.env.EMAIL_USERNAME);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', options.email);
    console.log('📧 Message ID:', info.messageId);
    console.log('📨 Response:', info.response);
    
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('🔧 Error code:', error.code);
    console.error('🔧 Error command:', error.command);
    
    // More specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Check your email credentials and App Password.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Could not connect to email server. Check your network and SMTP settings.');
    } else {
      throw new Error(`Email could not be sent: ${error.message}`);
    }
  }
};

export default sendEmail;