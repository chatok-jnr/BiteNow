import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PendingDeliveries from "./components/PendingDeliveries";
import ActiveDelivery from "./components/ActiveDelivery";
import RiderProfile from "./components/RiderProfile";
import DeliveryHistory from "./components/DeliveryHistory";
import axiosInstance from "../../utils/axios";

function RiderDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("available");
  const [isOnline, setIsOnline] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [deliverySteps, setDeliverySteps] = useState({}); // Track step for each delivery
  const [riderStats, setRiderStats] = useState({
    deliveries: 0,
    earnings: 0,
    hours: 0,
    rating: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "rider") {
        navigate("/");
      }
      setUser(parsedUser);
      // Fetch initial data
      fetchPendingRequests();
      fetchRiderStats();
      
      // Add mock rider ID for profile visualization
      if (!parsedUser.id && !parsedUser._id) {
        parsedUser._id = "mock_rider_id_12345";
        localStorage.setItem("user", JSON.stringify(parsedUser));
      }
    }
  }, [navigate]);

  const fetchPendingRequests = async () => {
    try {
      const response = await axiosInstance.get("/api/v1/order/rider");
      
      if (response.data.status === "success" && response.data.data.needRider) {
        // Transform API data to match component expectations
        const transformedRequests = response.data.data.needRider.map(order => ({
          id: order._id,
          _id: order._id,
          order_id: order.order_id,
          restaurant_name: order.restaurant_id?.restaurant_name || "Unknown Restaurant",
          restaurant_address: order.restaurant_id?.restaurant_address || "Unknown Address",
          customer_name: "Customer", // API doesn't provide customer name
          customer_address: `${order.delivery_address.street}, ${order.delivery_address.city}, ${order.delivery_address.state}, ${order.delivery_address.zip_code}`,
          food_cost: order.subtotal,
          delivery_charge: order.delivery_charge,
          total_amount: order.total_amount,
          pin1: "1234", // TODO: Get from API when available
          pin2: "5678", // TODO: Get from API when available
          estimated_delivery_time: order.estimated_delivery_time,
          items: order.items,
          payment_status: order.payment_status,
          order_status: order.order_status,
        }));
        
        setPendingRequests(transformedRequests);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      // Fallback to empty array on error
      setPendingRequests([]);
    }
  };

  const fetchRiderStats = async () => {
    try {
      // TODO: Replace with actual API to fetch rider stats
      // This could come from the rider profile endpoint
      const mockStats = {
        deliveries: 8,
        earnings: 400,
        hours: 6.5,
        rating: 4.9,
      };
      setRiderStats(mockStats);
    } catch (error) {
      console.error("Error fetching rider stats:", error);
    }
  };

  const handleAcceptRequest = (request) => {
    // TODO: Call API to accept delivery request
    setActiveDeliveries([...activeDeliveries, request]);
    setPendingRequests(pendingRequests.filter((r) => r.id !== request.id));
    setActiveTab("active");
  };

  const handleDropRequest = (request) => {
    // TODO: Call API to drop delivery request
    setActiveDeliveries(activeDeliveries.filter((d) => d.id !== request.id));
    setPendingRequests([...pendingRequests, request]);
    if (activeDeliveries.length <= 1) {
      setActiveTab("available");
    }
  };

  const handleCompleteDelivery = (delivery) => {
    // TODO: Call API to mark delivery as complete
    // Add completed timestamp and status
    const completedDelivery = {
      ...delivery,
      status: "Completed",
      completed_at: new Date().toISOString(),
      rating: 5, // Mock rating, will come from customer in real implementation
    };
    
    // Remove from active deliveries
    setActiveDeliveries(activeDeliveries.filter((d) => d.id !== delivery.id));
    
    // Add to completed deliveries
    setCompletedDeliveries([completedDelivery, ...completedDeliveries]);
    
    // Clean up delivery step for this delivery
    const newDeliverySteps = { ...deliverySteps };
    delete newDeliverySteps[delivery.id];
    setDeliverySteps(newDeliverySteps);
    
    // Update stats
    setRiderStats({
      ...riderStats,
      deliveries: riderStats.deliveries + 1,
      earnings: riderStats.earnings + 50,
    });
    
    fetchPendingRequests(); // Refresh pending requests
    
    if (activeDeliveries.length <= 1) {
      setActiveTab("history");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("intendedDestination");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">BiteNow Rider</h1>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                  isOnline
                    ? "bg-secondary text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    isOnline ? "bg-white animate-pulse" : "bg-gray-500"
                  }`}
                ></span>
                {isOnline ? "Online" : "Offline"}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Today&apos;s Earnings</p>
                  <p className="text-2xl font-bold text-secondary">
                    ৳{riderStats.earnings}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">Rider</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow transform hover:scale-105 duration-300">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-gray-600 text-sm">Deliveries</p>
            <p className="text-3xl font-bold text-gray-900">
              {riderStats.deliveries}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow transform hover:scale-105 duration-300">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-gray-600 text-sm">Earnings</p>
            <p className="text-3xl font-bold text-secondary">
              ৳{riderStats.earnings}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow transform hover:scale-105 duration-300">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-gray-600 text-sm">Hours</p>
            <p className="text-3xl font-bold text-gray-900">
              {riderStats.hours}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow transform hover:scale-105 duration-300">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-gray-600 text-sm">Rating</p>
            <p className="text-3xl font-bold text-gray-900">
              {riderStats.rating}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 px-2 pt-1">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "available"
                ? "bg-primary text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            🎯 Available Requests
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "active"
                ? "bg-primary text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            🚀 Active Delivery
            {activeDeliveries.length > 0 && (
              <span className="ml-2 bg-secondary text-white text-xs px-2 py-1 rounded-full">
                {activeDeliveries.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "history"
                ? "bg-primary text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📋 History
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "profile"
                ? "bg-primary text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            👤 Profile
          </button>
        </div>

        {/* Available Orders Tab */}
        {activeTab === "available" && (
          <PendingDeliveries
            requests={pendingRequests}
            onAcceptRequest={handleAcceptRequest}
            isOnline={isOnline}
          />
        )}

        {/* Active Delivery Tab */}
        {activeTab === "active" && (
          <ActiveDelivery
            activeDeliveries={activeDeliveries}
            deliverySteps={deliverySteps}
            setDeliverySteps={setDeliverySteps}
            onDropRequest={handleDropRequest}
            onCompleteDelivery={handleCompleteDelivery}
          />
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <DeliveryHistory 
            riderId={user?.id || user?._id} 
            completedDeliveries={completedDeliveries}
          />
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <RiderProfile riderId={user?.id || user?._id} />
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default RiderDashboard;
