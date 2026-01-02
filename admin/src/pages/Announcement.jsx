import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Send, Users, Bike, Store, UserCog, Bell, X, Search, Calendar, Filter } from 'lucide-react';
import axiosInstance from '../utils/axios';

export default function Announcement() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientType: 'All',
    specificRecipientId: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [announcementHistory, setAnnouncementHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('send'); // 'send' or 'history'
  const [expandedItems, setExpandedItems] = useState(new Set()); // Track expanded announcement items

  const recipientTypes = [
    { value: 'All', label: 'All Users', icon: Users, description: 'Send to everyone', apiValue: 'ALL' },
    { value: 'All Customer', label: 'All Customers', icon: Users, description: 'Send to all customers', apiValue: 'ALL_CUSTOMER' },
    { value: 'All Rider', label: 'All Riders', icon: Bike, description: 'Send to all riders', apiValue: 'ALL_RIDER' },
    { value: 'All Restaurant Owner', label: 'All Restaurant Owners', icon: Store, description: 'Send to all restaurant owners', apiValue: 'ALL_RESTAURANT_OWNER' },
    { value: 'Specific Customer', label: 'Specific Customer', icon: UserCog, description: 'Send to a specific customer', apiValue: 'CUSTOMER' },
    { value: 'Specific Rider', label: 'Specific Rider', icon: UserCog, description: 'Send to a specific rider', apiValue: 'RIDER' },
    { value: 'Specific Restaurant Owner', label: 'Specific Restaurant Owner', icon: UserCog, description: 'Send to a specific restaurant owner', apiValue: 'OWNER' }
  ];

  // Fetch announcements on component mount and when switching to history tab
  useEffect(() => {
    if (activeTab === 'history') {
      fetchAnnouncements();
    }
  }, [activeTab]);

  // Filter history based on category
  useEffect(() => {
    if (historyFilter === 'All') {
      setFilteredHistory(announcementHistory);
    } else {
      setFilteredHistory(announcementHistory.filter(item => item.recipientType === historyFilter));
    }
  }, [historyFilter, announcementHistory]);

  // Fetch announcements from API
  const fetchAnnouncements = async () => {
    try {
      const response = await axiosInstance.get('/admin/announcement');
      if (response.data.status === 'success' && response.data.announcement) {
        // Transform API response to match our UI format
        const transformedData = response.data.announcement.map(item => {
          // Map API user_type back to our UI recipientType
          const recipientType = recipientTypes.find(rt => rt.apiValue === item.target.user_type);
          
          return {
            title: item.announcement.title,
            message: item.announcement.message,
            recipientType: recipientType?.value || item.target.user_type,
            specificRecipientId: item.target.user_id || '',
            timestamp: item.createdAt,
            _id: item._id
          };
        });
        setAnnouncementHistory(transformedData);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err.response?.data?.message || 'Failed to fetch announcements');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.message.trim() || !formData.reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.recipientType.startsWith('Specific') && !formData.specificRecipientId) {
      setError('Please select a specific recipient');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get the API value for the selected recipient type
      const selectedType = recipientTypes.find(rt => rt.value === formData.recipientType);
      
      // Prepare announcement data according to API format
      const announcementData = {
        title: formData.title,
        message: formData.message,
        user_type: selectedType.apiValue,
        user_id: formData.specificRecipientId || null,
        reasson: formData.reason
      };

      // Send announcement to API
      const response = await axiosInstance.post('/admin/announcement', announcementData);
      
      if (response.data.status === 'success') {
        setSuccess(`Announcement sent successfully to ${formData.recipientType}!`);
        
        // Reset form
        setFormData({
          title: '',
          message: '',
          recipientType: 'All',
          specificRecipientId: '',
          reason: ''
        });
        
        // Refresh announcement history if on history tab
        if (activeTab === 'history') {
          fetchAnnouncements();
        }
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      }
      
    } catch (err) {
      console.error('Error sending announcement:', err);
      setError(err.response?.data?.message || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: value,
      // Reset specific recipient when changing type
      specificRecipientId: name === 'recipientType' ? '' : formData.specificRecipientId
    });
  };

  // Toggle announcement expansion
  const toggleExpand = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0d0d12]">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Announcements</h1>
                <p className="text-gray-400 text-sm">Send announcements to users</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('send')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'send'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-[#1a1a22] text-gray-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Announcement
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-[#1a1a22] text-gray-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                History
              </div>
            </button>
          </div>

          {activeTab === 'send' ? (
            <div className="max-w-4xl">
              {/* Alerts */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 flex items-center justify-between">
                  <span>{success}</span>
                  <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Announcement Form */}
              <div className="bg-[#1a1a22] border border-white/10 rounded-xl p-6">
                <form onSubmit={handleSubmit}>
                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Announcement Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter announcement title"
                      className="w-full px-4 py-3 bg-[#0d0d12] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-[#111116] transition-all"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Enter your announcement message"
                      rows="6"
                      className="w-full px-4 py-3 bg-[#0d0d12] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-[#111116] transition-all resize-none"
                      required
                    />
                  </div>

                  {/* Reason */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reason *
                    </label>
                    <input
                      type="text"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Enter reason for announcement"
                      className="w-full px-4 py-3 bg-[#0d0d12] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-[#111116] transition-all"
                      required
                    />
                  </div>

                  {/* Recipient Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Send To *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recipientTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, recipientType: type.value, specificRecipientId: '' })}
                            className={`p-4 rounded-lg border text-left transition-all ${
                              formData.recipientType === type.value
                                ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/10'
                                : 'bg-[#0d0d12] border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                formData.recipientType === type.value
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'bg-white/5 text-gray-400'
                              }`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-medium mb-1 ${
                                  formData.recipientType === type.value ? 'text-purple-400' : 'text-gray-300'
                                }`}>
                                  {type.label}
                                </h4>
                                <p className="text-xs text-gray-500">{type.description}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Specific Recipient ID Input */}
                  {formData.recipientType.startsWith('Specific') && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {formData.recipientType === 'Specific Customer' && 'Customer ID *'}
                        {formData.recipientType === 'Specific Rider' && 'Rider ID *'}
                        {formData.recipientType === 'Specific Restaurant Owner' && 'Restaurant Owner ID *'}
                      </label>
                      <input
                        type="text"
                        name="specificRecipientId"
                        value={formData.specificRecipientId}
                        onChange={handleInputChange}
                        placeholder={`Enter ${formData.recipientType.replace('Specific ', '').toLowerCase()} ID`}
                        className="w-full px-4 py-3 bg-[#0d0d12] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-[#111116] transition-all"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Enter the unique ID of the {formData.recipientType.replace('Specific ', '').toLowerCase()}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium shadow-lg shadow-purple-500/20 hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Announcement
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* History Tab */
            <div>
              {/* Filter Section */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Filter by:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setHistoryFilter('All')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      historyFilter === 'All'
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-[#1a1a22] text-gray-400 hover:bg-white/5 border border-white/10'
                    }`}
                  >
                    All
                  </button>
                  {recipientTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setHistoryFilter(type.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        historyFilter === type.value
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-[#1a1a22] text-gray-400 hover:bg-white/5 border border-white/10'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* History List */}
              <div className="bg-[#1a1a22] border border-white/10 rounded-xl p-6">
                {filteredHistory.length > 0 ? (
                  <div className="space-y-4">
                    {filteredHistory.map((item, index) => {
                      const recipientType = recipientTypes.find(t => t.value === item.recipientType);
                      const Icon = recipientType?.icon || Bell;
                      const itemId = item._id || index;
                      const isExpanded = expandedItems.has(itemId);
                      
                      return (
                        <div
                          key={itemId}
                          onClick={() => toggleExpand(itemId)}
                          className="bg-[#0d0d12] border border-white/10 rounded-lg p-4 hover:border-purple-500/30 transition-all cursor-pointer"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                                  <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <Users className="w-4 h-4" />
                                      {item.recipientType}
                                    </span>
                                    {item.specificRecipientId && (
                                      <span className="text-gray-500">
                                        ID: {item.specificRecipientId}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {new Date(item.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-gray-400 ml-4">
                                  <svg
                                    className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <p className="text-gray-300 text-sm leading-relaxed">{item.message}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      {historyFilter === 'All' ? 'No Announcement History' : `No ${historyFilter} Announcements`}
                    </h3>
                    <p className="text-gray-500">
                      {historyFilter === 'All' 
                        ? 'Your sent announcements will appear here' 
                        : `No announcements sent to ${historyFilter}`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}