const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  image: {
    type: String,
    required: true
  }
});

const ReviewSchema = new mongoose.Schema({
  reviewerName: {
    type: String,
    required: true
  },
  dateString: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  cleanliness: {
    type: Number,
    default: 5
  },
  service: {
    type: Number,
    default: 5
  },
  location: {
    type: Number,
    default: 5
  }
});

const StaySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  basePrice: {
    type: Number,
    required: [true, 'Please add a base price']
  },
  image: {
    type: String,
    required: [true, 'Please add a main image URL']
  },
  images: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 5.0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  amenities: {
    type: [String],
    default: []
  },
  featured: {
    type: Boolean,
    default: false
  },
  overview: {
    type: String,
    required: [true, 'Please add an overview']
  },
  rooms: [RoomSchema],
  reviews: [ReviewSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Stay', StaySchema);
