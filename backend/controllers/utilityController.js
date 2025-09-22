// controllers/utilityController.js

import Products from '../models/product.js';

// Clean up expired products
export async function cleanExpiredProducts(req, res) {
  try {
    const currentDate = new Date();
    
    // Find expired products
    const expiredProducts = await Products.find({
      expiryDate: { $lt: currentDate }
    });

    if (expiredProducts.length === 0) {
      return res.json({
        message: "No expired products found",
        cleaned: 0
      });
    }

    // Delete expired products
    const result = await Products.deleteMany({
      expiryDate: { $lt: currentDate }
    });

    res.json({
      message: `Successfully cleaned up ${result.deletedCount} expired products`,
      cleaned: result.deletedCount,
      expiredProducts: expiredProducts.map(p => ({
        id: p._id,
        name: p.productName,
        expiryDate: p.expiryDate
      }))
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      message: "Error cleaning up expired products: " + error.message
    });
  }
}

// Get products expiring soon (within next 7 days by default)
export async function getExpiringSoon(req, res) {
  try {
    // Get days from query parameter, default to 7 days
    const days = parseInt(req.query.days) || 7;
    
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + (days * 24 * 60 * 60 * 1000));

    const expiringSoon = await Products.find({
      expiryDate: {
        $gte: currentDate,
        $lte: futureDate
      }
    }).sort({ expiryDate: 1 });

    res.json({
      message: `Found ${expiringSoon.length} products expiring within ${days} days`,
      daysChecked: days,
      products: expiringSoon.map(p => ({
        id: p._id,
        name: p.productName,
        expiryDate: p.expiryDate,
        stock: p.quantityInStock,
        price: p.price,
        owner: p.owner,
        daysUntilExpiry: Math.ceil((new Date(p.expiryDate) - currentDate) / (1000 * 60 * 60 * 24))
      }))
    });

  } catch (error) {
    console.error('Expiring soon error:', error);
    res.status(500).json({
      message: "Error fetching expiring products: " + error.message
    });
  }
}

// Check system health
export async function systemHealth(req, res) {
  try {
    const totalProducts = await Products.countDocuments();
    const currentDate = new Date();
    
    const expiredCount = await Products.countDocuments({
      expiryDate: { $lt: currentDate }
    });
    
    // Check for products expiring within 7 days
    const expiringSoonCount = await Products.countDocuments({
      expiryDate: {
        $gte: currentDate,
        $lte: new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000))
      }
    });

    const lowStockCount = await Products.countDocuments({
      quantityInStock: { $lt: 10 }
    });

    res.json({
      systemHealth: {
        totalProducts,
        expiredProducts: expiredCount,
        expiringSoonWithin5Days: expiringSoonCount,
        lowStock: lowStockCount,
        healthStatus: expiredCount > 0 ? "Needs Cleanup" : expiringSoonCount > 0 ? "Warning - Products Expiring Soon" : "Good",
        lastChecked: new Date()
      }
    });

  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      message: "Error checking system health: " + error.message
    });
  }
}

// Get products expiring within specific days (dedicated endpoint for 5 days)
export async function getExpiringWithin5Days(req, res) {
  try {
    const currentDate = new Date();
    const fiveDaysFromNow = new Date(currentDate.getTime() + (5 * 24 * 60 * 60 * 1000));

    const expiringSoon = await Products.find({
      expiryDate: {
        $gte: currentDate,
        $lte: fiveDaysFromNow
      }
    }).sort({ expiryDate: 1 });

    // Group by days until expiry
    const groupedByDays = {};
    expiringSoon.forEach(product => {
      const daysUntilExpiry = Math.ceil((new Date(product.expiryDate) - currentDate) / (1000 * 60 * 60 * 24));
      if (!groupedByDays[daysUntilExpiry]) {
        groupedByDays[daysUntilExpiry] = [];
      }
      groupedByDays[daysUntilExpiry].push({
        id: product._id,
        name: product.productName,
        expiryDate: product.expiryDate,
        stock: product.quantityInStock,
        price: product.price,
        owner: product.owner
      });
    });

    res.json({
      message: `Found ${expiringSoon.length} products expiring within 5 days`,
      totalProducts: expiringSoon.length,
      urgentAlert: expiringSoon.filter(p => {
        const days = Math.ceil((new Date(p.expiryDate) - currentDate) / (1000 * 60 * 60 * 24));
        return days <= 2;
      }).length,
      groupedByDays,
      products: expiringSoon.map(p => ({
        id: p._id,
        name: p.productName,
        expiryDate: p.expiryDate,
        stock: p.quantityInStock,
        price: p.price,
        owner: p.owner,
        daysUntilExpiry: Math.ceil((new Date(p.expiryDate) - currentDate) / (1000 * 60 * 60 * 24)),
        urgency: Math.ceil((new Date(p.expiryDate) - currentDate) / (1000 * 60 * 60 * 24)) <= 2 ? "HIGH" : "MEDIUM"
      }))
    });

  } catch (error) {
    console.error('5-day expiry check error:', error);
    res.status(500).json({
      message: "Error fetching products expiring within 5 days: " + error.message
    });
  }
}