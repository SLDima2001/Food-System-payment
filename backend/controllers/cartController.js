// controllers/cartController.js

import Cart from '../models/cart.js';
import Products from '../models/product.js';

// Add item to cart
export async function addToCart(req, res) {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({
      message: "Product ID and valid quantity are required"
    });
  }

  try {
    // Check if product exists and is not expired
    const product = await Products.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Check if product is expired
    const currentDate = new Date();
    if (product.expiryDate && new Date(product.expiryDate) < currentDate) {
      return res.status(400).json({
        message: `Product "${product.productName}" has expired and cannot be added to cart`
      });
    }

    // Check if enough stock is available
    if (product.quantityInStock < quantity) {
      return res.status(400).json({
        message: `Not enough stock available. Only ${product.quantityInStock} items left`
      });
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Check if new total quantity exceeds stock
      if (newQuantity > product.quantityInStock) {
        return res.status(400).json({
          message: `Cannot add ${quantity} more items. Total would exceed available stock of ${product.quantityInStock}`
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].addedAt = new Date();
    } else {
      // Add new item to cart
      cart.items.push({
        productId,
        quantity,
        addedAt: new Date()
      });
    }

    await cart.save();

    // Populate product details for response
    await cart.populate('items.productId', 'productName price images quantityInStock expiryDate');

    res.json({
      message: "Item added to cart successfully",
      cart
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      message: "Error adding item to cart: " + error.message
    });
  }
}

// Get user's cart
export async function getCart(req, res) {
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId }).populate('items.productId', 'productName price images quantityInStock expiryDate');
    
    if (!cart) {
      cart = { userId, items: [], updatedAt: new Date() };
    } else {
      // Filter out expired products
      const currentDate = new Date();
      const validItems = cart.items.filter(item => {
        if (item.productId && item.productId.expiryDate) {
          return new Date(item.productId.expiryDate) >= currentDate;
        }
        return true; // Keep items without expiry date
      });

      // If some items were expired, update the cart
      if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
      }
    }

    // Calculate cart totals
    let totalItems = 0;
    let totalPrice = 0;

    cart.items.forEach(item => {
      if (item.productId) {
        totalItems += item.quantity;
        totalPrice += item.productId.price * item.quantity;
      }
    });

    res.json({
      cart,
      summary: {
        totalItems,
        totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
        itemCount: cart.items.length
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      message: "Error fetching cart: " + error.message
    });
  }
}

// Update item quantity in cart
export async function updateCartItem(req, res) {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (!productId || quantity < 0) {
    return res.status(400).json({
      message: "Product ID and valid quantity are required"
    });
  }

  try {
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Item not found in cart"
      });
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock availability
      const product = await Products.findById(productId);
      if (quantity > product.quantityInStock) {
        return res.status(400).json({
          message: `Not enough stock available. Only ${product.quantityInStock} items left`
        });
      }
      
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].addedAt = new Date();
    }

    await cart.save();
    await cart.populate('items.productId', 'productName price images quantityInStock expiryDate');

    res.json({
      message: quantity === 0 ? "Item removed from cart" : "Cart updated successfully",
      cart
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      message: "Error updating cart: " + error.message
    });
  }
}

// Remove item from cart
export async function removeFromCart(req, res) {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.productId', 'productName price images quantityInStock expiryDate');

    res.json({
      message: "Item removed from cart successfully",
      cart
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      message: "Error removing item from cart: " + error.message
    });
  }
}

// Clear entire cart
export async function clearCart(req, res) {
  const userId = req.user.id;

  try {
    await Cart.findOneAndUpdate(
      { userId },
      { items: [], updatedAt: new Date() },
      { new: true }
    );

    res.json({
      message: "Cart cleared successfully"
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      message: "Error clearing cart: " + error.message
    });
  }
}