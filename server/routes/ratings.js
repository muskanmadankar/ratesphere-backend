// import authenticateJWT from "../middleware/auth.js";
// import express from "express";
// import { body, validationResult } from "express-validator";
// import User from "../models/User.js";
// import Store from "../models/Store.js";
// import Rating from "../models/Rating.js";

// const router = express.Router();

// /**
//  * @route   GET /api/ratings
//  * @desc    Get all ratings
//  * @access  Private (Admin only)
//  */
// router.get("/", async (req, res) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "Unauthorized" });
//   }

//   try {
//     const ratings = await Rating.find()
//       .populate("user_id", "name")
//       .populate("store_id", "name")
//       .sort({ createdAt: -1 });

//     res.json(
//       ratings.map((r) => ({
//         id: r._id,
//         rating: r.rating,
//         createdAt: r.createdAt,
//         userId: r.user_id._id,
//         userName: r.user_id.name,
//         storeId: r.store_id._id,
//         storeName: r.store_id.name,
//       }))
//     );
//   } catch (error) {
//     console.error("Get ratings error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * @route   GET /api/ratings/user
//  * @desc    Get all ratings by current user
//  * @access  Private
//  */
// router.get("/user", async (req, res) => {
//   try {
//     const ratings = await Rating.find({ user_id: req.user.id })
//       .populate("store_id", "name")
//       .sort({ createdAt: -1 });

//     res.json(
//       ratings.map((r) => ({
//         id: r._id,
//         rating: r.rating,
//         storeId: r.store_id._id,
//         storeName: r.store_id.name,
//         createdAt: r.createdAt,
//       }))
//     );
//   } catch (error) {
//     console.error("Get user ratings error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * @route   GET /api/ratings/store/:id
//  * @desc    Get all ratings for a store
//  * @access  Private
//  */
// router.get("/store/:id", async (req, res) => {
//   const storeId = req.params.id;

//   try {
//     const store = await Store.findById(storeId);
//     if (!store) {
//       return res.status(404).json({ message: "Store not found" });
//     }

//     // Store owner can only see their store’s ratings unless admin
//     if (
//       req.user.role === "store_owner" &&
//       store.user_id.toString() !== req.user.id &&
//       req.user.role !== "admin"
//     ) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to view these ratings" });
//     }

//     const ratings = await Rating.find({ store_id: storeId })
//       .populate("user_id", "name")
//       .sort({ createdAt: -1 });

//     res.json(
//       ratings.map((r) => ({
//         id: r._id,
//         rating: r.rating,
//         createdAt: r.createdAt,
//         userId: r.user_id._id,
//         userName: r.user_id.name,
//       }))
//     );
//   } catch (error) {
//     console.error("Get store ratings error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * @route   POST /api/ratings
//  * @desc    Create or update a rating
//  * @access  Private (Normal Users only)
//  */
// router.post(
//   "/",
//   [
//     body("storeId").notEmpty().withMessage("Store ID is required"),
//     body("rating")
//       .isFloat({ min: 1, max: 5 })
//       .withMessage("Rating must be between 1 and 5"),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     if (req.user.role !== "user") {
//       return res
//         .status(403)
//         .json({ message: "Only normal users can submit ratings" });
//     }

//     const { storeId, rating } = req.body;
//     const userId = req.user.id;

//     try {
//       const store = await Store.findById(storeId);
//       if (!store) {
//         return res.status(404).json({ message: "Store not found" });
//       }

//       let existing = await Rating.findOne({ user_id: userId, store_id: storeId });

//       if (existing) {
//         existing.rating = rating;
//         await existing.save();

//         return res.json({
//           id: existing._id,
//           rating,
//           userId,
//           storeId,
//           message: "Rating updated successfully",
//         });
//       } else {
//         const newRating = new Rating({ user_id: userId, store_id: storeId, rating });
//         await newRating.save();

//         return res.status(201).json({
//           id: newRating._id,
//           rating,
//           userId,
//           storeId,
//           message: "Rating submitted successfully",
//         });
//       }
//     } catch (error) {
//       console.error("Submit rating error:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// /**
//  * @route   DELETE /api/ratings/:id
//  * @desc    Delete a rating
//  * @access  Private (Admin or rating owner)
//  */
// router.delete("/:id", async (req, res) => {
//   const ratingId = req.params.id;

//   try {
//     const rating = await Rating.findById(ratingId);
//     if (!rating) {
//       return res.status(404).json({ message: "Rating not found" });
//     }

//     if (req.user.role !== "admin" && rating.user_id.toString() !== req.user.id) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to delete this rating" });
//     }

//     await Rating.findByIdAndDelete(ratingId);

//     res.json({ message: "Rating deleted successfully" });
//   } catch (error) {
//     console.error("Delete rating error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;


import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateJWT } from "../middleware/auth.js";
import User from "../models/User.js";
import Store from "../models/Store.js";
import Rating from "../models/Rating.js";

