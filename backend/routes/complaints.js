import express from 'express';
import Complaint from '../models/Complaint.js';
import { protect } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Create complaint
router.post('/', protect, uploadImages, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    let images = [];
    
    // Upload images to Cloudinary
    if (req.files) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'complaints' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });
        
        images.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    }
    
    const complaint = await Complaint.create({
      title,
      description,
      category,
      images,
      raisedBy: req.user.id,
      wing: req.user.wing,
      flatNo: req.user.flatNo
    });
    
    await complaint.populate('raisedBy', 'fullName wing flatNo');
    
    res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all complaints (Admin sees all, residents see only their own)
router.get('/', protect, async (req, res) => {
  try {
    let complaints;
    
    if (req.user.role === 'admin') {
      complaints = await Complaint.find()
        .populate('raisedBy', 'fullName wing flatNo phoneNo')
        .sort({ createdAt: -1 });
    } else {
      complaints = await Complaint.find({ raisedBy: req.user.id })
        .populate('raisedBy', 'fullName wing flatNo phoneNo')
        .sort({ createdAt: -1 });
    }
    
    res.status(200).json({
      success: true,
      data: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update complaint status (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Only admin can update status and add comments
    if (req.user.role === 'admin') {
      if (req.body.status === 'resolved') {
        req.body.resolvedAt = new Date();
      }
      
      const updatedComplaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('raisedBy', 'fullName wing flatNo phoneNo');
      
      return res.status(200).json({
        success: true,
        data: updatedComplaint
      });
    }
    
    // Residents can only update their own complaints if status is pending
    if (complaint.raisedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this complaint'
      });
    }
    
    if (complaint.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending complaints'
      });
    }
    
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('raisedBy', 'fullName wing flatNo phoneNo');
    
    res.status(200).json({
      success: true,
      data: updatedComplaint
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;