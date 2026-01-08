import { useState, useEffect } from "react";
import {
  updateRestaurantOwner,
  uploadOwnerImage,
  updateOwnerImage,
  uploadOwnerDocuments,
  deleteOwnerDocument,
} from "../../../utils/restaurantOwnerService";

function EditOwnerProfileModal({
  isOpen,
  onClose,
  ownerData,
  onUpdate,
  onChangePassword,
  onDeleteAccount,
}) {
  const [formData, setFormData] = useState({
    restaurant_owner_name: "",
    restaurant_owner_phone: "",
    restaurant_owner_gender: "",
    restaurant_owner_dob: "",
    restaurant_owner_address: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [deletingDocId, setDeletingDocId] = useState(null);

  // Update form data when ownerData changes
  useEffect(() => {
    if (ownerData) {
      setFormData({
        restaurant_owner_name: ownerData.restaurant_owner_name || "",
        restaurant_owner_phone: ownerData.restaurant_owner_phone || "",
        restaurant_owner_gender: ownerData.restaurant_owner_gender || "",
        restaurant_owner_dob: ownerData.restaurant_owner_dob
          ? new Date(ownerData.restaurant_owner_dob).toISOString().split("T")[0]
          : "",
        restaurant_owner_address: ownerData.restaurant_owner_address || "",
      });

      // Set existing image preview
      if (ownerData.restaurant_owner_image?.url) {
        setImagePreview(ownerData.restaurant_owner_image.url);
      }

      // Set existing documents
      if (ownerData.restaurant_owner_documents) {
        setExistingDocuments(ownerData.restaurant_owner_documents);
      }
    }
  }, [ownerData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image file
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, image: "Please select a valid image file" });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image size must be less than 5MB" });
        return;
      }

      setImageFile(file);
      setErrors({ ...errors, image: "" });

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
    setImagePreview(ownerData?.restaurant_owner_image?.url || null);
  };

  const handlePdfChange = (e) => {
    const files = Array.from(e.target.files);

    // Check total count (existing + new)
    const totalCount = existingDocuments.length + files.length;
    if (totalCount > 5) {
      setErrors({
        ...errors,
        pdf: `Maximum 5 documents allowed. You have ${existingDocuments.length} existing documents.`,
      });
      return;
    }

    // Validate each file
    for (const file of files) {
      if (file.type !== "application/pdf") {
        setErrors({ ...errors, pdf: "Only PDF files are allowed" });
        return;
      }

      // Validate file size (max 10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, pdf: "Each PDF must be less than 10MB" });
        return;
      }
    }

    setPdfFiles(files);
    setErrors({ ...errors, pdf: "" });
  };

  const handleRemovePdf = (index) => {
    const newFiles = pdfFiles.filter((_, i) => i !== index);
    setPdfFiles(newFiles);
  };

  const handleDeleteExistingDoc = async (docId) => {
    // Get owner ID (handle both _id and id properties)
    const ownerId = ownerData?._id || ownerData?.id;

    if (!ownerId) return;

    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setDeletingDocId(docId);
    try {
      await deleteOwnerDocument(ownerId, docId);

      // Update local state
      setExistingDocuments(
        existingDocuments.filter((doc) => doc._id !== docId)
      );

      alert("Document deleted successfully!");
    } catch (error) {
      console.error("Error deleting document:", error);
      alert(error.message || "Failed to delete document");
    } finally {
      setDeletingDocId(null);
    }
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

    // Get owner ID (handle both _id and id properties)
    const ownerId = ownerData?._id || ownerData?.id;

    console.log("Owner Data:", ownerData);
    console.log("Owner ID:", ownerId);
    console.log("Form Data:", formData);

    if (!ownerId) {
      alert("Owner ID is missing");
      return;
    }

    setLoading(true);

    try {
      // 1. Update text fields
      console.log("Updating restaurant owner...");
      const updateResponse = await updateRestaurantOwner(ownerId, formData);
      console.log("Update response:", updateResponse);

      // 2. Handle image upload/update
      if (imageFile) {
        console.log("Processing image upload...");
        if (ownerData.restaurant_owner_image?.public_id) {
          // Update existing image
          const imageUpdateResponse = await updateOwnerImage(
            ownerId,
            imageFile
          );
          console.log("Image update response:", imageUpdateResponse);
        } else {
          // Upload new image
          const imageUploadResponse = await uploadOwnerImage(
            ownerId,
            imageFile
          );
          console.log("Image upload response:", imageUploadResponse);
        }
      }

      // 3. Upload new PDF documents if any
      if (pdfFiles.length > 0) {
        console.log("Uploading PDF documents...");
        const pdfUploadResponse = await uploadOwnerDocuments(ownerId, pdfFiles);
        console.log("PDF upload response:", pdfUploadResponse);
      }

      alert("Profile updated successfully!");

      // Call the parent update handler to refresh data
      if (onUpdate) {
        onUpdate();
      }

      onClose();
    } catch (error) {
      console.error("Error updating profile - Full error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      console.error("Error status:", error.response?.status);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-6 py-4 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            Edit Owner Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 overflow-y-auto flex-1">
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
                    errors.restaurant_owner_name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.restaurant_owner_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.restaurant_owner_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>

                {/* Current/Preview Image */}
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    {imageFile && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg
                          className="w-4 h-4"
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
                    )}
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {imageFile
                    ? `Selected: ${imageFile.name}`
                    : "Upload a new image (optional, max 5MB)"}
                </p>
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
                    errors.restaurant_owner_phone
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="+8801XXXXXXXXX"
                />
                {errors.restaurant_owner_phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.restaurant_owner_phone}
                  </p>
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
                    errors.restaurant_owner_gender
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.restaurant_owner_gender && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.restaurant_owner_gender}
                  </p>
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
                    errors.restaurant_owner_dob
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.restaurant_owner_dob && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.restaurant_owner_dob}
                  </p>
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
                    errors.restaurant_owner_address
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your address"
                />
                {errors.restaurant_owner_address && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.restaurant_owner_address}
                  </p>
                )}
              </div>

              {/* License Documents Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Documents (PDF files only, max 5 total)
                </label>

                {/* Existing Documents */}
                {existingDocuments.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-sm text-gray-600 font-medium">
                      Existing Documents:
                    </p>
                    {existingDocuments.map((doc, index) => (
                      <div
                        key={doc._id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-red-500"
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
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Document {index + 1}
                            </p>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              View PDF
                            </a>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingDoc(doc._id)}
                          disabled={deletingDocId === doc._id}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 disabled:opacity-50"
                        >
                          {deletingDocId === doc._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload New Documents */}
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handlePdfChange}
                  disabled={existingDocuments.length >= 5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {errors.pdf && (
                  <p className="text-red-500 text-sm mt-1">{errors.pdf}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {existingDocuments.length >= 5
                    ? "Maximum 5 documents reached. Delete existing documents to upload new ones."
                    : `You can upload ${
                        5 - existingDocuments.length
                      } more document(s). Each file max 10MB.`}
                </p>

                {/* Selected New Files Preview */}
                {pdfFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-600 font-medium">
                      New files to upload:
                    </p>
                    {pdfFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center gap-2">
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
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePdf(index)}
                          className="text-gray-500 hover:text-red-600"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Email cannot be changed. Contact
                  support if you need to update your email address.
                </p>
              </div>
            </div>

            {/* Account Actions */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Account Actions
              </h3>

              {/* Change Password */}
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Change Password
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Update your account password via OTP verification
                    </p>
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
                    <p className="text-sm text-red-600 mt-1">
                      Permanently delete your account and all data
                    </p>
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
          </div>

          <div className="border-t px-6 py-4 flex justify-end gap-3 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditOwnerProfileModal;
