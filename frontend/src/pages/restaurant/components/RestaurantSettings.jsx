import { useState, useEffect } from "react";
import {
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  deleteRestaurantImage,
} from "../../../utils/restaurantService";

function RestaurantSettings({
  restaurant: initialRestaurant,
  onClose,
  onUpdate,
}) {
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    restaurant_name: initialRestaurant.restaurant_name || "",
    restaurant_description: initialRestaurant.restaurant_description || "",
    restaurant_address: initialRestaurant.restaurant_address || "",
    restaurant_contact_info: {
      phone: initialRestaurant.restaurant_contact_info?.phone || "",
      email: initialRestaurant.restaurant_contact_info?.email || "",
      website: initialRestaurant.restaurant_contact_info?.website || "",
    },
    restaurant_category: initialRestaurant.restaurant_category || [],
    restaurant_opening_hours: initialRestaurant.restaurant_opening_hours || {
      monday: { open: "09:00", close: "22:00" },
      tuesday: { open: "09:00", close: "22:00" },
      wednesday: { open: "09:00", close: "22:00" },
      thursday: { open: "09:00", close: "22:00" },
      friday: { open: "09:00", close: "22:00" },
      saturday: { open: "10:00", close: "23:00" },
      sunday: { open: "10:00", close: "23:00" },
    },
  });

  const availableCategories = [
    "Fast Food",
    "BBQ",
    "Grill",
    "Indian",
    "Chinese",
    "Thai",
    "Italian",
    "Bangladeshi",
    "Pizza",
    "Burger",
    "Sushi",
    "Desserts",
    "Cafe",
    "Bakery",
    "Seafood",
    "Vegetarian",
    "Asian",
    "Noodles",
  ];

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Fetch restaurant data on component mount
  useEffect(() => {
    if (initialRestaurant._id) {
      fetchRestaurantData();
    }
  }, [initialRestaurant._id]);

  const fetchRestaurantData = async () => {
    try {
      setIsLoading(true);
      const response = await getRestaurantById(initialRestaurant._id);
      if (response.status === "success") {
        const restaurantData = response.data.restaurant;
        setRestaurant(restaurantData);

        // Update form data
        setFormData({
          restaurant_name: restaurantData.restaurant_name || "",
          restaurant_description: restaurantData.restaurant_description || "",
          restaurant_address: restaurantData.restaurant_address || "",
          restaurant_contact_info: {
            phone: restaurantData.restaurant_contact_info?.phone || "",
            email: restaurantData.restaurant_contact_info?.email || "",
            website: restaurantData.restaurant_contact_info?.website || "",
          },
          restaurant_category: restaurantData.restaurant_category || [],
          restaurant_opening_hours: restaurantData.restaurant_opening_hours || {
            monday: { open: "09:00", close: "22:00" },
            tuesday: { open: "09:00", close: "22:00" },
            wednesday: { open: "09:00", close: "22:00" },
            thursday: { open: "09:00", close: "22:00" },
            friday: { open: "09:00", close: "22:00" },
            saturday: { open: "10:00", close: "23:00" },
            sunday: { open: "10:00", close: "23:00" },
          },
        });
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Failed to fetch restaurant data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone" || name === "email" || name === "website") {
      setFormData((prev) => ({
        ...prev,
        restaurant_contact_info: {
          ...prev.restaurant_contact_info,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      restaurant_category: prev.restaurant_category.includes(category)
        ? prev.restaurant_category.filter((c) => c !== category)
        : [...prev.restaurant_category, category],
    }));
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      restaurant_opening_hours: {
        ...prev.restaurant_opening_hours,
        [day]: {
          ...prev.restaurant_opening_hours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Please select a valid image file" });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size must be less than 5MB" });
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setMessage({ type: "", text: "" });

      // Validate required fields
      if (!formData.restaurant_name.trim()) {
        setMessage({ type: "error", text: "Restaurant name is required" });
        return;
      }

      if (!formData.restaurant_address.trim()) {
        setMessage({ type: "error", text: "Restaurant address is required" });
        return;
      }

      if (formData.restaurant_category.length === 0) {
        setMessage({
          type: "error",
          text: "Please select at least one category",
        });
        return;
      }

      // Prepare update data
      const updateData = {
        restaurant_name: formData.restaurant_name,
        restaurant_description: formData.restaurant_description,
        restaurant_address: formData.restaurant_address,
        restaurant_contact_info: formData.restaurant_contact_info,
        restaurant_category: formData.restaurant_category,
        restaurant_opening_hours: formData.restaurant_opening_hours,
      };

      // Call update API
      const response = await updateRestaurant(
        restaurant._id,
        updateData,
        imageFile
      );

      if (response.status === "success") {
        setMessage({
          type: "success",
          text: "Restaurant updated successfully!",
        });
        setRestaurant(response.data.restaurant);
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(null);

        // Notify parent component if callback provided
        if (onUpdate) {
          onUpdate(response.data.restaurant);
        }

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating restaurant:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update restaurant",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    try {
      setIsSaving(true);
      const response = await deleteRestaurant(restaurant._id);

      if (response.status === "success") {
        setMessage({
          type: "success",
          text: "Restaurant deleted successfully!",
        });
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
          // Redirect to restaurant list or dashboard
          window.location.href = "/restaurant/dashboard";
        }, 1500);
      }
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete restaurant",
      });
      setShowDeleteModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(null);
    setMessage({ type: "", text: "" });

    // Reset form data to original values
    setFormData({
      restaurant_name: restaurant.restaurant_name || "",
      restaurant_description: restaurant.restaurant_description || "",
      restaurant_address: restaurant.restaurant_address || "",
      restaurant_contact_info: {
        phone: restaurant.restaurant_contact_info?.phone || "",
        email: restaurant.restaurant_contact_info?.email || "",
        website: restaurant.restaurant_contact_info?.website || "",
      },
      restaurant_category: restaurant.restaurant_category || [],
      restaurant_opening_hours: restaurant.restaurant_opening_hours || {
        monday: { open: "09:00", close: "22:00" },
        tuesday: { open: "09:00", close: "22:00" },
        wednesday: { open: "09:00", close: "22:00" },
        thursday: { open: "09:00", close: "22:00" },
        friday: { open: "09:00", close: "22:00" },
        saturday: { open: "10:00", close: "23:00" },
        sunday: { open: "10:00", close: "23:00" },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurant data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Restaurant Settings
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Details
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Restaurant Image */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Restaurant Image
        </h3>
        <div className="space-y-4">
          {/* Current Image */}
          {restaurant.restaurant_image?.url && !imagePreview && (
            <div className="relative">
              <img
                src={restaurant.restaurant_image.url}
                alt={restaurant.restaurant_name}
                className="w-full h-64 object-cover rounded-lg"
              />
              {isEditing && (
                <div className="absolute top-2 right-2">
                  <span className="px-3 py-1 bg-gray-900 bg-opacity-75 text-white text-sm rounded-full">
                    Current Image
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <span className="px-3 py-1 bg-green-600 bg-opacity-90 text-white text-sm rounded-full">
                  New Image
                </span>
                {isEditing && (
                  <button
                    onClick={handleRemoveImage}
                    className="px-3 py-1 bg-red-600 bg-opacity-90 text-white text-sm rounded-full hover:bg-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {imagePreview || restaurant.restaurant_image?.url
                  ? "Replace Image (Optional)"
                  : "Upload Image *"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum file size: 5MB. Supported formats: JPG, PNG, WebP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant Name *
            </label>
            <input
              type="text"
              name="restaurant_name"
              value={formData.restaurant_name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              placeholder="e.g., Opu vai vat er hotel"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant Address *
            </label>
            <input
              type="text"
              name="restaurant_address"
              value={formData.restaurant_address}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              placeholder="e.g., Uttara, Dhaka"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="restaurant_description"
              value={formData.restaurant_description}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              placeholder="Tell customers about your restaurant..."
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.restaurant_contact_info.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              placeholder="e.g., +8801971311958"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.restaurant_contact_info.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              placeholder="e.g., contact@restaurant.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website (Optional)
            </label>
            <input
              type="url"
              name="website"
              value={formData.restaurant_contact_info.website}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              placeholder="e.g., https://restaurant.com"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Categories *
        </h3>
        <div className="space-y-3">
          {/* Selected Categories */}
          {formData.restaurant_category.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
              {formData.restaurant_category.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-red-100 text-primary rounded-full text-sm flex items-center gap-2"
                >
                  {category}
                  {isEditing && (
                    <button
                      onClick={() => handleCategoryToggle(category)}
                      className="hover:text-primary/90"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Available Categories */}
          {isEditing && (
            <div className="flex flex-wrap gap-2">
              {availableCategories
                .filter((cat) => !formData.restaurant_category.includes(cat))
                .map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-red-100 hover:text-primary transition-colors"
                  >
                    + {category}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Opening Hours */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Opening Hours
        </h3>
        <div className="space-y-3">
          {days.map((day) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-28">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {day}
                </span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="time"
                  value={
                    formData.restaurant_opening_hours[day]?.open || "09:00"
                  }
                  onChange={(e) =>
                    handleOpeningHoursChange(day, "open", e.target.value)
                  }
                  disabled={!isEditing}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={
                    formData.restaurant_opening_hours[day]?.close || "22:00"
                  }
                  onChange={(e) =>
                    handleOpeningHoursChange(day, "close", e.target.value)
                  }
                  disabled={!isEditing}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      {!isEditing && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4">
            Danger Zone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">
                Delete Restaurant
              </p>
              <p className="text-sm text-gray-500">
                Once you delete a restaurant, there is no going back. Please be
                certain.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Restaurant
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Delete Restaurant?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this restaurant? This action
              cannot be undone and all associated data will be permanently
              removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRestaurant}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSaving ? "Deleting..." : "Delete Restaurant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantSettings;
