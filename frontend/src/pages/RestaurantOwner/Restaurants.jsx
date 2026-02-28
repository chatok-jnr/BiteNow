import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Plus,
  X,
  MapPin,
  Mail,
  Image,
  ChevronRight,
  Star,
  Package,
  Phone,
  Trash2,
  Edit,
  Navigation,
  Search,
} from "lucide-react";
import OwnerNavbar from "../../components/OwnerNavbar";
import ApprovalMessage from "../../components/ApprovalMessage";
import Footer from "../../components/Footer";
import { useNotification } from "../../contexts/NotificationContext";
import {
  getMyRestaurants,
  createRestaurant,
  deleteRestaurant,
  uploadRestaurantImage,
  updateRestaurant,
  updateRestaurantImage,
} from "../../utils/restaurantService";
import axiosInstance from "../../utils/axios";

const Restaurants = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null); // Store actual file for upload
  const [ownerStatus, setOwnerStatus] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [formData, setFormData] = useState({
    restaurant_name: "",
    restaurant_description: "",
    restaurant_address: "",
    coordinates: [90.4125, 23.8103], // Dhaka, Bangladesh
    restaurant_contact_info: {
      phone: "",
      email: "",
    },
    restaurant_category: [],
    restaurant_opening_hours: {
      monday: { open: "09:00", close: "22:00" },
      tuesday: { open: "09:00", close: "22:00" },
      wednesday: { open: "09:00", close: "22:00" },
      thursday: { open: "09:00", close: "22:00" },
      friday: { open: "09:00", close: "22:00" },
      saturday: { open: "09:00", close: "22:00" },
      sunday: { open: "09:00", close: "22:00" },
    },
  });

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const restaurantTypes = [
    "Italian",
    "Chinese",
    "Japanese",
    "American",
    "Mexican",
    "Indian",
    "Thai",
    "Bangladeshi",
    "Mediterranean",
    "Korean",
    "BBQ",
    "Grill",
    "Fast Food",
  ];

  // Fetch restaurants on component mount
  useEffect(() => {
    fetchOwnerProfile(); // Fetch fresh profile data first
    fetchRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch fresh owner profile from backend to get latest status
  const fetchOwnerProfile = async () => {
    try {
      // Get owner ID from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = currentUser._id || currentUser.id || currentUser.userId;

      if (!ownerId) {
        console.warn("⚠️ No owner ID found in localStorage");
        checkOwnerStatusFromLocalStorage();
        return;
      }

      console.log(
        "🔄 Fetching fresh restaurant owner profile for ID:",
        ownerId,
      );
      const response = await axiosInstance.get(
        `/api/v1/restaurant-owner/${ownerId}`,
      );

      if (
        response.data?.status === "success" &&
        response.data?.data?.restaurantOwner
      ) {
        const ownerData = response.data.data.restaurantOwner;
        console.log("✅ Fresh owner profile fetched:", ownerData);

        // Update localStorage with fresh data
        const updatedUser = {
          ...currentUser,
          ...ownerData,
          id: ownerData._id || ownerData.id || currentUser.id,
          userId: ownerData._id || ownerData.id || currentUser.userId,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("💾 Updated user data in localStorage");

        // Set the owner status
        setOwnerStatus(ownerData.restaurant_owner_status);
        console.log(
          "📊 Owner status set to:",
          ownerData.restaurant_owner_status,
        );
      }
    } catch (err) {
      console.error("❌ Error fetching owner profile:", err);
      // Fallback to localStorage data
      checkOwnerStatusFromLocalStorage();
    }
  };

  // Fallback: Check owner status from localStorage if API fails
  const checkOwnerStatusFromLocalStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      console.log("🔍 Raw user string from localStorage:", userStr);

      if (userStr) {
        const user = JSON.parse(userStr);
        console.log("👤 Parsed user object:", user);
        console.log(
          "📊 restaurant_owner_status:",
          user.restaurant_owner_status,
        );
        console.log("📊 status:", user.status);

        setOwnerStatus(user.restaurant_owner_status || user.status);
      }
    } catch (err) {
      console.error("Error checking owner status:", err);
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await getMyRestaurants();

      console.log("Fetch restaurants response:", response);

      if (response.status === "success" || response.success) {
        // Handle different response formats
        const restaurantList =
          response.data?.restaurants ||
          response.data ||
          response.restaurants ||
          [];

        // Ensure it's an array
        if (Array.isArray(restaurantList)) {
          setRestaurants(restaurantList);
        } else {
          console.warn("Restaurant data is not an array:", restaurantList);
          setRestaurants([]);
        }
      } else {
        setRestaurants([]);
      }
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      showError(err.message || "Failed to fetch restaurants");
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // Use browser geolocation to get current position
  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get address
        try {
          const fullAddress = await reverseGeocode(longitude, latitude);

          setFormData((prev) => ({
            ...prev,
            coordinates: [longitude, latitude],
            restaurant_address: fullAddress,
          }));

          showSuccess("Location set successfully!");
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          // Still set coordinates even if reverse geocoding fails
          setFormData((prev) => ({
            ...prev,
            coordinates: [longitude, latitude],
            restaurant_address: `${latitude}, ${longitude}`,
          }));
          showError(
            "Location coordinates set, but couldn't fetch address details",
          );
        }
        setLoadingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        showError(
          "Unable to retrieve your location. Please check your browser settings.",
        );
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
      // Using Mapbox Geocoding API
      const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      if (!MAPBOX_TOKEN) {
        throw new Error("Mapbox access token is not configured");
      }
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5&types=address,place,poi`,
      );

      if (!response.ok) {
        throw new Error("Geocoding request failed");
      }

      const data = await response.json();
      setSearchResults(data.features || []);
      setShowSearchResults(true);
    } catch (err) {
      console.error("Geocoding error:", err);
      setSearchResults([]);
    }
  };

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (longitude, latitude) => {
    try {
      const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      if (!MAPBOX_TOKEN) {
        throw new Error("Mapbox access token is not configured");
      }
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`,
      );

      if (!response.ok) {
        throw new Error("Reverse geocoding failed");
      }

      const data = await response.json();
      if (!data.features || data.features.length === 0) {
        throw new Error("No address found");
      }

      const feature = data.features[0];
      return feature.place_name; // Return full address string
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      throw err;
    }
  };

  // Select a location from search results
  const handleSelectLocation = (feature) => {
    const [longitude, latitude] = feature.center;

    setFormData((prev) => ({
      ...prev,
      coordinates: [longitude, latitude],
      restaurant_address: feature.place_name,
    }));

    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested fields
    if (name.startsWith("contact_")) {
      const field = name.replace("contact_", "");
      setFormData((prev) => ({
        ...prev,
        restaurant_contact_info: {
          ...prev.restaurant_contact_info,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => {
      const categories = prev.restaurant_category.includes(category)
        ? prev.restaurant_category.filter((c) => c !== category)
        : [...prev.restaurant_category, category];
      return { ...prev, restaurant_category: categories };
    });
  };

  const handleHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      restaurant_opening_hours: {
        ...prev.restaurant_opening_hours,
        [day]: { ...prev.restaurant_opening_hours[day], [field]: value },
      },
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        showError(
          "Image file is too large. Please select an image smaller than 5MB.",
        );
        e.target.value = ""; // Clear the input
        return;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        showError(
          "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
        );
        e.target.value = "";
        return;
      }

      setImageFile(file); // Store the actual file
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, restaurant_image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(`Debug = ${ownerStatus}`);

    // Check approval status first (only for creating new restaurants)
    if (!isEditMode && ownerStatus !== "Approved") {
      showError("Your account must be approved before you can add restaurants");
      return;
    }

    // Validation
    if (
      !formData.restaurant_name ||
      !formData.restaurant_description ||
      !formData.restaurant_address ||
      !formData.restaurant_contact_info.phone
    ) {
      showError(
        "Please fill in all required fields (Name, Description, Address, Phone)",
      );
      return;
    }

    if (formData.restaurant_category.length === 0) {
      showError("Please select at least one category");
      return;
    }

    try {
      setLoading(true);

      // Get owner_id from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const owner_id = user._id || user.id;

      if (!owner_id) {
        showError("Owner ID not found. Please login again.");
        return;
      }

      // Prepare data for API matching backend schema
      const restaurantData = {
        restaurant_name: formData.restaurant_name.trim(),
        restaurant_address: formData.restaurant_address.trim(),
        restaurant_location: {
          type: "Point",
          coordinates: formData.coordinates,
        },
        restaurant_description: formData.restaurant_description.trim(),
        restaurant_contact_info: {
          phone: formData.restaurant_contact_info.phone.trim(),
          ...(formData.restaurant_contact_info.email && {
            email: formData.restaurant_contact_info.email.trim(),
          }),
        },
        restaurant_category: formData.restaurant_category,
        restaurant_opening_hours: formData.restaurant_opening_hours,
      };

      // Add owner_id only for creating new restaurants
      if (!isEditMode) {
        restaurantData.owner_id = owner_id;
      }

      console.log(
        isEditMode
          ? "Updating restaurant with data:"
          : "Creating restaurant with data:",
        restaurantData,
      );

      let response;
      if (isEditMode) {
        // Update existing restaurant
        response = await updateRestaurant(editingRestaurantId, restaurantData);

        // Upload/update image if one was selected
        if (imageFile && editingRestaurantId) {
          try {
            console.log("Updating image for restaurant:", editingRestaurantId);
            await updateRestaurantImage(editingRestaurantId, imageFile);
            console.log("Image updated successfully");
          } catch (imgError) {
            console.error("Image update failed:", imgError);
            showWarning(
              "Restaurant updated but image update failed. You can update the image later.",
            );
          }
        }

        showSuccess("Restaurant updated successfully!");
      } else {
        // Create new restaurant
        response = await createRestaurant(restaurantData);

        const newRestaurant = response.data?.restaurant || response.data;

        // Upload image if one was selected
        if (imageFile && newRestaurant._id) {
          try {
            console.log("Uploading image for restaurant:", newRestaurant._id);
            await uploadRestaurantImage(newRestaurant._id, imageFile);
            console.log("Image uploaded successfully");
          } catch (imgError) {
            console.error("Image upload failed:", imgError);
            showWarning(
              "Restaurant created but image upload failed. You can add an image later.",
            );
          }
        }

        showSuccess("Restaurant created successfully!");
      }

      setShowAddModal(false);
      resetForm();
      setImageFile(null);
      setIsEditMode(false);
      setEditingRestaurantId(null);

      // Refresh the list
      await fetchRestaurants();
    } catch (err) {
      console.error(
        isEditMode
          ? "Error updating restaurant:"
          : "Error creating restaurant:",
        err,
      );
      console.error("Full error object:", JSON.stringify(err, null, 2));

      // Extract error message from various possible formats
      let errorMsg = isEditMode
        ? "Failed to update restaurant"
        : "Failed to create restaurant";

      if (err.message) {
        errorMsg = err.message;
      } else if (err.error) {
        errorMsg = err.error;
      } else if (err.msg) {
        errorMsg = err.msg;
      }

      // Check for validation errors
      if (err.errors && typeof err.errors === "object") {
        const errorDetails = Object.entries(err.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join("\n");
        errorMsg += "\n\nValidation Errors:\n" + errorDetails;
      }

      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    const confirmed = await confirm({
      title: "Delete Restaurant",
      message:
        "Are you sure you want to delete this restaurant? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      await deleteRestaurant(restaurantId);

      // Refresh the restaurant list
      await fetchRestaurants();

      showSuccess("Restaurant deleted successfully!");
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      showError(err.message || "Failed to delete restaurant");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRestaurant = (restaurant) => {
    // Parse coordinates from restaurant data
    let coordinates = [90.4125, 23.8103]; // Default to Dhaka
    if (restaurant.restaurant_location?.coordinates) {
      coordinates = restaurant.restaurant_location.coordinates;
    }

    setFormData({
      restaurant_name: restaurant.restaurant_name || "",
      restaurant_description: restaurant.restaurant_description || "",
      restaurant_address: restaurant.restaurant_address || "",
      coordinates,
      restaurant_contact_info: {
        phone: restaurant.restaurant_contact_info?.phone || "",
        email: restaurant.restaurant_contact_info?.email || "",
      },
      restaurant_category: restaurant.restaurant_category || [],
      restaurant_opening_hours: restaurant.restaurant_opening_hours || {
        monday: { open: "09:00", close: "22:00" },
        tuesday: { open: "09:00", close: "22:00" },
        wednesday: { open: "09:00", close: "22:00" },
        thursday: { open: "09:00", close: "22:00" },
        friday: { open: "09:00", close: "22:00" },
        saturday: { open: "09:00", close: "22:00" },
        sunday: { open: "09:00", close: "22:00" },
      },
      restaurant_image:
        restaurant.restaurant_image?.url || restaurant.restaurant_image || "",
    });

    setIsEditMode(true);
    setEditingRestaurantId(restaurant._id);
    setShowAddModal(true);
  };

  const handleManageRestaurant = (restaurant) => {
    // Store restaurant ID in localStorage for the Manage Restaurant page to use
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.restaurant_id = restaurant._id;
    localStorage.setItem("user", JSON.stringify(user));

    // Navigate to the Manage Restaurant page
    navigate("/restaurant_owner/manage_restaurant");
  };

  const resetForm = () => {
    setFormData({
      restaurant_name: "",
      restaurant_description: "",
      restaurant_address: "",
      coordinates: [90.4125, 23.8103], // Dhaka, Bangladesh
      restaurant_contact_info: {
        phone: "",
        email: "",
      },
      restaurant_category: [],
      restaurant_opening_hours: {
        monday: { open: "09:00", close: "22:00" },
        tuesday: { open: "09:00", close: "22:00" },
        wednesday: { open: "09:00", close: "22:00" },
        thursday: { open: "09:00", close: "22:00" },
        friday: { open: "09:00", close: "22:00" },
        saturday: { open: "09:00", close: "22:00" },
        sunday: { open: "09:00", close: "22:00" },
      },
    });
    setImageFile(null);
    setIsEditMode(false);
    setEditingRestaurantId(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col">
      <OwnerNavbar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24 lg:pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
              My Restaurants
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage all your restaurant locations
            </p>
          </div>

          {/* Show approval notice if not approved */}
          {ownerStatus && ownerStatus !== "Approved" && (
            <div className="mb-6">
              <ApprovalMessage
                status={ownerStatus}
                entityType="restaurant owner account"
                message="Your account is pending approval. You can view your restaurants but cannot add new ones until approved."
              />
            </div>
          )}

          {/* Loading State */}
          {loading && restaurants.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600">
                Loading restaurants...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && restaurants.length === 0 && (
            <div className="text-center py-12 bg-tertiary rounded-xl sm:rounded-2xl px-4">
              <Store className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                No restaurants yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {ownerStatus !== "Approved"
                  ? "Your account needs to be approved before you can add restaurants"
                  : "Start by adding your first restaurant"}
              </p>
              {ownerStatus === "Approved" && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full hover:bg-accent-dark transition-all font-semibold inline-flex items-center space-x-2 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Add Restaurant</span>
                </button>
              )}
            </div>
          )}

          {/* Restaurant Cards */}
          {restaurants.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  className="bg-tertiary rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={
                        restaurant.restaurant_image?.url ||
                        restaurant.restaurant_image ||
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80"
                      }
                      alt={restaurant.restaurant_name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-primary text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                      {restaurant.restaurant_category?.[0] || "Restaurant"}
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                      {restaurant.restaurant_name}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
                      {restaurant.restaurant_description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-gray-700">
                          {restaurant.restaurant_address ||
                            "No address provided"}
                        </p>
                      </div>
                      {restaurant.restaurant_contact_info?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                          <p className="text-xs sm:text-sm text-gray-700">
                            {restaurant.restaurant_contact_info.phone}
                          </p>
                        </div>
                      )}
                      {restaurant.restaurant_contact_info?.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                          <p className="text-xs sm:text-sm text-gray-700 break-all">
                            {restaurant.restaurant_contact_info.email}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-surface p-2 rounded-lg text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <p className="text-xs text-gray-600">Rating</p>
                        <p className="text-sm sm:text-base font-bold text-gray-800">
                          {restaurant.restaurant_rating?.average || "N/A"}
                        </p>
                      </div>
                      <div className="bg-surface p-2 rounded-lg text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                        </div>
                        <p className="text-xs text-gray-600">Sales</p>
                        <p className="text-sm sm:text-base font-bold text-gray-800">
                          {restaurant.restaurant_total_sales || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleManageRestaurant(restaurant)}
                        className="flex-1 bg-primary text-white py-2.5 sm:py-3 rounded-full hover:bg-accent-dark transition-all font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRestaurant(restaurant)}
                          disabled={loading}
                          className="bg-blue-500 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-full hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit Restaurant"
                        >
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRestaurant(restaurant._id)}
                          disabled={loading}
                          className="bg-red-500 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-full hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Restaurant"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Restaurant Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => {
                console.log(`Debug = ${ownerStatus}`);

                if (ownerStatus !== "Approved") {
                  showError(
                    "Your account must be approved before you can add restaurants",
                  );
                  return;
                }
                setShowAddModal(true);
              }}
              disabled={loading}
              className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-accent-dark transition-all font-semibold flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Add Restaurant</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            // Close modal if clicking on the backdrop (not the modal content)
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
              resetForm();
            }
          }}
        >
          <div
            className="bg-surface rounded-xl sm:rounded-2xl max-w-4xl w-full my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-secondary p-4 sm:p-6 flex items-center justify-between rounded-t-xl sm:rounded-t-2xl z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {isEditMode ? "Edit Restaurant" : "Add New Restaurant"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="bg-tertiary p-4 sm:p-6 rounded-xl space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  Basic Information
                </h3>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="restaurant_name"
                    value={formData.restaurant_name}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white text-sm sm:text-base"
                    placeholder="Enter restaurant name"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Restaurant Categories *
                  </label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                    {restaurantTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleCategoryToggle(type)}
                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                          formData.restaurant_category.includes(type)
                            ? "bg-primary text-white"
                            : "bg-white text-gray-700 border border-secondary hover:border-primary"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Selected:{" "}
                    {formData.restaurant_category.join(", ") || "None"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="restaurant_description"
                    value={formData.restaurant_description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white resize-none text-sm sm:text-base"
                    placeholder="Describe your restaurant"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Restaurant Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    {formData.restaurant_image && (
                      <img
                        src={formData.restaurant_image}
                        alt="Preview"
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-secondary rounded-lg p-3 sm:p-4 hover:border-primary transition-colors bg-white">
                        <div className="flex flex-col items-center space-y-2">
                          <Image className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                          <span className="text-xs sm:text-sm text-gray-600">
                            Click to upload
                          </span>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-tertiary p-4 sm:p-6 rounded-xl space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  Location & Address
                </h3>

                {/* Location Selector */}
                <div className="bg-surface p-3 sm:p-4 rounded-lg space-y-3">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                    Quick Location Selection
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={loadingLocation}
                      className="flex-1 bg-primary text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-accent-dark transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>
                        {loadingLocation
                          ? "Getting Location..."
                          : "Use My Location"}
                      </span>
                    </button>
                  </div>

                  {/* Address Search */}
                  <div className="relative">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Search Address
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleAddressSearch(e.target.value);
                        }}
                        onFocus={() =>
                          searchResults.length > 0 && setShowSearchResults(true)
                        }
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white text-sm sm:text-base"
                        placeholder="Search for an address..."
                      />
                    </div>

                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border-2 border-secondary rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectLocation(result)}
                            className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-surface transition-colors border-b border-gray-200 last:border-b-0"
                          >
                            <div className="flex items-start space-x-2">
                              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-1 flex-shrink-0" />
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
                  {formData.coordinates && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">
                        Selected Coordinates:
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        Lat: {formData.coordinates[1]?.toFixed(6)}, Lng:{" "}
                        {formData.coordinates[0]?.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Full Address Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <textarea
                    name="restaurant_address"
                    value={formData.restaurant_address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white resize-none text-sm sm:text-base"
                    placeholder="Enter full address or use location tools above to auto-fill"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Use &quot;Use My Location&quot; or &quot;Search
                    Address&quot; to automatically fill this field
                  </p>
                </div>
              </div>

              <div className="bg-tertiary p-4 sm:p-6 rounded-xl space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  Contact Information
                </h3>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.restaurant_contact_info.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white text-sm sm:text-base"
                    placeholder="+8801712345678"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.restaurant_contact_info.email}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white text-sm sm:text-base"
                    placeholder="restaurant@example.com"
                  />
                </div>
              </div>

              <div className="bg-tertiary p-4 sm:p-6 rounded-xl">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
                  Operating Hours
                </h3>
                <div className="space-y-3">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="bg-surface p-3 sm:p-4 rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                        <div className="flex items-center space-x-3 mb-3 md:mb-0 md:w-40">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700 capitalize">
                            {day}
                          </label>
                        </div>
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="flex-1">
                            <label className="text-xs text-gray-600 mb-1 block">
                              Opening
                            </label>
                            <input
                              type="time"
                              value={
                                formData.restaurant_opening_hours[day].open
                              }
                              onChange={(e) =>
                                handleHoursChange(day, "open", e.target.value)
                              }
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white text-xs sm:text-sm"
                            />
                          </div>
                          <span className="text-gray-600 mt-5">to</span>
                          <div className="flex-1">
                            <label className="text-xs text-gray-600 mb-1 block">
                              Closing
                            </label>
                            <input
                              type="time"
                              value={
                                formData.restaurant_opening_hours[day].close
                              }
                              onChange={(e) =>
                                handleHoursChange(day, "close", e.target.value)
                              }
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white text-xs sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-400 text-white py-2.5 sm:py-3 rounded-full hover:bg-gray-500 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-2.5 sm:py-3 rounded-full hover:bg-accent-dark transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Restaurant"
                      : "Add Restaurant"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
