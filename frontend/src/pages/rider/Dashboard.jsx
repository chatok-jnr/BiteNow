import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PendingDeliveries from "./components/PendingDeliveries";
import ActiveDelivery from "./components/ActiveDelivery";
import RiderProfile from "./components/RiderProfile";
import DeliveryHistory from "./components/DeliveryHistory";
import LocationPickerModal from "../../components/Map/LocationPickerModal";

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
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [riderLocation, setRiderLocation] = useState(null);
  const [locationLastUpdated, setLocationLastUpdated] = useState(null);

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
      
      // Add mock rider ID for profile visualization
      if (!parsedUser.id && !parsedUser._id) {
        parsedUser._id = "mock_rider_id_12345";
        localStorage.setItem("user", JSON.stringify(parsedUser));
      }

      // Check if location was set this session
      const locationSetThisSession = sessionStorage.getItem('rider_location_set');
      
      if (!locationSetThisSession) {
        // Force location picker on first load of session
        setShowLocationPicker(true);
      } else {
        // Load orders with existing location
        fetchPendingRequests();
      }

      // Fetch rider stats
      fetchRiderStats();
    }
  }, [navigate]);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Try to call backend API to get nearby orders
      try {
        const response = await fetch("http://localhost:5000/api/location/nearby-orders?maxDistance=15", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data?.length > 0) {
            setPendingRequests(data.data);
            return; // Successfully got data from backend
          }
        }
      } catch (apiError) {
        console.warn('Backend not available, using mock data:', apiError);
      }

      // Use mock data (when backend fails or returns empty)
      const mockRequests = [
        {
          id: "req1",
          _id: "req1",
          order_id: "ORD123456",
          restaurant_name: "Pizza Palace",
          restaurant_address: "123 Main St, Dhaka",
          restaurant_location: {
            type: 'Point',
            coordinates: [90.4125, 23.8103] // Dhaka center
          },
          customer_name: "John Doe",
          customer_address: "456 Oak Ave, Dhaka",
          customer_location: {
            type: 'Point',
            coordinates: [90.4225, 23.8203] // ~1.5km northeast
          },
          food_cost: 450,
          delivery_charge: 50,
          total_amount: 500,
          pin1: "1234",
          pin2: "5678",
        },
        {
          id: "req2",
          _id: "req2",
          order_id: "ORD123457",
          restaurant_name: "Burger House",
          restaurant_address: "789 Park Rd, Dhaka",
          restaurant_location: {
            type: 'Point',
            coordinates: [90.4025, 23.8003] // Southwest of center
          },
          customer_name: "Jane Smith",
          customer_address: "321 Elm St, Dhaka",
          customer_location: {
            type: 'Point',
            coordinates: [90.4325, 23.8303] // Northeast
          },
          food_cost: 350,
          delivery_charge: 50,
          total_amount: 400,
          pin1: "2345",
          pin2: "6789",
        },
      ];
      setPendingRequests(mockRequests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      // Fallback to empty on unexpected error
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

  const handleLocationConfirm = async (location) => {
    try {
      const token = localStorage.getItem("token");
      
      // Try to update rider location in backend
      try {
        const response = await fetch("http://localhost:5000/api/location/update", {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude: location.lat,
            longitude: location.lng
          })
        });

        if (!response.ok) {
          console.warn('Backend update failed, using mock data');
        }
      } catch (apiError) {
        console.warn('Backend not available, continuing with mock data:', apiError);
      }

      // Always update local state (works with or without backend)
      setRiderLocation(location);
      setLocationLastUpdated(new Date());
      sessionStorage.setItem('rider_location_set', 'true');
      
      // Fetch nearby orders after location update
      await fetchPendingRequests();
      
      setShowLocationPicker(false);
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Failed to update location. Please try again.');
    }
  };

  const handleRefreshLocation = () => {
    setShowLocationPicker(true);
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
              
              {/* Online/Offline Status Toggle */}
              <div className="flex items-start gap-2 px-4 py-2 bg-white rounded-lg border-2 shadow-sm">
                <span className="text-sm font-medium text-gray-700 mt-1">Status:</span>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => setIsOnline(!isOnline)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      isOnline ? "bg-secondary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isOnline ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-medium ${
                    isOnline ? "text-secondary" : "text-gray-500"
                  }`}>
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
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
        {/* Location Status and Refresh Button */}
        {locationLastUpdated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-semibold text-gray-900">Location Set</p>
                <p className="text-sm text-gray-600">
                  Last updated: {locationLastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={handleRefreshLocation}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              🔄 Refresh Location
            </button>
          </div>
        )}

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
            riderLocation={riderLocation}
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

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => {
          // Don't allow closing without setting location on first session load
          if (sessionStorage.getItem('rider_location_set')) {
            setShowLocationPicker(false);
          }
        }}
        onLocationSelect={handleLocationConfirm}
        initialLocation={riderLocation}
        title="Select Your Current Location"
        isMandatory={!sessionStorage.getItem('rider_location_set')}
      />

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
