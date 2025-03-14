const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['WATER', 'WELLNESS', 'CULTURE', 'NATURE']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  duration: {
    type: String,
    required: [true, 'Please add a duration']
  },
  image: {
    type: String,
    required: [true, 'Please add an image']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Experience', ExperienceSchema);
