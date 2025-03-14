const mongoose = require('mongoose');
const Stay = require('../models/Stay');

async function show() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/hotelB');
    const stays = await Stay.find();
    console.log(`Total stays in DB: ${stays.length}`);
    stays.forEach(s => {
      console.log(`Stay: ${s.title}`);
      console.log(`- Category: ${s.category}`);
      console.log(`- BasePrice: ${s.basePrice}`);
      console.log(`- Rating: ${s.rating}`);
      console.log(`- Location: ${s.location}`);
      console.log(`- Amenities:`, s.amenities);
      console.log('------------------------');
    });
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}
show();
