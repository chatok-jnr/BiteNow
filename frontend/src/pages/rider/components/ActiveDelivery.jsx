import { useState } from "react";
import axiosInstance from "../../../utils/axios";

function ActiveDelivery({ activeDeliveries, deliverySteps, setDeliverySteps, onDropRequest, onCompleteDelivery, onRefresh }) {
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [customerPin, setCustomerPin] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [showDropModal, setShowDropModal] = useState(false);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log("🎯 ActiveDelivery Component - activeDeliveries:", activeDeliveries);
  console.log("🎯 Number of deliveries:", activeDeliveries?.length || 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  if (!activeDeliveries || activeDeliveries.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl">
        <p className="text-6xl mb-4">🚴</p>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Active Delivery
        </h3>
        <p className="text-gray-600">
          Accept a request to start delivering
        </p>
      </div>
    );
  }

  const handleCardClick = (delivery) => {
    setSelectedDelivery(delivery);
    setShowPinModal(true);
  };

  const handleVerifyPin = async () => {
    try {
      // Verify customer PIN with backend API
      const response = await axiosInstance.patch("/api/v1/order/rider/verify-customer", {
        order_id: selectedDelivery._id || selectedDelivery.id,
        customer_pin: customerPin
      });

      if (response.data.status === "success") {
        setShowPinModal(false);
        setCustomerPin("");
        setError("");
        setSelectedDelivery(null);
        
        // Call completion handler
        setTimeout(() => {
          onCompleteDelivery(selectedDelivery);
        }, 1000);
      }
    } catch (error) {
      console.error("Error verifying customer PIN:", error);
      setError(error.response?.data?.message || "Invalid PIN. Please check with customer.");
    }
  };

  const handleDrop = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDropModal(true);
  };

  const confirmDrop = () => {
    setShowDropModal(false);
    onDropRequest(selectedDelivery);
    setSelectedDelivery(null);
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Active Deliveries</h2>
          <p className="text-gray-600">
            {activeDeliveries.length} {activeDeliveries.length === 1 ? 'delivery' : 'deliveries'} in progress
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 ${
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Delivery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeDeliveries.map((delivery) => (
          <div 
            key={delivery._id || delivery.id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary"
            onClick={() => handleCardClick(delivery)}
          >
            <div className="p-6">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    Order #{delivery.order_id?.slice(-6) || delivery._id?.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(delivery.createdAt).toLocaleDateString()} at {new Date(delivery.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div className="bg-secondary/10 px-3 py-1 rounded-full">
                  <p className="text-xs font-semibold text-secondary">
                    {delivery.order_status?.replace(/_/g, ' ').toUpperCase() || 'OUT FOR DELIVERY'}
                  </p>
                </div>
              </div>

              {/* Rider PIN Display */}
              <div className="bg-primary/10 p-4 rounded-xl mb-4">
                <p className="text-xs text-gray-600 mb-1">Your Rider PIN</p>
                <p className="text-2xl font-bold text-primary tracking-widest">
                  {delivery.rider_pin || delivery.pin1 || "N/A"}
                </p>
              </div>

              {/* Restaurant Info */}
              <div className="mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-xl">📍</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Pickup from</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {delivery.restaurant_name || delivery.restaurant_id?.restaurant_name || "Restaurant"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {delivery.restaurant_address || "Restaurant Address"}
                    </p>
                  </div>
                </div>
                <div className="border-l-2 border-primary h-6 ml-2.5 mb-2"></div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🏠</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Deliver to</p>
                    <p className="text-xs text-gray-700 mt-1">
                      {delivery.customer_address || delivery.delivery_address || 
                        `${delivery.delivery_address?.street}, ${delivery.delivery_address?.city}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">৳{delivery.subtotal || delivery.food_cost || 0}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Delivery Charge</span>
                  <span className="font-semibold text-secondary">৳{delivery.delivery_charge || 50}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-bold text-gray-900">Total to Collect</span>
                  <span className="text-xl font-bold text-primary">৳{delivery.total_amount || 0}</span>
                </div>
              </div>

              {/* Items Count */}
              {delivery.items && delivery.items.length > 0 && (
                <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    📦 {delivery.items.length} {delivery.items.length === 1 ? 'item' : 'items'} in this order
                  </p>
                </div>
              )}

              {/* Action Hint */}
              <div className="mt-4 text-center">
                <p className="text-sm text-primary font-semibold">
                  Click to complete delivery →
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PIN Verification Modal */}
      {showPinModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Verify Customer PIN
            </h3>
            <p className="text-gray-600 mb-6">
              Customer will provide you a 4-digit PIN. Enter it to complete the delivery.
            </p>

            {/* Order Info */}
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Order #{selectedDelivery.order_id?.slice(-6) || selectedDelivery._id?.slice(-6)}
              </p>
              <p className="text-xs text-gray-600">
                {selectedDelivery.restaurant_name || selectedDelivery.restaurant_id?.restaurant_name}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter PIN from Customer
              </label>
              <input
                type="text"
                maxLength="4"
                value={customerPin}
                onChange={(e) => {
                  setCustomerPin(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full px-6 py-4 text-2xl text-center tracking-widest border-2 border-gray-300 rounded-xl focus:border-secondary focus:outline-none"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <div className="bg-secondary/10 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Collect Payment:</strong>
              </p>
              <p className="text-2xl font-bold text-secondary">
                ৳{selectedDelivery.total_amount || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                (Food: ৳{selectedDelivery.subtotal || selectedDelivery.food_cost || 0} + Delivery: ৳{selectedDelivery.delivery_charge || 50})
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setCustomerPin("");
                  setError("");
                  setSelectedDelivery(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPin}
                disabled={customerPin.length !== 4}
                className="flex-1 px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Verify & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drop Request Confirmation Modal */}
      {showDropModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Drop This Request?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to drop this delivery request? It will be returned to the available requests.
              </p>
              <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  Order #{selectedDelivery.order_id?.slice(-6) || selectedDelivery._id?.slice(-6)}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDropModal(false);
                  setSelectedDelivery(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDrop}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
              >
                Yes, Drop It
              </button>
            </div>
          </div>
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

export default ActiveDelivery;
