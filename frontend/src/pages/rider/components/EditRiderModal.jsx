import { useState, useEffect } from "react";
import {
  updateRider,
  updateRiderImage,
  uploadRiderImage,
  uploadRiderDocuments,
  deleteRiderDocument,
} from "../../../utils/riderService";

function EditRiderModal({ isOpen, onClose, riderId, riderData, onSuccess }) {
  const [formData, setFormData] = useState({
    rider_name: "",
    rider_email: "",
    rider_date_of_birth: "",
    rider_gender: "Male",
    rider_address: "",
    emergency_contact: "",
    alternative_phone: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isDeletingDoc, setIsDeletingDoc] = useState(null);

  useEffect(() => {
    if (riderData && isOpen) {
      // Pre-fill form with existing data
      setFormData({
        rider_name: riderData.rider_name || "",
        rider_email: riderData.rider_email || "",
        rider_date_of_birth: riderData.rider_date_of_birth
          ? new Date(riderData.rider_date_of_birth).toISOString().split("T")[0]
          : "",
        rider_gender: riderData.rider_gender || "Male",
        rider_address: riderData.rider_address || "",
        emergency_contact:
          riderData.rider_contact_info?.emergency_contact || "",
        alternative_phone:
          riderData.rider_contact_info?.alternative_phone || "",
      });

      // Set existing profile image preview
      if (riderData.rider_image?.url) {
        setProfileImagePreview(riderData.rider_image.url);
      }

      // Set existing documents
      setExistingDocuments(riderData.rider_documents || []);
    }
  }, [riderData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files);

    // Check total document count (existing + new)
    const totalDocs = existingDocuments.length + files.length;
    if (totalDocs > 5) {
      setError(
        `Maximum 5 documents allowed. You currently have ${existingDocuments.length} documents.`
      );
      return;
    }

    // Validate each file
    for (let file of files) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed for documents");
        return;
      }

      // Validate file size (10MB max per PDF)
      if (file.size > 10 * 1024 * 1024) {
        setError("Each PDF must be less than 10MB");
        return;
      }
    }

    setDocuments(files);
    setError("");
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      setIsDeletingDoc(docId);
      await deleteRiderDocument(riderId, docId);

      // Remove from local state
      setExistingDocuments((prev) => prev.filter((doc) => doc._id !== docId));

      setError("");
    } catch (err) {
      console.error("Error deleting document:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete document. Please try again."
      );
    } finally {
      setIsDeletingDoc(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Step 1: Update basic rider information
      const updateData = {
        rider_name: formData.rider_name,
        rider_email: formData.rider_email,
        rider_date_of_birth: formData.rider_date_of_birth,
        rider_gender: formData.rider_gender,
        rider_address: formData.rider_address,
        "rider_contact_info.emergency_contact": formData.emergency_contact,
        "rider_contact_info.alternative_phone": formData.alternative_phone,
      };

      await updateRider(riderId, updateData);

      // Step 2: Upload/Update profile image if selected
      if (profileImage) {
        if (riderData.rider_image?.public_id) {
          // Update existing image
          await updateRiderImage(riderId, profileImage);
        } else {
          // Upload new image
          await uploadRiderImage(riderId, profileImage);
        }
      }

      // Step 3: Upload new documents if selected
      if (documents.length > 0) {
        await uploadRiderDocuments(riderId, documents);
      }

      // Success
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error("Error updating rider profile:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form
      setProfileImage(null);
      setProfileImagePreview(null);
      setDocuments([]);
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Edit Rider Profile
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Profile Image Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Profile Picture
            </label>
            <div className="flex items-center gap-6">
              {/* Image Preview */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>

              {/* Upload Button */}
              <div>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="profileImage"
                  className={`cursor-pointer px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all inline-block ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {profileImage ? "Change Image" : "Upload Image"}
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG or GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="rider_name"
                value={formData.rider_name}
                onChange={handleInputChange}
                required
                maxLength={100}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="rider_email"
                value={formData.rider_email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="rider_date_of_birth"
                value={formData.rider_date_of_birth}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="rider_gender"
                value={formData.rider_gender}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none disabled:bg-gray-100"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              name="rider_address"
              value={formData.rider_address}
              onChange={handleInputChange}
              required
              maxLength={50}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none disabled:bg-gray-100"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Emergency Contact *
              </label>
              <input
                type="tel"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alternative Phone
              </label>
              <input
                type="tel"
                name="alternative_phone"
                value={formData.alternative_phone}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Documents Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Documents (License, NID, Insurance, etc.)
            </label>

            {/* Existing Documents */}
            {existingDocuments.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-600 mb-2">Current Documents:</p>
                {existingDocuments.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {doc.altText || "Document"}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc._id)}
                      disabled={isDeletingDoc === doc._id || isSubmitting}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {isDeletingDoc === doc._id ? (
                        <span className="text-xs">Deleting...</span>
                      ) : (
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload New Documents */}
            {existingDocuments.length < 5 && (
              <div>
                <input
                  type="file"
                  id="documents"
                  accept="application/pdf"
                  multiple
                  onChange={handleDocumentsChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="documents"
                  className={`cursor-pointer px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all inline-block ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Upload New Documents
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PDF only (max {5 - existingDocuments.length} files, 10MB each)
                </p>
              </div>
            )}

            {/* Selected Documents Preview */}
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">Files to upload:</p>
                {Array.from(documents).map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-green-50 p-3 rounded-lg"
                  >
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRiderModal;
