const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true,},
  lastName: { type: String, required: true,},
    email: { type:String, required:true, unique: true},
    password: { type: String, required: true },
    role: { type: String, enum:['student', 'lecturer', 'admin'], required: true},
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    courseCodes: [{
      type: String,
      trim: true,
      minlength: 4,
      maxlength: 10,
    }],
    notificationPreferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
    displayName: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: 'https://placehold.co/100x100',
    },
    initials: {
      type: String,
      default: '',
    },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  // Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    console.log('Comparing password for:', this.email);
    return await bcrypt.compare(candidatePassword, this.password);
  };

  module.exports = mongoose.model('User', userSchema);