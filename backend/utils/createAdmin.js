import User from '../models/User.js';
import connectDB from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ email: 'admin@society.com' });
    
    if (!adminExists) {
      const admin = await User.create({
        fullName: 'Society Admin',
        email: 'admin@society.com',
        // wing: 'A',
        // flatNo: '101',
        phoneNo: '9876543210',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });
      
      console.log('Admin user created successfully:', admin.email);
    } else {
      console.log('Admin user already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();