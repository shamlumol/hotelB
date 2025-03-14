const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Stay = require('../models/Stay');
const User = require('../models/User');

async function check() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hotelB');
    console.log('Connected to MongoDB');
    
    const users = await User.find();
    console.log(`Users count: ${users.length}`);
    users.forEach(u => console.log(`- ${u.name} (${u.email}) - Points: ${u.loyaltyPoints}, Tier: ${u.loyaltyTier}`));

    const stays = await Stay.find();
    console.log(`Stays count: ${stays.length}`);
    // Print first 5 stays
    stays.slice(0, 5).forEach(s => console.log(`- ${s.title || s.name} (${s._id})`));

    const bookings = await Booking.find().populate('stay').populate('user');
    console.log(`Bookings count: ${bookings.length}`);
    bookings.forEach(b => console.log(`- Booking #${b.bookingNumber}: ${b.user?.name} booked ${b.stay?.title || b.stay?.name} (${b.roomTitle}) - Amount: ₹${b.totalAmount}, Status: ${b.status}`));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

check();
