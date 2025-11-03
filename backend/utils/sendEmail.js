// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// const sendEmail = async (options) => {
//   let transporter;
  
//   try {
//     // Try multiple configurations for production
//     const transporterConfigs = [
//       // Try SSL first (port 465)
//       {
//         host: 'smtp.gmail.com',
//         port: 465,
//         secure: true, // true for port 465
//         auth: {
//           user: process.env.EMAIL_USERNAME,
//           pass: process.env.EMAIL_PASSWORD
//         },
//         tls: {
//           rejectUnauthorized: false
//         }
//       },
//       // Fallback to STARTTLS (port 587)
//       {
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: false, // false for port 587
//         auth: {
//           user: process.env.EMAIL_USERNAME,
//           pass: process.env.EMAIL_PASSWORD
//         },
//         tls: {
//           rejectUnauthorized: false
//         }
//       }
//     ];

//     let lastError;
    
//     // Try each configuration
//     for (const config of transporterConfigs) {
//       try {
//         console.log(`🔧 Trying SMTP config: ${config.host}:${config.port} (secure: ${config.secure})`);
        
//         transporter = nodemailer.createTransport(config);
        
//         // Test connection with shorter timeout
//         await transporter.verify();
//         console.log(`✅ SMTP connection successful on port ${config.port}`);
//         break; // Success, exit loop
//       } catch (error) {
//         lastError = error;
//         console.log(`❌ Failed on port ${config.port}:`, error.message);
//         continue; // Try next configuration
//       }
//     }

//     if (!transporter) {
//       throw lastError || new Error('All SMTP configurations failed');
//     }

//     const otpMatch = options.message.match(/\b\d{4,6}\b/);
//     const otp = otpMatch ? otpMatch[0] : '';

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
//       html: htmlTemplate,
//       headers: {
//         'X-Priority': '1',
//         'X-MSMail-Priority': 'High',
//         'Importance': 'high'
//       }
//     };

//     console.log('📧 Attempting to send email to:', options.email);
    
//     const info = await transporter.sendMail(mailOptions);
//     console.log('✅ Email sent successfully to:', options.email);
//     console.log('📧 Message ID:', info.messageId);
    
//     return info;
//   } catch (error) {
//     console.error('❌ Error sending email:', error.message);
//     console.error('🔧 Error details:', error);
    
//     throw new Error(`Email could not be sent: ${error.message}`);
//   }
// };

// export default sendEmail;

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
  try {
    console.log('🔧 Starting Brevo API email process...');
    console.log('📧 Recipient:', options.email);
    console.log('📝 Subject:', options.subject);
    console.log('🔑 API Key exists:', !!process.env.BREVO_API_KEY);

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

    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@societypro.com';
    
    console.log('📨 Sending via Brevo API...');
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'SocietyPro',
          email: senderEmail
        },
        to: [
          {
            email: options.email,
            name: options.email.split('@')[0]
          }
        ],
        subject: options.subject,
        htmlContent: htmlTemplate,
        textContent: options.message
      })
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ Brevo API Error Response:', responseData);
      throw new Error(responseData.message || `Brevo API error: ${response.status}`);
    }

    console.log('✅ Email sent successfully via Brevo API');
    console.log('📧 Message ID:', responseData.messageId);
    
    return responseData;
  } catch (error) {
    console.error('❌ Brevo API Error:', error.message);
    console.error('🔧 Full error:', error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

export default sendEmail;

