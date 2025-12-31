import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function PendingCharts({ pendingOrders, pendingRestaurantOwners, pendingRiders }) {
  // Data for bar chart
  const barData = [
    { name: 'Orders', value: parseInt(pendingOrders) || 0 },
    { name: 'Restaurant Owners', value: parseInt(pendingRestaurantOwners) || 0 },
    { name: 'Riders', value: parseInt(pendingRiders) || 0 }
  ];

  // Data for pie chart
  const pieData = [
    { name: 'Pending Orders', value: parseInt(pendingOrders) || 0 },
    { name: 'Pending Owners', value: parseInt(pendingRestaurantOwners) || 0 },
    { name: 'Pending Riders', value: parseInt(pendingRiders) || 0 }
  ];

  // Colors for the charts (Pending Riders is blue for distinction)
  const COLORS = ['#fc5e03', '#f59e0b', '#3b82f6']; // Orders: orange, Owners: amber, Riders: blue

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a22] border border-[#fc5e03]/40 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 font-semibold">{payload[0].name}</p>
          <p className="font-bold text-lg" style={{ color: '#fc5e03' }}>{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Bar Chart
      <div className="relative border border-white/10 rounded-xl p-6 bg-gradient-to-br from-[#16161d] to-[#1a1a22] hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
        <h3 className="text-xl font-semibold mb-6 pb-3 border-b border-white/10 text-gray-50">
          Pending Items Overview (Bar Chart)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#9ca3af' }}
            />
            <Bar 
              dataKey="value" 
              fill="#fb923c"
              radius={[8, 8, 0, 0]}
              name="Pending Count"
            />
          </BarChart>
        </ResponsiveContainer>
      </div> */}

      {/* Pie Chart */}
      <div className="relative border border-white/10 rounded-xl p-6 bg-gradient-to-br from-[#16161d] to-[#1a1a22] hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
        <h3 className="text-xl font-semibold mb-6 pb-3 border-b border-white/10 text-gray-50">
          Pending Items Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#9ca3af' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Summary
      <div className="relative border border-white/10 rounded-xl p-6 bg-gradient-to-br from-[#16161d] to-[#1a1a22] hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
        <h3 className="text-xl font-semibold mb-6 pb-3 border-b border-white/10 text-gray-50">
          Detailed Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-6">
          {barData.map((item, index) => (
            <div 
              key={index}
              className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20"
            >
              <p className="text-gray-400 text-sm mb-2">{item.name}</p>
              <p className="text-3xl font-bold" style={{ color: '#fc5e03' }}>
                {item.value}
              </p>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500"
                  style={{ 
                    width: `${(item.value / Math.max(...barData.map(d => d.value))) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}
