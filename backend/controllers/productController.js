// controllers/productController.js

import Products from '../models/product.js';  // Import the Products model
import User from '../models/user.js';  // Import the User model for populate

// Helper to map product to public shape
function mapProduct(p) {
  if (!p) return null;
  return {
    id: p._id,
    productId: p.productId,
    name: p.productName,
    description: p.description,
    price: p.price,
    lastPrice: p.lastPrice,
    stock: p.quantityInStock,
    expiryDate: p.expiryDate,
    images: p.images || [],
    image: p.images && p.images.length ? p.images[0] : null,
    owner: typeof p.owner === 'object' && p.owner ? {
      id: p.owner._id || p.owner.id || p.owner,
      name: p.owner.name || p.owner.firstName || undefined,
      type: p.owner.type
    } : p.owner,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    status: p.quantityInStock > 0 ? 'active' : 'out_of_stock'
  };
}

// Route to add a new product (farmer adding product)
export async function newProducts(req, res) {
  console.log('=== ADD PRODUCT REQUEST ===');
  console.log('User:', req.user);
  console.log('Request body:', req.body);
  
  // Check if the user is authenticated and is a farmer
  if (!req.user || req.user.type !== 'farmer') {
    console.log('Authorization failed - user not farmer');
    return res.status(403).json({
      message: "You are not authorized to add a product",
    });
  }

  // Enforce subscription & approval
  if (!req.user.subscriptionPaid) {
    return res.status(402).json({ message: 'Subscription payment required before adding products' });
  }
  if (req.user.farmerStatus !== 'approved') {
    return res.status(403).json({ message: 'Your farmer account is not approved yet' });
  }

  // Destructure the product details from the request body
  const { productName, price, description, quantityInStock, expiryDate, images } = req.body;
  if (images && Array.isArray(images)) {
    images.forEach((img, idx) => {
      if (typeof img === 'string') {
        console.log(`Image[${idx}] length:`, img.length);
      }
    });
  }

  console.log('Extracted fields:', { productName, price, description, quantityInStock, expiryDate, images });

  // Check if all required fields are provided
  if (!productName || !price || !description || !quantityInStock || !expiryDate) {
    console.log('Missing required fields');
    return res.status(400).json({
      message: "Missing required fields: productName, price, description, quantityInStock, and expiryDate are required.",
    });
  }

  // Create a new product instance with the logged-in farmer as the owner
  const product = new Products({
    productName,
    price: Number(price),
    lastPrice: Number(price),  // Assuming last price is the same as the current price for new products
    description,
    quantityInStock: Number(quantityInStock),
    expiryDate,
  images: images && Array.isArray(images) ? images.map(i => typeof i === 'string' ? i.trim() : i) : [],
    owner: req.user.id || req.user._id,  // Link the product to the logged-in farmer (try both id and _id)
  });

  console.log('Product to save:', product);
  console.log('User ID for owner:', req.user.id || req.user._id);

  try {
    // Save the new product to the database
    const savedProduct = await product.save();
    console.log('Product saved successfully:', savedProduct);
    res.status(201).json({
      message: "Product added successfully to the system and is visible to customers.",
      product: savedProduct
    });
  } catch (error) {
    console.error('Database save error:', error);
    res.status(500).json({
      message: "Error adding product to the database: " + error.message,
    });
  }
}

// Route to list all products (admins can see all, farmers can see their own)
export async function listProducts(req, res) {
  console.log('=== LIST PRODUCTS REQUEST ===');
  const isAdmin = req.user && req.user.type === 'admin';
  const isFarmer = req.user && req.user.type === 'farmer';
  try {
    let filter = {};
    if (isFarmer) {
      filter.owner = req.user.id;
    } else if (!req.user) {
      filter.quantityInStock = { $gt: 0 }; // public only sees products in stock
    }
    const productsList = await Products.find(filter).populate('owner', 'name type');
    const mapped = productsList.map(mapProduct);
    res.json({ products: mapped });
  } catch (error) {
    console.error('Error in listProducts:', error);
    res.status(500).json({ message: 'Error fetching the product list: ' + error.message });
  }
}

// Get single product (public)
export async function getSingleProduct(req, res) {
  const { productId } = req.params; // this will be Mongo _id
  try {
    const product = await Products.findById(productId).populate('owner', 'name type');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product: mapProduct(product) });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ message: 'Error fetching product: ' + error.message });
  }
}

// Route to update a product's details (farmers can update their own products, admins can update any product)
export async function updateProducts(req, res) {
  const { productId } = req.params;
  const updateData = req.body;
  const { id: userId, type: role } = req.user; // Get user info from JWT token

  try {
    // First, find the product to check ownership
    const existingProduct = await Products.findById(productId);

    // If the product is not found
    if (!existingProduct) {
      return res.status(404).json({
        message: "The product with ID " + productId + " was not found",
      });
    }

    // Check authorization:
    // 1. Admins can update any product
    // 2. Farmers can only update their own products
    // 3. Customers cannot update any products
    
    if (role === 'customer') {
      return res.status(403).json({
        message: "Customers are not authorized to update products"
      });
    }

    if (role === 'farmer' && existingProduct.owner.toString() !== userId) {
      return res.status(403).json({
        message: "Farmers can only update their own products"
      });
    }

    // If we reach here, user is authorized to update
    const updatedProduct = await Products.findByIdAndUpdate(
      productId,  // Use MongoDB's _id
      updateData,
      { new: true, runValidators: true }
    );

    // Respond with the updated product
    res.json({
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      message: "Product update failed due to an error: " + error,
    });
  }
}

// Route to delete a product (farmers can delete their own products, admins can delete any product)
export async function delProducts(req, res) {
  const { productId } = req.params;
  const { id: userId, type: role } = req.user; // Get user info from JWT token

  try {
    // First, find the product to check ownership
    const existingProduct = await Products.findById(productId);

    // If the product is not found
    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found with ID: " + productId,
      });
    }

    // Check authorization:
    // 1. Admins can delete any product
    // 2. Farmers can only delete their own products
    // 3. Customers cannot delete any products
    
    if (role === 'customer') {
      return res.status(403).json({
        message: "Customers are not authorized to delete products"
      });
    }

    if (role === 'farmer' && existingProduct.owner.toString() !== userId) {
      return res.status(403).json({
        message: "Farmers can only delete their own products"
      });
    }

    // If we reach here, user is authorized to delete
    const result = await Products.findByIdAndDelete(productId);

    // Respond with success message
    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      message: "Product deletion failed due to an error: " + error,
    });
  }
}

// Route to reduce stock when an order is placed
export async function reduceStock(req, res) {
  const { productId, quantity } = req.body;

  try {
    // Find the product by MongoDB _id
    const product = await Products.findById(productId);

    // If the product is not found
    if (!product) {
      return res.status(404).json({
        message: "Product not found with ID: " + productId,
      });
    }

    // If there's not enough stock available
    if (product.quantityInStock < quantity) {
      return res.status(400).json({
        message: "Not enough stock available for product " + product.productName,
      });
    }

    // Reduce stock by the ordered quantity
    product.quantityInStock -= quantity;
    await product.save();  // Save the updated product to the database

    // Respond with success message
    res.json({ 
      message: "Stock updated successfully",
      product: {
        id: product._id,
        name: product.productName,
        newStock: product.quantityInStock
      }
    });
  } catch (error) {
    console.error('Stock reduction error:', error);
    res.status(500).json({ message: "Error reducing stock: " + error });
  }
}
