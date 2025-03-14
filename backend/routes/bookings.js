const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Stay = require('../models/Stay');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Import notification services
const { sendBookingConfirmation } = require('../services/emailService');
const { sendBookingNotification } = require('../services/whatsappService');

// Helper to generate custom booking confirmation number
const generateBookingNumber = () => {
  const segment1 = Math.floor(1000 + Math.random() * 9000);
  const segment2 = Math.floor(1000 + Math.random() * 9000);
  return `PI-${segment1}-${segment2}`;
};

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { stayId, roomTitle, checkIn, checkOut, guestCount, guestDetails, paymentMethod } = req.body;

    // Check if stay exists
    const stay = await Stay.findById(stayId);
    if (!stay) {
      return res.status(404).json({ success: false, message: 'Stay not found' });
    }

    // Find the room inside the stay to get the price (fall back to basePrice if not found)
    const room = stay.rooms?.find(r => r.title === roomTitle);
    const roomPrice = room ? room.price : stay.basePrice;

    if (!roomPrice) {
      return res.status(400).json({ success: false, message: 'Could not determine room price' });
    }

    // Calculate dates & nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      return res.status(400).json({ success: false, message: 'Invalid check-in or check-out date' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
    }

    const diffTime = Math.abs(checkOutDate - checkInDate);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // Calculate total pricing
    const subtotal = roomPrice * nights;
    const serviceFee = Math.round(subtotal * 0.06); // 6% service fee
    const taxes = Math.round(subtotal * 0.03); // 3% taxes
    const totalAmount = subtotal + serviceFee + taxes;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      stay: stayId,
      roomTitle,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guestCount,
      guestDetails,
      totalAmount,
      paymentMethod,
      bookingNumber: generateBookingNumber(),
      status: 'Confirmed'
    });

    // Populate the booking with stay and user details for notifications
    const populatedBooking = await Booking.findById(booking._id)
      .populate('stay')
      .populate('user', 'name email phoneNumber');

    // Prepare booking details for notifications
    const bookingDetails = {
      id: booking.bookingNumber,
      guestName: guestDetails?.name || populatedBooking.user?.name || 'Guest',
      hotelName: populatedBooking.stay?.title || stay.title || 'HotelB',
      roomTitle: roomTitle,
      checkIn: checkInDate.toLocaleDateString(),
      checkOut: checkOutDate.toLocaleDateString(),
      guests: guestCount,
      totalAmount: totalAmount.toLocaleString('en-IN')
    };

    const bookingEmail = guestDetails?.email || req.user.email;
    const bookingPhone = guestDetails?.phone || req.user.phoneNumber;

    // Send notifications (non-blocking - don't await, just fire and forget)
    Promise.all([
      // Send Email
      sendBookingConfirmation(bookingEmail, bookingDetails)
        .then(result => console.log('📧 Email:', result.success ? `✅ Sent (isReal: ${result.isReal || false})` : '❌ Failed'))
        .catch(err => console.error('Email error:', err.message)),
      
      // Send WhatsApp/SMS if phone number provided
      bookingPhone ? 
        sendBookingNotification(bookingPhone, bookingDetails)
          .then(result => console.log('💬 WhatsApp:', result.success ? '✅ Sent' : '❌ Failed'))
          .catch(err => console.error('WhatsApp error:', err.message))
        : Promise.resolve()
    ]);

    // Update User Loyalty points (1 point per ₹100 spent)
    const pointsAwarded = Math.floor(totalAmount / 100);
    const user = await User.findById(req.user.id);
    if (user) {
      user.loyaltyPoints += pointsAwarded;
      
      // Update tier based on points
      if (user.loyaltyPoints >= 20000) {
        user.loyaltyTier = 'Platinum';
      } else if (user.loyaltyPoints >= 10000) {
        user.loyaltyTier = 'Gold';
      } else if (user.loyaltyPoints >= 5000) {
        user.loyaltyTier = 'Silver';
      } else {
        user.loyaltyTier = 'None';
      }
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current user's bookings
// @route   GET /api/bookings/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('stay')
      .sort({ checkIn: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('stay')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership (unless admin)
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
