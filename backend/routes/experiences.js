const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all experiences
// @route   GET /api/experiences
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.category) {
      // Category is case-insensitive in search, matched to uppercase
      query.category = req.query.category.toUpperCase();
    }

    const experiences = await Experience.find(query);
    res.json({
      success: true,
      count: experiences.length,
      data: experiences
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create an experience
// @route   POST /api/experiences
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const experience = await Experience.create(req.body);
    res.status(201).json({
      success: true,
      data: experience
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
