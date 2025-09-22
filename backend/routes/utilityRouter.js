// routes/utilityRouter.js

import express from 'express';
import { cleanExpiredProducts, getExpiringSoon, getExpiringWithin5Days, systemHealth } from '../controllers/utilityController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Clean up expired products (admin only)
router.delete('/cleanup-expired', authenticate, cleanExpiredProducts);

// Get products expiring soon (flexible days via query param: ?days=5)
router.get('/expiring-soon', authenticate, getExpiringSoon);

// Get products expiring within exactly 5 days (dedicated endpoint)
router.get('/expiring-5-days', authenticate, getExpiringWithin5Days);

// Check system health
router.get('/health', authenticate, systemHealth);

export default router;