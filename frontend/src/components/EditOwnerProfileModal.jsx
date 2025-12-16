import { useState } from "react";

function EditOwnerProfileModal({ isOpen, onClose, ownerData, onUpdate, onChangePassword, onDeleteAccount }) {
  const [formData, setFormData] = useState({
    restaurant_owner_name: ownerData?.name || "",
    restaurant_owner_phone: ownerData?.phone || "",
    restaurant_owner_gender: ownerData?.gender || "",
    restaurant_owner_dob: ownerData?.dob || "",
    restaurant_owner_address: ownerData?.address || "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.restaurant_owner_name.trim())
      newErrors.restaurant_owner_name = "Name is required";
    if (!formData.restaurant_owner_phone.trim())
      newErrors.restaurant_owner_phone = "Phone is required";
    if (!formData.restaurant_owner_gender)
      newErrors.restaurant_owner_gender = "Gender is required";
    if (!formData.restaurant_owner_dob)
      newErrors.restaurant_owner_dob = "Date of birth is required";
    if (!formData.restaurant_owner_address.trim())
      newErrors.restaurant_owner_address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/restaurant-owners/${ownerId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Mock success
      onUpdate(formData);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Edit Owner Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="restaurant_owner_name"
                value={formData.restaurant_owner_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.restaurant_owner_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your full name"
              />
              {errors.restaurant_owner_name && (
                <p className="text-red-500 text-sm mt-1">{errors.restaurant_owner_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="restaurant_owner_phone"
                value={formData.restaurant_owner_phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.restaurant_owner_phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="+8801XXXXXXXXX"
              />
              {errors.restaurant_owner_phone && (
                <p className="text-red-500 text-sm mt-1">{errors.restaurant_owner_phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="restaurant_owner_gender"
                value={formData.restaurant_owner_gender}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.restaurant_owner_gender ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.restaurant_owner_gender && (
                <p className="text-red-500 text-sm mt-1">{errors.restaurant_owner_gender}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="restaurant_owner_dob"
                value={formData.restaurant_owner_dob}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.restaurant_owner_dob ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.restaurant_owner_dob && (
                <p className="text-red-500 text-sm mt-1">{errors.restaurant_owner_dob}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                name="restaurant_owner_address"
                value={formData.restaurant_owner_address}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.restaurant_owner_address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your address"
              />
              {errors.restaurant_owner_address && (
                <p className="text-red-500 text-sm mt-1">{errors.restaurant_owner_address}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Email cannot be changed. Contact support if you need to update your email address.
              </p>
            </div>
          </div>

          {/* Account Actions */}
          <div className="mt-6 pt-6 border-t space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Actions</h3>
            
            {/* Change Password */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Change Password</h4>
                  <p className="text-sm text-gray-600 mt-1">Update your account password via OTP verification</p>
                </div>
                <button
                  type="button"
                  onClick={onChangePassword}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-600 mt-1">Permanently delete your account and all data</p>
                </div>
                <button
                  type="button"
                  onClick={onDeleteAccount}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
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
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditOwnerProfileModal;
