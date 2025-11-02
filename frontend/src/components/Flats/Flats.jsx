import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building, Plus, Search, Edit, Trash2, 
  User, Home, Users, Eye
} from 'lucide-react';
import { flatAPI } from '../../services/api';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const Flats = () => {
  const { user } = useAuth();
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFlat, setEditingFlat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    wing: '',
    flatNo: '',
    status: 'vacant',
    ownerName: '',
    isTenant: false
  });

  useEffect(() => {
    fetchFlats();
  }, []);

  const fetchFlats = async () => {
    try {
      setLoading(true);
      const response = await flatAPI.getAll();
      console.log('Flats API response:', response);
      
      const flatsData = response?.data?.data || [];
      setFlats(Array.isArray(flatsData) ? flatsData : []);
    } catch (error) {
      console.error('Error fetching flats:', error);
      toast.error('Failed to load flats data');
      setFlats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFlat) {
        await flatAPI.update(editingFlat._id, formData);
        toast.success('Flat updated successfully');
      } else {
        await flatAPI.create(formData);
        toast.success('Flat created successfully');
      }
      setShowModal(false);
      setEditingFlat(null);
      setFormData({
        wing: '',
        flatNo: '',
        status: 'vacant',
        ownerName: '',
        isTenant: false
      });
      fetchFlats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (flat) => {
    setEditingFlat(flat);
    setFormData({
      wing: flat.wing || '',
      flatNo: flat.flatNo || '',
      status: flat.status || 'vacant',
      ownerName: flat.ownerName || '',
      isTenant: flat.isTenant || false
    });
    setShowModal(true);
  };

  const handleDelete = async (flatId) => {
    if (!window.confirm('Are you sure you want to delete this flat?')) return;
    
    try {
      await flatAPI.delete(flatId);
      toast.success('Flat deleted successfully');
      fetchFlats();
    } catch (error) {
      toast.error('Failed to delete flat');
    }
  };

const filteredFlats = Array.isArray(flats) ? flats
  .filter(flat => {
    const wing = flat?.wing || '';
    const flatNo = flat?.flatNo || '';
    const ownerName = flat?.ownerName || '';
    
    const searchLower = searchTerm.toLowerCase();
    
    // Improved search: search by wing only, wing+flat, or owner name
    return wing.toLowerCase().includes(searchLower) ||
           `${wing}-${flatNo}`.toLowerCase().includes(searchLower) ||
           ownerName.toLowerCase().includes(searchLower);
  })
  .sort((a, b) => {
    // Sort by wing first, then by flat number numerically
    const wingCompare = (a.wing || '').localeCompare(b.wing || '');
    if (wingCompare !== 0) return wingCompare;
    
    // Extract numbers from flat numbers for proper numerical sorting
    const getFlatNumber = (flatNo) => {
      const match = (flatNo || '').match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };
    
    return getFlatNumber(a.flatNo) - getFlatNumber(b.flatNo);
  }) : [];

  if (loading) {
    return <LoadingSpinner text="Loading flats..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Flat Management</h1>
          <p className="text-gray-400">
            Manage all residential flats and resident information
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Flat
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-emerald-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Flats</p>
              <p className="text-2xl font-bold text-white">{flats.length}</p>
            </div>
            <Building className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-emerald-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Occupied</p>
              <p className="text-2xl font-bold text-white">
                {flats.filter(f => f?.status === 'occupied').length}
              </p>
            </div>
            <User className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <div className="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-emerald-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Vacant</p>
              <p className="text-2xl font-bold text-white">
                {flats.filter(f => f?.status === 'vacant').length}
              </p>
            </div>
            <Home className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-emerald-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tenants</p>
              <p className="text-2xl font-bold text-white">
                {flats.filter(f => f?.isTenant).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-emerald-800/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by wing (A), wing+flat (A-101), or owner name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
        </div>
      </div>

      {/* Quick Wing Filters
        <div className="flex flex-wrap gap-2 mt-3">
          {['All', 'A', 'B', 'C', 'D', 'E'].map(wing => (
            <button
              key={wing}
              onClick={() => setSearchTerm(wing === 'All' ? '' : wing)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                (wing === 'All' && !searchTerm) || searchTerm === wing
                  ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800/30'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
              }`}
            >
              {wing}
            </button>
          ))}
        </div> */}

      {/* Flats Table */}
      <div className="bg-black/50 backdrop-blur-lg rounded-xl border border-emerald-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-800/30">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Wing</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Flat No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Owner Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Resident</th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-800/30">
              {filteredFlats.map((flat) => (
                <tr key={flat?._id} className="hover:bg-emerald-900/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/50 text-blue-400 border border-blue-800/30">
                      {flat?.wing || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{flat?.flatNo || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                      flat?.status === 'occupied'
                        ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800/30'
                        : 'bg-orange-900/50 text-orange-400 border-orange-800/30'
                    }`}>
                      {flat?.status || 'vacant'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{flat?.ownerName || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      flat?.isTenant
                        ? 'bg-purple-900/50 text-purple-400 border border-purple-800/30'
                        : 'bg-gray-800 text-gray-300 border border-gray-700'
                    }`}>
                      {flat?.isTenant ? 'Tenant' : 'Owner'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {flat?.residentId ? (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-emerald-400" />
                        <span className="text-gray-300">{flat.residentId.fullName || 'Resident'}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(flat)}
                          className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(flat._id)}
                          className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFlats.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No flats found</p>
            {searchTerm && (
              <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-emerald-800/30 w-full max-w-md">
            <div className="p-6 border-b border-emerald-800/30">
              <h2 className="text-xl font-bold text-white">
                {editingFlat ? 'Edit Flat' : 'Add New Flat'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wing
                </label>
                <input
                  type="text"
                  required
                  value={formData.wing}
                  onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter wing (A, B, C...)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Flat Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.flatNo}
                  onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter flat number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter owner name"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isTenant"
                  checked={formData.isTenant}
                  onChange={(e) => setFormData({ ...formData, isTenant: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 bg-gray-800 border-gray-700 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <label htmlFor="isTenant" className="text-sm text-gray-300">
                  This is a tenant (not owner)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                >
                  {editingFlat ? 'Update Flat' : 'Create Flat'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFlat(null);
                    setFormData({
                      wing: '',
                      flatNo: '',
                      status: 'vacant',
                      ownerName: '',
                      isTenant: false
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

export default Flats;