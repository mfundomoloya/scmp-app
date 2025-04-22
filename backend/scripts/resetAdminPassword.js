const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGO_URI is not defined in .env');
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const resetAdminPassword = async (email, newPassword) => {
  try {
    console.log('Attempting to reset password for:', email);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log('Generated hash for password:', { hashLength: hashedPassword.length });

    // Update or insert admin user
    const updateResult = await User.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          name: 'Admin User',
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log('Update result:', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      upsertedCount: updateResult.upsertedCount,
    });

    // Verify user and password
    const verifyUser = await User.findOne({ email: email.toLowerCase() });
    if (!verifyUser) {
      console.error('Verification failed: User not found after update');
      process.exit(1);
    }
    const isMatch = await bcrypt.compare(newPassword, verifyUser.password);
    if (!isMatch) {
      console.error('Verification failed: Password hash does not match');
      process.exit(1);
    }

    console.log(`Admin password reset successfully for: ${email}`);
    console.log('User details:', {
      email: verifyUser.email,
      role: verifyUser.role,
      isVerified: verifyUser.isVerified,
      passwordHashLength: verifyUser.password.length,
    });
    console.log('Password verification successful:', { email, isMatch });
  } catch (err) {
    console.error('Error resetting admin password:', {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
};

// Run the script
resetAdminPassword('admin1@scmp.com', '@dmin25');