import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, Plus, Search, Filter, Download, 
  Eye, CheckCircle, Clock, AlertTriangle, IndianRupee
} from 'lucide-react';
import { maintenanceAPI, flatAPI } from '../../services/api';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const Maintenance = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [operationLoading, setOperationLoading] = useState(false);

  const [formData, setFormData] = useState({
    wing: '',
    flatNo: '',
    amount: '',
    month: '',
    year: new Date().getFullYear(),
    dueDate: ''
  });

  useEffect(() => {
    fetchBills();
    if (user?.role === 'admin') {
      fetchFlats();
    }
  }, [user]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await maintenanceAPI.getAll();
      console.log('Maintenance API response:', response);
      
      const billsData = response?.data?.data || [];
      setBills(Array.isArray(billsData) ? billsData : []);
    } catch (error) {
      console.error('Error fetching maintenance bills:', error);
      toast.error('Failed to load maintenance bills');
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlats = async () => {
    try {
      const response = await flatAPI.getAll();
      const flatsData = response?.data?.data || [];
      setFlats(Array.isArray(flatsData) ? flatsData : []);
    } catch (error) {
      console.error('Error fetching flats:', error);
      toast.error('Failed to load flats data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    
    try {
      console.log('Submitting maintenance data:', formData);
      
      // Find the resident ID for the selected wing and flat
      const selectedFlat = flats.find(flat => 
        flat?.wing === formData.wing && flat?.flatNo === formData.flatNo
      );

      if (!selectedFlat && user?.role === 'admin') {
        toast.error('Please select a valid wing and flat number');
        return;
      }

      const maintenanceData = {
        wing: formData.wing,
        flatNo: formData.flatNo,
        amount: parseFloat(formData.amount),
        month: formData.month,
        year: parseInt(formData.year),
        dueDate: new Date(formData.dueDate)
      };

      // Only add residentId if it exists and user is admin
      if (selectedFlat?.residentId && user?.role === 'admin') {
        maintenanceData.residentId = selectedFlat.residentId;
      }

      console.log('Sending maintenance data:', maintenanceData);

      await maintenanceAPI.create(maintenanceData);
      toast.success('Maintenance bill created successfully');
      setShowModal(false);
      setFormData({
        wing: '',
        flatNo: '',
        amount: '',
        month: '',
        year: new Date().getFullYear(),
        dueDate: ''
      });
      fetchBills();
    } catch (error) {
      console.error('Create maintenance error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create maintenance bill';
      toast.error(errorMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  const handlePayment = async (bill) => {
    try {
      // For demo purposes - simulate payment success
      // In real implementation, you would integrate with Razorpay
      toast.success('Payment simulation: Maintenance bill paid successfully!');
      
      // Update bill status locally for demo
      setBills(prevBills => 
        prevBills.map(b => 
          b._id === bill._id 
            ? { ...b, status: 'paid', paymentDate: new Date() }
            : b
        )
      );
      
      // In real implementation, you would call:
      // await maintenanceAPI.createOrder(bill._id);
      // and handle Razorpay integration
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  const filteredBills = Array.isArray(bills) ? bills.filter(bill => {
    const wing = bill?.wing || '';
    const flatNo = bill?.flatNo || '';
    const residentName = bill?.residentId?.fullName || '';
    
    return wing.toLowerCase().includes(searchTerm.toLowerCase()) ||
           flatNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
           residentName.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-emerald-400 bg-emerald-900/50 border-emerald-800/30';
      case 'pending': return 'text-orange-400 bg-orange-900/50 border-orange-800/30';
      case 'overdue': return 'text-red-400 bg-red-900/50 border-red-800/30';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'pending': return Clock;
      case 'overdue': return AlertTriangle;
      default: return Clock;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get unique wings and flats for dropdown
  const uniqueWings = [...new Set(flats.map(flat => flat?.wing).filter(Boolean))];
  const getFlatsByWing = (wing) => {
    return flats.filter(flat => flat?.wing === wing && flat?.status === 'occupied');
  };

  if (loading) {
    return <LoadingSpinner text="Loading maintenance bills..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Maintenance</h1>
          <p className="text-gray-400">
            Manage and pay society maintenance bills
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            Generate Bill
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { status: 'all', label: 'Total Bills', count: bills.length, color: 'gray' },
          { status: 'pending', label: 'Pending', count: bills.filter(b => b?.status === 'pending').length, color: 'orange' },
          { status: 'paid', label: 'Paid', count: bills.filter(b => b?.status === 'paid').length, color: 'emerald' },
          { status: 'overdue', label: 'Overdue', count: bills.filter(b => b?.status === 'overdue').length, color: 'red' }
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
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-emerald-800/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by wing, flat, or name..."
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
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-black/50 backdrop-blur-lg rounded-xl border border-emerald-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-800/30">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Wing/Flat</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Resident</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Period</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-800/30">
              {filteredBills.map((bill) => {
                const StatusIcon = getStatusIcon(bill?.status);
                return (
                  <tr key={bill?._id} className="hover:bg-emerald-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/50 text-blue-400 border border-blue-800/30">
                          {bill?.wing || '-'}
                        </span>
                        <span className="text-white font-medium">{bill?.flatNo || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300">
                        {bill?.residentId?.fullName || 'Not Assigned'}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {bill?.residentId?.phoneNo || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {bill?.month || ''} {bill?.year || ''}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="w-4 h-4 text-emerald-400" />
                        <span className="text-white font-bold">{bill?.amount?.toLocaleString() || '0'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {bill?.dueDate ? new Date(bill.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(bill?.status)}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {bill?.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {user?.role === 'admin' ? (
                          <>
                            <button className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-emerald-400 hover:bg-emerald-900/30 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          bill?.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handlePayment(bill)}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Pay Now
                            </Button>
                          )
                        )}
                        {bill?.status === 'paid' && (
                          <span className="text-emerald-400 text-sm">
                            Paid on {bill?.paymentDate ? new Date(bill.paymentDate).toLocaleDateString() : 'Unknown date'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No maintenance bills found</p>
            {searchTerm && (
              <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
            )}
          </div>
        )}
      </div>

      {/* Generate Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-emerald-800/30 w-full max-w-md">
            <div className="p-6 border-b border-emerald-800/30">
              <h2 className="text-xl font-bold text-white">Generate Maintenance Bill</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {user?.role === 'admin' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Wing
                    </label>
                    <select
                      required
                      value={formData.wing}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          wing: e.target.value,
                          flatNo: '' // Reset flat when wing changes
                        });
                      }}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Select Wing</option>
                      {uniqueWings.map(wing => (
                        <option key={wing} value={wing}>{wing}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Flat Number
                    </label>
                    <select
                      required
                      value={formData.flatNo}
                      onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      disabled={!formData.wing}
                    >
                      <option value="">Select Flat</option>
                      {getFlatsByWing(formData.wing).map(flat => (
                        <option key={flat._id} value={flat.flatNo}>
                          {flat.flatNo} - {flat.ownerName || 'No Owner'}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
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
                        placeholder="A, B, C..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Flat No
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.flatNo}
                        onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="101, 202..."
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Month
                  </label>
                  <select
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Select Month</option>
                    {[
                      'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'
                    ].map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  loading={operationLoading}
                  disabled={operationLoading}
                >
                  Generate Bill
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      wing: '',
                      flatNo: '',
                      amount: '',
                      month: '',
                      year: new Date().getFullYear(),
                      dueDate: ''
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

export default Maintenance;