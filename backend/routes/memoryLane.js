import express from 'express';
import MemoryPost from '../models/MemoryPost.js';
import { protect } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Create memory post
router.post('/', protect, uploadImages, async (req, res) => {
  try {
    const { title, description, eventDate } = req.body;
    
    let images = [];
    
    // Upload images to Cloudinary
    if (req.files) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'memory-lane' },
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
    
    const memoryPost = await MemoryPost.create({
      title,
      description,
      eventDate,
      images,
      postedBy: req.user.id
    });
    
    await memoryPost.populate('postedBy', 'fullName');
    
    res.status(201).json({
      success: true,
      data: memoryPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all memory posts
router.get('/', protect, async (req, res) => {
  try {
    const memoryPosts = await MemoryPost.find()
      .populate('postedBy', 'fullName')
      .populate('likes', 'fullName')
      .populate('comments.user', 'fullName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: memoryPosts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Like/unlike post
router.post('/:id/like', protect, async (req, res) => {
  try {
    const memoryPost = await MemoryPost.findById(req.params.id);
    
    if (!memoryPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const isLiked = memoryPost.likes.includes(req.user.id);
    
    if (isLiked) {
      memoryPost.likes = memoryPost.likes.filter(
        like => like.toString() !== req.user.id
      );
    } else {
      memoryPost.likes.push(req.user.id);
    }
    
    await memoryPost.save();
    
    res.status(200).json({
      success: true,
      data: memoryPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add comment
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    
    const memoryPost = await MemoryPost.findById(req.params.id);
    
    if (!memoryPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    memoryPost.comments.push({
      user: req.user.id,
      text
    });
    
    await memoryPost.save();
    
    await memoryPost.populate('comments.user', 'fullName');
    
    res.status(200).json({
      success: true,
      data: memoryPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;