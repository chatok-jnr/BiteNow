import React, { useState } from 'react';
import { Store, DollarSign, TrendingUp, Package, ShoppingBag, Users, BarChart3, Menu, ChevronRight, Star } from 'lucide-react';
import OwnerSidebar from '../../components/OwnerSidebar';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const restaurantData = [
    {
      id: 1,
      name: 'Pizza Paradise',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
      totalEarnings: 15847.50,
      monthlyEarnings: 4250.00,
      totalOrders: 342,
      monthlyOrders: 89,
      rating: 4.8,
      topSelling: 'Margherita Pizza',
      topSellingCount: 156,
      status: 'active'
    },
    {
      id: 2,
      name: 'Burger House',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
      totalEarnings: 12430.75,
      monthlyEarnings: 3180.50,
      totalOrders: 278,
      monthlyOrders: 72,
      rating: 4.6,
      topSelling: 'Double Cheeseburger',
      topSellingCount: 134,
      status: 'active'
    },
    {
      id: 3,
      name: 'Sushi Master',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&q=80',
      totalEarnings: 18920.00,
      monthlyEarnings: 5240.00,
      totalOrders: 412,
      monthlyOrders: 98,
      rating: 4.9,
      topSelling: 'California Roll',
      topSellingCount: 187,
      status: 'active'
    },
    {
      id: 4,
      name: 'Thai Kitchen',
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80',
      totalEarnings: 9876.25,
      monthlyEarnings: 2340.75,
      totalOrders: 198,
      monthlyOrders: 54,
      rating: 4.7,
      topSelling: 'Pad Thai',
      topSellingCount: 98,
      status: 'active'
    }
  ];

  const totalEarnings = restaurantData.reduce((sum, r) => sum + r.totalEarnings, 0);
  const monthlyEarnings = restaurantData.reduce((sum, r) => sum + r.monthlyEarnings, 0);
  const totalOrders = restaurantData.reduce((sum, r) => sum + r.totalOrders, 0);
  const monthlyOrders = restaurantData.reduce((sum, r) => sum + r.monthlyOrders, 0);

  const topPerformer = [...restaurantData].sort((a, b) => b.monthlyOrders - a.monthlyOrders)[0];

  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#ACD4B1] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#67A177] rounded-full flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Restaurants</p>
          <p className="text-3xl font-bold text-[#67A177]">{restaurantData.length}</p>
        </div>

        <div className="bg-[#ACD4B1] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#67A177] rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
          <p className="text-3xl font-bold text-[#67A177]">${totalEarnings.toFixed(2)}</p>
        </div>

        <div className="bg-[#ACD4B1] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#67A177] rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Monthly Earnings</p>
          <p className="text-3xl font-bold text-[#67A177]">${monthlyEarnings.toFixed(2)}</p>
        </div>

        <div className="bg-[#ACD4B1] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#67A177] rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-[#67A177]">{totalOrders}</p>
        </div>
      </div>

      {/* Top Performer Highlight */}
      <div className="bg-gradient-to-r from-[#67A177] to-[#8DBC96] rounded-2xl p-6 shadow-lg text-white">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-8 h-8" />
          <h3 className="text-2xl font-bold">Top Performer This Month</h3>
        </div>
        <div className="flex items-center space-x-6">
          <img 
            src={topPerformer.image} 
            alt={topPerformer.name}
            className="w-24 h-24 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-2">{topPerformer.name}</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-white/80 text-sm">Monthly Orders</p>
                <p className="text-2xl font-bold">{topPerformer.monthlyOrders}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold">${topPerformer.monthlyEarnings.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm">Rating</p>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <p className="text-2xl font-bold">{topPerformer.rating}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Performance Cards */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Restaurant Performance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {restaurantData.map((restaurant) => (
            <div key={restaurant.id} className="bg-[#ACD4B1] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start p-6">
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-xl font-bold text-gray-800">{restaurant.name}</h4>
                    <div className="flex items-center space-x-1 bg-[#DDEEDB] px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-700">{restaurant.rating}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-[#DDEEDB] p-2 rounded-lg">
                      <p className="text-xs text-gray-600">Total Earnings</p>
                      <p className="text-lg font-bold text-[#67A177]">${restaurant.totalEarnings.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#DDEEDB] p-2 rounded-lg">
                      <p className="text-xs text-gray-600">This Month</p>
                      <p className="text-lg font-bold text-[#67A177]">${restaurant.monthlyEarnings.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-[#DDEEDB] p-2 rounded-lg">
                      <p className="text-xs text-gray-600">Total Orders</p>
                      <p className="text-lg font-bold text-gray-800">{restaurant.totalOrders}</p>
                    </div>
                    <div className="bg-[#DDEEDB] p-2 rounded-lg">
                      <p className="text-xs text-gray-600">Monthly Orders</p>
                      <p className="text-lg font-bold text-gray-800">{restaurant.monthlyOrders}</p>
                    </div>
                  </div>

                  <div className="bg-[#67A177] p-3 rounded-lg">
                    <p className="text-xs text-white/80 mb-1">Top Selling Item</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{restaurant.topSelling}</p>
                      <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
                        <ShoppingBag className="w-3 h-3 text-white" />
                        <span className="text-xs font-semibold text-white">{restaurant.topSellingCount} sold</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#C4E2C4] flex">
      <OwnerSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-[#8DBC96] shadow-md lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Store className="w-6 h-6 text-white" />
              <span className="text-xl font-bold text-white">BiteNow</span>
            </div>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <DashboardContent />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#8DBC96] text-white py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-white/80">© 2024 BiteNow. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;