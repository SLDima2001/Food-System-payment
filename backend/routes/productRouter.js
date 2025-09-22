// routes/productRouter.js

import express from 'express';
import { listProducts, newProducts, delProducts, updateProducts, reduceStock, getSingleProduct } from '../controllers/productController.js';  // Import product controller methods
import { authenticate } from '../middleware/authMiddleware.js';  // Import authenticate middleware

const router = express.Router();

// Route to list all products (no authentication required for public)
router.get('/', listProducts);
// Public single product detail
router.get('/:productId', getSingleProduct);

// Route to list farmer's products (authenticated farmers only)
router.get('/list', authenticate, listProducts);

// Route to create a new product (only farmers can add products)
router.post('/', authenticate, newProducts);

// Route to update a product (farmers can update their own products)
router.put('/:productId', authenticate, updateProducts);

// Route to delete a product (farmers can delete their own products)
router.delete('/:productId', authenticate, delProducts);

// Route to reduce stock when an order is placed
router.post('/reduce-stock', authenticate, reduceStock);

export default router;
