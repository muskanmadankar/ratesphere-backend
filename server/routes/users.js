import express from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { isAdmin, isAdminOrSelf } from "../middleware/auth.js";
import User from "../models/User.js";
import Store from "../models/Store.js";
import Rating from "../models/Rating.js";

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get("/", isAdmin, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 0;

    let users = await User.find({}, "name email address role createdAt")
      .limit(limit)
      .lean();

    // For store owners, fetch their rating
    const storeOwners = users.filter((user) => user.role === "store_owner");

    if (storeOwners.length > 0) {
      const storeOwnerIds = storeOwners.map((owner) => owner._id);

      // Aggregate average ratings for each store owner
      const stores = await Store.aggregate([
        { $match: { user_id: { $in: storeOwnerIds } } },
        {
          $lookup: {
            from: "ratings",
            localField: "_id",
            foreignField: "store_id",
            as: "ratings",
          },
        },
        {
          $project: {
            user_id: 1,
            avgRating: { $avg: "$ratings.rating" },
          },
        },
      ]);

      const storeRatings = {};
      stores.forEach((store) => {
        storeRatings[store.user_id.toString()] = store.avgRating;
      });

      users = users.map((user) => {
        if (user.role === "store_owner") {
          return {
            ...user,
            rating: storeRatings[user._id.toString()] || null,
          };
        }
        return user;
      });
    }

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or Self)
 */
router.get("/:id", isAdminOrSelf, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "name email address role createdAt").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If store owner, calculate avg rating
    if (user.role === "store_owner") {
      const store = await Store.findOne({ user_id: user._id });
      if (store) {
        const ratings = await Rating.find({ store_id: store._id });
        user.rating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : null;
      } else {
        user.rating = null;
      }
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post(
  "/",
  [
    isAdmin,
    body("name").isLength({ min: 10, max: 60 }).withMessage("Name must be between 10 and 60 characters"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 8, max: 16 })
      .withMessage("Password must be between 8 and 16 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must contain at least one special character"),
    body("address").isLength({ max: 400 }).withMessage("Address must not exceed 400 characters"),
    body("role").isIn(["user", "admin", "store_owner"]).withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        address,
        role,
      });

      // If store owner, also create a store
      if (role === "store_owner") {
        await Store.create({
          name,
          email,
          address,
          user_id: user._id,
        });
      }

      res.status(201).json(user);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin or Self)
 */
router.put(
  "/:id",
  [
    isAdminOrSelf,
    body("name").optional().isLength({ min: 10, max: 60 }).withMessage("Name must be between 10 and 60 characters"),
    body("email").optional().isEmail().withMessage("Please enter a valid email"),
    body("address").optional().isLength({ max: 400 }).withMessage("Address must not exceed 400 characters"),
    body("role").optional().isIn(["user", "admin", "store_owner"]).withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, role } = req.body;
    const userId = req.params.id;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const oldRole = user.role;

      // Update fields
      if (name) user.name = name;
      if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          return res.status(400).json({ message: "Email already in use" });
        }
        user.email = email;
      }
      if (address) user.address = address;

      // Only admins can change roles
      if (role && req.user.role === "admin") {
        user.role = role;
      }

      await user.save();

      // Handle role changes
      if (req.user.role === "admin" && role && oldRole !== role) {
        if (role === "store_owner") {
          await Store.create({
            name: user.name,
            email: user.email,
            address: user.address,
            user_id: user._id,
          });
        }
        if (oldRole === "store_owner") {
          await Store.updateMany({ user_id: user._id }, { active: false });
        }
      }

      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete("/:id", isAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If store owner, delete store and ratings
    if (user.role === "store_owner") {
      const store = await Store.findOne({ user_id: user._id });
      if (store) {
        await Rating.deleteMany({ store_id: store._id });
        await Store.deleteOne({ _id: store._id });
      }
    }

    // Delete user ratings
    await Rating.deleteMany({ user_id: user._id });

    // Delete user
    await User.deleteOne({ _id: user._id });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
