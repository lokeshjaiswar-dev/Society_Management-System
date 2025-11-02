import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building, Users, Bell, CreditCard, MessageSquare, 
  Image, Shield, Star, ArrowRight, Menu, X,
  ChevronLeft, ChevronRight, MapPin, Phone, Mail,
  CheckCircle, ArrowUpRight
} from 'lucide-react';
import Button from '../Common/Button';
import Chatbot from './Chatbot';

const MainPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const features = [
    {
      icon: Building,
      title: 'Flat Management',
      description: 'Manage all residential flats, track occupancy, and maintain resident details efficiently.'
    },
    {
      icon: Bell,
      title: 'Notice Board',
      description: 'Share important announcements and updates with all society members instantly.'
    },
    {
      icon: MessageSquare,
      title: 'Complaint System',
      description: 'Raise and track complaints with image support and real-time status updates.'
    },
    {
      icon: CreditCard,
      title: 'Maintenance',
      description: 'Generate and pay maintenance bills online with secure payment integration.'
    },
    {
      icon: Image,
      title: 'Memory Lane',
      description: 'Share and cherish society events and memories with photo galleries.'
    },
    {
      icon: Users,
      title: 'Community Chat',
      description: 'Connect with neighbors and build a stronger community together.'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Resident, Wing A',
      content: 'This system has made society management so transparent and efficient. Love the maintenance payment feature!',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Secretary',
      content: 'As an admin, I can easily manage all society operations. The complaint tracking system is fantastic.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Resident, Wing B',
      content: 'The memory lane feature helped us reconnect with neighbors during festivals. Great community builder!',
      rating: 4
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false); // Close mobile menu after clicking
  };

  // Handle navigation to authenticated routes
  const handleNavigateToAuth = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-emerald-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Society Pro</h1>
                <p className="text-xs text-emerald-400 hidden sm:block">Management System</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-300 hover:text-emerald-400 transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-300 hover:text-emerald-400 transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('reviews')}
                className="text-gray-300 hover:text-emerald-400 transition-colors"
              >
                Reviews
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-gray-300 hover:text-emerald-400 transition-colors"
              >
                Contact
              </button>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => handleNavigateToAuth('/login')}
                className="px-4 py-2 border border-emerald-600 text-emerald-400 rounded-lg hover:bg-emerald-900/50 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => handleNavigateToAuth('/register')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-emerald-900/50 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg border-b border-emerald-800/30">
            <div className="px-4 py-6 space-y-4">
              <button 
                onClick={() => scrollToSection('about')}
                className="block w-full text-left text-gray-300 hover:text-emerald-400 transition-colors py-2"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="block w-full text-left text-gray-300 hover:text-emerald-400 transition-colors py-2"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('reviews')}
                className="block w-full text-left text-gray-300 hover:text-emerald-400 transition-colors py-2"
              >
                Reviews
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left text-gray-300 hover:text-emerald-400 transition-colors py-2"
              >
                Contact
              </button>
              <div className="pt-4 space-y-3 border-t border-emerald-800/30">
                <button 
                  onClick={() => handleNavigateToAuth('/login')}
                  className="w-full px-4 py-2 border border-emerald-600 text-emerald-400 rounded-lg hover:bg-emerald-900/50 transition-colors text-center"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleNavigateToAuth('/register')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-colors text-center"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Modern Society
              <span className="gradient-text block">Management</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Streamline your residential society operations with our all-in-one management platform. 
              From maintenance to community building, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => handleNavigateToAuth('/register')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-colors flex items-center group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => handleNavigateToAuth('/login')}
                className="px-6 py-3 border border-emerald-600 text-emerald-400 rounded-lg hover:bg-emerald-900/50 transition-colors"
              >
                Existing User? Sign In
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">500+</div>
              <div className="text-gray-400 text-sm">Societies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">50K+</div>
              <div className="text-gray-400 text-sm">Residents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">₹10M+</div>
              <div className="text-gray-400 text-sm">Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">99%</div>
              <div className="text-gray-400 text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What is Society Pro?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A comprehensive digital platform designed to transform how residential societies operate, 
              communicate, and thrive in the modern world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Revolutionizing Community Living</h3>
              <p className="text-gray-300 mb-6">
                Society Pro brings together all aspects of residential society management into one 
                seamless platform. We eliminate paperwork, reduce conflicts, and build stronger 
                communities through technology.
              </p>
              <div className="space-y-4">
                {[
                  'Digital notice boards and announcements',
                  'Online maintenance payment system',
                  'Complaint and issue tracking',
                  'Resident directory and flat management',
                  'Event sharing and memory galleries',
                  'Secure and transparent operations'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/50 to-green-900/50 rounded-2xl p-8 border border-emerald-800/30">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-black/50 rounded-xl p-6 text-center border border-emerald-800/30">
                  <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Secure</h4>
                  <p className="text-sm text-gray-400">Bank-level security for all transactions</p>
                </div>
                <div className="bg-black/50 rounded-xl p-6 text-center border border-emerald-800/30">
                  <Users className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Collaborative</h4>
                  <p className="text-sm text-gray-400">Build stronger community bonds</p>
                </div>
                <div className="bg-black/50 rounded-xl p-6 text-center border border-emerald-800/30">
                  <CreditCard className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Convenient</h4>
                  <p className="text-sm text-gray-400">Everything at your fingertips</p>
                </div>
                <div className="bg-black/50 rounded-xl p-6 text-center border border-emerald-800/30">
                  <Building className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Scalable</h4>
                  <p className="text-sm text-gray-400">Grows with your society</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to manage your residential society efficiently and effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-emerald-800/30 hover:border-emerald-600/50 transition-all duration-300 group hover:transform hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:from-emerald-500 group-hover:to-green-500 transition-colors">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-300">
              Join thousands of satisfied residents and society managers.
            </p>
          </div>

          <div className="relative">
            {/* Testimonial Slider */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-emerald-800/30 text-center">
                      {/* Stars */}
                      <div className="flex justify-center mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-5 h-5 ${
                              i < testimonial.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <p className="text-lg text-gray-300 mb-6 italic">
                        "{testimonial.content}"
                      </p>
                      
                      <div>
                        <p className="font-semibold text-white">{testimonial.name}</p>
                        <p className="text-emerald-400 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors shadow-lg"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-emerald-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Society?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the modern way of society management today.
          </p>
          <button 
            onClick={() => handleNavigateToAuth('/register')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-colors flex items-center group mx-auto"
          >
            Start Your Free Trial
            <ArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-black/80 backdrop-blur-lg border-t border-emerald-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold gradient-text">Society Pro</h3>
                  <p className="text-sm text-emerald-400">Management System</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Modernizing residential society management with cutting-edge technology 
                and user-friendly solutions for better community living.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Mumbai-86, Maharashtra</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-white mb-4">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">+91 9699432919</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">lokeshjaiswar.dev@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => scrollToSection('about')}
                  className="block text-gray-400 hover:text-emerald-400 transition-colors text-sm text-left w-full"
                >
                  About Us
                </button>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="block text-gray-400 hover:text-emerald-400 transition-colors text-sm text-left w-full"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('reviews')}
                  className="block text-gray-400 hover:text-emerald-400 transition-colors text-sm text-left w-full"
                >
                  Testimonials
                </button>
                <button 
                  onClick={() => handleNavigateToAuth('/login')}
                  className="block text-gray-400 hover:text-emerald-400 transition-colors text-sm text-left w-full"
                >
                  Login
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-emerald-800/30 mt-12 pt-12 flex flex-col justify-center items-center text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Society Pro. All rights reserved.
            </p>
            <p className="text-emerald-400 text-sm mt-2">
              Developed with ❤️ by Lokesh
            </p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default MainPage;