import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  MapPin,
  Save,
  X,
  ShoppingCart,
  User as UserIcon,
  LogOut,
  Home as HomeIcon,
  Package,
  ArrowLeft,
  Home,
  Briefcase,
  Navigation,
  Search,
  Loader,
} from "lucide-react";
import {
  addCustomerAddress,
  updateCustomerAddress,
} from "../../utils/customerService";
import { useNotification } from "../../contexts/NotificationContext";

// Set your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const AddEditAddress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useNotification();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  const isEditMode = location.pathname.includes("/edit");
  const editAddress = location.state?.address;

  const [formData, setFormData] = useState({
    label: editAddress?.label || "",
    address: editAddress?.address || "",
    lat: editAddress?.latitude || null,
    lng: editAddress?.longitude || null,
  });

  const [loading, setLoading] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapboxgl.accessToken) {
      console.error("Mapbox access token is not set");
      showError("Map configuration error. Please contact support.");
      return;
    }

    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [
        formData.lng || 80.2707, // Default to Sri Lanka
        formData.lat || 6.9271,
      ],
      zoom: formData.lat && formData.lng ? 15 : 10,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add click event to map
    map.current.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      updateLocation(lat, lng);
    });

    // If editing and has coordinates, add marker
    if (formData.lat && formData.lng) {
      addMarker(formData.lat, formData.lng);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add marker to map
  const addMarker = (lat, lng) => {
    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Create new marker
    marker.current = new mapboxgl.Marker({ color: "#67A177", draggable: true })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Update location when marker is dragged
    marker.current.on("dragend", async () => {
      const lngLat = marker.current.getLngLat();
      updateLocation(lngLat.lat, lngLat.lng);
    });

    // Center map on marker
    map.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      essential: true,
    });
  };

  // Update location and reverse geocode
  const updateLocation = async (lat, lng) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
    addMarker(lat, lng);

    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`,
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        setFormData((prev) => ({ ...prev, address }));
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  // Use current location
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser");
      return;
    }

    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude);
        setGeolocating(false);
        showSuccess("Location detected successfully");
      },
      (error) => {
        console.error("Geolocation error:", error);
        showError("Failed to get your location");
        setGeolocating(false);
      },
    );
  };

  // Search address using Mapbox Geocoding API
  const searchAddress = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=5`,
      );
      const data = await response.json();

      if (data.features) {
        setSearchResults(data.features);
      }
    } catch (err) {
      console.error("Search error:", err);
      showError("Failed to search address");
    } finally {
      setSearching(false);
    }
  };

  // Handle search input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchAddress(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Select search result
  const selectSearchResult = (result) => {
    const [lng, lat] = result.center;
    const address = result.place_name;

    setFormData((prev) => ({ ...prev, address, lat, lng }));
    addMarker(lat, lng);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save address
  const handleSave = async () => {
    if (!formData.label.trim()) {
      showError("Please enter an address label");
      return;
    }

    if (!formData.address.trim()) {
      showError("Please enter an address");
      return;
    }

    if (!formData.lat || !formData.lng) {
      showError("Please select a location on the map");
      return;
    }

    try {
      setLoading(true);

      const userString = localStorage.getItem("user");
      if (!userString) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(userString);
      const customerId = user.id || user.userId || user._id || user.customer_id;

      const addressData = {
        label: formData.label,
        address: formData.address,
        latitude: formData.lat,
        longitude: formData.lng,
      };

      if (isEditMode && editAddress?._id) {
        await updateCustomerAddress(customerId, editAddress._id, addressData);
        showSuccess("Address updated successfully");
      } else {
        await addCustomerAddress(customerId, addressData);
        showSuccess("Address added successfully");
      }

      setTimeout(() => {
        navigate("/addresses");
      }, 1000);
    } catch (err) {
      console.error("Error saving address:", err);
      showError(err.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-primary shadow-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">
                BiteNow
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              <button
                onClick={() => navigate("/")}
                className="text-white hover:text-tertiary transition-colors font-medium px-2 py-2 sm:px-4 flex items-center gap-1 sm:gap-2"
                title="Home"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="hidden md:inline">Home</span>
              </button>
              <button
                onClick={() => navigate("/orderStatus")}
                className="text-white hover:text-tertiary transition-colors font-medium px-2 py-2 sm:px-4 flex items-center gap-1 sm:gap-2"
                title="Orders"
              >
                <Package className="w-5 h-5" />
                <span className="hidden md:inline">Orders</span>
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="text-white hover:text-tertiary transition-colors font-medium px-2 py-2 sm:px-4 flex items-center gap-1 sm:gap-2"
                title="Profile"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden md:inline">Profile</span>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  localStorage.removeItem("guest_session_id");
                  navigate("/login");
                }}
                className="text-white hover:text-red-300 transition-colors font-medium px-2 py-2 sm:px-4 flex items-center gap-1 sm:gap-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => navigate("/addresses")}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                {isEditMode ? "Edit Address" : "Add New Address"}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">
                {isEditMode
                  ? "Update your delivery address"
                  : "Add a new delivery address"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-3 sm:p-4 bg-primary text-white flex items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Select Location</span>
                  <span className="xs:hidden">Location</span>
                </h2>
                <button
                  onClick={useMyLocation}
                  disabled={geolocating}
                  className="bg-white text-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-all flex items-center gap-1 sm:gap-2 disabled:opacity-50"
                >
                  {geolocating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Locating...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      <span className="hidden sm:inline">Use My Location</span>
                      <span className="sm:hidden">Use GPS</span>
                    </>
                  )}
                </button>
              </div>

              {/* Search Box */}
              <div className="p-4 border-b relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for an address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                  />
                  {searching && (
                    <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => selectSearchResult(result)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-start gap-3"
                      >
                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-800">
                            {result.text}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.place_name}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Map Container */}
              <div
                ref={mapContainer}
                className="w-full h-[400px] lg:h-[500px]"
              />

              <div className="p-4 bg-gray-50 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Click on the map, drag the marker, or search to select your
                  exact location
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Address Details
              </h2>

              {/* Label Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Address Label
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Home", "Office", "Other"].map((label) => (
                    <button
                      key={label}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, label }))
                      }
                      className={`p-3 border-2 rounded-lg font-semibold transition-all flex flex-col items-center gap-2 ${
                        formData.label === label
                          ? "border-primary bg-surface text-primary"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {label === "Home" && <Home className="w-6 h-6" />}
                      {label === "Office" && <Briefcase className="w-6 h-6" />}
                      {label === "Other" && <MapPin className="w-6 h-6" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Label Input (for Other) */}
              {formData.label === "Other" && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Custom Label
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={formData.label === "Other" ? "" : formData.label}
                    onChange={handleInputChange}
                    placeholder="e.g., Friend's House, Gym, etc."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              {/* Address Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Complete Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {/* Coordinates Display */}
              {formData.lat && formData.lng && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Selected Coordinates
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => navigate("/addresses")}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={
                    loading || !formData.label || !formData.lat || !formData.lng
                  }
                  className="flex-1 bg-primary text-white py-3 rounded-full font-semibold hover:bg-accent-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      {isEditMode ? "Update Address" : "Save Address"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditAddress;
