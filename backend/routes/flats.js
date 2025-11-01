import express from 'express';
import Flat from '../models/Flat.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create flat (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const flat = await Flat.create(req.body);
    
    res.status(201).json({
      success: true,
      data: flat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all flats
router.get('/', protect, async (req, res) => {
  try {
    const flats = await Flat.find().populate('residentId', 'fullName email phoneNo');
    
    res.status(200).json({
      success: true,
      data: flats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update flat (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const flat = await Flat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: flat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete flat (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Flat.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Flat deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;