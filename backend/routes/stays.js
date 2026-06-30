const express = require('express');
const router = express.Router();
const Stay = require('../models/Stay');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all stays (with search and filters)
// @route   GET /api/stays
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query = {};

    // Search by location, title, or category (case insensitive partial match)
    if (req.query.location) {
      const searchRegex = { $regex: req.query.location, $options: 'i' };
      query.$or = [
        { location: searchRegex },
        { title: searchRegex },
        { category: searchRegex }
      ];
    }

    // Category / Property Type filter
    if (req.query.category) {
      // Multiple categories could be passed as comma-separated
      const categories = req.query.category.split(',');
      query.category = { $in: categories };
    }

    // Price range filter
    if (req.query.maxPrice) {
      query.basePrice = { $lte: Number(req.query.maxPrice) };
    }

    // Amenities filter
    if (req.query.amenities) {
      const amenitiesList = req.query.amenities.split(',');
      query.amenities = { $all: amenitiesList };
    }

    // Sorting
    let sortBy = {};
    if (req.query.sort) {
      if (req.query.sort === 'Price: Low to High') {
        sortBy = { basePrice: 1 };
      } else if (req.query.sort === 'Price: High to Low') {
        sortBy = { basePrice: -1 };
      } else if (req.query.sort === 'Top Rated') {
        sortBy = { rating: -1 };
      } else {
        sortBy = { createdAt: -1 }; // default / recommended
      }
    }

    const stays = await Stay.find(query).sort(sortBy);
    res.json({
      success: true,
      count: stays.length,
      data: stays
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get featured stays
// @route   GET /api/stays/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const stays = await Stay.find({ featured: true });
    res.json({
      success: true,
      data: stays
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single stay details
// @route   GET /api/stays/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const stay = await Stay.findById(req.id || req.params.id);
    if (!stay) {
      return res.status(404).json({ success: false, message: 'Stay not found' });
    }
    res.json({
      success: true,
      data: stay
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a stay
// @route   POST /api/stays
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const stay = await Stay.create(req.body);
    res.status(201).json({
      success: true,
      data: stay
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a stay
// @route   PUT /api/stays/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    let stay = await Stay.findById(req.params.id);
    if (!stay) {
      return res.status(404).json({ success: false, message: 'Stay not found' });
    }

    stay = await Stay.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: stay
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a stay
// @route   DELETE /api/stays/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const stay = await Stay.findById(req.params.id);
    if (!stay) {
      return res.status(404).json({ success: false, message: 'Stay not found' });
    }

    await stay.deleteOne();
    res.json({
      success: true,
      message: 'Stay deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add a review to a stay
// @route   POST /api/stays/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { comment, rating, cleanliness, service, location } = req.body;
    
    const parsedRating = Number(rating || 5);
    const parsedCleanliness = Number(cleanliness || 5);
    const parsedService = Number(service || 5);
    const parsedLocation = Number(location || 5);

    if (!comment) {
      return res.status(400).json({ success: false, message: 'Please provide a comment' });
    }

    const stay = await Stay.findById(req.params.id);
    if (!stay) {
      return res.status(404).json({ success: false, message: 'Stay not found' });
    }

    const newReview = {
      reviewerName: req.user.name || 'Anonymous Guest',
      dateString: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      comment,
      rating: isNaN(parsedRating) ? 5 : parsedRating,
      cleanliness: isNaN(parsedCleanliness) ? 5 : parsedCleanliness,
      service: isNaN(parsedService) ? 5 : parsedService,
      location: isNaN(parsedLocation) ? 5 : parsedLocation
    };

    stay.reviews.push(newReview);
    stay.reviewsCount = stay.reviews.length;
    
    // Calculate new overall rating
    const totalRating = stay.reviews.reduce((acc, item) => acc + item.rating, 0);
    stay.rating = Number((totalRating / stay.reviewsCount).toFixed(1));

    await stay.save();

    res.status(201).json({
      success: true,
      data: stay.reviews,
      rating: stay.rating,
      reviewsCount: stay.reviewsCount
    });
  } catch (error) {
    console.error('[DEBUG] Review Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to save review' });
  }
});

module.exports = router;
