const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretKey_hotelb_123', {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('[DEBUG] Backend Auth - Incoming Register Request:', { name, email });

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      loyaltyPoints: 1200, // 1200 welcome joining bonus points
      loyaltyTier: 'None'
    });

    if (user) {
      const responsePayload = {
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          photoURL: user.photoURL,
          provider: user.provider,
          role: user.role,
          loyaltyPoints: user.loyaltyPoints,
          loyaltyTier: user.loyaltyTier
        }
      };
      console.log('[DEBUG] Backend Auth - Register Success Response:', responsePayload);
      res.status(201).json(responsePayload);
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('[DEBUG] Backend Auth - Register Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Google OAuth authentication
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google ID token is required' });
    }

    console.log('[DEBUG] Backend Auth - Incoming Google Login Request');
    console.log('[DEBUG] Backend Auth - ID Token (first 25 chars):', idToken.substring(0, 25) + '...');

    // Verify Google ID token using OAuth2Client
    let ticket;
    try {
      console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
      console.log("Token exists:", !!idToken);

      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      console.log("Google token verified successfully");
    } catch (err) {
      console.error("VERIFY ERROR:", err.message);
      throw err;
    }
    const payload = ticket.getPayload();
    console.log('[DEBUG] Backend Auth - Verified Google Token Payload:', payload);

    const googleId = payload.sub;
    const { name, email, picture } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address not provided by Google' });
    }

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update fields if changed
      let modified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (user.photoURL !== picture) {
        user.photoURL = picture;
        modified = true;
      }
      if (user.provider === 'local') {
        user.provider = 'google';
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      // Create user
      user = await User.create({
        name,
        email,
        googleId,
        photoURL: picture,
        provider: 'google',
        role: 'user',
        loyaltyPoints: 1200, // 1200 welcome joining bonus points
        loyaltyTier: 'None'
      });
    }

    const token = generateToken(user._id);
    const responsePayload = {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        provider: user.provider,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyTier: user.loyaltyTier
      }
    };

    console.log('[DEBUG] Backend Auth - Google Login Success Response:', responsePayload);
    res.status(200).json(responsePayload);
  } catch (error) {
    console.log("=========== GOOGLE VERIFY ERROR ===========");
    console.log("Message:", error.message);

    if (error.response) {
      console.log("Response:", error.response.data);
    }

    console.log(error);
    console.log("==========================================");

    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[DEBUG] Backend Auth - Incoming Login Request for Email:', email);

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('[DEBUG] Backend Auth - User Not Found:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('[DEBUG] Backend Auth - Password Mismatch for User:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    const responsePayload = {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        provider: user.provider,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyTier: user.loyaltyTier
      }
    };

    console.log('[DEBUG] Backend Auth - Login Success Response:', responsePayload);
    res.json(responsePayload);
  } catch (error) {
    console.error('[DEBUG] Backend Auth - Login Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const responsePayload = {
      success: true,
      user
    };
    console.log('[DEBUG] Backend Auth - GET /me Success Response User ID:', user ? user._id : 'No User Found');
    res.json(responsePayload);
  } catch (error) {
    console.error('[DEBUG] Backend Auth - GET /me Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Redeem loyalty points
// @route   POST /api/auth/redeem
// @access  Private
router.post('/redeem', protect, async (req, res) => {
  try {
    const { points, description } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.loyaltyPoints < points) {
      return res.status(400).json({ success: false, message: 'Insufficient loyalty points' });
    }
    user.loyaltyPoints -= points;

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

    res.json({
      success: true,
      message: `Successfully redeemed ${points} points for: ${description}`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (name) user.name = name;
    if (email) {
      // Check if email already in use
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== req.user.id) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email;
    }
    await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user and select password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if OAuth user
    if (user.provider !== 'local') {
      return res.status(400).json({ success: false, message: 'OAuth users cannot update their passwords.' });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    // Set and save new password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Apple Login (Simulated)
// @route   POST /api/auth/apple
// @access  Public
router.post('/apple', async (req, res) => {
  try {
    const { email, name } = req.body;

    console.log('[DEBUG] Backend Auth - Incoming Apple Sign-In Request for:', email);

    let user = await User.findOne({ email });
    if (user) {
      // If user exists and provider is local, upgrade provider to apple
      if (user.provider !== 'apple') {
        user.provider = 'apple';
        await user.save();
      }
    } else {
      // Create a new apple traveler user
      user = await User.create({
        name: name || 'Apple Traveler',
        email: email || 'traveler_apple@hotelb.com',
        photoURL: '', // Apple provider does not serve profile images
        provider: 'apple',
        role: 'user',
        loyaltyPoints: 1200, // 1200 welcome joining bonus points
        loyaltyTier: 'None'
      });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        provider: user.provider,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyTier: user.loyaltyTier
      }
    });
  } catch (error) {
    console.error('[DEBUG] Backend Auth - Apple login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


// @desc    Test email endpoint
// @route   GET /api/auth/test-email
// @access  Public
router.get('/test-email', async (req, res) => {
  try {
    const { sendTestEmail } = require('../services/emailService');
    const result = await sendTestEmail('test@example.com');
    res.json(result);
  } catch (error) {
    console.error('❌ Test email route error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;


