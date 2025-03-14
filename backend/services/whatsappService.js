const twilio = require('twilio');

const isPlaceholder = (val) => {
  if (!val) return true;
  const lower = val.toLowerCase();
  return lower.includes('your_') || lower.includes('your-') || lower.includes('placeholder');
};

const hasCredentials = process.env.TWILIO_ACCOUNT_SID && 
                       process.env.TWILIO_AUTH_TOKEN && 
                       !isPlaceholder(process.env.TWILIO_ACCOUNT_SID) && 
                       !isPlaceholder(process.env.TWILIO_AUTH_TOKEN);

// Initialize Twilio client only if valid credentials exist
let client;
if (hasCredentials) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
} else {
  console.warn('⚠️ Twilio credentials missing or contain placeholders. WhatsApp/SMS notifications will be simulated.');
}

// Function to send WhatsApp message
const sendWhatsAppMessage = async (phoneNumber, bookingDetails) => {
  try {
    const formattedNumber = phoneNumber.replace(/\s/g, '');
    
    const message = `
🏨 *Booking Confirmed!* 🎉

Hello ${bookingDetails.guestName || 'Guest'}! 👋

Your booking at *${bookingDetails.hotelName || 'HotelB'}* is confirmed.

📅 Check-in: ${bookingDetails.checkIn || 'N/A'}
📅 Check-out: ${bookingDetails.checkOut || 'N/A'}
👥 Guests: ${bookingDetails.guests || 1}
💰 Total: ₹${bookingDetails.totalAmount || '0'}
🆔 Booking ID: ${bookingDetails.id || 'N/A'}

Thank you for choosing HotelB! 🌟
    `;

    if (!client) {
      console.log('📱 [SIMULATED WHATSAPP] Sending message to:', formattedNumber);
      console.log('💬 Content:', message.trim());
      return { success: true, messageId: 'simulated-whatsapp-' + Date.now() };
    }

    const response = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('✅ WhatsApp message sent:', response.sid);
    return { success: true, messageId: response.sid };
    
  } catch (error) {
    console.error('❌ WhatsApp error:', error.message);
    return { success: false, error: error.message };
  }
};

// Function to send SMS (fallback)
const sendSMS = async (phoneNumber, message) => {
  try {
    const formattedNumber = phoneNumber.replace(/\s/g, '');
    
    if (!client) {
      console.log('📱 [SIMULATED SMS] Sending message to:', formattedNumber);
      console.log('💬 Content:', message.trim());
      return { success: true, messageId: 'simulated-sms-' + Date.now() };
    }

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    console.log('✅ SMS sent:', response.sid);
    return { success: true, messageId: response.sid };
    
  } catch (error) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

// Function to send booking confirmation via WhatsApp or SMS
const sendBookingNotification = async (phoneNumber, bookingDetails) => {
  try {
    // Try WhatsApp first
    let result = await sendWhatsAppMessage(phoneNumber, bookingDetails);
    
    // If WhatsApp fails (and Twilio is configured), try SMS as fallback
    if (!result.success && client) {
      console.log('⚠️ WhatsApp failed, trying SMS...');
      const message = `
Booking Confirmed! 
Hotel: ${bookingDetails.hotelName}
Check-in: ${bookingDetails.checkIn}
Check-out: ${bookingDetails.checkOut}
Total: ₹${bookingDetails.totalAmount}
Booking ID: ${bookingDetails.id}
      `;
      result = await sendSMS(phoneNumber, message);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Notification error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { 
  sendWhatsAppMessage,
  sendSMS,
  sendBookingNotification 
};
