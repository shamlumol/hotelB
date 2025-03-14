const nodemailer = require('nodemailer');

const isPlaceholder = (val) => {
  if (!val) return true;
  const lower = val.toLowerCase();
  return lower.includes('your_') || lower.includes('your-') || lower.includes('placeholder');
};

const createTransporter = async () => {
  const hasConfig = process.env.EMAIL_USER && 
                    process.env.EMAIL_PASSWORD && 
                    !isPlaceholder(process.env.EMAIL_USER) && 
                    !isPlaceholder(process.env.EMAIL_PASSWORD);

  if (hasConfig) {
    if (process.env.EMAIL_USER.endsWith('@ethereal.email')) {
      console.log('📧 Using configured Ethereal SMTP for test emails:', process.env.EMAIL_USER);
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      console.log('📧 Using configured Gmail SMTP for real emails:', process.env.EMAIL_USER);
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }

  try {
    // Fallback dynamic test account registration
    const testAccount = await nodemailer.createTestAccount();

    console.log('📧 Dynamic Ethereal Test Account Created:');
    console.log('📧 User:', testAccount.user);
    console.log('📧 Pass:', testAccount.pass);
    console.log('📧 Preview URL: https://ethereal.email/login');

    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error('❌ Failed to create Ethereal account:', error.message);
    throw error;
  }
};

// Function to send booking confirmation
const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  try {
    console.log('📧 Sending booking confirmation to:', userEmail);

    const transporter = await createTransporter();

    const isRealGmail = process.env.EMAIL_USER && 
                        !isPlaceholder(process.env.EMAIL_USER) && 
                        !process.env.EMAIL_USER.endsWith('@ethereal.email');

    const fromAddress = isRealGmail ? `"HotelB" <${process.env.EMAIL_USER}>` : '"HotelB" <noreply@hotelb.com>';

    const mailOptions = {
      from: fromAddress,
      to: userEmail,
      subject: `Booking Confirmation - HotelB #${bookingDetails.id || '0001'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #004630; font-size: 28px; margin: 0;">Booking Confirmed! 🎉</h1>
            <p style="color: #666; margin-top: 4px;">Thank you for reserving with HotelB.</p>
          </div>
          <p>Dear ${bookingDetails.guestName || 'Guest'},</p>
          <p>Your sanctuary stay reservation has been confirmed successfully. Here are your booking details:</p>
          
          <div style="background: #f4f7f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #004630;">
            <h3 style="color: #004630; margin-top: 0; margin-bottom: 12px;">Booking Summary:</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #555; width: 120px;">Booking ID:</td>
                <td style="padding: 6px 0; color: #111;">#${bookingDetails.id || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #555;">Sanctuary Stay:</td>
                <td style="padding: 6px 0; color: #111;">${bookingDetails.hotelName || 'HotelB'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #555;">Room Assigned:</td>
                <td style="padding: 6px 0; color: #111;">${bookingDetails.roomTitle || 'Luxury Room'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #555;">Check-in:</td>
                <td style="padding: 6px 0; color: #111;">${bookingDetails.checkIn || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #555;">Check-out:</td>
                <td style="padding: 6px 0; color: #111;">${bookingDetails.checkOut || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #555;">Guests:</td>
                <td style="padding: 6px 0; color: #111;">${bookingDetails.guests || 1}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #555; border-top: 1px solid #ddd; padding-top: 10px;">Total Paid:</td>
                <td style="padding: 6px 0; color: #004630; font-weight: bold; font-size: 16px; border-top: 1px solid #ddd; padding-top: 10px;">₹${bookingDetails.totalAmount || '0'}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0 20px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-bookings" 
               style="background: #004630; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View My Bookings
            </a>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
            This is an automated message from HotelB. If you need any assistance, please contact our concierge service.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #eef; margin-top: 20px;">
          <p style="color: #999; font-size: 10px; text-align: center; margin: 0;">
            📧 Sent via Ethereal Mail. View inbox at: <a href="https://ethereal.email/login" target="_blank" style="color: #004630;">ethereal.email</a>
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    if (isRealGmail) {
      console.log('✅ Real Email sent successfully to:', userEmail);
      return { 
        success: true, 
        messageId: info.messageId, 
        isReal: true 
      };
    } else {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('✅ Ethereal Email sent successfully!');
      console.log('📧 Preview URL:', previewUrl);
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl,
        isReal: false
      };
    }

  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// Function to send simple email (for testing)
const sendTestEmail = async (email) => {
  try {
    console.log('📧 Sending test email to:', email);

    const transporter = await createTransporter();

    const isRealGmail = process.env.EMAIL_USER && 
                        !isPlaceholder(process.env.EMAIL_USER) && 
                        !process.env.EMAIL_USER.endsWith('@ethereal.email');

    const fromAddress = isRealGmail ? `"HotelB Test" <${process.env.EMAIL_USER}>` : '"HotelB Test" <test@hotelb.com>';

    const mailOptions = {
      from: fromAddress,
      to: email || 'test@example.com',
      subject: 'Test Email from HotelB',
      html: `
        <h1 style="color: #004630;">✅ Test Email</h1>
        <p>If you're receiving this, your email setup is working!</p>
        <p>Nodemailer is configured correctly.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    if (isRealGmail) {
      console.log('✅ Real Test email sent successfully to:', email);
      return { success: true, isReal: true };
    } else {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('✅ Ethereal Test email sent successfully!');
      console.log('📧 Preview URL:', previewUrl);
      return {
        success: true,
        previewUrl: previewUrl,
        isReal: false
      };
    }

  } catch (error) {
    console.error('❌ Test email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendBookingConfirmation,
  sendTestEmail
};