require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

console.log('Testing nodemailer with:', {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? '[REDACTED]' : undefined,
});

transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP verify error:', err);
  } else {
    console.log('SMTP server ready');
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'mfundomoloya19@gmail.com', // Replace with a real email
  subject: 'Test Email',
  text: 'This is a test email from Nodemailer.',
})
  .then(() => console.log('Test email sent successfully'))
  .catch((err) => console.error('Test email error:', err));