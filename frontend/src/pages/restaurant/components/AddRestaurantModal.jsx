import { useState } from "react";
import LocationPickerModal from "../../../components/Map/LocationPickerModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function AddRestaurantModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    restaurant_name: "",
    restaurant_address: "",
    restaurant_location: {
      type: "Point",
      coordinates: [90.4125, 23.8103], // [longitude, latitude] - Default Dhaka coordinates
    },
    restaurant_category: [],
    restaurant_description: "",
    restaurant_contact_info: {
      phone: "",
      email: "",
    },
  });

  const [categoryInput, setCategoryInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCategories = [
    "Fast Food", "BBQ", "Grill", "Indian", "Chinese", "Thai", 
    "Italian", "Bangladeshi", "Pizza", "Burger", "Sushi", 
    "Desserts", "Cafe", "Bakery", "Seafood", "Vegetarian",
    "Asian", "Noodles"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" || name === "email") {
      setFormData({
        ...formData,
        restaurant_contact_info: {
          ...formData.restaurant_contact_info,
          [name]: value,
        },
      });
    } else if (name === "longitude" || name === "latitude") {
      const index = name === "longitude" ? 0 : 1;
      const newCoordinates = [...formData.restaurant_location.coordinates];
      newCoordinates[index] = parseFloat(value) || 0;
      setFormData({
        ...formData,
        restaurant_location: {
          ...formData.restaurant_location,
          coordinates: newCoordinates,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const addCategory = (category) => {
    if (category && !formData.restaurant_category.includes(category)) {
      setFormData({
        ...formData,
        restaurant_category: [...formData.restaurant_category, category],
      });
    }
    setCategoryInput("");
  };

  const removeCategory = (category) => {
    setFormData({
      ...formData,
      restaurant_category: formData.restaurant_category.filter(
        (c) => c !== category
      ),
    });
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      restaurant_address: {
        ...formData.restaurant_address,
        coordinates: [location.lng, location.lat],
      },
    });
    setShowLocationPicker(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.restaurant_name.trim()) newErrors.restaurant_name = "Name is required";
    if (!formData.restaurant_address.trim()) newErrors.restaurant_address = "Address is required";
    if (!formData.restaurant_contact_info.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.restaurant_contact_info.email.trim()) newErrors.email = "Email is required";
    if (formData.restaurant_category.length === 0) newErrors.categories = "At least one category is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      
      if (!user || !token) {
        alert("Please login again");
        return;
      }

      const requestBody = {
        owner_id: user.id,
        restaurant_name: formData.restaurant_name,
        restaurant_address: formData.restaurant_address,
        restaurant_location: formData.restaurant_location,
        restaurant_category: formData.restaurant_category,
        restaurant_description: formData.restaurant_description,
        restaurant_contact_info: formData.restaurant_contact_info,
      };

      console.log('=== SENDING REQUEST ===');
      console.log('URL:', `${API_BASE_URL}/api/v1/restaurants/register`);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('User ID:', user.id);
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('=======================');

      const response = await fetch(`${API_BASE_URL}/api/v1/restaurants/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create restaurant');
      }
      
      alert("Restaurant created successfully!");
      onAdd(data.data.restaurant);
      onClose();
      
      // Reset form
      setFormData({
        restaurant_name: "",
        restaurant_address: "",
        restaurant_location: {
          type: "Point",
          coordinates: [90.4125, 23.8103],
        },
        restaurant_category: [],
        restaurant_description: "",
        restaurant_contact_info: {
          phone: "",
          email: "",
        },
      });
    } catch (error) {
      console.error("Error adding restaurant:", error);
      alert(error.message || "Failed to create restaurant. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full my-8" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
          <h2 className="text-2xl font-bold text-gray-900">Add New Restaurant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="restaurant_name"
                    value={formData.restaurant_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.restaurant_name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., Opu vai vat er hotel"
                  />
                  {errors.restaurant_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.restaurant_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Address *
                  </label>
                  <input
                    type="text"
                    name="restaurant_address"
                    value={formData.restaurant_address}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.restaurant_address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., Uttara, Dhaka"
                  />
                  {errors.restaurant_address && (
                    <p className="text-red-500 text-sm mt-1">{errors.restaurant_address}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="restaurant_description"
                    value={formData.restaurant_description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Brief description of your restaurant"
                  />
                </div>
              </div>
            </div>

            {/* Location Coordinates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Coordinates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    step="0.0001"
                    value={formData.restaurant_location.coordinates[0]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 90.3915"
                  />
                  <p className="text-xs text-gray-500 mt-1">Decimal degrees (e.g., 90.3915)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    step="0.0001"
                    value={formData.restaurant_location.coordinates[1]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 23.8766"
                  />
                  <p className="text-xs text-gray-500 mt-1">Decimal degrees (e.g., 23.8766)</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.restaurant_contact_info.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., 01971311958"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.restaurant_contact_info.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., contact@restaurant.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Location on Map
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📍</span>
                    <span>
                      {formData.restaurant_address.coordinates[0] !== 90.4125 || 
                       formData.restaurant_address.coordinates[1] !== 23.8103
                        ? 'Update Location on Map'
                        : 'Select Location on Map'}
                    </span>
                  </button>
                  {formData.restaurant_address.coordinates[0] !== 90.4125 && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Location set: {formData.restaurant_address.coordinates[1].toFixed(6)}, {formData.restaurant_address.coordinates[0].toFixed(6)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Pin your restaurant's exact location on the map
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories *</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.restaurant_category.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-red-100 text-primary rounded-full text-sm flex items-center gap-2"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      className="hover:text-primary/90"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableCategories
                  .filter((cat) => !formData.restaurant_category.includes(cat))
                  .map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => addCategory(category)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-red-100 hover:text-primary"
                    >
                      + {category}
                    </button>
                  ))}
              </div>
              {errors.categories && (
                <p className="text-red-500 text-sm mt-2">{errors.categories}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Add Restaurant"}
            </button>
          </div>
        </form>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPickerModal
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={handleLocationSelect}
          initialLocation={
            formData.restaurant_address.coordinates[0] !== 90.4125
              ? { lng: formData.restaurant_address.coordinates[0], lat: formData.restaurant_address.coordinates[1] }
              : null
          }
          title="Select Restaurant Location"
        />
      )}
    </div>
  );
}

export default AddRestaurantModal;
