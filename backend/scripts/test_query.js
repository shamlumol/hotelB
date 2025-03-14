const mongoose = require('mongoose');
const Stay = require('../models/Stay');

mongoose.connect('mongodb://127.0.0.1:27017/hotelB')
  .then(async () => {
    const query = { location: { $regex: 'Munnar', $options: 'i' } };
    const stays = await Stay.find(query);
    console.log(`Matched stays count: ${stays.length}`);
    stays.forEach(s => console.log(`- ${s.title}: ${s.location}`));
  })
  .catch(err => console.error(err))
  .finally(() => mongoose.disconnect());
