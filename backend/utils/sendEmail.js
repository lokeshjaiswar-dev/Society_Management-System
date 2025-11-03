// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// const sendEmail = async (options) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD
//       }
//     });

//     // Extract OTP from message (assuming OTP is in the message)
//     const otpMatch = options.message.match(/\b\d{4,6}\b/);
//     const otp = otpMatch ? otpMatch[0] : '';

//     // Simple black and green template with OTP highlight
//     const htmlTemplate = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { 
//             font-family: Arial, sans-serif; 
//             background: #f0f0f0; 
//             margin: 0; 
//             padding: 20px;
//           }
//           .email-container { 
//             max-width: 500px; 
//             margin: 0 auto; 
//             background: white; 
//             border-radius: 8px; 
//             padding: 20px;
//             border: 2px solid #000000;
//           }
//           .header { 
//             text-align: center; 
//             color: #000000; 
//             margin-bottom: 20px;
//           }
//           .content { 
//             color: #333333; 
//             line-height: 1.5;
//           }
//           .otp-container { 
//             background: #000000; 
//             color: #00ff00; 
//             padding: 25px; 
//             text-align: center; 
//             margin: 25px 0; 
//             border-radius: 8px;
//             border: 2px solid #00ff00;
//             font-size: 32px;
//             font-weight: bold;
//             letter-spacing: 8px;
//           }
//           .footer { 
//             text-align: center; 
//             color: #666666; 
//             margin-top: 20px; 
//             font-size: 12px;
//           }
//           .note {
//             background: #f8f8f8;
//             padding: 15px;
//             border-radius: 5px;
//             border-left: 4px solid #00ff00;
//             margin: 15px 0;
//             font-size: 14px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <div class="header">
//             <h2>🏢 SocietyPro</h2>
//             <h3>${options.subject}</h3>
//           </div>
          
//           <div class="content">
//             <p>${options.message.replace(otp, '').replace(/\n/g, '<br>')}</p>
            
//             ${otp ? `
//             <div class="otp-container">
//               ${otp}
//             </div>
//             ` : ''}
            
//             <div class="note">
//               <strong>Note:</strong> This OTP is valid for 10 minutes. Do not share it with anyone.
//             </div>
//           </div>
          
//           <div class="footer">
//             <p>© ${new Date().getFullYear()} SocietyPro</p>
//             <p>This is an automated message</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     const mailOptions = {
//       from: `SocietyPro <${process.env.EMAIL_USERNAME}>`,
//       to: options.email,
//       subject: options.subject,
//       text: options.message,
//       html: htmlTemplate
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('✅ Email sent successfully to:', options.email);
    
//   } catch (error) {
//     console.error('❌ Error sending email:', error.message);
//     throw new Error('Email could not be sent');
//   }
// };

// export default sendEmail;

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      // Add these for better production handling
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5
    });

    // Verify connection configuration
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // Your existing HTML template...
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

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', options.email);
    console.log('📧 Message ID:', info.messageId);
    
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('🔧 Error details:', error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

export default sendEmail;