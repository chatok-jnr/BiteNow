import React from 'react';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import PendingCharts from '../components/PendingCharts';

export default function BiteNowDashboard() {
  const stats = [
    { label: 'Pending Orders', value: '247' },
    { label: 'Restaurant Owner Pending', value: '12' },
    { label: 'Rider Pending', value: '8' }
  ];

  const userStats = [
    { role: 'Customer', count: '15,429' },
    { role: 'Restaurant Owner', count: '342' },
    { role: 'Restaurant', count: '289' },
    { role: 'Rider', count: '156' },
    { role: 'Admin', count: '7' }
  ];

  const auditLogs = [
    { user: 'Chatok', action: 'Banned a customer', time: '2 hours ago' },
    { user: 'Opu', action: 'Approved a restaurant', time: '3 hours ago' },
    { user: 'Sarah', action: 'Updated rider status', time: '5 hours ago' },
    { user: 'Mike', action: 'Reviewed order dispute', time: '6 hours ago' }
  ];

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
                {auditLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="py-3 border-b border-white/5 last:border-0 group/item hover:bg-white/5 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-gray-300 group-hover/item:text-gray-100 transition-colors">
                        <span className="font-semibold text-orange-400">
                          {log.user}:
                        </span>{' '}
                        {log.action}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">{log.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}