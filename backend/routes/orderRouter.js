// routes/orderRouter.js

import express from 'express';
import { newOrder, newOrderFromCart, listOrder, updateOrder, cancelOrder, getRevenueStats, getFarmerOrders, updateOrderItemStatus } from '../controllers/orderController.js';  // Import order controller methods
import { authenticate } from '../middleware/authMiddleware.js';  // Import authenticate middleware

const router = express.Router();

// Route to create a new order from cart (recommended)
router.post("/from-cart", authenticate, newOrderFromCart);  // Requires authentication

// Route to create a new order directly (without cart)
router.post("/", authenticate, newOrder);  // Requires authentication

// Route to list orders (for customers to view their own orders or admins to view all orders)
router.get("/", authenticate, listOrder);  // Requires authentication

// Route for farmers to get orders containing their products
router.get("/farmer", authenticate, getFarmerOrders);  // Farmers only

// Route to update order status (admin only)
router.put("/:orderId", authenticate, updateOrder);  // Only admins can update order status

// Route for farmers to update order item status
router.put("/item-status", authenticate, updateOrderItemStatus);  // Farmers only

// Route to cancel an order (admin or customer can cancel pending orders)
router.delete("/:orderId", authenticate, cancelOrder);  // Requires authentication

// Route to get revenue stats (admin only)
router.get("/revenue-stats", authenticate, getRevenueStats);  // Only admins can view revenue stats

export default router;
