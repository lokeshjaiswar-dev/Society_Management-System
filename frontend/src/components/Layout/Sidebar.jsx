import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  X, Home, Building, Megaphone, AlertTriangle, 
  CreditCard, Images, Users 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Flats & Residents', href: '/flats', icon: Building },
    { name: 'Notices', href: '/notices', icon: Megaphone },
    { name: 'Complaints', href: '/complaints', icon: AlertTriangle },
    { name: 'Maintenance', href: '/maintenance', icon: CreditCard },
    { name: 'Memory Lane', href: '/memory-lane', icon: Images },
  ];

  const isActive = (href) => location.pathname === href;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-black/80 backdrop-blur-lg border-r border-emerald-800/30
        transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-800/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Society Pro</h1>
              <p className="text-xs text-emerald-400">Management System</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-emerald-900/50 transition-colors"
          >
            <X className="w-5 h-5 text-emerald-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group
                  ${active 
                    ? 'bg-emerald-900/50 text-emerald-400 border-l-4 border-emerald-500' 
                    : 'text-gray-400 hover:bg-emerald-900/30 hover:text-emerald-300'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-400'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-4 left-4 right-4 p-4 bg-emerald-900/20 rounded-lg border border-emerald-800/30">
          <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
          <p className="text-xs text-emerald-400 truncate">{user?.email}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              {user?.wing}-{user?.flatNo}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              user?.role === 'admin' 
                ? 'bg-purple-900/50 text-purple-400' 
                : 'bg-blue-900/50 text-blue-400'
            }`}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-3 text-xs text-red-400 hover:text-red-300 transition-colors text-center"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;