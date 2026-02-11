import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Mail,
  Phone,
  User,
  Calendar,
  Camera,
  LogOut,
  MapPin,
  Home as HomeIcon,
  Package,
} from "lucide-react";
import {
  getCustomerProfile,
  updateCustomerProfile,
  updateCustomerImage,
  uploadCustomerImage,
  setDefaultAddress,
  getCustomerAddresses,
} from "../../utils/customerService";
import { useNotification } from "../../contexts/NotificationContext";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    gender: "",
    image: null,
    memberSince: "",
    savedAddresses: [],
    defaultAddressId: null,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
    birthDate: "",
    gender: "",
    image: "",
    selectedAddressId: null,
  });

  const [imageFile, setImageFile] = useState(null);

  // Load user data when component mounts or when returning to profile page
  useEffect(() => {
    console.log("Profile component mounted or location changed");
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userString = localStorage.getItem("user");

      console.log("Auth check:", { hasToken: !!token, hasUser: !!userString });

      if (!token || !userString) {
        console.log("No auth found, redirecting to login");
        navigate("/login", { replace: true });
        return;
      }

      await fetchCustomerProfile();
    };

    checkAuth();
  }, [navigate, location.pathname]);

  const fetchCustomerProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user from localStorage
      const userString = localStorage.getItem("user");
      const user = JSON.parse(userString);
      const customerId = user.id || user.userId || user._id || user.customer_id;

      console.log("Fetching profile for customer:", customerId);
      console.log("User from localStorage:", user);

      // Fetch customer profile from API
      const response = await getCustomerProfile(customerId);

      console.log("Profile API response:", response);

      if (response && response.data) {
        // Handle different response structures - backend uses "userRespone" (typo)
        const customer =
          response.data.userRespone || response.data.customer || response.data;

        console.log("Customer data:", customer);

        if (!customer) {
          console.error("No customer data in response");
          setError("No customer data received from server");
          return;
        }

        const memberSince = customer.createdAt
          ? new Date(customer.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "N/A";

        // Capitalize gender to match enum (Male, Female, Other)
        const capitalizeGender = (gender) => {
          if (!gender) return "";
          return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
        };

        // Fetch saved addresses separately to ensure we get the latest data
        let savedAddresses = [];
        let defaultAddress = null;

        try {
          const addressResponse = await getCustomerAddresses(customerId);
          console.log("Addresses API response:", addressResponse);
          savedAddresses = addressResponse.data?.addresses || [];
          defaultAddress = savedAddresses.find((addr) => addr.isDefault);
          console.log("Default address found:", defaultAddress);
        } catch (addressErr) {
          console.error("Error fetching addresses:", addressErr);
          // Fallback to addresses from customer profile if separate fetch fails
          savedAddresses = customer.saved_addresses || [];
          defaultAddress = savedAddresses.find((addr) => addr.isDefault);
        }

        const userData = {
          name: customer.name || customer.customer_name || "User",
          email: customer.email || customer.customer_email || "",
          phone: customer.phone || customer.customer_phone || "",
          address:
            defaultAddress?.address ||
            customer.address ||
            customer.customer_address ||
            "",
          birthDate: customer.dob
            ? new Date(customer.dob).toISOString().split("T")[0]
            : customer.customer_birth_date
              ? new Date(customer.customer_birth_date)
                  .toISOString()
                  .split("T")[0]
              : "",
          gender: capitalizeGender(
            customer.gender || customer.customer_gender || "",
          ),
          image: customer.photo?.url || customer.customer_image?.url || null,
          memberSince,
          savedAddresses: savedAddresses,
          defaultAddressId: defaultAddress?._id || null,
        };

        console.log("Setting profile data:", userData);

        setProfileData(userData);
        setEditForm({
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          birthDate: userData.birthDate,
          gender: userData.gender,
          image: userData.image,
          selectedAddressId: userData.defaultAddressId,
        });
      } else {
        console.error("Unexpected API response format:", response);
        setError("Unexpected response from server");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      console.error("Error details:", err.response?.data);
      setError(
        err.response?.data?.message || err.message || "Failed to load profile",
      );
      // Don't redirect on API errors, just show the error
      // Only redirect if it's specifically an auth error
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const userString = localStorage.getItem("user");
      const user = JSON.parse(userString);
      const customerId = user.id || user.userId || user._id || user.customer_id;

      console.log("Updating profile for customer:", customerId);
      console.log("Update data:", {
        name: editForm.name,
        phone: editForm.phone,
        address: editForm.address,
        birthDate: editForm.birthDate,
        gender: editForm.gender,
      });

      // Update profile data
      const response = await updateCustomerProfile(customerId, {
        name: editForm.name,
        phone: editForm.phone,
        address: editForm.address,
        birthDate: editForm.birthDate,
        gender: editForm.gender,
      });

      console.log("Update response:", response);

      // Update default address if changed
      if (
        editForm.selectedAddressId &&
        editForm.selectedAddressId !== profileData.defaultAddressId
      ) {
        console.log("Updating default address to:", editForm.selectedAddressId);
        await setDefaultAddress(customerId, editForm.selectedAddressId);
      }

      // Upload or update image if selected
      if (imageFile) {
        console.log("Processing image upload/update...");
        try {
          // Check if customer already has a profile picture
          if (profileData.image) {
            // Update existing image
            console.log("Updating existing image...");
            await updateCustomerImage(customerId, imageFile);
          } else {
            // Upload new image
            console.log("Uploading new image...");
            await uploadCustomerImage(customerId, imageFile);
          }
        } catch (imgErr) {
          console.error("Error processing image:", imgErr);
          throw new Error(
            "Failed to upload/update image: " +
              (imgErr.response?.data?.message || imgErr.message),
          );
        }
      }

      // Refresh profile data
      await fetchCustomerProfile();
      setIsEditing(false);
      setImageFile(null);
      showSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update profile",
      );
      showError(
        "Failed to update profile: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: profileData.name,
      phone: profileData.phone,
      address: profileData.address,
      birthDate: profileData.birthDate,
      gender: profileData.gender,
      image: profileData.image,
    });
    setImageFile(null);
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading && !profileData.email) {
    return (
      <div className="min-h-screen bg-bgPrimary flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-primary shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              onClick={() => navigate("/")}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-10 h-10 bg-tertiary rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-white">BiteNow</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="text-white hover:text-tertiary transition-colors font-medium px-4 py-2 flex items-center gap-2"
              >
                <HomeIcon className="w-5 h-5" />
                Home
              </button>
              <button
                onClick={() => navigate("/orderStatus")}
                className="text-white hover:text-tertiary transition-colors font-medium px-4 py-2 flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                Orders
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="bg-tertiary text-primary px-6 py-2 rounded-full font-semibold flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                Profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  localStorage.removeItem("guest_session_id");
                  navigate("/login");
                }}
                className="text-white hover:text-red-300 transition-colors font-medium px-4 py-2 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Container */}
      <div className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-tertiary rounded-3xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-secondary h-32"></div>

            <div className="relative px-8 pb-8">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Profile Image */}
              <div className="flex justify-center -mt-16 mb-6">
                <div className="relative">
                  {(isEditing ? editForm.image : profileData.image) ? (
                    <img
                      src={isEditing ? editForm.image : profileData.image}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-tertiary object-cover shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-tertiary bg-primary shadow-xl flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-accent-dark transition-all shadow-lg">
                      <Camera className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              {!isEditing ? (
                // View Mode
                <div className="space-y-6">
                  {/* Name */}
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-1">
                      {profileData.name}
                    </h2>
                    <p className="text-gray-600">BiteNow Member</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Email */}
                    <div className="bg-white rounded-2xl p-5 shadow-md">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-semibold">
                            Email
                          </p>
                          <p className="text-gray-800 font-medium">
                            {profileData.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="bg-white rounded-2xl p-5 shadow-md">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-semibold">
                            Phone
                          </p>
                          <p className="text-gray-800 font-medium">
                            {profileData.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Default Address */}
                    <div className="bg-white rounded-2xl p-5 shadow-md">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-semibold">
                            Default Delivery Address
                          </p>
                          <p className="text-gray-800 font-medium">
                            {profileData.address || "No address saved"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Birth Date */}
                    <div className="bg-white rounded-2xl p-5 shadow-md">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-semibold">
                            Birth Date
                          </p>
                          <p className="text-gray-800 font-medium">
                            {profileData.birthDate
                              ? new Date(
                                  profileData.birthDate,
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="bg-white rounded-2xl p-5 shadow-md">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-semibold">
                            Gender
                          </p>
                          <p className="text-gray-800 font-medium capitalize">
                            {profileData.gender || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="bg-white rounded-2xl p-5 shadow-md">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-semibold">
                            Member Since
                          </p>
                          <p className="text-gray-800 font-medium">
                            {profileData.memberSince}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Management Section */}
                  <div className="mt-8 bg-white rounded-2xl p-5 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-semibold">
                            Saved Addresses
                          </p>
                          <p className="text-gray-800 font-medium">
                            Manage your delivery addresses
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/addresses")}
                        className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-accent-dark transition-all"
                      >
                        Manage
                      </button>
                    </div>
                  </div>

                  {/* Update Profile Button */}
                  <div className="flex justify-center gap-4 mt-8">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-primary text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-accent-dark transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Update Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-red-600 transition-all hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      Edit Profile
                    </h2>
                    <p className="text-gray-600">Update your information</p>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        placeholder="Your name"
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-full border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-full border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Select Default Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Default Delivery Address
                    </label>
                    {profileData.savedAddresses.length > 0 ? (
                      <select
                        name="selectedAddressId"
                        value={editForm.selectedAddressId || ""}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 bg-white rounded-full border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                      >
                        <option value="">Select an address</option>
                        {profileData.savedAddresses.map((addr) => (
                          <option key={addr._id} value={addr._id}>
                            {addr.label} - {addr.address}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-600 mb-3">
                          No saved addresses yet
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/addresses")}
                          className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-accent-dark transition-all inline-flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4" />
                          Add Address
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Birth Date Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Birth Date
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <input
                        type="date"
                        name="birthDate"
                        value={editForm.birthDate}
                        onChange={handleEditChange}
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-full border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Gender Select */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 bg-white rounded-full border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Read-only Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address (Cannot be changed)
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full border-2 border-transparent text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-400 text-white py-3 rounded-full font-bold text-lg hover:bg-gray-500 transition-all hover:shadow-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-primary text-white py-3 rounded-full font-bold text-lg hover:bg-accent-dark transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
