import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building, Users, Bell, AlertTriangle, 
  CreditCard, Image, TrendingUp, Calendar,
  Eye, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { flatAPI, noticeAPI, complaintAPI, maintenanceAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import Chatbot from '../MainPage/Chatbot';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFlats: 0,
    occupiedFlats: 0,
    pendingComplaints: 0,
    unpaidMaintenance: 0,
    recentNotices: 0
  });
  const [recentNotices, setRecentNotices] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel with error handling
      const [flatsRes, noticesRes, complaintsRes, maintenanceRes] = await Promise.allSettled([
        flatAPI.getAll().catch(err => ({ data: { data: [] } })),
        noticeAPI.getAll().catch(err => ({ data: { data: [] } })),
        complaintAPI.getAll().catch(err => ({ data: { data: [] } })),
        maintenanceAPI.getAll().catch(err => ({ data: { data: [] } }))
      ]);

      // Extract data safely
      const flats = flatsRes.status === 'fulfilled' ? flatsRes.value?.data?.data || [] : [];
      const notices = noticesRes.status === 'fulfilled' ? noticesRes.value?.data?.data || [] : [];
      const complaints = complaintsRes.status === 'fulfilled' ? complaintsRes.value?.data?.data || [] : [];
      const maintenance = maintenanceRes.status === 'fulfilled' ? maintenanceRes.value?.data?.data || [] : [];

      console.log('📊 Maintenance data for dashboard:', maintenance); // Debug log

      // Calculate stats safely
      const totalFlats = Array.isArray(flats) ? flats.length : 0;
      const occupiedFlats = Array.isArray(flats) ? flats.filter(flat => flat?.status === 'occupied').length : 0;
      
      const pendingComplaints = Array.isArray(complaints) ? 
        complaints.filter(comp => comp?.status === 'pending').length : 0;
      
      // ✅ FIXED: Properly check residentId for unpaid maintenance
      const unpaidMaintenance = user?.role === 'admin' 
        ? (Array.isArray(maintenance) ? maintenance.filter(m => m?.status === 'pending').length : 0)
        : (Array.isArray(maintenance) ? maintenance.filter(m => {
            // Check both possible structures: m.residentId (ObjectId) or m.residentId._id
            const residentId = m?.residentId?._id || m?.residentId;
            return residentId === user?.id && m?.status === 'pending';
          }).length : 0);

      console.log('💰 Unpaid maintenance count:', unpaidMaintenance); // Debug log

      setStats({
        totalFlats,
        occupiedFlats,
        pendingComplaints,
        unpaidMaintenance,
        recentNotices: Array.isArray(notices) ? notices.length : 0
      });

      // Set recent data safely
      setRecentNotices(Array.isArray(notices) ? notices.slice(0, 5) : []);
      setRecentComplaints(Array.isArray(complaints) ? complaints.slice(0, 5) : []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Set default empty state on error
      setStats({
        totalFlats: 0,
        occupiedFlats: 0,
        pendingComplaints: 0,
        unpaidMaintenance: 0,
        recentNotices: 0
      });
      setRecentNotices([]);
      setRecentComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, description, color = 'emerald' }) => {
    // Safe color classes
    const colorClasses = {
      emerald: 'bg-emerald-900/50 border-emerald-800/30 text-emerald-400',
      blue: 'bg-blue-900/50 border-blue-800/30 text-blue-400',
      orange: 'bg-orange-900/50 border-orange-800/30 text-orange-400',
      red: 'bg-red-900/50 border-red-800/30 text-red-400'
    };

    return (
      <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-emerald-800/30 hover:border-emerald-600/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-sm ${
              trend > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
        <p className="text-gray-400 text-sm">{title}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-2">{description}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 rounded-2xl p-8 border border-emerald-800/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.fullName || 'User'}! 👋
            </h1>
            <p className="text-gray-300 text-lg">
              Here's what's happening in your society today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-2 bg-black/50 rounded-lg px-4 py-2 border border-emerald-800/30">
              <Building className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-medium">{user?.wing}-{user?.flatNo}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                user?.role === 'admin' 
                  ? 'bg-purple-900/50 text-purple-400' 
                  : 'bg-blue-900/50 text-blue-400'
              }`}>
                {user?.role || 'resident'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Flats"
          value={stats.totalFlats}
          icon={Building}
          trend={2.5}
          color="blue"
        />
        <StatCard
          title="Occupied Flats"
          value={stats.occupiedFlats}
          icon={Users}
          description={stats.totalFlats > 0 ? `${((stats.occupiedFlats / stats.totalFlats) * 100).toFixed(1)}% occupancy` : '0% occupancy'}
          color="emerald"
        />
        <StatCard
          title="Pending Complaints"
          value={stats.pendingComplaints}
          icon={AlertTriangle}
          trend={-1.2}
          color="orange"
        />
        <StatCard
          title="Unpaid Maintenance"
          value={stats.unpaidMaintenance}
          icon={CreditCard}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Notices */}
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-emerald-800/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Bell className="w-5 h-5 text-emerald-400" />
              <span>Recent Notices</span>
            </h2>
            <span className="text-emerald-400 text-sm bg-emerald-900/50 px-3 py-1 rounded-full">
              {recentNotices.length} new
            </span>
          </div>

          <div className="space-y-4">
            {recentNotices.length > 0 ? (
              recentNotices.map((notice) => (
                <div
                  key={notice?._id || Math.random()}
                  className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-emerald-800/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {notice?.title || 'Untitled Notice'}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      notice?.priority === 'high' 
                        ? 'bg-red-900/50 text-red-400'
                        : notice?.priority === 'medium'
                        ? 'bg-orange-900/50 text-orange-400'
                        : 'bg-blue-900/50 text-blue-400'
                    }`}>
                      {notice?.priority || 'medium'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {notice?.content || 'No content available'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>By {notice?.createdBy?.fullName || 'Admin'}</span>
                    <span>{notice?.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notices yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-emerald-800/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span>Recent Complaints</span>
            </h2>
            <span className="text-orange-400 text-sm bg-orange-900/50 px-3 py-1 rounded-full">
              {recentComplaints.filter(c => c?.status === 'pending').length} pending
            </span>
          </div>

          <div className="space-y-4">
            {recentComplaints.length > 0 ? (
              recentComplaints.map((complaint) => (
                <div
                  key={complaint?._id || Math.random()}
                  className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-orange-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{complaint?.title || 'Untitled Complaint'}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      complaint?.status === 'pending'
                        ? 'bg-orange-900/50 text-orange-400'
                        : complaint?.status === 'resolved'
                        ? 'bg-green-900/50 text-green-400'
                        : complaint?.status === 'in-progress'
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      {complaint?.status || 'pending'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {complaint?.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{complaint?.raisedBy?.fullName || 'Resident'} • {complaint?.category || 'other'}</span>
                    <span>{complaint?.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No complaints yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-emerald-800/30">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Bell, label: 'Post Notice', href: '/notices', color: 'blue', adminOnly: true },
            { icon: AlertTriangle, label: 'Raise Complaint', href: '/complaints', color: 'orange' },
            { icon: CreditCard, label: 'Pay Maintenance', href: '/maintenance', color: 'emerald' },
            { icon: Image, label: 'Share Memory', href: '/memory-lane', color: 'purple' }
          ]
          .filter(action => !action.adminOnly || user?.role === 'admin')
          .map((action, index) => {
            const Icon = action.icon;
            const colorClasses = {
              blue: 'bg-blue-900/20 border-blue-800/30 text-blue-400 hover:bg-blue-900/40 hover:border-blue-700/50',
              orange: 'bg-orange-900/20 border-orange-800/30 text-orange-400 hover:bg-orange-900/40 hover:border-orange-700/50',
              emerald: 'bg-emerald-900/20 border-emerald-800/30 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-700/50',
              purple: 'bg-purple-900/20 border-purple-800/30 text-purple-400 hover:bg-purple-900/40 hover:border-purple-700/50'
            };

            return (
              <a
                key={index}
                href={action.href}
                className={`p-4 rounded-xl border transition-all duration-200 group text-center ${colorClasses[action.color]}`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">{action.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-emerald-800/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>Upcoming Events</span>
          </h2>
          <span className="text-purple-400 text-sm bg-purple-900/50 px-3 py-1 rounded-full">
            This month
          </span>
        </div>

        <div className="space-y-4">
          {[
            {
              title: 'General Body Meeting',
              date: 'February 15, 2024',
              time: '6:00 PM',
              location: 'Society Clubhouse',
              type: 'meeting'
            },
            {
              title: 'Holi Celebration',
              date: 'March 8, 2024',
              time: '4:00 PM',
              location: 'Central Garden',
              type: 'festival'
            },
            {
              title: 'Maintenance Due',
              date: 'February 28, 2024',
              time: 'All day',
              location: 'Online Payment',
              type: 'payment'
            }
          ].map((event, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-purple-800/50 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                event.type === 'meeting' 
                  ? 'bg-blue-900/50 border border-blue-800/30'
                  : event.type === 'festival'
                  ? 'bg-green-900/50 border border-green-800/30'
                  : 'bg-orange-900/50 border border-orange-800/30'
              }`}>
                <Calendar className={`w-6 h-6 ${
                  event.type === 'meeting' 
                    ? 'text-blue-400'
                    : event.type === 'festival'
                    ? 'text-green-400'
                    : 'text-orange-400'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{event.title}</h3>
                <p className="text-gray-400 text-sm">
                  {event.date} • {event.time}
                </p>
                <p className="text-gray-500 text-xs">{event.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Dashboard;