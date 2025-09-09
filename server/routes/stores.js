import express from 'express';
import { body, validationResult } from 'express-validator';
import { isAdmin, isStoreOwner } from '../middleware/auth.js';

import Store from '../models/Store.js';
import User from '../models/User.js';
import Rating from '../models/Rating.js';

const router = express.Router();

/**
 * @route   GET /api/stores
 * @desc    Get all stores
 * @access  Private
 */
router.get('/', async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : null;
  
  try {
    let query = Store.find().populate('user_id', 'name email role');
    if (limit) query = query.limit(limit);

    const stores = await query.sort({ createdAt: -1 }).lean();

    // Attach avg ratings dynamically
    const storesWithRatings = await Promise.all(stores.map(async (s) => {
      const ratings = await Rating.find({ store_id: s._id });
      const avgRating = ratings.length
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;
      return { ...s, avgRating };
    }));

    res.json(storesWithRatings);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stores/me
 * @desc    Get store for current store owner
 * @access  Private (Store Owner only)
 */
router.get('/me', isStoreOwner, async (req, res) => {
  try {
    const store = await Store.findOne({ user_id: req.user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const ratings = await Rating.find({ store_id: store._id });
    const avgRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.json({ ...store, avgRating });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stores/ratings
 * @desc    Get ratings for current store owner's store
 * @access  Private (Store Owner only)
 */
router.get('/ratings', isStoreOwner, async (req, res) => {
  try {
    const store = await Store.findOne({ user_id: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const ratings = await Rating.find({ store_id: store._id })
      .populate('user_id', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ storeId: store._id, ratings });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stores/:id
 * @desc    Get store by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).lean();

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const ratings = await Rating.find({ store_id: store._id });
    const avgRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.json({ ...store, avgRating });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/stores
 * @desc    Create new store
 * @access  Private (Admin only)
 */
router.post('/', [
  isAdmin,
  body('name').isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('address').isLength({ max: 400 }).withMessage('Address must not exceed 400 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, address, userId } = req.body;

  try {
    let user = null;

    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role !== 'store_owner') {
        user.role = 'store_owner';
        await user.save();
      }
    }

    const store = new Store({
      name,
      email,
      address,
      user_id: userId || null
    });

    await store.save();

    res.status(201).json(store);
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/stores/:id
 * @desc    Update store
 * @access  Private (Admin or Store Owner)
 */
router.put('/:id', [
  body('name').optional().isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('address').optional().isLength({ max: 400 }).withMessage('Address must not exceed 400 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (req.user.role !== 'admin' && store.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this store' });
    }

    if (req.body.name !== undefined) store.name = req.body.name;
    if (req.body.email !== undefined) store.email = req.body.email;
    if (req.body.address !== undefined) store.address = req.body.address;

    await store.save();

    res.json(store);
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/stores/:id
 * @desc    Delete store
 * @access  Private (Admin only)
 */
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    await Rating.deleteMany({ store_id: store._id });
    await store.deleteOne();

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
