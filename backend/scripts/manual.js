const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const user = await User.findOne({ email: 'mfundomoloya19@gmail.com' });
  if (!user) return console.log('User not found');

  const newPassword = 'test12345';
  const hash = await bcrypt.hash(newPassword, 10);
  user.password = hash;
  await user.save();

  console.log('Password manually reset to:', newPassword);
  console.log('Hash:', hash);
  process.exit(0);
});
