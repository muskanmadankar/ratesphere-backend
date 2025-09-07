import express from "express";
import { isAdmin, isStoreOwner } from "../middleware/auth.js";
import User from "../models/User.js";
import Store from "../models/Store.js";
import Rating from "../models/Rating.js";

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get("/stats", isAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const storeCount = await Store.countDocuments();
    const ratingCount = await Rating.countDocuments();

    res.json({
      userCount,
      storeCount,
      ratingCount,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/dashboard/store
 * @desc    Get store owner dashboard statistics
 * @access  Private (Store Owner only)
 */
router.get("/store", isStoreOwner, async (req, res) => {
  try {
    // Find the store belonging to this store owner
    const store = await Store.findOne({ user_id: req.user.id });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const storeId = store._id;

    // Count ratings
    const ratingCount = await Rating.countDocuments({ store_id: storeId });

    // Average rating
    const avgRatingAgg = await Rating.aggregate([
      { $match: { store_id: storeId } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const avgRating = avgRatingAgg.length > 0 ? avgRatingAgg[0].avg : 0;

    // Rating distribution
    const ratingDistribution = await Rating.aggregate([
      { $match: { store_id: storeId } },
      { $group: { _id: "$rating", count: { $count: {} } } },
      { $sort: { _id: -1 } },
    ]).then((data) =>
      data.map((item) => ({ rating: item._id, count: item.count }))
    );

    res.json({
      storeId,
      ratingCount,
      avgRating,
      ratingDistribution,
    });
  } catch (error) {
    console.error("Get store dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
