import React, { useState, useEffect } from "react";
import {
  Store,
  Coins,
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Menu,
  ChevronRight,
  Star,
} from "lucide-react";
import OwnerSidebar from "../../components/OwnerSidebar";
import ApprovalMessage from "../../components/ApprovalMessage";
import { getOwnerDashboard } from "../../utils/restaurantOwnerService";
import { useNotification } from "../../contexts/NotificationContext";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [restaurantData, setRestaurantData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerStatus, setOwnerStatus] = useState(null);
  const { showError } = useNotification();

  useEffect(() => {
    fetchDashboardData();
    checkOwnerStatus();
  }, []);

  const checkOwnerStatus = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setOwnerStatus(user.restaurant_owner_status || user.status);
      }
    } catch (err) {
      console.error("Error checking owner status:", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getOwnerDashboard();

      if (response.status === "success" && response.myRestaurants) {
        // Transform backend data to match frontend structure
        const transformedData = response.myRestaurants.map((restaurant) => ({
          id: restaurant._id,
          name: restaurant.restaurant_name,
          image:
            restaurant.restaurant_image?.url ||
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
          totalEarnings: restaurant.restaurant_total_revenue || 0,
          monthlyEarnings: restaurant.total_revenue || 0,
          totalOrders: restaurant.restaurant_total_orders || 0,
          monthlyOrders: restaurant.order_count || 0,
          rating: Number(restaurant.restaurant_rating) || 0,
          status: restaurant.restaurant_status || "Pending",
          address: restaurant.restaurant_address || "N/A",
          commissionRate: restaurant.restaurant_commissionRate || 0.25,
        }));
        setRestaurantData(transformedData);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      showError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = restaurantData.reduce(
    (sum, r) => sum + r.totalEarnings,
    0,
  );
  const monthlyEarnings = restaurantData.reduce(
    (sum, r) => sum + r.monthlyEarnings,
    0,
  );
  const totalOrders = restaurantData.reduce((sum, r) => sum + r.totalOrders, 0);
  const monthlyOrders = restaurantData.reduce(
    (sum, r) => sum + r.monthlyOrders,
    0,
  );

  const topPerformer =
    restaurantData.length > 0
      ? [...restaurantData].sort((a, b) => b.monthlyOrders - a.monthlyOrders)[0]
      : null;

  const DashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#67A177] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    if (restaurantData.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Restaurants Yet
            </h3>
            <p className="text-gray-600 mb-4">
              {ownerStatus !== "Approved"
                ? ownerStatus === "Pending"
                  ? "To get approved and add restaurants, you need to upload the required documents that prove you are eligible. Once you add your documents, our admin team will review them and approve your account."
                  : "Your account needs to be approved before you can add restaurants"
                : "Add your first restaurant to see dashboard data"}
            </p>
          </div>
        </div>
      );
    }

    return (
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
            <p className="text-3xl font-bold text-[#67A177]">
              {restaurantData.length}
            </p>
          </div>

          <div className="bg-[#ACD4B1] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#67A177] rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-[#67A177]">
              ৳{totalEarnings.toFixed(2)}
            </p>
          </div>

          <div className="bg-[#ACD4B1] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#67A177] rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Monthly Earnings</p>
            <p className="text-3xl font-bold text-[#67A177]">
              ৳{monthlyEarnings.toFixed(2)}
            </p>
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
        {topPerformer && (
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
                    <p className="text-2xl font-bold">
                      {topPerformer.monthlyOrders}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Monthly Revenue</p>
                    <p className="text-2xl font-bold">
                      ৳{topPerformer.monthlyEarnings.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Rating</p>
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <p className="text-2xl font-bold">
                        {topPerformer.rating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restaurant Performance Cards */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Restaurant Performance
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {restaurantData.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-[#ACD4B1] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start p-6">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-xl font-bold text-gray-800">
                        {restaurant.name}
                      </h4>
                      <div className="flex items-center space-x-1 bg-[#DDEEDB] px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-gray-700">
                          {restaurant.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          restaurant.status === "Accepted"
                            ? "bg-green-100 text-green-700"
                            : restaurant.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : restaurant.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {restaurant.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-[#DDEEDB] p-2 rounded-lg">
                        <p className="text-xs text-gray-600">Total Earnings</p>
                        <p className="text-lg font-bold text-[#67A177]">
                          ৳{restaurant.totalEarnings.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-[#DDEEDB] p-2 rounded-lg">
                        <p className="text-xs text-gray-600">This Month</p>
                        <p className="text-lg font-bold text-[#67A177]">
                          ৳{restaurant.monthlyEarnings.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-[#DDEEDB] p-2 rounded-lg">
                        <p className="text-xs text-gray-600">Total Orders</p>
                        <p className="text-lg font-bold text-gray-800">
                          {restaurant.totalOrders}
                        </p>
                      </div>
                      <div className="bg-[#DDEEDB] p-2 rounded-lg">
                        <p className="text-xs text-gray-600">Monthly Orders</p>
                        <p className="text-lg font-bold text-gray-800">
                          {restaurant.monthlyOrders}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#67A177] p-3 rounded-lg">
                      <p className="text-xs text-white/80 mb-1">
                        Restaurant Address
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {restaurant.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#C4E2C4] flex">
      <OwnerSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-[#8DBC96] shadow-md lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="text-white">
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
            {/* Show approval message if not approved */}
            {ownerStatus && ownerStatus !== "Approved" && (
              <div className="mb-6">
                <ApprovalMessage status={ownerStatus} entityType="account" />
              </div>
            )}
            <DashboardContent />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#8DBC96] text-white py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-white/80">
              © 2026 BiteNow. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
