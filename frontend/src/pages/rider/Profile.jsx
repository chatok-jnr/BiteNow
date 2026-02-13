import React, { useState, useEffect } from "react";
import {
  Bike,
  User,
  UserCircle,
  Mail,
  Phone,
  Calendar,
  FileText,
  Package,
  Star,
  Edit2,
  X,
  Camera,
  Eye,
  EyeOff,
  ArrowLeft,
  Trash2,
  MapPin,
  CheckCircle,
  Clock,
  Upload,
  XCircle,
  Navigation,
  Search,
} from "lucide-react";
import {
  getRiderProfile,
  updateRider,
  deleteRider,
  uploadRiderImage,
  uploadRiderDocuments,
  deleteRiderDocument,
} from "../../utils/riderService";
import { getMyOrderList } from "../../utils/orderService";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";

const Profile = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [showDocDeleteConfirm, setShowDocDeleteConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [navbarProfile, setNavbarProfile] = useState({
    image: null,
    gender: null,
    name: null,
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  const [editForm, setEditForm] = useState({
    rider_name: "",
    rider_date_of_birth: "",
    rider_gender: "",
    rider_address: "",
    coordinates: null,
    "rider_contact_info.emergency_contact": "",
    "rider_contact_info.alternative_phone": "",
    rider_password: "",
    confirmPassword: "",
    imageFile: null,
  });

  // Fetch rider profile and orders on component mount
  useEffect(() => {
    fetchRiderProfile();
    fetchCompletedOrders();
  }, []);

  const fetchRiderProfile = async () => {
    try {
      setLoading(true);
      const response = await getRiderProfile();
      if (response.status === "success") {
        setProfileData(response.rider);

        // Extract image URL for navbar
        const imageData = response.rider?.image;
        const imageUrl =
          typeof imageData === "object" ? imageData?.url : imageData;

        setNavbarProfile({
          image: imageUrl,
          gender: response.rider?.gender,
          name: response.rider?.name,
        });

        // Initialize edit form with current data
        const riderCoords = response.rider.location?.coordinates || null;
        setCoordinates(riderCoords);

        setEditForm({
          rider_name: response.rider.name || "",
          rider_date_of_birth: response.rider.date_of_birth
            ? new Date(response.rider.date_of_birth).toISOString().split("T")[0]
            : "",
          rider_gender: response.rider.gender || "",
          rider_address: response.rider.address || "",
          coordinates: riderCoords,
          "rider_contact_info.emergency_contact":
            response.rider.contact_info?.emergency_contact || "",
          "rider_contact_info.alternative_phone":
            response.rider.contact_info?.alternative_phone || "",
          rider_password: "",
          confirmPassword: "",
          imageFile: null,
        });
      }
    } catch (error) {
      console.error("Error fetching rider profile:", error);
      showError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const response = await getMyOrderList();
      if (response.status === "success" && response.myOrder) {
        // Filter only completed/delivered orders
        const completed = response.myOrder.filter(
          (order) => order.order_status === "delivered",
        );
        setCompletedOrders(completed);
      }
    } catch (error) {
      console.error("Error fetching completed orders:", error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing && profileData) {
      // Reset form when canceling edit
      const riderCoords = profileData.location?.coordinates || null;
      setEditForm({
        rider_name: profileData.name || "",
        rider_date_of_birth: profileData.date_of_birth
          ? new Date(profileData.date_of_birth).toISOString().split("T")[0]
          : "",
        rider_gender: profileData.gender || "",
        rider_address: profileData.address || "",
        coordinates: riderCoords,
        "rider_contact_info.emergency_contact":
          profileData.contact_info?.emergency_contact || "",
        "rider_contact_info.alternative_phone":
          profileData.contact_info?.alternative_phone || "",
        rider_password: "",
        confirmPassword: "",
        imageFile: null,
      });
      setCoordinates(riderCoords);
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showError("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("Image size should be less than 5MB");
        return;
      }
      setEditForm((prev) => ({
        ...prev,
        imageFile: file,
      }));
    }
  };

  // Use browser geolocation to get current position
  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);
    console.log("Requesting geolocation...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = [longitude, latitude];

        console.log("Location detected:", { latitude, longitude });

        setCoordinates(coords);
        setEditForm((prev) => ({ ...prev, coordinates: coords }));

        // Reverse geocode to get address
        console.log("Reverse geocoding...");
        const address = await reverseGeocode(longitude, latitude);
        if (address) {
          console.log("Address found:", address);
          setEditForm((prev) => ({ ...prev, rider_address: address }));
          showSuccess("Location detected successfully!");
        } else {
          showWarning("Location detected but address not found");
        }
        setLoadingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to retrieve your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        showError(errorMessage);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // Search for addresses using Mapbox Geocoding API
  const handleAddressSearch = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      if (!MAPBOX_TOKEN) {
        throw new Error("Mapbox access token is not configured");
      }
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=BD&limit=5`;

      console.log("Searching address:", query);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Search results:", data.features);

      if (data.features && data.features.length > 0) {
        setSearchResults(data.features);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
        showInfo("No addresses found. Try a different search term.");
      }
    } catch (err) {
      console.error("Address search error:", err);
      showError("Failed to search address. Please try again.");
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (longitude, latitude) => {
    try {
      const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      if (!MAPBOX_TOKEN) {
        throw new Error("Mapbox access token is not configured");
      }
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`;

      console.log("Reverse geocoding:", { longitude, latitude });
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Reverse geocode result:", data);

      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        console.log("Address extracted:", address);
        return address;
      }
      return null;
    } catch (err) {
      console.error("Reverse geocode error:", err);
      return null;
    }
  };

  // Select a location from search results
  const handleSelectLocation = (feature) => {
    const [longitude, latitude] = feature.center;
    const coords = [longitude, latitude];

    console.log("Location selected:", {
      name: feature.place_name,
      coordinates: coords,
    });

    setCoordinates(coords);
    setEditForm((prev) => ({
      ...prev,
      coordinates: coords,
      rider_address: feature.place_name,
    }));

    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);
    showSuccess("Location selected successfully!");
  };

  const handleSaveProfile = async () => {
    try {
      // Validate password match if changing password
      if (
        editForm.rider_password &&
        editForm.rider_password !== editForm.confirmPassword
      ) {
        showError("Passwords do not match!");
        return;
      }

      // Prepare update data
      const updateData = {
        rider_name: editForm.rider_name,
        rider_date_of_birth: editForm.rider_date_of_birth,
        rider_gender: editForm.rider_gender,
        rider_address: editForm.rider_address,
        "rider_contact_info.emergency_contact":
          editForm["rider_contact_info.emergency_contact"],
        "rider_contact_info.alternative_phone":
          editForm["rider_contact_info.alternative_phone"],
      };

      // Add coordinates if they exist
      if (coordinates) {
        updateData.rider_coordinates = coordinates;
        console.log("Adding coordinates to update:", coordinates);
      }

      // Add password only if it's being changed
      if (editForm.rider_password) {
        updateData.rider_password = editForm.rider_password;
      }

      console.log("Update data being sent:", updateData);

      // Update profile information
      const response = await updateRider(profileData.id, updateData);

      if (response.status === "success") {
        // If there's a new image, upload it
        if (editForm.imageFile) {
          try {
            await uploadRiderImage(profileData.id, editForm.imageFile);
          } catch (imgError) {
            console.error("Error uploading image:", imgError);
            showWarning(
              "Profile updated but image upload failed. Please try uploading the image separately.",
            );
          }
        }

        // Refresh profile data
        await fetchRiderProfile();
        setIsEditing(false);
        showSuccess("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showError(
        error.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await deleteRider(profileData.id);
      if (response.status === "success") {
        showSuccess("Account deleted successfully");
        // Clear local storage and redirect to login
        setTimeout(() => {
          localStorage.clear();
          navigate("/rider/login");
        }, 1500);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      showError(
        error.response?.data?.message ||
          "Failed to delete account. Please try again.",
      );
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate number of files (max 5)
    if (files.length > 5) {
      showError("You can upload a maximum of 5 documents at once");
      return;
    }

    // Validate file types (accept common document formats)
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    const invalidFiles = files.filter(
      (file) => !allowedTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      showError("Please upload only PDF or image files (JPG, JPEG, PNG)");
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showError("Each file should be less than 5MB");
      return;
    }

    setDocumentFiles(files);
  };

  const handleUploadDocuments = async () => {
    if (documentFiles.length === 0) {
      showError("Please select documents to upload");
      return;
    }

    try {
      setUploadingDocs(true);
      const response = await uploadRiderDocuments(
        profileData.id,
        documentFiles,
      );

      if (response.status === "success") {
        showSuccess("Documents uploaded successfully!");
        setDocumentFiles([]);
        // Clear the file input
        const fileInput = document.getElementById("document-upload");
        if (fileInput) fileInput.value = "";
        // Refresh profile to show new documents
        await fetchRiderProfile();
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      showError(
        error.response?.data?.message ||
          "Failed to upload documents. Please try again.",
      );
    } finally {
      setUploadingDocs(false);
    }
  };

  const handleDeleteDocument = (docId) => {
    setDocToDelete(docId);
    setShowDocDeleteConfirm(true);
  };

  const confirmDeleteDocument = async () => {
    if (!docToDelete) return;

    try {
      const response = await deleteRiderDocument(profileData.id, docToDelete);

      if (response.status === "success") {
        showSuccess("Document deleted successfully!");
        // Refresh profile to remove deleted document
        await fetchRiderProfile();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      showError(
        error.response?.data?.message ||
          "Failed to delete document. Please try again.",
      );
    } finally {
      setShowDocDeleteConfirm(false);
      setDocToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgPrimary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-bgPrimary flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Failed to load profile</p>
          <button
            onClick={() => navigate("/rider/home")}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-full hover:bg-accent-dark"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgPrimary">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-primary shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {navbarProfile.image ? (
                <img
                  src={navbarProfile.image}
                  alt="Rider profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
                style={{ display: navbarProfile.image ? "none" : "flex" }}
              >
                {navbarProfile.gender?.toLowerCase() === "female" ? (
                  <UserCircle className="w-6 h-6 text-primary" />
                ) : (
                  <User className="w-6 h-6 text-primary" />
                )}
              </div>
              <span className="text-2xl font-bold text-white">
                {navbarProfile.name || "BiteNow Rider"}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/rider/home")}
                className="text-white hover:text-surface transition-colors font-medium flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="bg-secondary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            My Profile
          </h1>
          <p className="text-white/90 text-lg">
            Manage your account information and settings
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Rating Card */}
          <div className="bg-tertiary rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-primary rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-gray-600 mb-1">Rating</p>
              <p className="text-3xl font-bold text-primary">
                {profileData.stats?.average_rating?.toFixed(1) || "0.0"}
              </p>
            </div>
          </div>

          {/* Total Deliveries Card */}
          <div className="bg-tertiary rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-primary rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-600 mb-1">Total Deliveries</p>
              <p className="text-3xl font-bold text-primary">
                {profileData.stats?.total_deliveries || 0}
              </p>
            </div>
          </div>

          {/* Completed Orders Card */}
          <div className="bg-tertiary rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-primary rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-primary">
                {completedOrders.length}
              </p>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="bg-tertiary rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-primary rounded-full flex items-center justify-center">
                <Bike className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <p className="text-lg font-bold text-primary capitalize">
                {profileData.account_status || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details - Full Width */}
        <div className="space-y-6">
          {/* Profile Information Card */}
          <div>
            <div className="bg-tertiary rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-secondary p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <User className="w-6 h-6" />
                  <span>Profile Information</span>
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEditToggle}
                    className="bg-primary text-white px-4 py-2 rounded-full hover:bg-accent-dark transition-all font-semibold flex items-center space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all font-semibold flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <div className="p-6">
                {/* Profile Photo */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-primary shadow-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                      {editForm.imageFile || profileData?.image?.url ? (
                        <img
                          src={
                            editForm.imageFile
                              ? URL.createObjectURL(editForm.imageFile)
                              : profileData.image.url
                          }
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-accent-dark transition-all">
                        <Camera className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Form Fields - Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="bg-surface p-4 rounded-xl md:col-span-2">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <User className="w-4 h-4 text-primary" />
                      <span>Full Name</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="rider_name"
                        value={editForm.rider_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">
                        {profileData.name}
                      </p>
                    )}
                  </div>

                  {/* Email (Read Only) */}
                  <div className="bg-surface p-4 rounded-xl md:col-span-2">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>Email Address</span>
                    </label>
                    <p className="text-lg font-semibold text-gray-800">
                      {profileData.email}
                    </p>
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="bg-surface p-4 rounded-xl">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>Emergency Contact</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="rider_contact_info.emergency_contact"
                        value={editForm["rider_contact_info.emergency_contact"]}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">
                        {profileData.contact_info?.emergency_contact ||
                          "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Alternative Phone */}
                  <div className="bg-surface p-4 rounded-xl">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>Alternative Phone</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="rider_contact_info.alternative_phone"
                        value={editForm["rider_contact_info.alternative_phone"]}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">
                        {profileData.contact_info?.alternative_phone ||
                          "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="bg-surface p-4 rounded-xl">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <User className="w-4 h-4 text-primary" />
                      <span>Gender</span>
                    </label>
                    {isEditing ? (
                      <select
                        name="rider_gender"
                        value={editForm.rider_gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">
                        {profileData.gender || "Not specified"}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  {isEditing && (
                    <div className="bg-tertiary p-6 rounded-xl space-y-4 md:col-span-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        Location & Address
                      </h3>

                      {/* Location Selector */}
                      <div className="bg-surface p-4 rounded-lg space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Quick Location Selection
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={loadingLocation}
                            className="flex-1 bg-primary text-white px-4 py-3 rounded-lg hover:bg-accent-dark transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Navigation className="w-5 h-5" />
                            <span>
                              {loadingLocation
                                ? "Getting Location..."
                                : "Use My Location"}
                            </span>
                          </button>
                        </div>

                        {/* Address Search */}
                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Search Address
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSearchQuery(value);
                                if (value.length >= 3) {
                                  handleAddressSearch(value);
                                } else {
                                  setSearchResults([]);
                                  setShowSearchResults(false);
                                }
                              }}
                              onFocus={() =>
                                searchResults.length > 0 &&
                                setShowSearchResults(true)
                              }
                              onBlur={() => {
                                // Delay to allow click on results
                                setTimeout(
                                  () => setShowSearchResults(false),
                                  200,
                                );
                              }}
                              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                              placeholder="Search for an address..."
                            />
                          </div>

                          {/* Search Results Dropdown */}
                          {showSearchResults && searchResults.length > 0 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border-2 border-secondary rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {searchResults.map((result, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onMouseDown={(e) => {
                                    // Prevent input blur
                                    e.preventDefault();
                                    handleSelectLocation(result);
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-surface transition-colors border-b border-gray-200 last:border-b-0"
                                >
                                  <div className="flex items-start space-x-2">
                                    <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium text-gray-800 text-sm">
                                        {result.text}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {result.place_name}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Current Coordinates Display */}
                        {(coordinates || editForm.coordinates) && (
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">
                              Selected Coordinates:
                            </p>
                            <p className="text-sm font-medium text-gray-800">
                              Lat:{" "}
                              {(
                                coordinates?.[1] || editForm.coordinates?.[1]
                              )?.toFixed(6)}
                              , Lng:{" "}
                              {(
                                coordinates?.[0] || editForm.coordinates?.[0]
                              )?.toFixed(6)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Full Address Field */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Address
                        </label>
                        <textarea
                          name="rider_address"
                          value={editForm.rider_address}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white resize-none"
                          placeholder="Enter full address or use location tools above to auto-fill"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Tip: Use &quot;Use My Location&quot; or
                          &quot;Search Address&quot; to automatically fill this
                          field
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Address Display (when not editing) */}
                  {!isEditing && (
                    <div className="bg-surface p-4 rounded-xl md:col-span-2">
                      <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>Address</span>
                      </label>
                      <p className="text-lg font-semibold text-gray-800">
                        {profileData.address || "Not provided"}
                      </p>
                    </div>
                  )}

                  {/* Date of Birth */}
                  <div className="bg-surface p-4 rounded-xl md:col-span-2">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Date of Birth</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="rider_date_of_birth"
                        value={editForm.rider_date_of_birth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">
                        {profileData.date_of_birth
                          ? new Date(
                              profileData.date_of_birth,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Password Fields (Only in Edit Mode) */}
                  {isEditing && (
                    <>
                      <div className="bg-surface p-4 rounded-xl md:col-span-2">
                        <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <span>
                            New Password (Leave blank to keep current)
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="rider_password"
                            value={editForm.rider_password}
                            onChange={handleInputChange}
                            placeholder="Enter new password"
                            className="w-full px-4 py-2 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="bg-surface p-4 rounded-xl md:col-span-2">
                        <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <span>Confirm New Password</span>
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={editForm.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleSaveProfile}
                      className="w-full bg-primary text-white py-3 rounded-full hover:bg-accent-dark transition-all font-semibold text-lg hover:shadow-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                )}

                {/* Delete Account Button */}
                {!isEditing && (
                  <div className="mt-6 pt-6 border-t border-secondary/30">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full bg-red-500 text-white py-3 rounded-full hover:bg-red-600 transition-all font-semibold text-lg hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Delete Account</span>
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      This action cannot be undone
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-tertiary rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-secondary p-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <FileText className="w-6 h-6" />
                  <span>Required Documents</span>
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Upload and manage your rider verification documents
                </p>
              </div>
              <div className="p-6">
                <div className="bg-surface p-4 rounded-xl">
                  <label className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Rider Documents</span>
                  </label>

                  {/* Upload Documents Section */}
                  <div className="mb-4 p-4 bg-white rounded-lg border-2 border-dashed border-secondary">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="document-upload"
                          className="cursor-pointer bg-primary text-white px-4 py-2 rounded-full hover:bg-accent-dark transition-all font-semibold text-sm flex items-center space-x-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Choose Documents</span>
                          <input
                            id="document-upload"
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleDocumentChange}
                            className="hidden"
                            disabled={uploadingDocs}
                          />
                        </label>
                        {documentFiles.length > 0 && (
                          <button
                            onClick={handleUploadDocuments}
                            disabled={uploadingDocs}
                            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-all font-semibold text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Upload className="w-4 h-4" />
                            <span>
                              {uploadingDocs ? "Uploading..." : "Upload"}
                            </span>
                          </button>
                        )}
                      </div>

                      {documentFiles.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 font-medium">
                            Selected files:
                          </p>
                          {documentFiles.map((file, index) => (
                            <div
                              key={index}
                              className="text-xs text-gray-700 flex items-center space-x-2"
                            >
                              <FileText className="w-3 h-3 text-primary" />
                              <span>
                                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        Upload up to 5 documents (PDF). Max 10MB each.
                      </p>
                    </div>
                  </div>

                  {/* Existing Documents */}
                  {profileData.documents && profileData.documents.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Uploaded Documents:
                      </p>
                      {profileData.documents.map((doc, index) => (
                        <div
                          key={doc._id || index}
                          className="flex items-center justify-between bg-white p-3 rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-primary hover:text-accent-dark transition-colors font-medium text-sm flex-1"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Document {index + 1}</span>
                          </a>
                          <button
                            onClick={() => handleDeleteDocument(doc._id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                            title="Delete document"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No documents uploaded yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Delete Confirmation Modal */}
      {showDocDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Delete Document?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this document? This action
                cannot be undone.
              </p>
              <div className="space-y-3">
                <button
                  onClick={confirmDeleteDocument}
                  className="w-full bg-red-500 text-white py-3 rounded-full hover:bg-red-600 transition-all font-semibold"
                >
                  Yes, Delete Document
                </button>
                <button
                  onClick={() => {
                    setShowDocDeleteConfirm(false);
                    setDocToDelete(null);
                  }}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-full hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Delete Account?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot
                be undone and all your data will be permanently removed.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleDeleteAccount}
                  className="w-full bg-red-500 text-white py-3 rounded-full hover:bg-red-600 transition-all font-semibold"
                >
                  Yes, Delete My Account
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-full hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-secondary text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">BiteNow Rider</span>
          </div>
          <p className="text-white/80">© 2026 BiteNow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
