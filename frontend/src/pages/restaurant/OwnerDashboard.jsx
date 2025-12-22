import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddRestaurantModal from "./components/AddRestaurantModal";
import EditOwnerProfileModal from "./components/EditOwnerProfileModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function OwnerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePasswordError, setDeletePasswordError] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [activeTab, setActiveTab] = useState("restaurants");

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
      fetchRestaurants(parsedUser.id);
    }
  }, [navigate]);

  const fetchRestaurants = async (ownerId) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/restaurants/my/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data?.restaurants) {
        setRestaurants(data.data.restaurants);
      } else {
        setRestaurants([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setRestaurants([]);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("intendedDestination");
    navigate("/");
  };

  const handleAddRestaurant = (restaurantData) => {
    // Add the new restaurant to the list
    setRestaurants([...restaurants, restaurantData]);
    setShowAddRestaurant(false);
    // Optionally refetch to ensure data consistency
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      fetchRestaurants(parsedUser.id);
    }
  };

  const handleUpdateProfile = (profileData) => {
    // Mock update
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("Profile updated successfully!");
    setShowEditProfile(false);
  };

  const handleChangePassword = () => {
    // TODO: Send OTP to user's email via API
    // await fetch('/api/send-otp', { method: 'POST', body: JSON.stringify({ email: user.email }) });
    
    setShowChangePassword(false);
    // Redirect to OTP page with context that this is for password change
    navigate("/otp?redirectTo=owner-change-password");
  };

  const handleDeleteAccount = () => {
    // Reset password error
    setDeletePasswordError("");

    // Validate password is entered
    if (!deletePassword.trim()) {
      setDeletePasswordError("Password is required");
      return;
    }

    // TODO: Replace with actual API call to verify password
    // Mock password validation - assuming user's password is "password123"
    const mockPassword = "password123"; // This should come from backend verification
    
    if (deletePassword !== mockPassword) {
      setDeletePasswordError("Incorrect password. Please try again.");
      return;
    }

    // TODO: Implement actual delete API call
    setShowDeleteConfirm(false);
    setDeletePassword("");
    setDeletePasswordError("");
    setShowDeletePassword(false);
    localStorage.removeItem("user");
    navigate("/");
  };

  const getTotalStats = () => {
    const totalRevenue = restaurants.reduce((sum, r) => sum + r.restaurant_total_revenue, 0);
    const totalSales = restaurants.reduce((sum, r) => sum + r.restaurant_total_sales, 0);
    return { totalRevenue, totalSales };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Owner Profile Image */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user?.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowEditProfile(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("restaurants")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "restaurants"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Restaurants
            </button>
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Restaurants</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{restaurants.length}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">৳{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSales}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "restaurants" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                My Restaurants ({restaurants.length})
              </h2>
              <button
                onClick={() => setShowAddRestaurant(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Restaurant
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading restaurants...</p>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants yet</h3>
                <p className="text-gray-500 mb-6">Get started by adding your first restaurant</p>
                <button
                  onClick={() => setShowAddRestaurant(true)}
                  className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
                >
                  Add Your First Restaurant
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max">
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant._id}
                      className="w-80 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer flex-shrink-0"
                      onClick={() => navigate(`/restaurant-manager/${restaurant._id}`)}
                    >
                      {/* Restaurant Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={restaurant.restaurant_image?.url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"}
                          alt={restaurant.restaurant_name}
                          className="w-full h-full object-cover"
                        />
                        <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                          restaurant.restaurant_status === 'Active'
                            ? "bg-green-500/90 text-white"
                            : restaurant.restaurant_status === 'Pending'
                            ? "bg-orange-500/90 text-white"
                            : "bg-red-500/90 text-white"
                        }`}>
                          ● {restaurant.restaurant_status || 'Pending'}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="mb-3">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {restaurant.restaurant_name}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {restaurant.restaurant_address}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {restaurant.restaurant_category?.map((category, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                              {category}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(restaurant.restaurant_rating.average) ? "fill-current" : "fill-gray-300"
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {restaurant.restaurant_rating.average}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({restaurant.restaurant_rating.count})
                          </span>
                        </div>

                        <div className="border-t pt-3 mb-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Revenue</p>
                              <p className="text-sm font-bold text-gray-900">
                                ৳{restaurant.restaurant_total_revenue.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Sales</p>
                              <p className="text-sm font-bold text-gray-900">
                                {restaurant.restaurant_total_sales}
                              </p>
                            </div>
                          </div>
                        </div>

                        <button className="w-full py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                          Manage Restaurant
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <AddRestaurantModal
        isOpen={showAddRestaurant}
        onClose={() => setShowAddRestaurant(false)}
        onAdd={handleAddRestaurant}
      />

      <EditOwnerProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        ownerData={user}
        onUpdate={handleUpdateProfile}
        onChangePassword={() => setShowChangePassword(true)}
        onDeleteAccount={() => setShowDeleteConfirm(true)}
      />

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <p className="text-gray-600 mb-6">
              You will receive an OTP on your email <strong>{user?.email}</strong> to verify your identity before changing your password.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowChangePassword(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Send OTP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowDeleteConfirm(false);
            setDeletePassword("");
            setDeletePasswordError("");
            setShowDeletePassword(false);
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-600">Delete Account</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Are you absolutely sure you want to delete your account? This action cannot be undone and will:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
              <li>Delete all your restaurants ({restaurants.length} {restaurants.length === 1 ? 'restaurant' : 'restaurants'})</li>
              <li>Remove all menu items and settings</li>
              <li>Erase all order history</li>
              <li>Permanently delete your account data</li>
            </ul>
            
            {/* Password Confirmation */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your password to confirm *
              </label>
              <div className="relative">
                <input
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeletePasswordError("");
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    deletePasswordError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showDeletePassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {deletePasswordError && (
                <p className="text-red-500 text-sm mt-1">{deletePasswordError}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                  setDeletePasswordError("");
                  setShowDeletePassword(false);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Password & Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
