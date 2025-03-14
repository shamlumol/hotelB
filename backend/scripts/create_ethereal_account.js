const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('Generating Ethereal Mail test credentials...');
    const account = await nodemailer.createTestAccount();
    
    console.log('\n========================================');
    console.log('📧 Ethereal Account Generated Successfully!');
    console.log(`User: ${account.user}`);
    console.log(`Pass: ${account.pass}`);
    console.log('SMTP Host: smtp.ethereal.email');
    console.log('SMTP Port: 587');
    console.log('Log in to see received messages: https://ethereal.email/login');
    console.log('========================================\n');

    const envPath = path.join(__dirname, '../.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Check if EMAIL_USER already exists, replace or append
    if (envContent.includes('EMAIL_USER=')) {
      envContent = envContent.replace(/EMAIL_USER=.*/, `EMAIL_USER=${account.user}`);
      envContent = envContent.replace(/EMAIL_PASSWORD=.*/, `EMAIL_PASSWORD=${account.pass}`);
    } else {
      envContent += `\n# Ethereal Mail Credentials\nEMAIL_USER=${account.user}\nEMAIL_PASSWORD=${account.pass}\n`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
    console.log('✅ Appended Ethereal Mail credentials to backend/.env file!');

  } catch (error) {
    console.error('❌ Error generating Ethereal credentials:', error.message);
  }
}

main();
