// middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file

export function authenticate(req, res, next) {
  console.log('=== AUTHENTICATION MIDDLEWARE ===');
  console.log('Headers:', req.headers);
  
  const authHeader = req.header('Authorization');
  console.log('Authorization header:', authHeader);
  
  const token = authHeader?.replace('Bearer ', '');  // Get the token from the Authorization header
  console.log('Extracted token:', token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);  // Verify the token using the secret key
    console.log('Decoded user:', decoded);
    req.user = decoded;  // Attach decoded user info to the request object
    next();  // Proceed to the next route handler
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

export function isAdmin(req, res, next) {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}
