import express from 'express';
import Razorpay from 'razorpay';
import Maintenance from '../models/Maintenance.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Initialize Razorpay with error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
  });
  console.log('✅ Razorpay initialized successfully');
} catch (error) {
  console.error('❌ Razorpay initialization failed:', error.message);
  razorpay = null;
}

// Create maintenance bill (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { wing, flatNo, amount, month, year, dueDate } = req.body;

    console.log('Creating maintenance bill for:', { wing, flatNo, amount, month, year, dueDate });

    // Validate required fields
    if (!wing || !flatNo || !amount || !month || !year || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: wing, flatNo, amount, month, year, dueDate'
      });
    }

    // Find resident by wing and flatNo
    const resident = await User.findOne({ 
      wing: wing.toUpperCase(), 
      flatNo: flatNo,
      role: 'resident'
    });

    console.log('Found resident:', resident);

    if (!resident) {
      return res.status(400).json({
        success: false,
        message: `No resident found for ${wing}-${flatNo}. Please assign a resident to this flat first.`
      });
    }

    // Check if maintenance bill already exists for this period
    const existingBill = await Maintenance.findOne({
      wing: wing.toUpperCase(),
      flatNo: flatNo,
      month: month,
      year: year
    });

    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: `Maintenance bill already exists for ${wing}-${flatNo} for ${month} ${year}`
      });
    }

    // Create maintenance with residentId
    const maintenance = await Maintenance.create({
      residentId: resident._id,
      wing: wing.toUpperCase(),
      flatNo,
      amount: parseFloat(amount),
      month,
      year: parseInt(year),
      dueDate: new Date(dueDate)
    });

    // Populate the resident info in response
    await maintenance.populate('residentId', 'fullName email phoneNo');
    
    res.status(201).json({
      success: true,
      data: maintenance,
      message: `Maintenance bill created successfully for ${resident.fullName}`
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${errors.join(', ')}`
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate maintenance bill found for this period'
      });
    }
    
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
    console.error('Get maintenance bills error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create Razorpay order
router.post('/:id/create-order', protect, async (req, res) => {
  try {
    console.log('Creating Razorpay order for maintenance ID:', req.params.id);
    
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway is not configured. Please contact administrator.'
      });
    }

    // Check Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
      console.error('Razorpay credentials missing in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway configuration error'
      });
    }

    console.log('Razorpay Key ID exists:', !!process.env.RAZORPAY_KEY_ID);
    console.log('Razorpay Secret exists:', !!process.env.RAZORPAY_SECRET);

    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance bill not found'
      });
    }
    
    if (maintenance.residentId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay this bill'
      });
    }

    if (maintenance.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This bill has already been paid'
      });
    }

    const options = {
      amount: Math.round(maintenance.amount * 100), // amount in paise
      currency: 'INR',
      receipt: `maintenance_${maintenance._id}_${Date.now()}`,
      payment_capture: 1
    };

    console.log('Creating Razorpay order with options:', options);
    
    const order = await razorpay.orders.create(options);
    
    console.log('✅ Razorpay order created successfully:', order.id);

    maintenance.razorpayOrderId = order.id;
    await maintenance.save();
    
    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('❌ Create Razorpay order error:', error);
    
    // Handle Razorpay authentication errors
    if (error.statusCode === 401) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway authentication failed. Please check Razorpay credentials.'
      });
    }
    
    if (error.error && error.error.description) {
      return res.status(400).json({
        success: false,
        message: `Payment error: ${error.error.description}`
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
});

// Simulated payment for development
router.post('/:id/simulate-payment', protect, async (req, res) => {
  try {
    console.log('Simulating payment for maintenance ID:', req.params.id);
    
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance bill not found'
      });
    }
    
    // Check authorization
    if (maintenance.residentId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay this bill'
      });
    }

    if (maintenance.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This bill has already been paid'
      });
    }

    // Simulate payment success
    maintenance.status = 'paid';
    maintenance.paymentDate = new Date();
    maintenance.razorpayPaymentId = `simulated_${Date.now()}`;
    await maintenance.save();

    await maintenance.populate('residentId', 'fullName email phoneNo');

    res.status(200).json({
      success: true,
      message: 'Payment simulated successfully',
      data: maintenance
    });

  } catch (error) {
    console.error('Simulate payment error:', error);
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
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get maintenance bill by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('residentId', 'fullName email phoneNo wing flatNo');
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance bill not found'
      });
    }

    // Check if user is authorized to view this bill
    if (maintenance.residentId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this bill'
      });
    }
    
    res.status(200).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Get maintenance by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update maintenance bill (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('residentId', 'fullName email phoneNo');

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance bill not found'
      });
    }

    res.status(200).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete maintenance bill (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance bill not found'
      });
    }

    await Maintenance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Maintenance bill deleted successfully'
    });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Bulk create maintenance bills (Admin only)
router.post('/bulk', protect, authorize('admin'), async (req, res) => {
  try {
    const { bills } = req.body;

    if (!bills || !Array.isArray(bills) || bills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bills array is required'
      });
    }

    const createdBills = [];
    const errors = [];

    for (const billData of bills) {
      try {
        const { wing, flatNo, amount, month, year, dueDate } = billData;

        // Find resident by wing and flatNo
        const resident = await User.findOne({ 
          wing: wing.toUpperCase(), 
          flatNo: flatNo,
          role: 'resident'
        });

        if (!resident) {
          errors.push(`No resident found for ${wing}-${flatNo}`);
          continue;
        }

        // Check if maintenance bill already exists for this period
        const existingBill = await Maintenance.findOne({
          wing: wing.toUpperCase(),
          flatNo: flatNo,
          month: month,
          year: year
        });

        if (existingBill) {
          errors.push(`Bill already exists for ${wing}-${flatNo} (${month} ${year})`);
          continue;
        }

        // Create maintenance bill
        const maintenance = await Maintenance.create({
          residentId: resident._id,
          wing: wing.toUpperCase(),
          flatNo,
          amount: parseFloat(amount),
          month,
          year: parseInt(year),
          dueDate: new Date(dueDate)
        });

        await maintenance.populate('residentId', 'fullName email phoneNo');
        createdBills.push(maintenance);

      } catch (error) {
        errors.push(`Error creating bill for ${billData.wing}-${billData.flatNo}: ${error.message}`);
      }
    }

    res.status(201).json({
      success: true,
      data: createdBills,
      createdCount: createdBills.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Created ${createdBills.length} maintenance bills successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
    });

  } catch (error) {
    console.error('Bulk create maintenance error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;