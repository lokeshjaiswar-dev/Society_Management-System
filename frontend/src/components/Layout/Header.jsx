import React from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-black/50 backdrop-blur-lg border-b border-emerald-800/30">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section - Menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-emerald-900/50 transition-colors"
        >
          <Menu className="w-6 h-6 text-emerald-400" />
        </button>

        {/* Center section - Welcome message */}
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold gradient-text">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-sm text-gray-400">
            {user?.wing} - {user?.flatNo} • {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </p>
        </div>

        {/* Right section - User actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-emerald-900/50 transition-colors group">
            <Bell className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
          </button>

          {/* User dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-emerald-900/50 transition-colors">
              <User className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-gray-300 hidden sm:block">{user?.fullName}</span>
            </button>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-lg rounded-lg shadow-xl border border-emerald-800/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-4 border-b border-emerald-800/30">
                <p className="text-sm font-medium text-white">{user?.fullName}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2 p-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors rounded-b-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;