// routes/cartRouter.js

import express from 'express';
import { 
  addToCart, 
  getCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user's cart
router.get('/', authenticate, getCart);

// Add item to cart
router.post('/add', authenticate, addToCart);

// Update item quantity in cart
router.put('/update', authenticate, updateCartItem);

// Remove specific item from cart
router.delete('/remove/:productId', authenticate, removeFromCart);

// Clear entire cart
router.delete('/clear', authenticate, clearCart);

export default router;