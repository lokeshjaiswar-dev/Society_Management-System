import express from 'express';
import Notice from '../models/Notice.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create notice (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const notice = await Notice.create(req.body);
    
    res.status(201).json({
      success: true,
      data: notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all notices
router.get('/', protect, async (req, res) => {
  try {
    const notices = await Notice.find({ isActive: true })
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: notices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update notice (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete notice (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;