const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testPassword() {
  try {
    console.log('Attempting to connect to MongoDB with URI:', process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@'));
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    for (const { email, password } of usersToTest) {
      const user = await User.findOne({ email });
      if (!user) {
        console.log(`User not found: ${email}`);
        continue;
      }

      console.log('User details:', {
        email: user.email,
        storedHash: user.password,
        isVerified: user.isVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        initials: user.initials,
        avatar: user.avatar,
      });

      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`Testing password for ${email}: "${password}" => Match: ${isMatch}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

testPassword();