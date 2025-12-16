import { useState } from "react";

function AddRestaurantModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    restaurant_name: "",
    restaurant_location: "",
    restaurant_image_url: "",
    restaurant_address: {
      street: "",
      city: "",
      state: "",
      country: "Bangladesh",
      zipCode: "",
      coordinates: [90.4125, 23.8103], // Default Dhaka coordinates
    },
    restaurant_description: "",
    restaurant_contact_info: {
      phone: "",
    },
    restaurant_categories: [],
    restaurant_opening_hours: {
      monday: { open: "10:00", close: "22:00" },
      tuesday: { open: "10:00", close: "22:00" },
      wednesday: { open: "10:00", close: "22:00" },
      thursday: { open: "10:00", close: "22:00" },
      friday: { open: "10:00", close: "22:00" },
      saturday: { open: "10:00", close: "22:00" },
      sunday: { open: "10:00", close: "22:00" },
    },
  });

  const [categoryInput, setCategoryInput] = useState("");
  const [errors, setErrors] = useState({});

  const availableCategories = [
    "Fast Food", "BBQ", "Grill", "Indian", "Chinese", "Thai", 
    "Italian", "Bangladeshi", "Pizza", "Burger", "Sushi", 
    "Desserts", "Cafe", "Bakery", "Seafood", "Vegetarian"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        restaurant_address: {
          ...formData.restaurant_address,
          [field]: value,
        },
      });
    } else if (name === "phone") {
      setFormData({
        ...formData,
        restaurant_contact_info: { phone: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const handleHoursChange = (day, type, value) => {
    setFormData({
      ...formData,
      restaurant_opening_hours: {
        ...formData.restaurant_opening_hours,
        [day]: {
          ...formData.restaurant_opening_hours[day],
          [type]: value,
        },
      },
    });
  };

  const addCategory = (category) => {
    if (category && !formData.restaurant_categories.includes(category)) {
      setFormData({
        ...formData,
        restaurant_categories: [...formData.restaurant_categories, category],
      });
    }
    setCategoryInput("");
  };

  const removeCategory = (category) => {
    setFormData({
      ...formData,
      restaurant_categories: formData.restaurant_categories.filter(
        (c) => c !== category
      ),
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.restaurant_name.trim()) newErrors.restaurant_name = "Name is required";
    if (!formData.restaurant_location.trim()) newErrors.restaurant_location = "Location is required";
    if (!formData.restaurant_image_url.trim()) newErrors.restaurant_image_url = "Image URL is required";
    if (!formData.restaurant_address.street.trim()) newErrors.street = "Street is required";
    if (!formData.restaurant_address.city.trim()) newErrors.city = "City is required";
    if (!formData.restaurant_contact_info.phone.trim()) newErrors.phone = "Phone is required";
    if (formData.restaurant_categories.length === 0) newErrors.categories = "At least one category is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/restaurants', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formData, owner_id: user.id })
      // });
      
      // Mock success
      onAdd(formData);
      onClose();
      
      // Reset form
      setFormData({
        restaurant_name: "",
        restaurant_location: "",
        restaurant_image_url: "",
        restaurant_address: {
          street: "",
          city: "",
          state: "",
          country: "Bangladesh",
          zipCode: "",
          coordinates: [90.4125, 23.8103],
        },
        restaurant_description: "",
        restaurant_contact_info: { phone: "" },
        restaurant_categories: [],
        restaurant_opening_hours: {
          monday: { open: "10:00", close: "22:00" },
          tuesday: { open: "10:00", close: "22:00" },
          wednesday: { open: "10:00", close: "22:00" },
          thursday: { open: "10:00", close: "22:00" },
          friday: { open: "10:00", close: "22:00" },
          saturday: { open: "10:00", close: "22:00" },
          sunday: { open: "10:00", close: "22:00" },
        },
      });
    } catch (error) {
      console.error("Error adding restaurant:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
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
                    placeholder="e.g., Dhaka Grill House"
                  />
                  {errors.restaurant_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.restaurant_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location/Area *
                  </label>
                  <input
                    type="text"
                    name="restaurant_location"
                    value={formData.restaurant_location}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.restaurant_location ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., Gulshan, Banani"
                  />
                  {errors.restaurant_location && (
                    <p className="text-red-500 text-sm mt-1">{errors.restaurant_location}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Image URL *
                  </label>
                  <input
                    type="url"
                    name="restaurant_image_url"
                    value={formData.restaurant_image_url}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.restaurant_image_url ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.restaurant_image_url && (
                    <p className="text-red-500 text-sm mt-1">{errors.restaurant_image_url}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Enter a valid image URL for your restaurant</p>
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

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.restaurant_address.street}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.street ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="House/Plot number, Road"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.restaurant_address.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., Dhaka"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.restaurant_address.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Dhaka Division"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.restaurant_address.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 1212"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
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
                  placeholder="+8801XXXXXXXXX"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories *</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.restaurant_categories.map((category) => (
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
                  .filter((cat) => !formData.restaurant_categories.includes(cat))
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

            {/* Opening Hours */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Opening Hours</h3>
              <div className="space-y-3">
                {Object.keys(formData.restaurant_opening_hours).map((day) => (
                  <div key={day} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </span>
                    <input
                      type="time"
                      value={formData.restaurant_opening_hours[day].open}
                      onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={formData.restaurant_opening_hours[day].close}
                      onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Add Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRestaurantModal;
