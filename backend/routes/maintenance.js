import express from 'express';
import Razorpay from 'razorpay';
import Maintenance from '../models/Maintenance.js';
import { protect, authorize } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// Create maintenance bill (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const maintenance = await Maintenance.create(req.body);
    
    res.status(201).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get maintenance bills
router.get('/', protect, async (req, res) => {
  try {
    let maintenanceBills;
    
    if (req.user.role === 'admin') {
      maintenanceBills = await Maintenance.find()
        .populate('residentId', 'fullName email phoneNo')
        .sort({ createdAt: -1 });
    } else {
      maintenanceBills = await Maintenance.find({ residentId: req.user.id })
        .populate('residentId', 'fullName email phoneNo')
        .sort({ createdAt: -1 });
    }
    
    res.status(200).json({
      success: true,
      data: maintenanceBills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create Razorpay order
router.post('/:id/create-order', protect, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance bill not found'
      });
    }
    
    if (maintenance.residentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay this bill'
      });
    }
    
    const options = {
      amount: maintenance.amount * 100, // amount in paise
      currency: 'INR',
      receipt: `maintenance_${maintenance._id}`,
      payment_capture: 1
    };
    
    const order = await razorpay.orders.create(options);
    
    maintenance.razorpayOrderId = order.id;
    await maintenance.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify payment
router.post('/:id/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance bill not found'
      });
    }
    
    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    if (generated_signature === razorpay_signature) {
      maintenance.status = 'paid';
      maintenance.razorpayPaymentId = razorpay_payment_id;
      maintenance.paymentDate = new Date();
      await maintenance.save();
      
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;