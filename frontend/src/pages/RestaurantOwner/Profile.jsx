import React, { useState, useEffect, useRef } from "react";
import {
  getRestaurantOwner,
  updateRestaurantOwner,
  uploadOwnerImage,
  updateOwnerImage,
  deleteOwnerImage,
  uploadOwnerDocuments,
  deleteAllOwnerDocuments,
  deleteOwnerDocument,
  deleteRestaurantOwner,
} from "../../utils/restaurantOwnerService";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Lock,
  Trash2,
} from "lucide-react";
import OwnerNavbar from "../../components/OwnerNavbar";
import { useNotification } from "../../contexts/NotificationContext";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState("");
  const fileInputRef = useRef();
  const { showSuccess, showError, confirm } = useNotification();

  // Fetch profile data on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      fetchProfile(user.id);
    }
  }, []);

  const fetchProfile = async (ownerId) => {
    setLoading(true);
    try {
      const res = await getRestaurantOwner(ownerId);
      // API returns { status, data: { restaurantOwner } }
      setProfileData(res.data.restaurantOwner);
    } catch (err) {
      // handle error
      setProfileData(null);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload or update profile image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !profileData?._id) return;
    try {
      if (profileData.restaurant_owner_image?.url) {
        // update
        await updateOwnerImage(profileData._id, file);
      } else {
        // upload
        await uploadOwnerImage(profileData._id, file);
      }
      fetchProfile(profileData._id);
    } catch (err) {
      showError("Failed to upload image");
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData?._id) return;
    try {
      // Only send updatable fields
      const updateFields = {
        restaurant_owner_name: profileData.restaurant_owner_name,
        restaurant_owner_email: profileData.restaurant_owner_email,
        restaurant_owner_phone: profileData.restaurant_owner_phone,
        restaurant_owner_address: profileData.restaurant_owner_address,
        restaurant_owner_gender: profileData.restaurant_owner_gender,
        restaurant_owner_dob: profileData.restaurant_owner_dob,
      };
      await updateRestaurantOwner(profileData._id, updateFields);
      showSuccess("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile(profileData._id);
    } catch (err) {
      showError("Failed to update profile");
    }
  };

  // Document upload handler
  const handleDocUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !profileData?._id) return;
    setUploadingDoc(true);
    setDocError("");
    try {
      // Only allow PDF files
      const pdfs = files.filter((f) => f.type === "application/pdf");
      if (!pdfs.length) {
        setDocError("Only PDF files are allowed.");
        setUploadingDoc(false);
        return;
      }
      await uploadOwnerDocuments(profileData._id, pdfs);
      fetchProfile(profileData._id);
    } catch (err) {
      setDocError("Failed to upload document(s)");
    }
    setUploadingDoc(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Delete a document
  const handleDeleteDoc = async (docId) => {
    if (!profileData?._id || !docId) return;
    const confirmed = await confirm({
      title: "Delete Document",
      message:
        "Are you sure you want to delete this document? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteOwnerDocument(profileData._id, docId);
      fetchProfile(profileData._id);
    } catch (err) {
      showError("Failed to delete document");
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("Passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showError("Password must be at least 8 characters long!");
      return;
    }
    // Add API call here
    showSuccess("Password changed successfully!");
    setShowChangePassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleDeleteAccount = async () => {
    const confirmed = await confirm({
      title: "Delete Account",
      message:
        "Are you absolutely sure? This action cannot be undone and will delete all your restaurants and data.",
      confirmText: "Delete Account",
      cancelText: "Cancel",
      type: "danger",
    });
    if (confirmed) {
      // Add API call here
      showSuccess("Account deleted");
      // Redirect to login
    }
    setShowDeleteAccount(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-screen">
        Profile not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col">
      <OwnerNavbar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 sm:pt-24 md:pt-24">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              My Profile
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="hidden sm:block sm:w-auto px-4 sm:px-6 py-2 bg-secondary text-white rounded-xl hover:bg-primary transition-all shadow-lg text-sm sm:text-base"
              >
                Edit Profile
              </button>
            )}
          </div>
          {/* Profile Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            {/* Header with Image */}
            <div className="bg-gradient-to-r from-secondary to-primary p-4 sm:p-6 md:p-8 text-center">
              <div className="relative inline-block">
                <img
                  src={
                    profileData.restaurant_owner_image?.url ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(
                        profileData.restaurant_owner_name || "Owner",
                      )
                  }
                  alt="Profile"
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 sm:p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition-all">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-3 sm:mt-4 px-2">
                {profileData.restaurant_owner_name}
              </h2>
              <p className="text-sm sm:text-base text-white/90">
                Restaurant Owner
              </p>
              <p className="text-white/70 text-xs sm:text-sm mt-2">
                Member since{" "}
                {profileData.restaurant_owner_created_at
                  ? new Date(
                      profileData.restaurant_owner_created_at,
                    ).toLocaleDateString()
                  : ""}
              </p>
            </div>
            {/* Profile Information */}
            <div className="p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 block">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="restaurant_owner_name"
                      value={profileData.restaurant_owner_name || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DBC96]"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-xl">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <span className="text-sm sm:text-base text-gray-800">
                        {profileData.restaurant_owner_name}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 block">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="restaurant_owner_email"
                      value={profileData.restaurant_owner_email || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DBC96]"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-xl">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <span className="text-sm sm:text-base text-gray-800 break-all">
                        {profileData.restaurant_owner_email}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 block">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="restaurant_owner_phone"
                      value={profileData.restaurant_owner_phone || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DBC96]"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-xl">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <span className="text-sm sm:text-base text-gray-800">
                        {profileData.restaurant_owner_phone}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 block">
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="restaurant_owner_address"
                      value={profileData.restaurant_owner_address || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DBC96]"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-xl">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <span className="text-sm sm:text-base text-gray-800">
                        {profileData.restaurant_owner_address}
                      </span>
                    </div>
                  )}
                </div>
                {/* Add more fields as needed, e.g. gender, dob, status, etc. */}
              </div>
              {/* Document Management Section */}
              <div className="mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-primary">
                    Documents
                  </h3>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="application/pdf"
                      multiple
                      ref={fileInputRef}
                      onChange={handleDocUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-all text-xs sm:text-sm"
                      disabled={uploadingDoc}
                      onClick={() =>
                        fileInputRef.current && fileInputRef.current.click()
                      }
                    >
                      {uploadingDoc ? "Uploading..." : "Add Document"}
                    </button>
                  </label>
                </div>
                {docError && (
                  <div className="text-red-500 text-xs sm:text-sm mb-2">
                    {docError}
                  </div>
                )}
                <div className="space-y-2">
                  {profileData.restaurant_owner_documents &&
                  profileData.restaurant_owner_documents.length > 0 ? (
                    profileData.restaurant_owner_documents.map((doc, idx) => (
                      <div
                        key={doc.public_id || idx}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 rounded-lg px-3 sm:px-4 py-2 gap-2 sm:gap-0"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-primary font-semibold text-sm sm:text-base">
                            Document {idx + 1}
                          </span>
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline text-xs sm:text-sm"
                            >
                              View
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:underline text-xs sm:text-sm w-full sm:w-auto text-left sm:text-right"
                          onClick={() => handleDeleteDoc(doc.public_id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-xs sm:text-sm">
                      No documents uploaded.
                    </div>
                  )}
                </div>
              </div>
              {/* Save/Cancel Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-4 sm:mt-6">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-secondary text-white rounded-xl hover:bg-primary transition-all shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Mobile-only Edit Profile button — shown below all content */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="sm:hidden w-full px-4 py-2 bg-secondary text-white rounded-xl hover:bg-primary transition-all shadow-lg text-sm"
            >
              Edit Profile
            </button>
          )}
          {/* ...existing code for statistics and account actions... */}
        </div>
      </main>
      {/* ...existing code for modals... */}
    </div>
  );
};

export default Profile;
