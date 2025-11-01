import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Megaphone, Plus, Search, Edit, Trash2, 
  Eye, Calendar, Filter
} from 'lucide-react';
import { noticeAPI } from '../../services/api';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const Notices = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium'
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await noticeAPI.getAll();
      console.log('Notices API response:', response);
      
      const noticesData = response?.data?.data || [];
      setNotices(Array.isArray(noticesData) ? noticesData : []);
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to load notices');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await noticeAPI.update(editingNotice._id, formData);
        toast.success('Notice updated successfully');
      } else {
        await noticeAPI.create(formData);
        toast.success('Notice created successfully');
      }
      setShowModal(false);
      setEditingNotice(null);
      setFormData({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium'
      });
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice?.title || '',
      content: notice?.content || '',
      category: notice?.category || 'general',
      priority: notice?.priority || 'medium'
    });
    setShowModal(true);
  };

  const handleDelete = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      await noticeAPI.delete(noticeId);
      toast.success('Notice deleted successfully');
      fetchNotices();
    } catch (error) {
      toast.error('Failed to delete notice');
    }
  };

  const filteredNotices = Array.isArray(notices) ? notices.filter(notice => {
    const title = notice?.title || '';
    const content = notice?.content || '';
    const category = notice?.category || '';
    const priority = notice?.priority || '';
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || category === filterCategory;
    const matchesPriority = filterPriority === 'all' || priority === filterPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  }) : [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/50 border-red-800/30';
      case 'medium': return 'text-orange-400 bg-orange-900/50 border-orange-800/30';
      case 'low': return 'text-blue-400 bg-blue-900/50 border-blue-800/30';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'emergency': return 'text-red-400 bg-red-900/20';
      case 'maintenance': return 'text-orange-400 bg-orange-900/20';
      case 'event': return 'text-purple-400 bg-purple-900/20';
      default: return 'text-emerald-400 bg-emerald-900/20';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading notices..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notice Board</h1>
          <p className="text-gray-400">
            Important announcements and updates for all residents
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Notice
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-emerald-800/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="maintenance">Maintenance</option>
            <option value="event">Event</option>
            <option value="emergency">Emergency</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredNotices.map((notice) => (
          <div
            key={notice?._id}
            className="bg-black/50 backdrop-blur-lg rounded-2xl border border-emerald-800/30 hover:border-emerald-600/50 transition-all duration-300 group"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(notice?.category)}`}>
                    {notice?.category || 'general'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notice?.priority)}`}>
                    {notice?.priority || 'medium'}
                  </span>
                </div>
                {user?.role === 'admin' && (
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(notice)}
                      className="p-1 text-blue-400 hover:bg-blue-900/30 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(notice._id)}
                      className="p-1 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                {notice?.title || 'Untitled Notice'}
              </h3>
              <p className="text-gray-400 mb-4 line-clamp-3">
                {notice?.content || 'No content available'}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>All Residents</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{notice?.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                  </div>
                </div>
                <span className="text-emerald-400">
                  {notice?.createdBy?.fullName || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotices.length === 0 && (
        <div className="text-center py-12 bg-black/50 backdrop-blur-lg rounded-2xl border border-emerald-800/30">
          <Megaphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No notices found</p>
          {searchTerm && (
            <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-emerald-800/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-emerald-800/30">
              <h2 className="text-xl font-bold text-white">
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter notice title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="event">Event</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Enter notice content..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                >
                  {editingNotice ? 'Update Notice' : 'Create Notice'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingNotice(null);
                    setFormData({
                      title: '',
                      content: '',
                      category: 'general',
                      priority: 'medium'
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;