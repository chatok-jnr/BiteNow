import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, X, Shield, Mail, Hash, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '../utils/axios';

export default function AdminList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch admins from API
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/adminList');
      
      if (response.data.status === 'success' && response.data.admins) {
        // Transform the API response to match the component's data structure
        const transformedAdmins = response.data.admins.map(admin => {
          // Count actions by type
          const actionCounts = {
            CUSTOMER_BAN: 0,
            CUSTOMER_DELETE: 0,
            CUSTOMER_UNBAN: 0,
            CUSTOMER_PASS_RESET: 0,
            OWNER_APPROVE: 0,
            OWNER_REJECT: 0,
            OWNER_BAN: 0,
            OWNER_UNBAN: 0,
            OWNER_DELETE: 0,
            OWNER_PASS_RESET: 0,
            RIDER_APPROVE: 0,
            RIDER_REJECT: 0,
            RIDER_BAN: 0,
            RIDER_UNBAN: 0,
            RIDER_DELETE: 0,
            RIDER_PASS_RESET: 0,
            ANNOUNCEMENT: 0
          };

          // Count each action type from myActions array
          if (admin.myActions && Array.isArray(admin.myActions)) {
            admin.myActions.forEach(actionItem => {
              const actionType = actionItem.action;
              if (actionCounts.hasOwnProperty(actionType)) {
                actionCounts[actionType]++;
              }
            });
          }

          // Calculate total actions
          const totalActions = admin.myActions ? admin.myActions.length : 0;

          return {
            id: admin._id,
            name: admin.admin_name,
            email: admin.admin_email,
            phone: admin.admin_phone,
            dob: admin.admin_dob,
            gender: admin.admin_gender,
            address: admin.admin_address,
            photo: admin.admin_photo,
            isVerified: admin.admin_is_verified,
            role: admin.role,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt,
            totalActions: totalActions,
            actionCounts: actionCounts,
            myActions: admin.myActions || []
          };
        });

        setAdmins(transformedAdmins);
        setFilteredAdmins(transformedAdmins);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setLoading(false);
    }
  };

  // Filter admins based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAdmins(admins);
    } else {
      const filtered = admins.filter(admin =>
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAdmins(filtered);
    }
  }, [searchQuery, admins]);

  const toggleRowExpansion = (adminId) => {
    setExpandedRows(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  const viewAdminDetails = (admin) => {
    setSelectedAdmin(admin);
    setShowDetailModal(true);
  };

  const getActionLabel = (actionKey) => {
    return actionKey.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getActionCategory = (actionKey) => {
    if (actionKey.startsWith('CUSTOMER')) return 'Customer';
    if (actionKey.startsWith('OWNER')) return 'Restaurant Owner';
    if (actionKey.startsWith('RIDER')) return 'Rider';
    return 'General';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111116] to-[#0a0a0f]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-white">Admin List</h1>
            </div>
            <p className="text-gray-400">Manage and monitor all admin accounts and their activities</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1a1a22] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#1a1a22] to-[#1f1f2a] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Admins</p>
                  <p className="text-3xl font-bold text-white">{admins.length}</p>
                </div>
                <Shield className="w-12 h-12 text-orange-500/30" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1a1a22] to-[#1f1f2a] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Actions</p>
                  <p className="text-3xl font-bold text-white">
                    {admins.reduce((sum, admin) => sum + admin.totalActions, 0)}
                  </p>
                </div>
                <Activity className="w-12 h-12 text-blue-500/30" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1a1a22] to-[#1f1f2a] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Avg Actions per Admin</p>
                  <p className="text-3xl font-bold text-white">
                    {admins.length > 0 ? Math.round(admins.reduce((sum, admin) => sum + admin.totalActions, 0) / admins.length) : 0}
                  </p>
                </div>
                <Activity className="w-12 h-12 text-green-500/30" />
              </div>
            </div>
          </div>

          {/* Admin Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading admins...</p>
              </div>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1a22] border border-white/10 rounded-2xl">
              <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No admins found</p>
            </div>
          ) : (
            <div className="bg-[#1a1a22] border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#1f1f2a]">
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">ID</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Name</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Email</th>
                      <th className="text-center p-4 text-gray-400 font-medium text-sm">Total Actions</th>
                      <th className="text-center p-4 text-gray-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((admin) => (
                      <React.Fragment key={admin.id}>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <span className="text-gray-300 font-mono text-sm">{admin.id.substring(0, 8)}...</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-semibold">
                                {admin.name.charAt(0)}
                              </div>
                              <span className="text-white font-medium">{admin.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-300">{admin.email}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-full font-semibold">
                              <Activity className="w-4 h-4" />
                              {admin.totalActions}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => viewAdminDetails(admin)}
                                className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-all text-sm font-medium"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => toggleRowExpansion(admin.id)}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
                              >
                                {expandedRows[admin.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRows[admin.id] && (
                          <tr className="bg-[#15151a] border-b border-white/5">
                            <td colSpan="5" className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['Customer', 'Restaurant Owner', 'Rider'].map(category => {
                                  const categoryActions = Object.entries(admin.actionCounts).filter(([key]) => 
                                    getActionCategory(key) === category
                                  );
                                  const categoryTotal = categoryActions.reduce((sum, [, count]) => sum + count, 0);

                                  return (
                                    <div key={category} className="bg-[#1a1a22] border border-white/10 rounded-xl p-4">
                                      <h4 className="text-white font-semibold mb-3 flex items-center justify-between">
                                        <span>{category} Actions</span>
                                        <span className="text-orange-500 text-sm">{categoryTotal}</span>
                                      </h4>
                                      <div className="space-y-2">
                                        {categoryActions.map(([actionKey, count]) => (
                                          count > 0 && (
                                            <div key={actionKey} className="flex items-center justify-between text-sm">
                                              <span className="text-gray-400">{getActionLabel(actionKey)}</span>
                                              <span className="text-white font-medium bg-white/5 px-2 py-1 rounded">
                                                {count}
                                              </span>
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {admin.actionCounts.ANNOUNCEMENT > 0 && (
                                <div className="mt-4 bg-[#1a1a22] border border-white/10 rounded-xl p-4">
                                  <h4 className="text-white font-semibold mb-2">General Actions</h4>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Announcements</span>
                                    <span className="text-white font-medium bg-white/5 px-2 py-1 rounded">
                                      {admin.actionCounts.ANNOUNCEMENT}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedAdmin && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDetailModal(false);
            setSelectedAdmin(null);
          }}
        >
          <div 
            className="bg-[#1a1a22] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#1a1a22] border-b border-white/10 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Admin Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Admin Info */}
              <div className="bg-gradient-to-br from-[#1f1f2a] to-[#15151a] border border-white/10 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-3xl font-bold">
                    {selectedAdmin.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{selectedAdmin.name}</h3>
                    <p className="text-gray-400">{selectedAdmin.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a22] border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Admin ID</p>
                    <p className="text-white font-mono text-sm">{selectedAdmin.id}</p>
                  </div>
                  <div className="bg-[#1a1a22] border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Actions</p>
                    <p className="text-white text-2xl font-bold">{selectedAdmin.totalActions}</p>
                  </div>
                </div>
              </div>

              {/* Action Breakdown */}
              <h3 className="text-xl font-bold text-white mb-4">Action Breakdown</h3>
              
              {/* Customer Actions */}
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Customer Actions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedAdmin.actionCounts)
                    .filter(([key]) => key.startsWith('CUSTOMER'))
                    .map(([key, value]) => (
                      <div key={key} className="bg-[#1f1f2a] border border-white/10 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-gray-400 text-sm">{getActionLabel(key)}</span>
                        <span className="text-white font-semibold bg-blue-500/10 px-3 py-1 rounded-full">{value}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Owner Actions */}
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Restaurant Owner Actions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedAdmin.actionCounts)
                    .filter(([key]) => key.startsWith('OWNER'))
                    .map(([key, value]) => (
                      <div key={key} className="bg-[#1f1f2a] border border-white/10 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-gray-400 text-sm">{getActionLabel(key)}</span>
                        <span className="text-white font-semibold bg-green-500/10 px-3 py-1 rounded-full">{value}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Rider Actions */}
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Rider Actions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedAdmin.actionCounts)
                    .filter(([key]) => key.startsWith('RIDER'))
                    .map(([key, value]) => (
                      <div key={key} className="bg-[#1f1f2a] border border-white/10 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-gray-400 text-sm">{getActionLabel(key)}</span>
                        <span className="text-white font-semibold bg-purple-500/10 px-3 py-1 rounded-full">{value}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Other Actions */}
              {selectedAdmin.actionCounts.ANNOUNCEMENT > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    General Actions
                  </h4>
                  <div className="bg-[#1f1f2a] border border-white/10 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Announcements</span>
                    <span className="text-white font-semibold bg-orange-500/10 px-3 py-1 rounded-full">
                      {selectedAdmin.actionCounts.ANNOUNCEMENT}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
