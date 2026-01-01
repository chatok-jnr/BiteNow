import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, MoreVertical, X, FileText, ExternalLink, Bike } from 'lucide-react';

export default function Riders() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [riders, setRiders] = useState([]);
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Mock data - Replace with actual API call
  useEffect(() => {
    const mockRiders = [
      {
        id: 'RD001',
        name: 'Jahangir Alam',
        email: 'jahangir.alam@example.com',
        phone: '+8801712345678',
        status: 'Approved',
        // removed verification
        photo: 'https://i.pravatar.cc/150?img=12',
        birthDate: '1995-03-15',
        gender: 'Male',
        address: 'Dhanmondi, Dhaka',
        joinedDate: '2024-01-10',
        totalRides: 245,
        documents: [
          { type: 'Bike License', url: 'https://example.com/bike-license-1.pdf', uploadedAt: '2024-01-10' },
          { type: 'NID', url: 'https://example.com/nid-1.pdf', uploadedAt: '2024-01-10' },
          { type: 'Driving License', url: 'https://example.com/driving-license-1.pdf', uploadedAt: '2024-01-10' }
        ],
        bikeInfo: {
          model: 'Honda CB Shine',
          year: '2022',
          licensePlate: 'DHA-MA-11-2345'
        }
      },
      {
        id: 'RD002',
        name: 'Rahim Uddin',
        email: 'rahim.uddin@example.com',
        phone: '+8801823456789',
        status: 'Pending',
        // removed verification
        photo: 'https://i.pravatar.cc/150?img=15',
        birthDate: '1992-07-22',
        gender: 'Male',
        address: 'Gulshan, Dhaka',
        joinedDate: '2024-03-20',
        totalRides: 0,
        documents: [
          { type: 'Bike License', url: 'https://example.com/bike-license-2.pdf', uploadedAt: '2024-03-20' },
          { type: 'NID', url: 'https://example.com/nid-2.pdf', uploadedAt: '2024-03-20' }
        ],
        bikeInfo: {
          model: 'Bajaj Pulsar',
          year: '2023',
          licensePlate: 'DHA-MA-12-3456'
        }
      },
      {
        id: 'RD003',
        name: 'Kamal Hossain',
        email: 'kamal.hossain@example.com',
        phone: '+8801934567890',
        status: 'Approved',
        // removed verification
        photo: 'https://i.pravatar.cc/150?img=13',
        birthDate: '1988-11-08',
        gender: 'Male',
        address: 'Uttara, Dhaka',
        joinedDate: '2023-12-05',
        totalRides: 512,
        documents: [
          { type: 'Bike License', url: 'https://example.com/bike-license-3.pdf', uploadedAt: '2023-12-05' },
          { type: 'NID', url: 'https://example.com/nid-3.pdf', uploadedAt: '2023-12-05' },
          { type: 'Driving License', url: 'https://example.com/driving-license-3.pdf', uploadedAt: '2023-12-05' },
          { type: 'Police Clearance', url: 'https://example.com/police-clearance-3.pdf', uploadedAt: '2023-12-05' }
        ],
        bikeInfo: {
          model: 'Hero Splendor',
          year: '2021',
          licensePlate: 'DHA-MA-10-1234'
        }
      },
      {
        id: 'RD004',
        name: 'Anwar Khan',
        email: 'anwar.khan@example.com',
        phone: '+8801645678901',
        status: 'Suspended',
        // removed verification
        photo: 'https://i.pravatar.cc/150?img=14',
        birthDate: '1990-05-30',
        gender: 'Male',
        address: 'Banani, Dhaka',
        joinedDate: '2023-10-15',
        totalRides: 189,
        documents: [
          { type: 'Bike License', url: 'https://example.com/bike-license-4.pdf', uploadedAt: '2023-10-15' },
          { type: 'NID', url: 'https://example.com/nid-4.pdf', uploadedAt: '2023-10-15' },
          { type: 'Driving License', url: 'https://example.com/driving-license-4.pdf', uploadedAt: '2023-10-15' }
        ],
        bikeInfo: {
          model: 'TVS Apache',
          year: '2022',
          licensePlate: 'DHA-MA-11-5678'
        }
      },
      {
        id: 'RD005',
        name: 'Billal Hossain',
        email: 'billal.hossain@example.com',
        phone: '+8801556789012',
        status: 'Approved',
        // removed verification
        photo: 'https://i.pravatar.cc/150?img=16',
        birthDate: '1994-09-12',
        gender: 'Male',
        address: 'Mirpur, Dhaka',
        joinedDate: '2024-02-18',
        totalRides: 87,
        documents: [
          { type: 'Bike License', url: 'https://example.com/bike-license-5.pdf', uploadedAt: '2024-02-18' },
          { type: 'NID', url: 'https://example.com/nid-5.pdf', uploadedAt: '2024-02-18' }
        ],
        bikeInfo: {
          model: 'Suzuki Gixxer',
          year: '2023',
          licensePlate: 'DHA-MA-13-7890'
        }
      },
      {
        id: 'RD006',
        name: 'Shafiq Ahmed',
        email: 'shafiq.ahmed@example.com',
        phone: '+8801467890123',
        status: 'Pending',
        // removed verification
        photo: 'https://i.pravatar.cc/150?img=17',
        birthDate: '1996-01-20',
        gender: 'Male',
        address: 'Mohammadpur, Dhaka',
        joinedDate: '2024-03-25',
        totalRides: 0,
        documents: [
          { type: 'Bike License', url: 'https://example.com/bike-license-6.pdf', uploadedAt: '2024-03-25' },
          { type: 'NID', url: 'https://example.com/nid-6.pdf', uploadedAt: '2024-03-25' },
          { type: 'Driving License', url: 'https://example.com/driving-license-6.pdf', uploadedAt: '2024-03-25' }
        ],
        bikeInfo: {
          model: 'Yamaha FZ',
          year: '2022',
          licensePlate: 'DHA-MA-14-9012'
        }
      },
      {
        id: 'RD007',
        name: 'Nasir Mahmud',
        email: 'nasir.mahmud@example.com',
        phone: '+8801378901234',
        status: 'Approved',
        // removed verification
        photo: 'https://i.pravatar.cc/150?img=18',
        birthDate: '1991-06-18',
        gender: 'Male',
        address: 'Bashundhara, Dhaka',
        joinedDate: '2023-11-12',
        totalRides: 356,
        documents: [
          { type: 'Bike License', url: 'https://example.com/bike-license-7.pdf', uploadedAt: '2023-11-12' },
          { type: 'NID', url: 'https://example.com/nid-7.pdf', uploadedAt: '2023-11-12' },
          { type: 'Driving License', url: 'https://example.com/driving-license-7.pdf', uploadedAt: '2023-11-12' }
        ],
        bikeInfo: {
          model: 'Honda CB Hornet',
          year: '2021',
          licensePlate: 'DHA-MA-09-3456'
        }
      }
    ];
    setRiders(mockRiders);
  }, []);

  // Filter riders based on active tab and search
  useEffect(() => {
    let filtered = riders;

    // Filter by tab
    if (activeTab === 'Pending') {
      filtered = filtered.filter(r => r.status === 'Pending');
    } else if (activeTab === 'Approved') {
      filtered = filtered.filter(r => r.status === 'Approved');
    } else if (activeTab === 'Suspended') {
      filtered = filtered.filter(r => r.status === 'Suspended');
    // Removed Verified tab filter
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRiders(filtered);
  }, [activeTab, searchQuery, riders]);

  const handleCardClick = (rider) => {
    setSelectedRider(rider);
    setShowDetailModal(true);
    setShowActionMenu(null);
  };

  const handleActionClick = (e, riderId) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === riderId ? null : riderId);
  };

  const handleAction = (action, rider) => {
    setPendingAction({ action, rider });
    setShowConfirmDialog(true);
    setShowActionMenu(null);
  };

  const confirmAction = () => {
    const { action, rider } = pendingAction;
    
    // Update rider status
    setRiders(prev => prev.map(r => {
      if (r.id === rider.id) {
        if (action === 'Delete') {
          return null; // Will be filtered out
        } else if (action === 'Approve') {
          return { ...r, status: 'Approved' };
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

  const tabs = ['All', 'Pending', 'Approved', 'Suspended'];

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-auto bg-[#0a0a0f]">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-50">Rider Management</h2>
            <p className="text-gray-500">View and manage all riders on the platform</p>
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
                placeholder="Search riders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a22] border border-white/10 rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-[#1f1f2a] transition-all"
              />
            </div>
          </div>

          {/* Rider Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRiders.map((rider) => (
              <div
                key={rider.id}
                onClick={() => handleCardClick(rider)}
                className="group relative bg-[#1a1a22] border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1"
              >
                {/* Three Dots Menu */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => handleActionClick(e, rider.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Action Dropdown */}
                  {showActionMenu === rider.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1f1f2a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                      {rider.status === 'Pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Approve', rider);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-green-400 hover:bg-white/5 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {rider.status === 'Suspended' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Approve', rider);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-green-400 hover:bg-white/5 transition-colors"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('Suspend', rider);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-yellow-400 hover:bg-white/5 transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      {/* Verification buttons removed */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('Delete', rider);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Rider Photo */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <img
                      src={rider.photo}
                      alt={rider.name}
                      className="w-24 h-24 rounded-full border-4 border-white/10 group-hover:border-orange-500/50 transition-colors"
                    />
                    <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[#1a1a22] ${
                      rider.status === 'Approved' ? 'bg-green-500' : 
                      rider.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>

                {/* Rider Info */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-100">{rider.name}</h3>
                    {/* Verification badge removed */}
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-3">{rider.id}</p>
                  
                  {/* Status Badge */}
                  <div className="flex justify-center mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      rider.status === 'Approved' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : rider.status === 'Pending'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {rider.status}
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-500">Total Rides</p>
                      <p className="text-sm font-semibold text-gray-200 flex items-center justify-center gap-1">
                        <Bike className="w-3 h-3" />
                        {rider.totalRides}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Documents</p>
                      <p className="text-sm font-semibold text-gray-200 flex items-center justify-center gap-1">
                        <FileText className="w-3 h-3" />
                        {rider.documents.length}
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
          {filteredRiders.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No riders found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>

      {/* Rider Detail Modal */}
      {showDetailModal && selectedRider && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDetailModal(false);
            setSelectedRider(null);
          }}
        >
          <div 
            className="bg-[#1a1a22] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1a1a22] border-b border-white/10 p-6 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold text-gray-100">Rider Details</h3>
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
                  src={selectedRider.photo}
                  alt={selectedRider.name}
                  className="w-24 h-24 rounded-full border-4 border-white/10"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-2xl font-bold text-gray-100">{selectedRider.name}</h4>
                    {selectedRider.verified && (
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-mono mb-2">{selectedRider.id}</p>
                  <div className="flex gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      selectedRider.status === 'Approved' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : selectedRider.status === 'Pending'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {selectedRider.status}
                    </span>
                    {/* Verification badge removed */}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <DetailItem label="Email" value={selectedRider.email} />
                <DetailItem label="Phone" value={selectedRider.phone} />
                <DetailItem label="Birth Date" value={selectedRider.birthDate} />
                <DetailItem label="Gender" value={selectedRider.gender} />
                <DetailItem label="Joined Date" value={selectedRider.joinedDate} />
                <DetailItem label="Total Rides Completed" value={selectedRider.totalRides} />
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Address</label>
                <p className="text-gray-200 bg-[#111116] p-4 rounded-xl border border-white/10">
                  {selectedRider.address}
                </p>
              </div>

              {/* Bike Information */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-400 mb-3 block">Bike Information</label>
                <div className="bg-[#111116] p-4 rounded-xl border border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Model</p>
                      <p className="text-sm font-medium text-gray-200">{selectedRider.bikeInfo.model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Year</p>
                      <p className="text-sm font-medium text-gray-200">{selectedRider.bikeInfo.year}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">License Plate</p>
                      <p className="text-sm font-medium text-gray-200 font-mono">{selectedRider.bikeInfo.licensePlate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-400 mb-3 block">Documents</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRider.documents.map((doc, index) => (
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
                {selectedRider.status === 'Pending' && (
                  <button
                    onClick={() => handleAction('Approve', selectedRider)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl font-medium hover:bg-green-500/20 transition-colors"
                  >
                    Approve Rider
                  </button>
                )}
                {selectedRider.status === 'Suspended' ? (
                  <button
                    onClick={() => handleAction('Approve', selectedRider)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl font-medium hover:bg-green-500/20 transition-colors"
                  >
                    Activate Rider
                  </button>
                ) : selectedRider.status === 'Approved' && (
                  <button
                    onClick={() => handleAction('Suspend', selectedRider)}
                    className="flex-1 min-w-[200px] px-4 py-3 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl font-medium hover:bg-yellow-500/20 transition-colors"
                  >
                    Suspend Rider
                  </button>
                )}
                {/* Verification action buttons removed */}
                <button
                  onClick={() => handleAction('Delete', selectedRider)}
                  className="flex-1 min-w-[200px] px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
                >
                  Delete Rider
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
              Are you sure you want to <span className="font-semibold text-orange-400">{pendingAction.action.toLowerCase()}</span> rider{' '}
              <span className="font-semibold text-gray-200">{pendingAction.rider.name}</span>?
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
                    : pendingAction.action === 'Approve'
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
