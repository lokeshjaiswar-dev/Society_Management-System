import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertTriangle, Plus, Search, Filter, 
  Edit, MessageSquare, Image, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { complaintAPI } from '../../services/api';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    images: []
  });

  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getAll();
      console.log('Complaints API response:', response);
      
      const complaintsData = response?.data?.data || [];
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      
      formData.images.forEach((image) => {
        submitData.append('images', image);
      });

      await complaintAPI.create(submitData);
      toast.success('Complaint raised successfully');
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'other',
        images: []
      });
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to raise complaint');
    }
  };

  const handleStatusUpdate = async (complaintId, status, comment = '') => {
    try {
      const updateData = { status };
      if (comment) {
        updateData.adminComments = comment;
      }
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
      }

      await complaintAPI.update(complaintId, updateData);
      toast.success(`Complaint marked as ${status}`);
      setSelectedComplaint(null);
      setAdminComment('');
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to update complaint status');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const filteredComplaints = Array.isArray(complaints) ? complaints.filter(complaint => {
    const title = complaint?.title || '';
    const description = complaint?.description || '';
    const status = complaint?.status || '';
    const category = complaint?.category || '';
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    const matchesCategory = filterCategory === 'all' || category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-orange-400 bg-orange-900/50 border-orange-800/30';
      case 'in-progress': return 'text-blue-400 bg-blue-900/50 border-blue-800/30';
      case 'resolved': return 'text-emerald-400 bg-emerald-900/50 border-emerald-800/30';
      case 'rejected': return 'text-red-400 bg-red-900/50 border-red-800/30';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'plumbing': return 'text-blue-400 bg-blue-900/20';
      case 'electrical': return 'text-yellow-400 bg-yellow-900/20';
      case 'cleaning': return 'text-green-400 bg-green-900/20';
      case 'security': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading complaints..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Complaints & Issues</h1>
          <p className="text-gray-400">
            Report and track issues in the society
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Raise Complaint
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { status: 'all', label: 'Total', count: complaints.length, color: 'gray' },
          { status: 'pending', label: 'Pending', count: complaints.filter(c => c?.status === 'pending').length, color: 'orange' },
          { status: 'in-progress', label: 'In Progress', count: complaints.filter(c => c?.status === 'in-progress').length, color: 'blue' },
          { status: 'resolved', label: 'Resolved', count: complaints.filter(c => c?.status === 'resolved').length, color: 'emerald' }
        ].map((stat) => (
          <div 
            key={stat.status}
            className="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-emerald-800/30 cursor-pointer hover:border-emerald-600/50 transition-colors"
            onClick={() => setFilterStatus(stat.status)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.count}</p>
              </div>
              <AlertTriangle className={`w-8 h-8 text-${stat.color}-400`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-emerald-800/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="cleaning">Cleaning</option>
            <option value="security">Security</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.map((complaint) => (
          <div
            key={complaint?._id}
            className="bg-black/50 backdrop-blur-lg rounded-2xl border border-emerald-800/30 hover:border-emerald-600/50 transition-all duration-300"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-white">{complaint?.title || 'Untitled Complaint'}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(complaint?.status)}`}>
                    {complaint?.status || 'pending'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(complaint?.category)}`}>
                    {complaint?.category || 'other'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{complaint?.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 mb-4">{complaint?.description || 'No description available'}</p>

              {/* Images */}
              {complaint?.images && Array.isArray(complaint.images) && complaint.images.length > 0 && (
                <div className="flex space-x-2 mb-4">
                  {complaint.images.map((image, index) => (
                    <img
                      key={index}
                      src={image?.url}
                      alt={`Complaint evidence ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(image?.url, '_blank')}
                    />
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{complaint?.raisedBy?.fullName || 'Resident'} • {complaint?.wing || 'A'}-{complaint?.flatNo || '101'}</span>
                  </div>
                  {complaint?.resolvedAt && (
                    <div className="flex items-center space-x-1 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Resolved on {new Date(complaint.resolvedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {user?.role === 'admin' && complaint?.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(complaint._id, 'in-progress')}
                      >
                        Start Progress
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Update
                      </Button>
                    </>
                  )}
                  {user?.role === 'admin' && complaint?.status === 'in-progress' && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>

              {/* Admin Comments */}
              {complaint?.adminComments && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-300 font-medium mb-1">Admin Comments:</p>
                  <p className="text-gray-400 text-sm">{complaint.adminComments}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredComplaints.length === 0 && (
        <div className="text-center py-12 bg-black/50 backdrop-blur-lg rounded-2xl border border-emerald-800/30">
          <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No complaints found</p>
          {searchTerm && (
            <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
          )}
        </div>
      )}

      {/* Raise Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-emerald-800/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-emerald-800/30">
              <h2 className="text-xl font-bold text-white">Raise New Complaint</h2>
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
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Detailed description of the issue..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Images (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Image className="w-8 h-8 text-gray-500" />
                    <span className="text-gray-400">Click to upload images</span>
                    <span className="text-gray-500 text-sm">Supports JPG, PNG (Max 5MB each)</span>
                  </label>
                </div>

                {/* Preview Images */}
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Submit Complaint
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      title: '',
                      description: '',
                      category: 'other',
                      images: []
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

      {/* Admin Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-emerald-800/30 w-full max-w-md">
            <div className="p-6 border-b border-emerald-800/30">
              <h2 className="text-xl font-bold text-white">Update Complaint</h2>
              <p className="text-gray-400 text-sm mt-1">{selectedComplaint?.title || 'Untitled Complaint'}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Update Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['in-progress', 'resolved', 'rejected'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusUpdate(selectedComplaint._id, status, adminComment)}
                      className="p-3 text-center border border-gray-700 rounded-lg hover:border-emerald-500 transition-colors text-gray-300 hover:text-white"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  rows={3}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Add comments for the resident..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => setSelectedComplaint(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;