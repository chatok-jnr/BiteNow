import { useState, useEffect } from "react";

function DeliveryHistory({ riderId, completedDeliveries = [] }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, today, week, month

  useEffect(() => {
    fetchDeliveryHistory();
  }, [riderId, filter, completedDeliveries]);

  const fetchDeliveryHistory = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint for delivery history
      // const token = localStorage.getItem("token");
      // const response = await fetch(
      //   `http://localhost:5000/api/deliveries?rider=${riderId}&filter=${filter}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

      // Use completedDeliveries from props, merge with mock data if needed
      const mockDeliveries = completedDeliveries.length > 0 ? [] : [
        {
          id: "1",
          order_id: "ORD123456",
          restaurant_name: "Pizza Palace",
          customer_name: "John Doe",
          delivery_charge: 50,
          food_cost: 450,
          total_amount: 500,
          status: "Completed",
          completed_at: new Date().toISOString(),
          rating: 5,
        },
        {
          id: "2",
          order_id: "ORD123455",
          restaurant_name: "Burger House",
          customer_name: "Jane Smith",
          delivery_charge: 50,
          food_cost: 350,
          total_amount: 400,
          status: "Completed",
          completed_at: new Date(Date.now() - 3600000).toISOString(),
          rating: 4,
        },
        {
          id: "3",
          order_id: "ORD123454",
          restaurant_name: "Sushi Master",
          customer_name: "Bob Wilson",
          delivery_charge: 50,
          food_cost: 650,
          total_amount: 700,
          status: "Completed",
          completed_at: new Date(Date.now() - 7200000).toISOString(),
          rating: 5,
        },
      ];

      // Combine completed deliveries from props with mock data
      const allDeliveries = [...completedDeliveries, ...mockDeliveries];
      setDeliveries(allDeliveries);
    } catch (error) {
      console.error("Error fetching delivery history:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalEarnings = () => {
    return deliveries.reduce((total, delivery) => total + 50, 0);
  };

  const calculateTotalDeliveries = () => {
    return deliveries.length;
  };

  const calculateAverageRating = () => {
    if (deliveries.length === 0) return 0;
    const totalRating = deliveries.reduce(
      (sum, delivery) => sum + (delivery.rating || 0),
      0
    );
    return (totalRating / deliveries.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Filter Buttons */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
            filter === "all"
              ? "bg-primary text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setFilter("today")}
          className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
            filter === "today"
              ? "bg-primary text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setFilter("week")}
          className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
            filter === "week"
              ? "bg-primary text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setFilter("month")}
          className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
            filter === "month"
              ? "bg-primary text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          This Month
        </button>
      </div>

      {/* Delivery List */}
      {deliveries.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <p className="text-6xl mb-4">📋</p>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Delivery History
          </h3>
          <p className="text-gray-600">
            Your completed deliveries will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Delivery History
          </h2>
          {deliveries.map((delivery, index) => (
            <div
              key={delivery.id}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">
                      {delivery.restaurant_name}
                    </h3>
                    <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-semibold">
                      {delivery.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Customer: {delivery.customer_name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Order ID: #{delivery.order_id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-secondary mb-1">
                    ৳{delivery.delivery_charge}
                  </p>
                  <p className="text-xs text-gray-500">Your Earning</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Food Cost</p>
                  <p className="font-semibold text-gray-900">
                    ৳{delivery.food_cost}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Delivery Charge</p>
                  <p className="font-semibold text-gray-900">
                    ৳{delivery.delivery_charge}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Collected</p>
                  <p className="font-semibold text-gray-900">
                    ৳{delivery.total_amount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Rating</p>
                  <p className="font-semibold text-gray-900">
                    ⭐ {delivery.rating}/5
                  </p>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-gray-500">
                  Completed:{" "}
                  {new Date(delivery.completed_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default DeliveryHistory;
