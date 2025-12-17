import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [user, setUser] = useState({
    name: "John Doe",
    email: "customer@test.com",
    phone: "+880 1712345678",
    address: "House 123, Road 4, Dhanmondi, Dhaka",
    birthDate: "1995-05-15",
    gender: "Male",
    joinedDate: "2024-01-15",
  });

  const [formData, setFormData] = useState({ ...user });

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user");
    if (!userData) {
      localStorage.setItem("intendedDestination", "/customer-dashboard/profile");
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "customer") {
      localStorage.setItem("intendedDestination", "/customer-dashboard/profile");
      navigate("/login");
    }
    
    // Load user data (in real app, fetch from backend)
    setUser({ ...user, ...parsedUser });
    setFormData({ ...user, ...parsedUser });
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUser(formData);
    
    // Update localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    localStorage.setItem("user", JSON.stringify({ ...storedUser, ...formData }));
    
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    // Validate password (mock validation - checking against "customer123")
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const correctPassword = storedUser.password || "customer123";
    
    if (deletePassword !== correctPassword) {
      setDeleteError("Incorrect password. Please try again.");
      return;
    }
    
    // Password is correct, proceed with deletion
    localStorage.removeItem("user");
    localStorage.removeItem("customerOrders");
    localStorage.removeItem("pendingCheckout");
    navigate("/login");
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <span className="text-5xl">👤</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-primary-100">{user.email}</p>
                <p className="text-sm mt-2 opacity-90">
                  Member since {new Date(user.joinedDate).toLocaleDateString('en-GB', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSave} className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors font-medium"
                  >
                    💾 Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    !isEditing ? "bg-gray-50 text-gray-600" : ""
                  }`}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    !isEditing ? "bg-gray-50 text-gray-600" : ""
                  }`}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    !isEditing ? "bg-gray-50 text-gray-600" : ""
                  }`}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    !isEditing ? "bg-gray-50 text-gray-600" : ""
                  }`}
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows="3"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                    !isEditing ? "bg-gray-50 text-gray-600" : ""
                  }`}
                />
              </div>
            </div>
          </form>

          {/* Quick Links */}
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/customer-dashboard/orders")}
                className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📦</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">My Orders</p>
                    <p className="text-sm text-gray-600">View order history</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={() => navigate("/customer-dashboard")}
                className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🍽️</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Browse Restaurants</p>
                    <p className="text-sm text-gray-600">Order food now</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-gray-200 bg-red-50 p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              🗑️ Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Delete Account?
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete your account? This action cannot be
              undone and all your data will be permanently removed.
            </p>
            
            {/* Password Confirmation */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm your password to continue
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError("");
                }}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {deleteError && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {deleteError}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCloseDeleteModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
