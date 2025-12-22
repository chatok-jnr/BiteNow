import { useState } from "prop-types";

function PendingDeliveries({ requests, onAcceptRequest, isOnline }) {
  if (!isOnline) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
        <p className="text-yellow-800 font-semibold">
          ⚠️ You&apos;re currently offline. Go online to see available delivery
          requests.
        </p>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl">
        <p className="text-6xl mb-4">📦</p>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Pending Requests
        </h3>
        <p className="text-gray-600">
          New delivery requests will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {requests.map((request, index) => (
        <div
          key={request._id || request.id}
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-102"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-xl text-gray-900">
                  {request.restaurant_name || request.restaurant?.restaurant_name}
                </h3>
                <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-semibold">
                  ৳{request.delivery_charge || 50}
                </span>
              </div>
              <p className="text-gray-600">
                Customer: {request.customer_name || request.customer?.customer_name}
              </p>
              <p className="text-sm text-gray-500">
                Food Cost: ৳{request.food_cost || request.total_amount}
              </p>
              <p className="text-sm text-gray-500">
                Order ID: #{request.order_id || request._id?.slice(-6)}
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-sm text-gray-600">Pickup - Restaurant</p>
                <p className="font-semibold text-gray-900">
                  {request.restaurant_address || request.pickup_address}
                </p>
              </div>
            </div>
            <div className="border-l-2 border-gray-300 h-6 ml-3"></div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="text-sm text-gray-600">Dropoff - Customer</p>
                <p className="font-semibold text-gray-900">
                  {request.customer_address || request.delivery_address}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="text-gray-600">
                Total: <span className="font-bold text-secondary">৳{(request.delivery_charge || 50) + (request.food_cost || request.total_amount || 0)}</span>
              </p>
              <p className="text-gray-500 text-xs mt-1">
                (৳50 delivery + ৳{request.food_cost || request.total_amount || 0} food cost)
              </p>
            </div>
            <button
              onClick={() => onAcceptRequest(request)}
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105"
            >
              Accept Request
            </button>
          </div>
        </div>
      ))}

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

export default PendingDeliveries;
