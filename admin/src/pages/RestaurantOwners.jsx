import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, MoreVertical, X, FileText, ExternalLink, Store } from 'lucide-react';

export default function RestaurantOwners() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Mock data - Replace with actual API call
  useEffect(() => {
    const mockOwners = [
      {
        id: 'RO001',
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@example.com',
        phone: '+8801712345678',
        status: 'Approved',
        verified: true,
        photo: 'https://i.pravatar.cc/150?img=33',
        birthDate: '1985-03-15',
        gender: 'Male',
        address: 'Dhanmondi, Dhaka',
        joinedDate: '2024-01-10',
        totalRestaurants: 3,
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-1.pdf', uploadedAt: '2024-01-10' },
          { type: 'NID', url: 'https://example.com/nid-1.pdf', uploadedAt: '2024-01-10' },
          { type: 'Tax Certificate', url: 'https://example.com/tax-cert-1.pdf', uploadedAt: '2024-01-10' },
          { type: 'Business Registration', url: 'https://example.com/business-reg-1.pdf', uploadedAt: '2024-01-10' }
        ],
        restaurants: [
          { id: 'REST001', name: 'Spice Garden' },
          { id: 'REST002', name: 'Royal Kitchen' },
          { id: 'REST003', name: 'Dhaka Delights' }
        ]
      },
      {
        id: 'RO002',
        name: 'Fatima Rahman',
        email: 'fatima.rahman@example.com',
        phone: '+8801823456789',
        status: 'Pending',
        verified: false,
        photo: 'https://i.pravatar.cc/150?img=47',
        birthDate: '1990-07-22',
        gender: 'Female',
        address: 'Gulshan, Dhaka',
        joinedDate: '2024-03-20',
        totalRestaurants: 1,
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-2.pdf', uploadedAt: '2024-03-20' },
          { type: 'NID', url: 'https://example.com/nid-2.pdf', uploadedAt: '2024-03-20' }
        ],
        restaurants: [
          { id: 'REST004', name: 'Fusion Café' }
        ]
      },
      {
        id: 'RO003',
        name: 'Karim Uddin',
        email: 'karim.uddin@example.com',
        phone: '+8801934567890',
        status: 'Approved',
        verified: true,
        photo: 'https://i.pravatar.cc/150?img=52',
        birthDate: '1982-11-08',
        gender: 'Male',
        address: 'Uttara, Dhaka',
        joinedDate: '2023-12-05',
        totalRestaurants: 5,
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-3.pdf', uploadedAt: '2023-12-05' },
          { type: 'NID', url: 'https://example.com/nid-3.pdf', uploadedAt: '2023-12-05' },
          { type: 'Tax Certificate', url: 'https://example.com/tax-cert-3.pdf', uploadedAt: '2023-12-05' },
          { type: 'Business Registration', url: 'https://example.com/business-reg-3.pdf', uploadedAt: '2023-12-05' },
          { type: 'Food Safety Certificate', url: 'https://example.com/food-safety-3.pdf', uploadedAt: '2023-12-05' }
        ],
        restaurants: [
          { id: 'REST005', name: 'Heritage Restaurant' },
          { id: 'REST006', name: 'Biryani House' },
          { id: 'REST007', name: 'Street Food Corner' },
          { id: 'REST008', name: 'Premium Grill' },
          { id: 'REST009', name: 'Fast Bites' }
        ]
      },
      {
        id: 'RO004',
        name: 'Nusrat Jahan',
        email: 'nusrat.jahan@example.com',
        phone: '+8801645678901',
        status: 'Suspended',
        verified: true,
        photo: 'https://i.pravatar.cc/150?img=44',
        birthDate: '1988-05-30',
        gender: 'Female',
        address: 'Banani, Dhaka',
        joinedDate: '2023-10-15',
        totalRestaurants: 2,
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-4.pdf', uploadedAt: '2023-10-15' },
          { type: 'NID', url: 'https://example.com/nid-4.pdf', uploadedAt: '2023-10-15' },
          { type: 'Tax Certificate', url: 'https://example.com/tax-cert-4.pdf', uploadedAt: '2023-10-15' }
        ],
        restaurants: [
          { id: 'REST010', name: 'Green Curry' },
          { id: 'REST011', name: 'Dessert Paradise' }
        ]
      },
      {
        id: 'RO005',
        name: 'Rahim Mia',
        email: 'rahim.mia@example.com',
        phone: '+8801556789012',
        status: 'Approved',
        verified: false,
        photo: 'https://i.pravatar.cc/150?img=60',
        birthDate: '1992-09-12',
        gender: 'Male',
        address: 'Mirpur, Dhaka',
        joinedDate: '2024-02-18',
        totalRestaurants: 1,
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-5.pdf', uploadedAt: '2024-02-18' },
          { type: 'NID', url: 'https://example.com/nid-5.pdf', uploadedAt: '2024-02-18' }
        ],
        restaurants: [
          { id: 'REST012', name: 'Budget Bites' }
        ]
      },
      {
        id: 'RO006',
        name: 'Shabnam Akter',
        email: 'shabnam.akter@example.com',
        phone: '+8801467890123',
        status: 'Pending',
        verified: false,
        photo: 'https://i.pravatar.cc/150?img=45',
        birthDate: '1995-01-20',
        gender: 'Female',
        address: 'Mohammadpur, Dhaka',
        joinedDate: '2024-03-25',
        totalRestaurants: 1,
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-6.pdf', uploadedAt: '2024-03-25' },
          { type: 'NID', url: 'https://example.com/nid-6.pdf', uploadedAt: '2024-03-25' },
          { type: 'Business Registration', url: 'https://example.com/business-reg-6.pdf', uploadedAt: '2024-03-25' }
        ],
        restaurants: [
          { id: 'REST013', name: 'Sweet Treats' }
        ]
      }
    ];
    setOwners(mockOwners);
  }, []);

  // Filter owners based on active tab and search
  useEffect(() => {
    let filtered = owners;

    // Filter by tab
    if (activeTab === 'Pending') {
      filtered = filtered.filter(o => o.status === 'Pending');
    } else if (activeTab === 'Approved') {
      filtered = filtered.filter(o => o.status === 'Approved');
    } else if (activeTab === 'Suspended') {
      filtered = filtered.filter(o => o.status === 'Suspended');
    } else if (activeTab === 'Verified') {
      filtered = filtered.filter(o => o.verified === true);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(o => 
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOwners(filtered);
  }, [activeTab, searchQuery, owners]);

  const handleCardClick = (owner) => {
    setSelectedOwner(owner);
    setShowDetailModal(true);
    setShowActionMenu(null);
  };

  const handleActionClick = (e, ownerId) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === ownerId ? null : ownerId);
  };

  const handleAction = (action, owner) => {
    setPendingAction({ action, owner });
    setShowConfirmDialog(true);
    setShowActionMenu(null);
  };

  const confirmAction = () => {
    const { action, owner } = pendingAction;
    
    // Update owner status
    setOwners(prev => prev.map(o => {
      if (o.id === owner.id) {
        if (action === 'Delete') {
          return null; // Will be filtered out
        } else if (action === 'Approve') {
          return { ...o, status: 'Approved' };
        } else if (action === 'Suspend') {
          return { ...o, status: 'Suspended' };
        } else if (action === 'Verify') {
          return { ...o, verified: true };
        } else if (action === 'Unverify') {
          return { ...o, verified: false };
        }
      }
      return o;
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

  const tabs = ['All', 'Pending', 'Approved', 'Suspended', 'Verified'];

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-auto bg-[#0a0a0f]">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-50">Restaurant Owner Management</h2>
            <p className="text-gray-500">View and manage all restaurant owners on the platform</p>
          </div>

          {/* Tabs and Search */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Tabs */}
            <div className="flex gap-2 bg-[#1a1a22] p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
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
                placeholder="Search restaurant owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a22] border border-white/10 rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-[#1f1f2a] transition-all"
              />
            </div>
          </div>

          {/* Owner Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOwners.map((owner) => (
              <div
                key={owner.id}
                onClick={() => handleCardClick(owner)}
                className="group relative bg-[#1a1a22] border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1"
              >
                {/* Three Dots Menu */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => handleActionClick(e, owner.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Action Dropdown */}
                  {showActionMenu === owner.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1f1f2a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                      {owner.status === 'Pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Approve', owner);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-green-400 hover:bg-white/5 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {owner.status === 'Suspended' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Approve', owner);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-green-400 hover:bg-white/5 transition-colors"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Suspend', owner);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-yellow-400 hover:bg-white/5 transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      {!owner.verified ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Verify', owner);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-blue-400 hover:bg-white/5 transition-colors"
                        >
                          Mark as Verified
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Unverify', owner);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-400 hover:bg-white/5 transition-colors"
                        >
                          Remove Verification
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('Delete', owner);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Owner Photo */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <img
                      src={owner.photo}
                      alt={owner.name}
                      className="w-24 h-24 rounded-full border-4 border-white/10 group-hover:border-orange-500/50 transition-colors"
                    />
                    <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[#1a1a22] ${
                      owner.status === 'Approved' ? 'bg-green-500' : 
                      owner.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-100">{owner.name}</h3>
                    {owner.verified && (
                      <div className="flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-3">{owner.id}</p>
                  
                  {/* Status Badge */}
                  <div className="flex justify-center mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      owner.status === 'Approved' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : owner.status === 'Pending'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {owner.status}
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-500">Restaurants</p>
                      <p className="text-sm font-semibold text-gray-200 flex items-center justify-center gap-1">
                        <Store className="w-3 h-3" />
                        {owner.totalRestaurants}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Documents</p>
                      <p className="text-sm font-semibold text-gray-200 flex items-center justify-center gap-1">
                        <FileText className="w-3 h-3" />
                        {owner.documents.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredOwners.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No restaurant owners found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>

      {/* Owner Detail Modal */}
      {showDetailModal && selectedOwner && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDetailModal(false);
            setSelectedOwner(null);
          }}
        >
          <div 
            className="bg-[#1a1a22] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1a1a22] border-b border-white/10 p-6 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold text-gray-100">Restaurant Owner Details</h3>
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
                  src={selectedOwner.photo}
                  alt={selectedOwner.name}
                  className="w-24 h-24 rounded-full border-4 border-white/10"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-2xl font-bold text-gray-100">{selectedOwner.name}</h4>
                    {selectedOwner.verified && (
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-mono mb-2">{selectedOwner.id}</p>
                  <div className="flex gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      selectedOwner.status === 'Approved' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : selectedOwner.status === 'Pending'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {selectedOwner.status}
                    </span>
                    {selectedOwner.verified && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <DetailItem label="Email" value={selectedOwner.email} />
                <DetailItem label="Phone" value={selectedOwner.phone} />
                <DetailItem label="Birth Date" value={selectedOwner.birthDate} />
                <DetailItem label="Gender" value={selectedOwner.gender} />
                <DetailItem label="Joined Date" value={selectedOwner.joinedDate} />
                <DetailItem label="Total Restaurants" value={selectedOwner.totalRestaurants} />
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Address</label>
                <p className="text-gray-200 bg-[#111116] p-4 rounded-xl border border-white/10">
                  {selectedOwner.address}
                </p>
              </div>

              {/* Documents Section */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-400 mb-3 block">Documents</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOwner.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-[#111116] border border-white/10 rounded-xl hover:border-orange-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <FileText className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200">{doc.type}</p>
                          <p className="text-xs text-gray-500">Uploaded: {doc.uploadedAt}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-400 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Restaurants Section */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-400 mb-3 block">
                  Owned Restaurants ({selectedOwner.restaurants.length})
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedOwner.restaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="flex items-center justify-between p-4 bg-[#111116] border border-white/10 rounded-xl hover:border-orange-500/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <Store className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200">{restaurant.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{restaurant.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10 flex-wrap">
                {selectedOwner.status === 'Pending' && (
                  <button
                    onClick={() => handleAction('Approve', selectedOwner)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl font-medium hover:bg-green-500/20 transition-colors"
                  >
                    Approve Owner
                  </button>
                )}
                {selectedOwner.status === 'Suspended' ? (
                  <button
                    onClick={() => handleAction('Approve', selectedOwner)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl font-medium hover:bg-green-500/20 transition-colors"
                  >
                    Activate Owner
                  </button>
                ) : selectedOwner.status === 'Approved' && (
                  <button
                    onClick={() => handleAction('Suspend', selectedOwner)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl font-medium hover:bg-yellow-500/20 transition-colors"
                  >
                    Suspend Owner
                  </button>
                )}
                {!selectedOwner.verified ? (
                  <button
                    onClick={() => handleAction('Verify', selectedOwner)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-medium hover:bg-blue-500/20 transition-colors"
                  >
                    Mark as Verified
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('Unverify', selectedOwner)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-xl font-medium hover:bg-gray-500/20 transition-colors"
                  >
                    Remove Verification
                  </button>
                )}
                <button
                  onClick={() => handleAction('Delete', selectedOwner)}
                  className="flex-1 min-w-[200px] px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
                >
                  Delete Owner
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
              Are you sure you want to <span className="font-semibold text-orange-400">{pendingAction.action.toLowerCase()}</span> restaurant owner{' '}
              <span className="font-semibold text-gray-200">{pendingAction.owner.name}</span>?
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
                    : pendingAction.action === 'Verify' || pendingAction.action === 'Approve'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
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
