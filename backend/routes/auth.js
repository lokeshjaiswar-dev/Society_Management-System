import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Flat from '../models/Flat.js';
import { protect } from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Register - OPTIMIZED VERSION
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, wing, flatNo, phoneNo, password, confirmPassword } = req.body;

    // Input validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate wing and flatNo
    if (!wing || !flatNo) {
      return res.status(400).json({ 
        success: false, 
        message: "Wing and Flat No are required for registration" 
      });
    }

    // Check if flat exists
    const flat = await Flat.findOne({ wing: wing.toUpperCase(), flatNo });
    if (!flat) {
      return res.status(400).json({
        success: false,
        message: `Flat ${wing}-${flatNo} not found. Please contact admin to add this flat first.`
      });
    }

    // Generate OTP
    const verificationOTP = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create user
    const user = await User.create({
      fullName,
      email,
      wing,
      flatNo,
      phoneNo,
      password,
      verificationOTP,
      otpExpires
    });

    // Send response immediately without waiting for email
    res.status(201).json({
      success: true,
      message: 'OTP sent to email. Please verify your account.',
      userId: user._id
    });

    // Send email in background (don't await)
    sendEmail({
      email: user.email,
      subject: 'Email Verification OTP - SocietyPro',
      message: `Your OTP for email verification is: ${verificationOTP}. This OTP is valid for 10 minutes.`
    }).catch(emailError => {
      // Log email error but don't affect the user registration
      console.error('Email sending failed (non-critical):', emailError);
      // Optional: You can implement retry logic here
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // More specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Verify OTP - OPTIMIZED
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    // Find user and validate OTP in single query if possible
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user'
      });
    }

    // Check OTP validity
    if (user.verificationOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Update user and generate token
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        wing: user.wing,
        flatNo: user.flatNo
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
});

// Login - OPTIMIZED
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Single query with password selection
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.correctPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        wing: user.wing,
        flatNo: user.flatNo
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        wing: user.wing,
        flatNo: user.flatNo,
        phoneNo: user.phoneNo
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
});

export default router;