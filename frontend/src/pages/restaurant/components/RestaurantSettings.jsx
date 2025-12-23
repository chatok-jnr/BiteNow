import { useState } from "react";
import LocationPickerModal from "../../../components/Map/LocationPickerModal";

function RestaurantSettings({ restaurant: initialRestaurant, onClose }) {
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: initialRestaurant.restaurant_name,
    description: initialRestaurant.restaurant_description || "",
    imageUrl: initialRestaurant.restaurant_image_url || "",
    street: initialRestaurant.restaurant_address?.street || "",
    city: initialRestaurant.restaurant_address?.city || "",
    zipCode: initialRestaurant.restaurant_address?.zipCode || "",
    phone: initialRestaurant.restaurant_contact_phone || "",
    email: initialRestaurant.restaurant_contact_email || "",
    categories: initialRestaurant.restaurant_categories || [],
    location: initialRestaurant.restaurant_location || null,
    openingHours: initialRestaurant.restaurant_opening_hours || {
      Monday: { open: "09:00", close: "22:00", closed: false },
      Tuesday: { open: "09:00", close: "22:00", closed: false },
      Wednesday: { open: "09:00", close: "22:00", closed: false },
      Thursday: { open: "09:00", close: "22:00", closed: false },
      Friday: { open: "09:00", close: "22:00", closed: false },
      Saturday: { open: "10:00", close: "23:00", closed: false },
      Sunday: { open: "10:00", close: "23:00", closed: false },
    },
  });

  const availableCategories = [
    "Fast Food",
    "Italian",
    "Chinese",
    "Indian",
    "Mexican",
    "Japanese",
    "Thai",
    "American",
    "Mediterranean",
    "Seafood",
    "Vegetarian",
    "Vegan",
    "Desserts",
    "Bakery",
    "Cafe",
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      }
    }));
    setShowLocationPicker(false);
  };

  const handleSaveChanges = async () => {
    // Validate image is provided
    if (!formData.imageUrl) {
      alert("Restaurant image is required");
      return;
    }

    // TODO: Call API to update restaurant details
    // const response = await fetch(`/api/restaurants/${restaurant.restaurant_id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     restaurant_name: formData.name,
    //     restaurant_description: formData.description,
    //     restaurant_image_url: formData.imageUrl,
    //     restaurant_address: {
    //       street: formData.street,
    //       city: formData.city,
    //       zipCode: formData.zipCode,
    //     },
    //     restaurant_contact_phone: formData.phone,
    //     restaurant_contact_email: formData.email,
    //     restaurant_categories: formData.categories,
    //     restaurant_opening_hours: formData.openingHours,
    //     restaurant_location: formData.location,
    //   }),
    // });

    // Update local state with mock data
    setRestaurant((prev) => ({
      ...prev,
      restaurant_name: formData.name,
      restaurant_description: formData.description,
      restaurant_image_url: formData.imageUrl,
      restaurant_address: {
        street: formData.street,
        city: formData.city,
        zipCode: formData.zipCode,
      },
      restaurant_contact_phone: formData.phone,
      restaurant_contact_email: formData.email,
      restaurant_categories: formData.categories,
      restaurant_opening_hours: formData.openingHours,
      restaurant_location: formData.location,
    }));

    setIsEditing(false);
    alert("Restaurant settings updated successfully!");
  };

  const handleDeleteRestaurant = async () => {
    // TODO: Call API to delete restaurant
    // await fetch(`/api/restaurants/${restaurant.restaurant_id}`, {
    //   method: 'DELETE',
    // });
    alert("Restaurant deleted successfully! (Mock - redirecting to owner dashboard)");
    window.location.href = "/owner-dashboard";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Restaurant Settings</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Details
          </button>
        )}
      </div>

      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              placeholder="Tell customers about your restaurant..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant Image {isEditing && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              name="imageUrl"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData((prev) => ({ ...prev, imageUrl: file }));
                }
              }}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            />
            {isEditing && (
              <p className="text-xs text-gray-500 mt-1">Upload an image file for your restaurant</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
        <div className="space-y-4">
          {/* Map Location Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Location</label>
            <button
              type="button"
              onClick={() => setShowLocationPicker(true)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left ${
                formData.location?.coordinates
                  ? 'bg-secondary/10 text-secondary border-2 border-secondary'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'hover:bg-secondary/20'}`}
            >
              {formData.location?.coordinates ? (
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    ✓ Location Set ({formData.location.coordinates[1].toFixed(4)}, {formData.location.coordinates[0].toFixed(4)})
                  </span>
                  {isEditing && <span className="text-sm">Click to update</span>}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  📍 {isEditing ? 'Select Restaurant Location on Map' : 'No location set'}
                </span>
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Categories</h3>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => isEditing && handleCategoryToggle(category)}
              disabled={!isEditing}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                formData.categories.includes(category)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:border-primary"
              } ${!isEditing ? "cursor-default opacity-75" : "cursor-pointer"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Opening Hours */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Opening Hours</h3>
        <div className="space-y-3">
          {days.map((day) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-28 font-medium text-gray-700">{day}</div>
              {formData.openingHours[day]?.closed ? (
                <div className="flex-1 text-gray-500">Closed</div>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="time"
                    value={formData.openingHours[day]?.open || "09:00"}
                    onChange={(e) => handleOpeningHoursChange(day, "open", e.target.value)}
                    disabled={!isEditing}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={formData.openingHours[day]?.close || "22:00"}
                    onChange={(e) => handleOpeningHoursChange(day, "close", e.target.value)}
                    disabled={!isEditing}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                  />
                </div>
              )}
              {isEditing && (
                <button
                  onClick={() => handleOpeningHoursChange(day, "closed", !formData.openingHours[day]?.closed)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                    formData.openingHours[day]?.closed
                      ? "bg-green-50 text-green-700 border-green-300"
                      : "bg-red-50 text-red-700 border-red-300"
                  }`}
                >
                  {formData.openingHours[day]?.closed ? "Open" : "Close"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-3">
          <button
            onClick={handleSaveChanges}
            className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Save Changes
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setFormData({
                name: restaurant.restaurant_name,
                description: restaurant.restaurant_description || "",
                imageUrl: restaurant.restaurant_image_url || "",
                street: restaurant.restaurant_address?.street || "",
                city: restaurant.restaurant_address?.city || "",
                zipCode: restaurant.restaurant_address?.zipCode || "",
                phone: restaurant.restaurant_contact_phone || "",
                email: restaurant.restaurant_contact_email || "",
                categories: restaurant.restaurant_categories || [],
                location: restaurant.restaurant_location || null,
                openingHours: restaurant.restaurant_opening_hours || {},
              });
            }}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-700 mb-4">
          Once you delete your restaurant, there is no going back. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Delete Restaurant
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Restaurant</h3>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{restaurant.restaurant_name}</span>? This
              action cannot be undone and all data associated with this restaurant will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteRestaurant}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Yes, Delete Restaurant
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={
          formData.location?.coordinates
            ? { lat: formData.location.coordinates[1], lng: formData.location.coordinates[0] }
            : null
        }
        title="Update Restaurant Location"
        markerColor="#8a122c"
      />
    </div>
  );
}

export default RestaurantSettings;
