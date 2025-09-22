// models/user.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';  // Import bcryptjs for password hashing

// Define the User schema
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: function() {
      return this.type !== 'farmer';
    },
  },
  lastName: {
    type: String,
    required: function() {
      return this.type !== 'farmer';
    },
  },
  name: {
    type: String,
    required: function() {
      return this.type === 'farmer';
    },
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: function() {
      return this.type === 'farmer';
    },
  },
  // Farmer-specific fields
  farmName: {
    type: String,
    required: function() {
      return this.type === 'farmer';
    },
  },
  farmLocation: {
    type: String,
    required: function() {
      return this.type === 'farmer';
    },
  },
  farmSize: {
    type: String,
    enum: ['small', 'medium', 'large', ''],
    default: '',
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'experienced', ''],
    default: '',
  },
  specializations: {
    type: [String],
    default: [],
  },
  bio: {
    type: String,
    default: '',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['admin', 'farmer', 'customer'],
    default: 'customer',  // Default user type is customer
  },
  profilePicture: {
    type: String,
    default: 'https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg',
  },
  // Farmer subscription & approval workflow
  subscriptionPaid: {
    type: Boolean,
    default: false,
  },
  farmerStatus: {
    type: String,
    enum: ['pending_payment', 'pending_review', 'approved', 'declined', ''],
    default: '',
  },
}, {
  timestamps: true  // Add createdAt and updatedAt fields
});

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);  // Hash the password using bcryptjs
  }
  next();
});

// Method to compare passwords during login
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);  // Compare entered password with stored hashed password
};

// Create the User model from the schema (name must match refs like 'User')
const User = mongoose.model('User', userSchema);

export default User;
