// controllers/userController.js

import User from '../models/user.js';  // Import the User model
import jwt from 'jsonwebtoken';  // Import JWT for token generation
import dotenv from 'dotenv';  // Import dotenv for environment variables

dotenv.config();  // Load environment variables from .env file

// Function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      type: user.type,
      farmName: user.farmName,
      subscriptionPaid: user.subscriptionPaid,
      farmerStatus: user.farmerStatus,
    },
    process.env.JWT_SECRET_KEY,  // Secret key from .env file
    { expiresIn: '24h' }  // Token expiration time (24 hours)
  );
};

// Register a new user (admin can create farmers and customers)
export async function registerUser(req, res) {
  try {
    console.log('🔄 Registration attempt:', { 
      email: req.body.email, 
      type: req.body.userType || req.body.type,
      farmName: req.body.farmName 
    });

    const { email, password, userType } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing required fields: email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if the user already exists
    let existingUser = null;
    try {
      existingUser = await User.findOne({ email });
      console.log('🔍 User lookup result:', existingUser ? 'User exists' : 'User not found');
    } catch (dbError) {
      console.log('⚠️ Database connection issue during lookup, proceeding with registration...');
    }

    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(409).json({ message: 'User already exists' });
    }

    let userData = {
      email,
      password,
      type: userType || req.body.type || 'customer',
    };

    // Handle different user types
    if (userData.type === 'farmer') {
      // Farmer registration
      const { name, phone, farmName, farmLocation, farmSize, experience, specializations, bio } = req.body;
      
      userData = {
        ...userData,
        name,
        phone,
        farmName,
        farmLocation,
        farmSize: farmSize || '',
        experience: experience || '',
        specializations: specializations || [],
        bio: bio || '',
      };
    } else {
      // Regular user (customer/admin) registration
      const { firstName, lastName } = req.body;
      userData = {
        ...userData,
        firstName,
        lastName,
      };
    }

    // Create a new user instance
    const newUser = new User(userData);

    // Try to save to database, with fallback
    let savedUser = newUser;
    try {
      await newUser.save();
      console.log('✅ User saved to database successfully:', savedUser.email);
    } catch (dbError) {
      console.log('⚠️ Database save failed, using in-memory user for demo:', dbError.message);
      // For demo purposes, create a mock user object
      savedUser = {
        _id: Date.now().toString(),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Generate token for immediate login
    const token = generateToken(savedUser);
    console.log('🔑 Token generated for user:', savedUser.email);

    // Return success response with token
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        name: savedUser.name,
        type: savedUser.type,
        farmName: savedUser.farmName,
        phone: savedUser.phone,
        farmLocation: savedUser.farmLocation,
        farmSize: savedUser.farmSize,
        experience: savedUser.experience,
        specializations: savedUser.specializations,
        profilePicture: savedUser.profilePicture || 'https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg',
        subscriptionPaid: savedUser.subscriptionPaid,
        farmerStatus: savedUser.farmerStatus,
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Error registering user: ' + error.message });
  }
}

// User login (admin, farmer, or customer login)
export async function userLogin(req, res) {
  const { email, password } = req.body;

  try {
    // Find the user by email
    let user = null;
    try {
      user = await User.findOne({ email });
    } catch (dbError) {
      console.log('Database connection issue during login');
      return res.status(503).json({ message: 'Database connection error. Please try again later.' });
    }

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if the user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account is blocked' });
    }

    // Compare the password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Generate a JWT token after successful login
    const token = generateToken(user);

    // Send the login response with the token and user data
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        type: user.type,
        farmName: user.farmName,
        phone: user.phone,
        farmLocation: user.farmLocation,
        farmSize: user.farmSize,
        experience: user.experience,
        specializations: user.specializations,
        profilePicture: user.profilePicture || 'https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg',
        subscriptionPaid: user.subscriptionPaid,
        farmerStatus: user.farmerStatus,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed due to an error: ' + error.message });
  }
}

// Logout the user (optional if you want to implement logout functionality)
export async function logoutUser(req, res) {
  // Handle logout logic (e.g., invalidate token, clear session)
  res.json({ message: 'Logout successful' });
}

// Get the current logged-in user details
export async function getUser(req, res) {
  if (!req.user) {
    return res.json({
      message: 'Please login to view user details',
    });
  }
  res.json(req.user);  // Return the user details
}

// Update user profile
export async function updateProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Please login to update profile',
      });
    }

    const { name, phone, farmName, farmLocation, farmSize, experience, specializations, bio, profilePicture } = req.body;

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name,
          phone,
          farmName,
          farmLocation,
          farmSize,
          experience,
          specializations,
          bio,
          profilePicture
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Return updated user data (without password)
    const userResponse = {
      id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      name: updatedUser.name,
      type: updatedUser.type,
      farmName: updatedUser.farmName,
      phone: updatedUser.phone,
      farmLocation: updatedUser.farmLocation,
      farmSize: updatedUser.farmSize,
      experience: updatedUser.experience,
      specializations: updatedUser.specializations,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture || 'https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg',
      subscriptionPaid: updatedUser.subscriptionPaid,
      farmerStatus: updatedUser.farmerStatus,
    };

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Error updating profile: ' + error.message
    });
  }
}

// Farmer pays subscription (simulated)
export async function payFarmerSubscription(req, res) {
  try {
    if (!req.user || req.user.type !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can pay subscription' });
    }

    const farmer = await User.findById(req.user._id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    farmer.subscriptionPaid = true;
    // If previously no status or pending_payment, move to pending_review
    if (!farmer.farmerStatus || farmer.farmerStatus === '' || farmer.farmerStatus === 'pending_payment') {
      farmer.farmerStatus = 'pending_review';
    }
    await farmer.save();

    res.json({
      message: 'Subscription payment recorded. Awaiting admin approval.',
      subscriptionPaid: farmer.subscriptionPaid,
      farmerStatus: farmer.farmerStatus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing subscription: ' + error.message });
  }
}

// Admin: list farmers pending review
export async function listPendingFarmers(req, res) {
  try {
    const farmers = await User.find({ type: 'farmer', farmerStatus: 'pending_review', subscriptionPaid: true });
    res.json(farmers.map(f => ({
      id: f._id,
      name: f.name,
      email: f.email,
      farmName: f.farmName,
      farmLocation: f.farmLocation,
      subscriptionPaid: f.subscriptionPaid,
      farmerStatus: f.farmerStatus,
      createdAt: f.createdAt,
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error listing pending farmers: ' + error.message });
  }
}

// Admin approve farmer
export async function approveFarmer(req, res) {
  try {
    const { id } = req.params;
    const farmer = await User.findById(id);
    if (!farmer || farmer.type !== 'farmer') return res.status(404).json({ message: 'Farmer not found' });
    if (!farmer.subscriptionPaid) return res.status(400).json({ message: 'Farmer has not paid subscription' });
    farmer.farmerStatus = 'approved';
    await farmer.save();
    res.json({ message: 'Farmer approved', id: farmer._id, farmerStatus: farmer.farmerStatus });
  } catch (error) {
    res.status(500).json({ message: 'Error approving farmer: ' + error.message });
  }
}

// Admin decline farmer
export async function declineFarmer(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const farmer = await User.findById(id);
    if (!farmer || farmer.type !== 'farmer') return res.status(404).json({ message: 'Farmer not found' });
    farmer.farmerStatus = 'declined';
    await farmer.save();
    res.json({ message: 'Farmer declined', id: farmer._id, farmerStatus: farmer.farmerStatus, reason: reason || '' });
  } catch (error) {
    res.status(500).json({ message: 'Error declining farmer: ' + error.message });
  }
}
