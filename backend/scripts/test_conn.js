const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
console.log('ENV PATH:', envPath);
console.log('ENV FILE EXISTS:', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('--- START ---');
  console.log(content);
  console.log('--- END ---');
  const parsed = dotenv.parse(content);
  console.log('PARSED:', parsed);
}
