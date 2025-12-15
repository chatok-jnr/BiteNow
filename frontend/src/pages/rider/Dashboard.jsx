import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RiderDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("available");
  const [isOnline, setIsOnline] = useState(true);
  const [acceptedOrder, setAcceptedOrder] = useState(null);

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
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const availableOrders = [
    {
      id: 1,
      restaurant: "Pizza Palace",
      customer: "John Smith",
      pickup: "123 Main St",
      dropoff: "456 Oak Ave",
      distance: "2.3 km",
      earning: "$8.50",
      items: 3,
    },
    {
      id: 2,
      restaurant: "Burger House",
      customer: "Emma Wilson",
      pickup: "789 Park Rd",
      dropoff: "321 Elm St",
      distance: "1.8 km",
      earning: "$6.75",
      items: 2,
    },
    {
      id: 3,
      restaurant: "Sushi Master",
      customer: "David Lee",
      pickup: "555 Beach Blvd",
      dropoff: "888 Hill Dr",
      distance: "3.5 km",
      earning: "$11.20",
      items: 4,
    },
  ];

  const completedDeliveries = [
    {
      id: 101,
      restaurant: "Italian Corner",
      earning: "$9.50",
      time: "2:45 PM",
      rating: 5,
    },
    {
      id: 102,
      restaurant: "Taco Fiesta",
      earning: "$7.25",
      time: "1:20 PM",
      rating: 5,
    },
    {
      id: 103,
      restaurant: "Sweet Treats",
      earning: "$5.80",
      time: "12:10 PM",
      rating: 4,
    },
  ];

  const todayStats = {
    deliveries: 8,
    earnings: "$127.50",
    hours: "6.5",
    rating: "4.9",
  };

  const acceptOrder = (order) => {
    setAcceptedOrder(order);
    setActiveTab("active");
  };

  const completeDelivery = () => {
    setAcceptedOrder(null);
    setActiveTab("history");
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
                    {todayStats.earnings}
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
              {todayStats.deliveries}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow transform hover:scale-105 duration-300">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-gray-600 text-sm">Earnings</p>
            <p className="text-3xl font-bold text-secondary">
              {todayStats.earnings}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow transform hover:scale-105 duration-300">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-gray-600 text-sm">Hours</p>
            <p className="text-3xl font-bold text-gray-900">
              {todayStats.hours}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow transform hover:scale-105 duration-300">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-gray-600 text-sm">Rating</p>
            <p className="text-3xl font-bold text-gray-900">
              {todayStats.rating}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "available"
                ? "bg-primary text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            🎯 Available Orders
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
            {acceptedOrder && (
              <span className="ml-2 bg-secondary text-white text-xs px-2 py-1 rounded-full">
                1
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
        </div>

        {/* Available Orders Tab */}
        {activeTab === "available" && (
          <div className="space-y-6 animate-fadeIn">
            {!isOnline && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                <p className="text-yellow-800 font-semibold">
                  ⚠️ You&apos;re currently offline. Go online to see available
                  orders.
                </p>
              </div>
            )}
            {isOnline &&
              availableOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-102"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-xl text-gray-900">
                          {order.restaurant}
                        </h3>
                        <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-semibold">
                          {order.earning}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        Customer: {order.customer}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items} items
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <p className="text-sm text-gray-600">Pickup</p>
                        <p className="font-semibold text-gray-900">
                          {order.pickup}
                        </p>
                      </div>
                    </div>
                    <div className="border-l-2 border-gray-300 h-6 ml-3"></div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🏠</span>
                      <div>
                        <p className="text-sm text-gray-600">Dropoff</p>
                        <p className="font-semibold text-gray-900">
                          {order.dropoff}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>🛣️</span>
                      <span className="font-semibold">{order.distance}</span>
                    </div>
                    <button
                      onClick={() => acceptOrder(order)}
                      className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105"
                    >
                      Accept Order
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Active Delivery Tab */}
        {activeTab === "active" && (
          <div className="animate-fadeIn">
            {acceptedOrder ? (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="text-center mb-8">
                  <div className="inline-block p-6 bg-secondary/10 rounded-full mb-4 animate-pulse">
                    <span className="text-6xl">🚴</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Delivery in Progress
                  </h2>
                  <p className="text-gray-600">Order #{acceptedOrder.id}</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-4">
                      {acceptedOrder.restaurant}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📍</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            Pickup Location
                          </p>
                          <p className="font-semibold text-gray-900">
                            {acceptedOrder.pickup}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
                          Navigate
                        </button>
                      </div>
                      <div className="border-l-2 border-primary h-8 ml-3 animate-pulse"></div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🏠</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            Delivery Location
                          </p>
                          <p className="font-semibold text-gray-900">
                            {acceptedOrder.dropoff}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Distance</p>
                      <p className="text-xl font-bold text-gray-900">
                        {acceptedOrder.distance}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Items</p>
                      <p className="text-xl font-bold text-gray-900">
                        {acceptedOrder.items}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-secondary/10 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Earning</p>
                      <p className="text-xl font-bold text-secondary">
                        {acceptedOrder.earning}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                    📞 Call Customer
                  </button>
                  <button
                    onClick={completeDelivery}
                    className="flex-1 px-6 py-4 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all transform hover:scale-105"
                  >
                    ✓ Complete Delivery
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl">
                <p className="text-6xl mb-4">🚴</p>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Active Delivery
                </h3>
                <p className="text-gray-600">
                  Accept an order to start delivering
                </p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Today&apos;s Deliveries
            </h2>
            {completedDeliveries.map((delivery, index) => (
              <div
                key={delivery.id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {delivery.restaurant}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Completed at {delivery.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-secondary mb-1">
                      {delivery.earning}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {delivery.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