const router = express.Router();

/**
 * @route   GET /api/ratings
 * @desc    Get all ratings
 * @access  Private (Admin only)
 */
router.get("/", authenticateJWT, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const ratings = await Rating.find()
      .populate("user_id", "name")
      .populate("store_id", "name")
      .sort({ createdAt: -1 });

    res.json(
      ratings.map((r) => ({
        id: r._id,
        rating: r.rating,
        createdAt: r.createdAt,
        userId: r.user_id._id,
        userName: r.user_id.name,
        storeId: r.store_id._id,
        storeName: r.store_id.name,
      }))
    );
  } catch (error) {
    console.error("Get ratings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/ratings/user
 * @desc    Get all ratings by current user
 * @access  Private
 */
router.get("/user", authenticateJWT, async (req, res) => {
  try {
    const ratings = await Rating.find({ user_id: req.user.id })
      .populate("store_id", "name")
      .sort({ createdAt: -1 });

    res.json(
      ratings.map((r) => ({
        id: r._id,
        rating: r.rating,
        storeId: r.store_id._id,
        storeName: r.store_id.name,
        createdAt: r.createdAt,
      }))
    );
  } catch (error) {
    console.error("Get user ratings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/ratings/store-owner
 * @desc    Get all ratings for the store owned by the logged-in store owner
 * @access  Private (Store Owner only)
 */
// router.get("/store-owner", authenticateJWT, async (req, res) => {
//   try {
//     if (req.user.role !== "store_owner") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const store = await Store.findOne({ user_id: req.user.id });
//     if (!store) {
//       return res.status(404).json({ message: "Store not found for this owner" });
//     }

//     const ratings = await Rating.find({ store_id: store._id })
//       .populate("user_id", "name")
//       .sort({ createdAt: -1 });

//     res.json(
//       ratings.map((r) => ({
//         id: r._id,
//         rating: r.rating,
//         createdAt: r.createdAt,
//         userId: r.user_id._id,
//         userName: r.user_id.name,
//       }))
//     );
//   } catch (error) {
//     console.error("Get store-owner ratings error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/store-owner", authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== "store_owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("Logged-in store owner ID:", req.user.id);

    const store = await Store.findOne({ user_id: req.user.id });

    console.log("Store found:", store);

    if (!store) {
      return res.status(404).json({ message: "Store not found for this owner" });
    }

    const ratings = await Rating.find({ store_id: store._id })
      .populate("user_id", "name")
      .sort({ createdAt: -1 });

      const averageRating =
  ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

    console.log("Ratings found:", ratings);

  res.json({
  ratings: ratings.map((r) => ({
    id: r._id,
    rating: r.rating,
    createdAt: r.createdAt,
    userId: r.user_id._id,
    userName: r.user_id.name,
  })),
  averageRating,
});
  } catch (error) {
    console.error("Error fetching store owner ratings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/ratings/store/:id
 * @desc    Get all ratings for a store
 * @access  Private
 */
router.get("/store/:id", authenticateJWT, async (req, res) => {
  const storeId = req.params.id;

  try {
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    if (
      req.user.role === "store_owner" &&
      store.user_id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view these ratings" });
    }

    const ratings = await Rating.find({ store_id: storeId })
      .populate("user_id", "name")
      .sort({ createdAt: -1 });

    res.json(
      ratings.map((r) => ({
        id: r._id,
        rating: r.rating,
        createdAt: r.createdAt,
        userId: r.user_id._id,
        userName: r.user_id.name,
      }))
    );
  } catch (error) {
    console.error("Get store ratings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   POST /api/ratings
 * @desc    Create or update a rating
 * @access  Private (Normal Users only)
 */
router.post(
  "/",
  authenticateJWT,
  [
    body("storeId").notEmpty().withMessage("Store ID is required"),
    body("rating")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Only normal users can submit ratings" });
    }

    const { storeId, rating } = req.body;
    const userId = req.user.id;

    try {
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      let existing = await Rating.findOne({ user_id: userId, store_id: storeId });

      if (existing) {
        existing.rating = rating;
        await existing.save();

        return res.json({
          id: existing._id,
          rating,
          userId,
          storeId,
          message: "Rating updated successfully",
        });
      } else {
        const newRating = new Rating({ user_id: userId, store_id: storeId, rating });
        await newRating.save();

        return res.status(201).json({
          id: newRating._id,
          rating,
          userId,
          storeId,
          message: "Rating submitted successfully",
        });
      }
    } catch (error) {
      console.error("Submit rating error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @route   DELETE /api/ratings/:id
 * @desc    Delete a rating
 * @access  Private (Admin or rating owner)
 */
router.delete("/:id", authenticateJWT, async (req, res) => {
  const ratingId = req.params.id;

  try {
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    if (req.user.role !== "admin" && rating.user_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this rating" });
    }

    await Rating.findByIdAndDelete(ratingId);

    res.json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Delete rating error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;