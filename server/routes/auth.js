import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { authenticateJWT } from "../middleware/auth.js";

import User from "../models/User.js";

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // ✅ Find user
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      // ✅ Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      // ✅ Create JWT payload
      const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", {
        expiresIn: "24h",
      });

      // ✅ Remove password from response
      const { password: _, ...userWithoutPassword } = user.toObject();

      res.json({ success: true, token, user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  "/register",
  [
    body("name").isLength({ min: 3, max: 60 }).withMessage("Name must be between 3 and 60 characters"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 8, max: 16 })
      .withMessage("Password must be between 8 and 16 characters")
      .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
      .matches(/[!@#$%^&*]/).withMessage("Password must contain at least one special character"),
    body("address").isLength({ max: 400 }).withMessage("Address must not exceed 400 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address } = req.body;

    try {
      // ✅ Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "User already exists" });

      // ✅ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        address,
        role: "user",
      });

      const { password: _, ...userWithoutPassword } = user.toObject();

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   PUT /api/auth/update-password
 * @desc    Update user password
 * @access  Private
 */
router.put(
  "/update-password",
  [
    authenticateJWT,
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8, max: 16 })
      .withMessage("Password must be between 8 and 16 characters")
      .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
      .matches(/[!@#$%^&*]/).withMessage("Password must contain at least one special character"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // ✅ Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

      // ✅ Hash new password
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @route   POST /api/admin/add-user
 * @desc    Admin add new user with role
 * @access  Public (temporary)
 */
router.post(
  "/add-user",
  [
    body("name").notEmpty().trim().withMessage("Username is required"),
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("role").isIn(["user", "admin", "store_owner"]).withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, address } = req.body;

    try {
      // ✅ Check email uniqueness
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "Email already taken" });

      // ✅ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Create user with role
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        address,
      });

      const { password: _, ...userWithoutPassword } = user.toObject();

      res.status(201).json({ message: "User added successfully", user: userWithoutPassword });
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
