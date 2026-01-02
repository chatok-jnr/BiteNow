import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, X, FileText, User, Shield, Calendar, AlertCircle } from 'lucide-react';
import axiosInstance from '../utils/axios';

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch audit logs from API
  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/auditLogs');
      
      if (response.data.status === 'success') {
        setAuditLogs(response.data.data);
        setFilteredLogs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Show error message to user
      if (error.response?.status === 401) {
        // Handle unauthorized - redirect to login
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter logs based on search
  useEffect(() => {
    if (searchQuery) {
      const filtered = auditLogs.filter(log => 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.target?.user_type && log.target.user_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        log.reasson.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(auditLogs);
    }
  }, [searchQuery, auditLogs]);

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('APPROVE')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (action.includes('REJECT')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (action.includes('BAN')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (action.includes('UNBAN')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (action.includes('DELETE')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (action.includes('PASS_RESET')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (action.includes('ANNOUNCEMENT')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getUserTypeBadgeColor = (userType) => {
    switch(userType) {
      case 'Customer': return 'bg-blue-500/20 text-blue-400';
      case 'RestaurantOwner': return 'bg-orange-500/20 text-orange-400';
      case 'Rider': return 'bg-green-500/20 text-green-400';
      case 'Restaurant': return 'bg-purple-500/20 text-purple-400';
      case 'All': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <Sidebar />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          </div>
          <p className="text-gray-400">Track all administrative actions and changes</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by action, user type, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1a1a22] border border-white/10 rounded-2xl text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1a1a22] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Logs</p>
                <p className="text-2xl font-bold text-white mt-1">{auditLogs.length}</p>
              </div>
              <FileText className="w-10 h-10 text-orange-500/50" />
            </div>
          </div>
          <div className="bg-[#1a1a22] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approvals</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {auditLogs.filter(log => log.action.includes('APPROVE')).length}
                </p>
              </div>
              <Shield className="w-10 h-10 text-green-500/50" />
            </div>
          </div>
          <div className="bg-[#1a1a22] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejections</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                  {auditLogs.filter(log => log.action.includes('REJECT')).length}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-500/50" />
            </div>
          </div>
          <div className="bg-[#1a1a22] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Bans/Unbans</p>
                <p className="text-2xl font-bold text-orange-400 mt-1">
                  {auditLogs.filter(log => log.action.includes('BAN') || log.action.includes('UNBAN')).length}
                </p>
              </div>
              <User className="w-10 h-10 text-orange-500/50" />
            </div>
          </div>
        </div>

        {/* Audit Logs List */}
        <div className="bg-[#1a1a22] border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="text-gray-400 mt-4">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No audit logs found</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <div
                  key={log._id}
                  onClick={() => handleLogClick(log)}
                  className="p-6 hover:bg-white/5 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionBadgeColor(log.action)}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          {log.target?.user_type && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUserTypeBadgeColor(log.target.user_type)}`}>
                              {log.target.user_type}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Admin</p>
                      <p className="text-gray-300 font-medium">{log.actor.id.admin_name}</p>
                      <p className="text-gray-600 font-mono text-xs mt-0.5">{log.actor.id._id}</p>
                    </div>
                    {log.target?.id ? (
                      <div>
                        <p className="text-gray-500 mb-1">Target User</p>
                        <p className="text-gray-300 font-medium font-mono text-sm">{log.target.id}</p>
                        <p className="text-gray-600 text-xs mt-0.5">{log.target.user_type}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-500 mb-1">Target User</p>
                        <p className="text-gray-400 italic text-sm">No specific user</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedLog && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowDetailModal(false);
              setSelectedLog(null);
            }}
          >
            <div 
              className="bg-[#1a1a22] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#1a1a22] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Audit Log Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Action Type */}
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Action Type</label>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getActionBadgeColor(selectedLog.action)}`}>
                    {selectedLog.action.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Date & Time */}
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Date & Time</label>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedLog.createdAt)}</span>
                  </div>
                </div>

                {/* Admin Information */}
                <div className="bg-[#111116] border border-white/5 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Admin Name</p>
                      <p className="text-gray-300 font-medium">{selectedLog.actor.id.admin_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Admin ID</p>
                      <p className="text-gray-300 font-mono text-sm">{selectedLog.actor.id._id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">IP Address</p>
                      <p className="text-gray-300 font-mono text-sm">{selectedLog.actor.ip_address}</p>
                    </div>
                  </div>
                </div>

                {/* Target User Information */}
                {selectedLog.target?.id ? (
                  <div className="bg-[#111116] border border-white/5 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Target User Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">User Type</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getUserTypeBadgeColor(selectedLog.target.user_type)}`}>
                          {selectedLog.target.user_type}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">User ID</p>
                        <p className="text-gray-300 font-mono text-sm">{selectedLog.target.id}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#111116] border border-white/5 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Target User Information
                    </h3>
                    <p className="text-gray-500 text-sm italic">No specific user targeted (General action)</p>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Reason for Action</label>
                  <div className="bg-[#111116] border border-white/5 rounded-2xl p-4">
                    <p className="text-gray-300 leading-relaxed">{selectedLog.reasson}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-[#1a1a22] border-t border-white/10 px-6 py-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-2xl transition-all shadow-lg shadow-orange-500/20"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
