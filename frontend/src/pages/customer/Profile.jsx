import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import {
  getCustomerProfile,
  updateCustomerProfile,
  updateCustomerImage,
  uploadCustomerImage,
  deleteCustomerImage,
} from "../../utils/customerService";

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [customerId, setCustomerId] = useState(null);

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    gender: "Male",
    joinedDate: "",
    status: "",
    photo: {
      url: null,
      altText: "Customer image",
      public_id: null,
    },
  });

  const [formData, setFormData] = useState({ ...user });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        // Check authentication
        const userDataString = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!userDataString || !token) {
          localStorage.setItem(
            "intendedDestination",
            "/customer-dashboard/profile"
          );
          navigate("/login");
          return;
        }

        const parsedUser = JSON.parse(userDataString);

        if (parsedUser.role !== "customer") {
          localStorage.setItem(
            "intendedDestination",
            "/customer-dashboard/profile"
          );
          navigate("/login");
          return;
        }

        // Extract customer ID - try multiple field names
        const userId =
          parsedUser.id ||
          parsedUser.customer_id ||
          parsedUser._id ||
          parsedUser.userId;

        if (!userId) {
          console.error("No user ID found in localStorage:", parsedUser);
          setError("User ID not found. Please login again.");
          setTimeout(() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/login");
          }, 2000);
          return;
        }

        console.log("Fetching profile for user ID:", userId);
        console.log("User data from localStorage:", parsedUser);
        setCustomerId(userId);

        // Fetch profile from backend
        const response = await getCustomerProfile(userId);
        const profileData = response.data.userRespone;

        // Map backend response to frontend state
        const profileState = {
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          birthDate: profileData.dob ? profileData.dob.split("T")[0] : "",
          gender: profileData.gender || "Male",
          joinedDate: profileData.createdAt || "",
          status: profileData.status || "Active",
          photo: profileData.photo || {
            url: null,
            altText: "Customer image",
            public_id: null,
          },
        };

        setUser(profileState);
        setFormData(profileState);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);

        // Show more specific error messages
        let errorMessage = "Failed to load profile";
        if (err.message === "You are not authorized to see this data") {
          errorMessage =
            "Authorization error. The user ID in your session doesn't match. Please login again.";
          setTimeout(() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/login");
          }, 3000);
        } else if (err.status === 401) {
          errorMessage = "Session expired. Please login again.";
          setTimeout(() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/login");
          }, 2000);
        } else if (err.status === 403) {
          errorMessage = "Access denied. Please login again.";
          setTimeout(() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/login");
          }, 2000);
        } else {
          errorMessage = err.message || "Failed to load profile";
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchCustomerProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccessMessage("");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleRemoveImage = async () => {
    if (!user.photo?.public_id) {
      setError("No profile image to remove");
      return;
    }

    if (
      !window.confirm("Are you sure you want to remove your profile picture?")
    ) {
      return;
    }

    try {
      setImageUploading(true);
      await deleteCustomerImage(customerId);

      setUser({
        ...user,
        photo: {
          url: null,
          altText: "Customer image",
          public_id: null,
        },
      });

      setSelectedImage(null);
      setImagePreview(null);
      setSuccessMessage("Profile picture removed successfully");
      setImageUploading(false);
    } catch (err) {
      console.error("Error removing image:", err);
      setError(err.message || "Failed to remove profile picture");
      setImageUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setSaving(true);

    try {
      // Update profile data
      await updateCustomerProfile(customerId, formData);

      // Update user state
      setUser(formData);

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          name: formData.name,
          phone: formData.phone,
        })
      );

      // Handle image upload if selected
      if (selectedImage) {
        try {
          setImageUploading(true);

          // Check if user already has an image
          if (user.photo?.public_id) {
            // Update existing image
            const imageResponse = await updateCustomerImage(
              customerId,
              selectedImage
            );
            setUser({
              ...formData,
              photo: imageResponse.data.image,
            });
          } else {
            // Upload new image
            const imageResponse = await uploadCustomerImage(
              customerId,
              selectedImage
            );
            setUser({
              ...formData,
              photo: imageResponse.data.images,
            });
          }

          setSelectedImage(null);
          setImagePreview(null);
          setImageUploading(false);
        } catch (imgErr) {
          console.error("Error uploading image:", imgErr);
          setError(imgErr.message || "Profile updated but image upload failed");
          setImageUploading(false);
          setSaving(false);
          setIsEditing(false);
          return;
        }
      }

      setSuccessMessage("Profile updated successfully!");
      setSaving(false);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setSelectedImage(null);
    setImagePreview(null);
    setError("");
    setSuccessMessage("");
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    // Note: Account deletion should be implemented with proper backend endpoint
    // This is a placeholder that logs out the user
    setDeleteError(
      "Account deletion requires admin approval. Please contact support."
    );

    // For now, just log out
    // localStorage.removeItem("user");
    // localStorage.removeItem("token");
    // navigate("/login");
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
            <span className="mr-2">✅</span>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user.photo?.url ? (
                    <img
                      src={user.photo.url}
                      alt={user.photo.altText}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">👤</span>
                  )}
                </div>
                {isEditing && (
                  <div className="mt-2 flex gap-2">
                    <label className="cursor-pointer bg-white text-primary px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                      {selectedImage ? "Change" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={imageUploading}
                      />
                    </label>
                    {(user.photo?.url || imagePreview) && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={imageUploading}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-primary-100">{user.email}</p>
                <p className="text-sm mt-2 opacity-90">
                  Member since{" "}
                  {user.joinedDate
                    ? new Date(user.joinedDate).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
                {user.status && (
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                )}
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
                    disabled={saving || imageUploading}
                    className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving || imageUploading
                      ? "⏳ Saving..."
                      : "💾 Save Changes"}
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
                  max={new Date().toISOString().split("T")[0]}
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
                    <p className="font-medium text-gray-900">
                      Browse Restaurants
                    </p>
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
              Once you delete your account, there is no going back. Please be
              certain.
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
              Are you sure you want to delete your account? This action cannot
              be undone and all your data will be permanently removed.
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
