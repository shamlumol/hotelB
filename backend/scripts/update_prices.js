const mongoose = require('mongoose');
const Stay = require('../models/Stay');

async function updatePrices() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hotelB');
    console.log('Connected to MongoDB');

    const stays = await Stay.find();
    console.log(`Found ${stays.length} stays to update.`);

    for (let stay of stays) {
      // Map base price to 1500 - 3500 range
      const newBasePrice = Math.floor(Math.random() * (3500 - 1500 + 1)) + 1500;
      stay.basePrice = newBasePrice;

      // Update room prices
      if (stay.rooms && stay.rooms.length > 0) {
        stay.rooms = stay.rooms.map(room => {
          room.price = newBasePrice;
          if (room.originalPrice) {
            room.originalPrice = Math.round(newBasePrice * 1.25);
          }
          return room;
        });
      }

      await stay.save();
    }

    console.log('Successfully updated all stays and rooms prices to the 1500 - 3500 range.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error updating prices:', error);
  }
}

updatePrices();
