const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const isPlaceholder = (val) => {
  if (!val) return true;
  const lower = val.toLowerCase();
  return lower.includes('placeholder') || lower.includes('your_') || lower.includes('your-');
};

// Initialize Stripe if valid key is available
let stripe;
const hasStripeKey = process.env.STRIPE_SECRET_KEY && !isPlaceholder(process.env.STRIPE_SECRET_KEY);
if (hasStripeKey) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('💳 Stripe initialized with configured secret key.');
} else {
  console.warn('⚠️ Stripe secret key missing or is placeholder. Payment flow will run in SIMULATED mode.');
}

// @desc    Create Stripe PaymentIntent
// @route   POST /api/payments/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Please provide payment amount' });
    }

    // If Stripe is not configured or in simulated mode
    if (!stripe) {
      console.log(`💳 [SIMULATED PAYMENT] Creating PaymentIntent of ₹${(amount / 100).toFixed(2)}`);
      return res.status(200).json({
        success: true,
        clientSecret: `mock_secret_intent_${Date.now()}_amount_${amount}`,
        isSimulated: true
      });
    }

    // Create real Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // in cents / paise
      currency: currency || 'inr',
      payment_method_types: ['card'],
      metadata: {
        userId: req.user.id,
        userEmail: req.user.email
      }
    });

    console.log(`✅ Stripe PaymentIntent created: ${paymentIntent.id} for amount ₹${(amount / 100).toFixed(2)}`);

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      isSimulated: false
    });

  } catch (error) {
    console.error('❌ Stripe PaymentIntent error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment initiation failed'
    });
  }
});

module.exports = router;
