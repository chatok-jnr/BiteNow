import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, MoreVertical, X } from 'lucide-react';

export default function Customers() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Mock data - Replace with actual API call
  useEffect(() => {
    const mockCustomers = [
      {
        id: 'CUST001',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        status: 'Active',
        photo: 'https://i.pravatar.cc/150?img=1',
        birthDate: '1990-05-15',
        gender: 'Male',
        address: '123 Main St, New York, NY 10001',
        joinedDate: '2024-01-15',
        totalOrders: 45,
        totalSpent: '$1,234.50'
      },
      {
        id: 'CUST002',
        name: 'Sarah Smith',
        email: 'sarah.smith@example.com',
        phone: '+1234567891',
        status: 'Active',
        photo: 'https://i.pravatar.cc/150?img=5',
        birthDate: '1992-08-22',
        gender: 'Female',
        address: '456 Oak Ave, Los Angeles, CA 90001',
        joinedDate: '2024-02-10',
        totalOrders: 32,
        totalSpent: '$892.30'
      },
      {
        id: 'CUST003',
        name: 'Mike Johnson',
        email: 'mike.j@example.com',
        phone: '+1234567892',
        status: 'Suspended',
        photo: 'https://i.pravatar.cc/150?img=12',
        birthDate: '1988-03-10',
        gender: 'Male',
        address: '789 Pine Rd, Chicago, IL 60601',
        joinedDate: '2023-11-20',
        totalOrders: 15,
        totalSpent: '$456.80'
      },
      {
        id: 'CUST004',
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '+1234567893',
        status: 'Active',
        photo: 'https://i.pravatar.cc/150?img=9',
        birthDate: '1995-12-05',
        gender: 'Female',
        address: '321 Elm St, Boston, MA 02101',
        joinedDate: '2024-03-05',
        totalOrders: 28,
        totalSpent: '$678.90'
      },
      {
        id: 'CUST005',
        name: 'David Wilson',
        email: 'david.w@example.com',
        phone: '+1234567894',
        status: 'Active',
        photo: 'https://i.pravatar.cc/150?img=14',
        birthDate: '1991-07-18',
        gender: 'Male',
        address: '654 Maple Dr, Seattle, WA 98101',
        joinedDate: '2024-01-28',
        totalOrders: 52,
        totalSpent: '$1,567.40'
      },
      {
        id: 'CUST006',
        name: 'Lisa Anderson',
        email: 'lisa.a@example.com',
        phone: '+1234567895',
        status: 'Suspended',
        photo: 'https://i.pravatar.cc/150?img=20',
        birthDate: '1993-04-25',
        gender: 'Female',
        address: '987 Cedar Ln, Miami, FL 33101',
        joinedDate: '2023-12-15',
        totalOrders: 8,
        totalSpent: '$234.60'
      }
    ];
    setCustomers(mockCustomers);
  }, []);

  // Filter customers based on active tab and search
  useEffect(() => {
    let filtered = customers;

    // Filter by tab
    if (activeTab === 'Active') {
      filtered = filtered.filter(c => c.status === 'Active');
    } else if (activeTab === 'Suspended') {
      filtered = filtered.filter(c => c.status === 'Suspended');
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  }, [activeTab, searchQuery, customers]);

  const handleCardClick = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
    setShowActionMenu(null);
  };

  const handleActionClick = (e, customerId) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === customerId ? null : customerId);
  };

  const handleAction = (action, customer) => {
    setPendingAction({ action, customer });
    setShowConfirmDialog(true);
    setShowActionMenu(null);
  };

  const confirmAction = () => {
    const { action, customer } = pendingAction;
    
    // Update customer status
    setCustomers(prev => prev.map(c => {
      if (c.id === customer.id) {
        if (action === 'Delete') {
          return null; // Will be filtered out
        }
        return { ...c, status: action === 'Suspend' ? 'Suspended' : 'Active' };
      }
      return c;
    }).filter(Boolean));

    // Close dialogs
    setShowConfirmDialog(false);
    setPendingAction(null);
    setShowDetailModal(false);
  };

  const cancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const tabs = ['All', 'Active', 'Suspended'];

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-auto bg-[#0a0a0f]">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-50">Customer Management</h2>
            <p className="text-gray-500">View and manage all customers on the platform</p>
          </div>

          {/* Tabs and Search */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Tabs */}
            <div className="flex gap-2 bg-[#1a1a22] p-1.5 rounded-2xl border border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-[#fc5e03] to-[#fc5e03] text-white shadow-lg shadow-[#fc5e03]/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a22] border border-white/10 rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-[#1f1f2a] transition-all"
              />
            </div>
          </div>

          {/* Customer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleCardClick(customer)}
                className="group relative bg-[#1a1a22] border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1"
              >
                {/* Three Dots Menu */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => handleActionClick(e, customer.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Action Dropdown */}
                  {showActionMenu === customer.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-[#1f1f2a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                      {customer.status === 'Suspended' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Active', customer);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-green-400 hover:bg-white/5 transition-colors"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Suspend', customer);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-yellow-400 hover:bg-white/5 transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('Delete', customer);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Customer Photo */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <img
                      src={customer.photo}
                      alt={customer.name}
                      className="w-24 h-24 rounded-full border-4 border-white/10 group-hover:border-orange-500/50 transition-colors"
                    />
                    <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[#1a1a22] ${
                      customer.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-100 mb-1">{customer.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mb-3">{customer.id}</p>
                  
                  {/* Status Badge */}
                  <div className="flex justify-center mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'Active' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {customer.status}
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-500">Orders</p>
                      <p className="text-sm font-semibold text-gray-200">{customer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Spent</p>
                      <p className="text-sm font-semibold text-gray-200">{customer.totalSpent}</p>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No customers found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDetailModal(false);
            setSelectedCustomer(null);
          }}
        >
          <div 
            className="bg-[#1a1a22] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1a1a22] border-b border-white/10 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-100">Customer Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Profile Section */}
              <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/10">
                <img
                  src={selectedCustomer.photo}
                  alt={selectedCustomer.name}
                  className="w-24 h-24 rounded-full border-4 border-white/10"
                />
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-100 mb-1">{selectedCustomer.name}</h4>
                  <p className="text-sm text-gray-500 font-mono mb-2">{selectedCustomer.id}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedCustomer.status === 'Active' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <DetailItem label="Email" value={selectedCustomer.email} />
                <DetailItem label="Phone" value={selectedCustomer.phone} />
                <DetailItem label="Birth Date" value={selectedCustomer.birthDate} />
                <DetailItem label="Gender" value={selectedCustomer.gender} />
                <DetailItem label="Joined Date" value={selectedCustomer.joinedDate} />
                <DetailItem label="Total Orders" value={selectedCustomer.totalOrders} />
                <DetailItem label="Total Spent" value={selectedCustomer.totalSpent} />
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Address</label>
                <p className="text-gray-200 bg-[#111116] p-4 rounded-xl border border-white/10">
                  {selectedCustomer.address}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                {selectedCustomer.status === 'Suspended' ? (
                  <button
                    onClick={() => handleAction('Active', selectedCustomer)}
                    className="flex-1 px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl font-medium hover:bg-green-500/20 transition-colors"
                  >
                    Activate Customer
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('Suspend', selectedCustomer)}
                    className="flex-1 px-4 py-3 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl font-medium hover:bg-yellow-500/20 transition-colors"
                  >
                    Suspend Customer
                  </button>
                )}
                <button
                  onClick={() => handleAction('Delete', selectedCustomer)}
                  className="flex-1 px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
                >
                  Delete Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1a1a22] border border-white/10 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-100 mb-2">Confirm Action</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to <span className="font-semibold text-orange-400">{pendingAction.action.toLowerCase()}</span> customer{' '}
              <span className="font-semibold text-gray-200">{pendingAction.customer.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelAction}
                className="flex-1 px-4 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                  pendingAction.action === 'Delete'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    : pendingAction.action === 'Suspend'
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20'
                    : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for detail items
function DetailItem({ label, value }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">{label}</label>
      <p className="text-gray-200">{value}</p>
    </div>
  );
}
