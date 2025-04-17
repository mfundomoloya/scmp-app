const mongoose = require('mongoose');

// Define the service schema
const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, 
    },
    description: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now, 
    },
});

// Middleware to update the updatedAt field before saving
serviceSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create the Service model
const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;