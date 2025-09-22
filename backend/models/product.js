// models/product.js

import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    default: () => `product-${Math.random().toString(36).substr(2, 9)}`,  // Auto-generate productId
  },
  productName: {
    type: String,
    required: true,
  },
  altNames: [
    {
      type: String,
    }
  ],
  images: [
    {
      type: String,
    }
  ],
  price: {
    type: Number,
    required: true,
  },
  lastPrice: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantityInStock: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
  },
  // Add the 'owner' field to associate the product with a farmer (user)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference the User model
    required: true,  // Ensure that each product has an owner (farmer)
  }
}, { timestamps: true });

// Create the Product model from the schema
const Product = mongoose.model('Product', productSchema);

export default Product;
