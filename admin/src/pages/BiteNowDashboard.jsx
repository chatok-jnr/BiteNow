import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import PendingCharts from '../components/PendingCharts';
import axiosInstance from '../utils/axios';

export default function BiteNowDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    pending_order: 0,
    pending_owner: 0,
    pending_rider: 0,
    no_of_customer: 0,
    no_of_restaurant_owner: 0,
    no_of_riders: 0,
    no_of_restaurant: 0,
    no_of_admin: 0,
    last4audit: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/allCount');
      if (response.data.status === 'success') {
        setDashboardData(response.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = [
    { label: 'Pending Orders', value: dashboardData.pending_order.toString() },
    { label: 'Restaurant Owner Pending', value: dashboardData.pending_owner.toString() },
    { label: 'Rider Pending', value: dashboardData.pending_rider.toString() }
  ];

  const userStats = [
    { role: 'Customer', count: dashboardData.no_of_customer.toLocaleString() },
    { role: 'Restaurant Owner', count: dashboardData.no_of_restaurant_owner.toLocaleString() },
    { role: 'Restaurant', count: dashboardData.no_of_restaurant.toLocaleString() },
    { role: 'Rider', count: dashboardData.no_of_riders.toLocaleString() },
    { role: 'Admin', count: dashboardData.no_of_admin.toLocaleString() }
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0a0a0f] text-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-[#0a0a0f] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-[#0a0a0f] text-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-[#0a0a0f] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#0a0a0f]">
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-50">Dashboard Overview</h2>
            <p className="text-gray-500">Monitor your platform's key metrics</p>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-6 mb-8 justify-center">
            {stats.map((stat, idx) => (
              <StatsCard key={idx} label={stat.label} value={stat.value} />
            ))}
          </div>

          {/* Pending Charts Section */}
          <div className="mb-8">
            <PendingCharts 
              pendingOrders={stats[0].value}
              pendingRestaurantOwners={stats[1].value}
              pendingRiders={stats[2].value}
            />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-3 gap-6">
            {/* Total Users - Takes 1 column */}
            <div className="relative border border-white/10 rounded-xl p-6 bg-gradient-to-br from-[#16161d] to-[#1a1a22] hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <h3 className="text-xl font-semibold mb-6 pb-3 border-b border-white/10 relative z-10 text-gray-50">
                Total Users
              </h3>
              <div className="space-y-4 relative z-10">
                {userStats.map((user, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 group/item"
                  >
                    <span className="text-gray-300 text-sm group-hover/item:text-gray-100 transition-colors">{user.role}</span>
                    <span className="text-xl font-bold text-gray-50 group-hover/item:text-orange-400 transition-colors">{user.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs - Takes 2 columns */}
            <div className="relative col-span-2 border border-white/10 rounded-xl p-6 bg-gradient-to-br from-[#16161d] to-[#1a1a22] hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <h3 className="text-xl font-semibold mb-6 pb-3 border-b border-white/10 relative z-10 text-gray-50">
                Last 4 Audit Logs
              </h3>
              <div className="space-y-4 relative z-10">
                {dashboardData.last4audit.map((log, idx) => (
                  <div
                    key={log._id || idx}
                    className="py-3 border-b border-white/5 last:border-0 group/item hover:bg-white/5 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="mb-2">
                      <p className="text-gray-300 group-hover/item:text-gray-100 transition-colors mb-1">
                        <span className="font-semibold text-orange-400">
                          {log.actor.id.admin_name}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">
                          (ID: {log.actor.id._id})
                        </span>
                        <span className="text-gray-400 ml-3">
                          - {formatAction(log.action)}
                        </span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                  </div>
                ))}
                {dashboardData.last4audit.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No audit logs available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}