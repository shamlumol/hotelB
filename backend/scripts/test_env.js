const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
console.log('--- START RAW .env ---');
console.log(content);
console.log('--- END RAW .env ---');
