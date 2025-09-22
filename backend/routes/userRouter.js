// routes/userRouter.js

import express from 'express';
import { userLogin, registerUser, getUser, logoutUser, updateProfile, payFarmerSubscription, listPendingFarmers, approveFarmer, declineFarmer } from '../controllers/userController.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

// Route for registration (POST /api/users/register)
userRouter.post('/register', registerUser);  // This should be defined

// Route for login (POST /api/users/login)
userRouter.post('/login', userLogin);

// Route to get the logged-in user's details (GET /api/users/me)
userRouter.get('/me', authenticate, getUser);

// Route to update user profile (PUT /api/users/profile)
userRouter.put('/profile', authenticate, updateProfile);

// Route to log out (POST /api/users/logout)
userRouter.post('/logout', logoutUser);

// Farmer subscription payment (POST /api/users/farmer/pay-subscription)
userRouter.post('/farmer/pay-subscription', authenticate, payFarmerSubscription);

// Admin: list pending farmers
userRouter.get('/admin/farmers/pending', authenticate, isAdmin, listPendingFarmers);

// Admin: approve farmer
userRouter.post('/admin/farmers/:id/approve', authenticate, isAdmin, approveFarmer);

// Admin: decline farmer
userRouter.post('/admin/farmers/:id/decline', authenticate, isAdmin, declineFarmer);

export default userRouter;
