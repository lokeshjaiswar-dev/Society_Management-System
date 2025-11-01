import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Building, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../Common/Button';
import toast from 'react-hot-toast';

const Verification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP } = useAuth();

  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate('/register');
    }
  }, [userId, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp(prev => prev.map((d, idx) => (idx === index ? element.value : d)));

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
      setOtp(prev => prev.map((d, idx) => (idx === index ? '' : d)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);

    const result = await verifyOTP(userId, otpValue);
    
    if (result.success) {
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const resendOTP = () => {
    setTimer(60);
    toast.success('OTP has been resent to your email');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-gray-400">Enter the 6-digit code sent to your email</p>
        </div>

        {/* Verification Form */}
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl border border-emerald-800/30 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                6-Digit Verification Code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={e => handleOtpChange(e.target, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    onFocus={e => e.target.select()}
                    className="w-12 h-12 text-center text-xl font-semibold bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            {timer > 0 && (
              <p className="text-center text-orange-400 text-sm">
                Resend OTP in {timer} seconds
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full py-3 text-base"
            >
              Verify Email
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              <button
                type="button"
                onClick={resendOTP}
                disabled={timer > 0}
                className={`text-sm font-medium ${
                  timer > 0 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-emerald-400 hover:text-emerald-300'
                } transition-colors`}
              >
                Didn't receive code? Resend OTP
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Wrong email?{' '}
              <Link 
                to="/register" 
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Go back
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Verification;