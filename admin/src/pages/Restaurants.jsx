import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, MoreVertical, X, FileText, ExternalLink, Store, ShoppingBag, DollarSign, User, Filter } from 'lucide-react';

export default function Restaurants() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilterQuery, setOwnerFilterQuery] = useState('');
  const [showOwnerFilter, setShowOwnerFilter] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Mock data - Replace with actual API call
  useEffect(() => {
    const mockRestaurants = [
      {
        id: 'REST001',
        name: 'Spice Garden',
        logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300',
        status: 'Accepted',
        verified: true,
        cuisine: 'Indian, Chinese',
        address: 'Dhanmondi 15, Dhaka',
        phone: '+8801912345678',
        email: 'spicegarden@example.com',
        rating: 4.5,
        totalOrders: 1250,
        completedOrders: 1180,
        taxPerOrder: 50, // BDT
        totalTaxCollected: 59000, // BDT
        joinedDate: '2024-01-15',
        owner: {
          id: 'RO001',
          name: 'Ahmed Hassan',
          phone: '+8801712345678'
        },
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-r1.pdf', uploadedAt: '2024-01-15' },
          { type: 'Tax Certificate', url: 'https://example.com/tax-cert-r1.pdf', uploadedAt: '2024-01-15' },
          { type: 'Food Safety Certificate', url: 'https://example.com/food-safety-r1.pdf', uploadedAt: '2024-01-15' },
          { type: 'Business Registration', url: 'https://example.com/business-reg-r1.pdf', uploadedAt: '2024-01-15' }
        ]
      },
      {
        id: 'REST002',
        name: 'Royal Kitchen',
        logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300',
        status: 'Accepted',
        verified: true,
        cuisine: 'Bengali, Mughlai',
        address: 'Gulshan 1, Dhaka',
        phone: '+8801823456789',
        email: 'royalkitchen@example.com',
        rating: 4.8,
        totalOrders: 2100,
        completedOrders: 2050,
        taxPerOrder: 60,
        totalTaxCollected: 123000,
        joinedDate: '2024-01-20',
        owner: {
          id: 'RO001',
          name: 'Ahmed Hassan',
          phone: '+8801712345678'
        },
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-r2.pdf', uploadedAt: '2024-01-20' },
          { type: 'Tax Certificate', url: 'https://example.com/tax-cert-r2.pdf', uploadedAt: '2024-01-20' },
          { type: 'Food Safety Certificate', url: 'https://example.com/food-safety-r2.pdf', uploadedAt: '2024-01-20' }
        ]
      },
      {
        id: 'REST003',
        name: 'Fusion Café',
        logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300',
        status: 'Pending',
        verified: false,
        cuisine: 'Continental, Asian',
        address: 'Banani 11, Dhaka',
        phone: '+8801934567890',
        email: 'fusioncafe@example.com',
        rating: 0,
        totalOrders: 0,
        completedOrders: 0,
        taxPerOrder: 45,
        totalTaxCollected: 0,
        joinedDate: '2024-03-25',
        owner: {
          id: 'RO002',
          name: 'Fatima Rahman',
          phone: '+8801823456789'
        },
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-r3.pdf', uploadedAt: '2024-03-25' },
          { type: 'Tax Certificate', url: 'https://example.com/tax-cert-r3.pdf', uploadedAt: '2024-03-25' }
        ]
      },
      {
        id: 'REST004',
        name: 'Heritage Restaurant',
        logo: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=300',
        status: 'Accepted',
        verified: true,
        cuisine: 'Traditional Bengali',
        address: 'Uttara, Sector 7, Dhaka',
        phone: '+8801645678901',
        email: 'heritage@example.com',
        rating: 4.6,
        totalOrders: 1580,
        completedOrders: 1520,
        taxPerOrder: 55,
        totalTaxCollected: 83600,
        joinedDate: '2023-12-10',
        owner: {
          id: 'RO003',
          name: 'Karim Uddin',
          phone: '+8801934567890'
        },
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-r4.pdf', uploadedAt: '2023-12-10' },
          { type: 'Tax Certificate', url: 'https://example.com/tax-cert-r4.pdf', uploadedAt: '2023-12-10' },
          { type: 'Food Safety Certificate', url: 'https://example.com/food-safety-r4.pdf', uploadedAt: '2023-12-10' },
          { type: 'Business Registration', url: 'https://example.com/business-reg-r4.pdf', uploadedAt: '2023-12-10' }
        ]
      },
      {
        id: 'REST005',
        name: 'Green Curry',
        logo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300',
        status: 'Suspended',
        verified: true,
        cuisine: 'Thai, Asian',
        address: 'Dhanmondi 27, Dhaka',
        phone: '+8801556789012',
        email: 'greencurry@example.com',
        rating: 4.2,
        totalOrders: 890,
        completedOrders: 820,
        taxPerOrder: 48,
        totalTaxCollected: 39360,
        joinedDate: '2023-11-20',
        owner: {
          id: 'RO004',
          name: 'Nusrat Jahan',
          phone: '+8801645678901'
        },
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-r5.pdf', uploadedAt: '2023-11-20' },
          { type: 'Tax Certificate', url: 'https://example.com/tax-cert-r5.pdf', uploadedAt: '2023-11-20' }
        ]
      },
      {
        id: 'REST006',
        name: 'Biryani House',
        logo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300',
        status: 'Accepted',
        verified: false,
        cuisine: 'Hyderabadi, Mughlai',
        address: 'Mirpur 10, Dhaka',
        phone: '+8801467890123',
        email: 'biryanihouse@example.com',
        rating: 4.7,
        totalOrders: 1920,
        completedOrders: 1850,
        taxPerOrder: 52,
        totalTaxCollected: 96200,
        joinedDate: '2024-02-05',
        owner: {
          id: 'RO003',
          name: 'Karim Uddin',
          phone: '+8801934567890'
        },
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-r6.pdf', uploadedAt: '2024-02-05' },
          { type: 'Tax Certificate', url: 'https://example.com/tax-cert-r6.pdf', uploadedAt: '2024-02-05' },
          { type: 'Food Safety Certificate', url: 'https://example.com/food-safety-r6.pdf', uploadedAt: '2024-02-05' }
        ]
      },
      {
        id: 'REST007',
        name: 'Sweet Treats',
        logo: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=300',
        status: 'Pending',
        verified: false,
        cuisine: 'Desserts, Bakery',
        address: 'Mohammadpur, Dhaka',
        phone: '+8801378901234',
        email: 'sweettreats@example.com',
        rating: 0,
        totalOrders: 0,
        completedOrders: 0,
        taxPerOrder: 35,
        totalTaxCollected: 0,
        joinedDate: '2024-03-28',
        owner: {
          id: 'RO006',
          name: 'Shabnam Akter',
          phone: '+8801467890123'
        },
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-r7.pdf', uploadedAt: '2024-03-28' }
        ]
      },
      {
        id: 'REST008',
        name: 'Fast Bites',
        logo: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300',
        status: 'Accepted',
        verified: true,
        cuisine: 'Fast Food, Burgers',
        address: 'Bashundhara R/A, Dhaka',
        phone: '+8801289012345',
        email: 'fastbites@example.com',
        rating: 4.4,
        totalOrders: 2350,
        completedOrders: 2280,
        taxPerOrder: 42,
        totalTaxCollected: 95760,
        joinedDate: '2024-01-05',
        owner: {
          id: 'RO003',
          name: 'Karim Uddin',
          phone: '+8801934567890'
        },
        documents: [
          { type: 'Trade License', url: 'https://example.com/trade-license-r8.pdf', uploadedAt: '2024-01-05' },
          { type: 'Tax Certificate', url: 'https://example.com/tax-cert-r8.pdf', uploadedAt: '2024-01-05' },
          { type: 'Food Safety Certificate', url: 'https://example.com/food-safety-r8.pdf', uploadedAt: '2024-01-05' }
        ]
      }
    ];
    setRestaurants(mockRestaurants);
  }, []);

  // Filter restaurants based on active tab, search, and owner filter
  useEffect(() => {
    let filtered = restaurants;

    // Filter by tab
    if (activeTab === 'Pending') {
      filtered = filtered.filter(r => r.status === 'Pending');
    } else if (activeTab === 'Accepted') {
      filtered = filtered.filter(r => r.status === 'Accepted');
    } else if (activeTab === 'Suspended') {
      filtered = filtered.filter(r => r.status === 'Suspended');
    } else if (activeTab === 'Verified') {
      filtered = filtered.filter(r => r.verified === true);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by owner
    if (ownerFilterQuery) {
      filtered = filtered.filter(r => 
        r.owner.name.toLowerCase().includes(ownerFilterQuery.toLowerCase()) ||
        r.owner.id.toLowerCase().includes(ownerFilterQuery.toLowerCase())
      );
    }

    setFilteredRestaurants(filtered);
  }, [activeTab, searchQuery, ownerFilterQuery, restaurants]);

  const handleCardClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDetailModal(true);
    setShowActionMenu(null);
  };

  const handleActionClick = (e, restaurantId) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === restaurantId ? null : restaurantId);
  };

  const handleAction = (action, restaurant) => {
    setPendingAction({ action, restaurant });
    setShowConfirmDialog(true);
    setShowActionMenu(null);
  };

  const confirmAction = () => {
    const { action, restaurant } = pendingAction;
    
    // Update restaurant status
    setRestaurants(prev => prev.map(r => {
      if (r.id === restaurant.id) {
        if (action === 'Delete') {
          return null; // Will be filtered out
        } else if (action === 'Accept') {
          return { ...r, status: 'Accepted' };
        } else if (action === 'Suspend') {
          return { ...r, status: 'Suspended' };
        } else if (action === 'Verify') {
          return { ...r, verified: true };
        } else if (action === 'Unverify') {
          return { ...r, verified: false };
        }
      }
      return r;
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

  const tabs = ['All', 'Pending', 'Accepted', 'Suspended', 'Verified'];

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-auto bg-[#0a0a0f]">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-50">Restaurant Management</h2>
            <p className="text-gray-500">View and manage all restaurants on the platform</p>
          </div>

          {/* Tabs and Search */}
          <div className="mb-6 flex flex-col gap-4">
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

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search by Restaurant */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search restaurants by name, ID, cuisine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a22] border border-white/10 rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-[#1f1f2a] transition-all"
                />
              </div>

              {/* Filter by Owner */}
              <div className="relative w-full sm:w-80">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Filter by owner name or ID..."
                  value={ownerFilterQuery}
                  onChange={(e) => setOwnerFilterQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a22] border border-white/10 rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-[#1f1f2a] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Restaurant Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => handleCardClick(restaurant)}
                className="group relative bg-[#1a1a22] border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1"
              >
                {/* Three Dots Menu */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => handleActionClick(e, restaurant.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Action Dropdown */}
                  {showActionMenu === restaurant.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1f1f2a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                      {restaurant.status === 'Pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Accept', restaurant);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-green-400 hover:bg-white/5 transition-colors"
                        >
                          Accept
                        </button>
                      )}
                      {restaurant.status === 'Suspended' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Accept', restaurant);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-green-400 hover:bg-white/5 transition-colors"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Suspend', restaurant);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-yellow-400 hover:bg-white/5 transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      {!restaurant.verified ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Verify', restaurant);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-blue-400 hover:bg-white/5 transition-colors"
                        >
                          Mark as Verified
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Unverify', restaurant);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-400 hover:bg-white/5 transition-colors"
                        >
                          Remove Verification
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('Delete', restaurant);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Restaurant Logo */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <img
                      src={restaurant.logo}
                      alt={restaurant.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/10 group-hover:border-orange-500/50 transition-colors"
                    />
                    <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[#1a1a22] ${
                      restaurant.status === 'Accepted' ? 'bg-green-500' : 
                      restaurant.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-100">{restaurant.name}</h3>
                    {restaurant.verified && (
                      <div className="flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-2">{restaurant.id}</p>
                  <p className="text-xs text-gray-400 mb-3">{restaurant.cuisine}</p>
                  
                  {/* Status Badge */}
                  <div className="flex justify-center mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      restaurant.status === 'Accepted' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : restaurant.status === 'Pending'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {restaurant.status}
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-500">Completed Orders</p>
                      <p className="text-sm font-semibold text-gray-200 flex items-center justify-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        {restaurant.completedOrders}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Tax</p>
                      <p className="text-sm font-semibold text-gray-200 flex items-center justify-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ৳{restaurant.totalTaxCollected.toLocaleString()}
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
          {filteredRestaurants.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No restaurants found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>

      {/* Restaurant Detail Modal */}
      {showDetailModal && selectedRestaurant && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDetailModal(false);
            setSelectedRestaurant(null);
          }}
        >
          <div 
            className="bg-[#1a1a22] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1a1a22] border-b border-white/10 p-6 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold text-gray-100">Restaurant Details</h3>
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
                  src={selectedRestaurant.logo}
                  alt={selectedRestaurant.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/10"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-2xl font-bold text-gray-100">{selectedRestaurant.name}</h4>
                    {selectedRestaurant.verified && (
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-mono mb-2">{selectedRestaurant.id}</p>
                  <div className="flex gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      selectedRestaurant.status === 'Accepted' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : selectedRestaurant.status === 'Pending'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {selectedRestaurant.status}
                    </span>
                    {selectedRestaurant.verified && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <DetailItem label="Email" value={selectedRestaurant.email} />
                <DetailItem label="Phone" value={selectedRestaurant.phone} />
                <DetailItem label="Cuisine Type" value={selectedRestaurant.cuisine} />
                <DetailItem label="Rating" value={selectedRestaurant.rating > 0 ? `⭐ ${selectedRestaurant.rating}/5` : 'Not rated yet'} />
                <DetailItem label="Joined Date" value={selectedRestaurant.joinedDate} />
                <DetailItem label="Total Orders" value={selectedRestaurant.totalOrders} />
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Address</label>
                <p className="text-gray-200 bg-[#111116] p-4 rounded-xl border border-white/10">
                  {selectedRestaurant.address}
                </p>
              </div>

              {/* Owner Information */}
              <div className="mb-6 bg-[#111116] border border-white/10 rounded-xl p-5">
                <label className="text-sm font-medium text-gray-400 mb-3 block flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Restaurant Owner
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Owner Name</p>
                    <p className="text-gray-200 font-medium">{selectedRestaurant.owner.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Owner ID</p>
                    <p className="text-gray-200 font-mono text-sm">{selectedRestaurant.owner.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Owner Phone</p>
                    <p className="text-gray-200">{selectedRestaurant.owner.phone}</p>
                  </div>
                </div>
              </div>

              {/* Order & Tax Statistics */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#111116] border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order Statistics</p>
                      <p className="text-lg font-bold text-gray-100">{selectedRestaurant.completedOrders} / {selectedRestaurant.totalOrders}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Completed / Total Orders</p>
                </div>

                <div className="bg-[#111116] border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <DollarSign className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tax Collection</p>
                      <p className="text-lg font-bold text-gray-100">৳{selectedRestaurant.totalTaxCollected.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">৳{selectedRestaurant.taxPerOrder} per order</p>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-400 mb-3 block">Documents</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRestaurant.documents.map((doc, index) => (
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10 flex-wrap">
                {selectedRestaurant.status === 'Pending' && (
                  <button
                    onClick={() => handleAction('Accept', selectedRestaurant)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl font-medium hover:bg-green-500/20 transition-colors"
                  >
                    Accept Restaurant
                  </button>
                )}
                {selectedRestaurant.status === 'Suspended' ? (
                  <button
                    onClick={() => handleAction('Accept', selectedRestaurant)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl font-medium hover:bg-green-500/20 transition-colors"
                  >
                    Activate Restaurant
                  </button>
                ) : selectedRestaurant.status === 'Accepted' && (
                  <button
                    onClick={() => handleAction('Suspend', selectedRestaurant)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl font-medium hover:bg-yellow-500/20 transition-colors"
                  >
                    Suspend Restaurant
                  </button>
                )}
                {!selectedRestaurant.verified ? (
                  <button
                    onClick={() => handleAction('Verify', selectedRestaurant)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-medium hover:bg-blue-500/20 transition-colors"
                  >
                    Mark as Verified
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('Unverify', selectedRestaurant)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-xl font-medium hover:bg-gray-500/20 transition-colors"
                  >
                    Remove Verification
                  </button>
                )}
                <button
                  onClick={() => handleAction('Delete', selectedRestaurant)}
                  className="flex-1 min-w-[200px] px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
                >
                  Delete Restaurant
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
              Are you sure you want to <span className="font-semibold text-orange-400">{pendingAction.action.toLowerCase()}</span> restaurant{' '}
              <span className="font-semibold text-gray-200">{pendingAction.restaurant.name}</span>?
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
                    : pendingAction.action === 'Verify' || pendingAction.action === 'Accept'
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
