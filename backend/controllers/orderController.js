// controllers/orderController.js

import Order from "../models/order.js";
import Products from "../models/product.js";
import Cart from "../models/cart.js";

// Create a new order from cart
export async function newOrderFromCart(req, res) {
  const { name, address, phone } = req.body;
  const userId = req.user.id;

  try {
    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty. Add items to cart before placing an order."
      });
    }

    const newProductArray = [];
    const currentDate = new Date();

    // Process each cart item
    for (let item of cart.items) {
      const product = item.productId;
      const quantity = item.quantity;

      if (!product) {
        return res.status(400).json({
          message: "One or more products in cart no longer exist."
        });
      }

      // Check if product is expired
      if (product.expiryDate && new Date(product.expiryDate) < currentDate) {
        return res.status(400).json({
          message: `Product "${product.productName}" has expired and cannot be ordered.`
        });
      }

      // Check stock availability
      if (product.quantityInStock < quantity) {
        return res.status(400).json({
          message: `Not enough stock for "${product.productName}". Available: ${product.quantityInStock}, Requested: ${quantity}`
        });
      }

      // Reduce stock
      product.quantityInStock -= quantity;
      await product.save();

      newProductArray.push({
        name: product.productName,
        price: product.price,
        quantity,
        image: product.images[0] || "default-image-url"
      });
    }

    // Generate unique order ID
    const latestOrder = await Order.find().sort({ date: -1 }).limit(1);
    let orderId;
    if (latestOrder.length === 0) {
      orderId = "CBC0001";
    } else {
      const currentOrderId = latestOrder[0].orderId;
      const numberString = currentOrderId.replace("CBC", "");
      const number = parseInt(numberString);
      const newNumber = (number + 1).toString().padStart(4, "0");
      orderId = "CBC" + newNumber;
    }

    // Create order
    const newOrderData = {
      orderId,
      email: req.user.email,
      orderedItems: newProductArray,
      name,
      address,
      phone,
    };

    const order = new Order(newOrderData);
    const savedOrder = await order.save();

    // Clear cart after successful order
    await Cart.findOneAndUpdate(
      { userId },
      { items: [], updatedAt: new Date() }
    );

    res.json({
      message: "Order placed successfully from cart.",
      order: savedOrder,
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      message: `Error placing the order: ${error.message}`,
    });
  }
}

// Create a new order (direct order without cart)
export async function newOrder(req, res) {
  const { orderedItems, name, address, phone } = req.body;

  try {
    // Array to store order item details
    const newProductArray = [];

    // Check the stock and reduce it
    for (let i = 0; i < orderedItems.length; i++) {
      const { productId, quantity } = orderedItems[i];
      const product = await Products.findOne({ productId });

      if (!product) {
        return res.json({
          message: `Product with ID ${productId} not found.`,
        });
      }

      // Check if stock is available
      if (product.quantityInStock < quantity) {
        return res.json({
          message: `Not enough stock for ${product.productName}. Available: ${product.quantityInStock}`,
        });
      }

      // Reduce stock for the ordered quantity
      product.quantityInStock -= quantity;
      await product.save();

      newProductArray.push({
        name: product.productName,
        price: product.price,
        quantity,
        image: product.images[0] || "default-image-url",  // Default image if no product image
      });
    }

    // Generate unique order ID (CBC + 4-digit number)
    const latestOrder = await Order.find().sort({ date: -1 }).limit(1);
    let orderId;
    if (latestOrder.length === 0) {
      orderId = "CBC0001";
    } else {
      const currentOrderId = latestOrder[0].orderId;
      const numberString = currentOrderId.replace("CBC", "");
      const number = parseInt(numberString);
      const newNumber = (number + 1).toString().padStart(4, "0");
      orderId = "CBC" + newNumber;
    }

    // Prepare order data
    const newOrderData = {
      orderId,
      email: req.user.email,
      orderedItems: newProductArray,
      name,
      address,
      phone,
    };

    // Save order in database
    const order = new Order(newOrderData);
    const savedOrder = await order.save();

    res.json({
      message: "Order placed successfully.",
      order: savedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error placing the order: ${error.message}`,
    });
  }
}

// Get all orders for a customer or admin
export async function listOrder(req, res) {
  try {
    if (req.user.type === "customer") {
      const orderList = await Order.find({ email: req.user.email });
      res.json({ list: orderList });
    } else if (req.user.type === "admin") {
      const orderList = await Order.find();
      res.json({ list: orderList });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(500).json({
      message: `Error fetching orders: ${error.message}`,
    });
  }
}

// Update order status (admin can update order status)
export async function updateOrder(req, res) {
  const { orderId } = req.params;
  const { status, notes } = req.body;

  try {
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.json({ message: `Order with ID ${orderId} not found` });
    }

    order.status = status;
    order.notes = notes || order.notes; // Only update notes if provided

    await order.save();

    res.json({
      message: `Order with ID ${orderId} updated successfully`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error updating order: ${error.message}`,
    });
  }
}

// Cancel an order
export async function cancelOrder(req, res) {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.json({ message: `Order with ID ${orderId} not found` });
    }

    if (order.status === "shipped" || order.status === "completed") {
      return res.json({ message: `Order cannot be cancelled, it's already ${order.status}` });
    }

    order.status = "cancelled";
    await order.save();

    res.json({
      message: `Order with ID ${orderId} has been cancelled`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error cancelling order: ${error.message}`,
    });
  }
}

// Get revenue stats (optional - for admin)
export async function getRevenueStats(req, res) {
  try {
    const orders = await Order.find();

    let totalRevenue = 0;
    orders.forEach((order) => {
      order.orderedItems.forEach((item) => {
        totalRevenue += item.price * item.quantity;
      });
    });

    res.json({
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error fetching revenue stats: ${error.message}`,
    });
  }
}

// Get orders containing farmer's products
export async function getFarmerOrders(req, res) {
  try {
    // Check if user is a farmer
    if (!req.user || req.user.type !== 'farmer') {
      return res.status(403).json({
        message: "Only farmers can access this endpoint"
      });
    }

    // Find all orders that contain products owned by this farmer
    const orders = await Order.find()
      .populate({
        path: 'orderedItems.productId',
        match: { owner: req.user._id }
      });

    // Filter orders that actually contain the farmer's products
    const farmerOrders = orders.filter(order => 
      order.orderedItems.some(item => item.productId && item.productId.owner.toString() === req.user._id.toString())
    );

    res.json({
      orders: farmerOrders
    });
  } catch (error) {
    res.status(500).json({
      message: `Error fetching farmer orders: ${error.message}`,
    });
  }
}

// Update order item status (for farmers to update status of their products in orders)
export async function updateOrderItemStatus(req, res) {
  try {
    const { orderId, productId, status } = req.body;

    // Check if user is a farmer
    if (!req.user || req.user.type !== 'farmer') {
      return res.status(403).json({
        message: "Only farmers can update product status in orders"
      });
    }

    // Find the order
    const order = await Order.findById(orderId).populate('orderedItems.productId');
    
    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Find the specific item and verify farmer owns the product
    const orderItem = order.orderedItems.find(item => 
      item.productId._id.toString() === productId && 
      item.productId.owner.toString() === req.user._id.toString()
    );

    if (!orderItem) {
      return res.status(404).json({
        message: "Product not found in order or you don't own this product"
      });
    }

    // Update the item status
    orderItem.status = status;
    await order.save();

    res.json({
      message: "Order item status updated successfully",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: `Error updating order item status: ${error.message}`,
    });
  }
}
