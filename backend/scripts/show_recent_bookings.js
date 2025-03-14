const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');

async function show() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hotelB');
    const bookings = await Booking.find().sort({ createdAt: -1 }).populate('user');
    console.log(`Total bookings in DB: ${bookings.length}`);
    bookings.forEach(b => {
      console.log(`Booking #${b.bookingNumber}:`);
      console.log(`- CreatedAt: ${b.createdAt}`);
      console.log(`- User: ${b.user ? b.user.email : 'None'} (${b.user ? b.user.name : 'N/A'})`);
      console.log(`- Stay ID: ${b.stay}`);
      console.log(`- Status: ${b.status}`);
      console.log(`- Dates: ${b.checkIn} to ${b.checkOut}`);
      console.log(`- Room: ${b.roomTitle}`);
      console.log('------------------------');
    });
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}
show();
