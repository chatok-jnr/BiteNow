import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RestaurantDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "restaurant") {
        navigate("/");
      }
      setUser(parsedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const pendingOrders = [
    {
      id: 1,
      customer: "John Smith",
      items: ["Margherita Pizza", "Garlic Bread", "Coca Cola"],
      total: "$28.50",
      time: "Just now",
      status: "pending",
    },
    {
      id: 2,
      customer: "Emma Wilson",
      items: ["Pepperoni Pizza", "Caesar Salad"],
      total: "$32.00",
      time: "2 min ago",
      status: "pending",
    },
  ];

  const preparingOrders = [
    {
      id: 3,
      customer: "David Lee",
      items: ["BBQ Chicken Pizza", "Mozzarella Sticks"],
      total: "$35.75",
      time: "8 min ago",
      status: "preparing",
    },
  ];

  const readyOrders = [
    {
      id: 4,
      customer: "Sarah Johnson",
      items: ["Vegetarian Pizza", "Tiramisu"],
      total: "$29.50",
      time: "15 min ago",
      status: "ready",
    },
  ];

  const menuItems = [
    {
      id: 1,
      name: "Margherita Pizza",
      price: "$12.99",
      category: "Pizza",
      inStock: true,
      sales: 45,
    },
    {
      id: 2,
      name: "Pepperoni Pizza",
      price: "$14.99",
      category: "Pizza",
      inStock: true,
      sales: 62,
    },
    {
      id: 3,
      name: "BBQ Chicken Pizza",
      price: "$16.99",
      category: "Pizza",
      inStock: true,
      sales: 38,
    },
    {
      id: 4,
      name: "Vegetarian Pizza",
      price: "$13.99",
      category: "Pizza",
      inStock: false,
      sales: 29,
    },
    {
      id: 5,
      name: "Garlic Bread",
      price: "$5.99",
      category: "Sides",
      inStock: true,
      sales: 78,
    },
    {
      id: 6,
      name: "Caesar Salad",
      price: "$8.99",
      category: "Salads",
      inStock: true,
      sales: 34,
    },
  ];

  const todayStats = {
    orders: 42,
    revenue: "$1,247.50",
    avgOrder: "$29.70",
    rating: "4.8",
  };

  const acceptOrder = (orderId) => {
    console.log("Order accepted:", orderId);
    // Animation and state update would happen here
  };

  const rejectOrder = (orderId) => {
    console.log("Order rejected:", orderId);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">
                🍕 {user.name}
              </h1>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                  isOpen
                    ? "bg-secondary text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    isOpen ? "bg-white animate-pulse" : "bg-gray-500"
                  }`}
                ></span>
                {isOpen ? "Open" : "Closed"}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Today&apos;s Revenue</p>
                  <p className="text-2xl font-bold text-secondary">
                    {todayStats.revenue}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    Restaurant Owner
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
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
            <p className="text-gray-600 text-sm">Orders Today</p>
            <p className="text-3xl font-bold text-gray-900">
              {todayStats.orders}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow transform hover:scale-105 duration-300">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-gray-600 text-sm">Revenue</p>
            <p className="text-3xl font-bold text-secondary">
              {todayStats.revenue}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow transform hover:scale-105 duration-300">
            <div className="text-3xl mb-2">🧾</div>
            <p className="text-gray-600 text-sm">Avg Order</p>
            <p className="text-3xl font-bold text-gray-900">
              {todayStats.avgOrder}
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
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "orders"
                ? "bg-primary text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📋 Orders
            {pendingOrders.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                {pendingOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "menu"
                ? "bg-primary text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            🍽️ Menu
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "analytics"
                ? "bg-primary text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📊 Analytics
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🔔 New Orders
                  <span className="text-sm font-normal text-gray-600">
                    ({pendingOrders.length})
                  </span>
                </h2>
                <div className="space-y-4">
                  {pendingOrders.map((order, index) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl shadow-sm p-6 border-2 border-red-200 hover:shadow-xl transition-all duration-300 animate-pulse"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-xl text-gray-900">
                              Order #{order.id}
                            </h3>
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                              NEW
                            </span>
                          </div>
                          <p className="text-gray-600">
                            Customer: {order.customer}
                          </p>
                          <p className="text-sm text-gray-500">{order.time}</p>
                        </div>
                        <p className="text-2xl font-bold text-secondary">
                          {order.total}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Items:
                        </p>
                        <ul className="space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-gray-700">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => rejectOrder(order.id)}
                          className="flex-1 px-6 py-3 border-2 border-red-300 text-red-700 rounded-xl font-semibold hover:bg-red-50 transition-colors"
                        >
                          ✕ Reject
                        </button>
                        <button
                          onClick={() => acceptOrder(order.id)}
                          className="flex-1 px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all transform hover:scale-105"
                        >
                          ✓ Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preparing Orders */}
            {preparingOrders.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  👨‍🍳 Preparing
                </h2>
                <div className="space-y-4">
                  {preparingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl shadow-sm p-6 border-2 border-yellow-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-xl text-gray-900">
                              Order #{order.id}
                            </h3>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                              PREPARING
                            </span>
                          </div>
                          <p className="text-gray-600">
                            Customer: {order.customer}
                          </p>
                          <p className="text-sm text-gray-500">{order.time}</p>
                        </div>
                        <p className="text-2xl font-bold text-secondary">
                          {order.total}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Items:
                        </p>
                        <ul className="space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-gray-700">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button className="w-full px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-colors">
                        ✓ Mark as Ready
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ready Orders */}
            {readyOrders.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  ✅ Ready for Pickup
                </h2>
                <div className="space-y-4">
                  {readyOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl shadow-sm p-6 border-2 border-green-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-xl text-gray-900">
                              Order #{order.id}
                            </h3>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                              READY
                            </span>
                          </div>
                          <p className="text-gray-600">
                            Customer: {order.customer}
                          </p>
                          <p className="text-sm text-gray-500">{order.time}</p>
                        </div>
                        <p className="text-2xl font-bold text-secondary">
                          {order.total}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Items:
                        </p>
                        <ul className="space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-gray-700">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
              <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105">
                + Add Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.inStock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-primary">
                      {item.price}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{item.sales}</span> sold
                      today
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm">
                      Edit
                    </button>
                    <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm">
                      {item.inStock ? "Mark Out" : "Mark Available"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Performance Analytics
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">
                  📈 Revenue Trend
                </h3>
                <div className="space-y-3">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                    (day, index) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-24">
                          {day}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-secondary h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${60 + index * 8}%`,
                              animationDelay: `${index * 100}ms`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-16">
                          ${(800 + index * 150).toFixed(2)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">
                  🏆 Top Items
                </h3>
                <div className="space-y-4">
                  {menuItems
                    .slice(0, 5)
                    .sort((a, b) => b.sales - a.sales)
                    .map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-bold text-sm">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-secondary font-bold">
                          {item.sales} sold
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                ⏰ Peak Hours
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {["12 PM", "1 PM", "2 PM", "6 PM", "7 PM", "8 PM"].map(
                  (hour, index) => (
                    <div key={hour} className="text-center">
                      <div className="mb-2 flex items-end justify-center h-24">
                        <div
                          className="w-full bg-primary rounded-t-lg transition-all duration-1000"
                          style={{
                            height: `${[60, 80, 75, 90, 100, 85][index]}%`,
                            animationDelay: `${index * 100}ms`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 font-semibold">
                        {hour}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
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

export default RestaurantDashboard;
