import React, { useState, useEffect, useRef } from 'react';
import {
  getRestaurantOwner,
  updateRestaurantOwner,
  uploadOwnerImage,
  updateOwnerImage,
  deleteOwnerImage,
  uploadOwnerDocuments,
  deleteAllOwnerDocuments,
  deleteOwnerDocument,
  deleteRestaurantOwner
} from '../../utils/restaurantOwnerService';
import { User, Mail, Phone, MapPin, Camera, Save, Menu, Lock, Trash2, Store, ChevronRight } from 'lucide-react';
import OwnerSidebar from '../../components/OwnerSidebar';

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState('');
  const fileInputRef = useRef();

  // Fetch profile data on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
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
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
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
      alert('Failed to upload image');
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
      alert('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile(profileData._id);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  // Document upload handler
  const handleDocUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !profileData?._id) return;
    setUploadingDoc(true);
    setDocError('');
    try {
      // Only allow PDF files
      const pdfs = files.filter(f => f.type === 'application/pdf');
      if (!pdfs.length) {
        setDocError('Only PDF files are allowed.');
        setUploadingDoc(false);
        return;
      }
      await uploadOwnerDocuments(profileData._id, pdfs);
      fetchProfile(profileData._id);
    } catch (err) {
      setDocError('Failed to upload document(s)');
    }
    setUploadingDoc(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Delete a document
  const handleDeleteDoc = async (docId) => {
    if (!profileData?._id || !docId) return;
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteOwnerDocument(profileData._id, docId);
      fetchProfile(profileData._id);
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    // Add API call here
    alert('Password changed successfully!');
    setShowChangePassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you absolutely sure? This action cannot be undone and will delete all your restaurants and data.')) {
      // Add API call here
      alert('Account deleted');
      // Redirect to login
    }
    setShowDeleteAccount(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (!profileData) {
    return <div className="flex items-center justify-center h-screen">Profile not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#C4E2C4] flex">
      <OwnerSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        {/* ...existing code... */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-[#67A177]">My Profile</h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-[#8DBC96] text-white rounded-xl hover:bg-[#67A177] transition-all shadow-lg"
                >
                  Edit Profile
                </button>
              )}
            </div>
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header with Image */}
              <div className="bg-gradient-to-r from-[#8DBC96] to-[#67A177] p-8 text-center">
                <div className="relative inline-block">
                  <img
                    src={profileData.restaurant_owner_image?.url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profileData.restaurant_owner_name || 'Owner')}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition-all">
                      <Camera className="w-5 h-5 text-[#67A177]" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">{profileData.restaurant_owner_name}</h2>
                <p className="text-white/90">Restaurant Owner</p>
                <p className="text-white/70 text-sm mt-2">Member since {profileData.restaurant_owner_created_at ? new Date(profileData.restaurant_owner_created_at).toLocaleDateString() : ''}</p>
              </div>
              {/* Profile Information */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="restaurant_owner_name"
                        value={profileData.restaurant_owner_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DBC96]"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <User className="w-5 h-5 text-[#67A177]" />
                        <span className="text-gray-800">{profileData.restaurant_owner_name}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="restaurant_owner_email"
                        value={profileData.restaurant_owner_email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DBC96]"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Mail className="w-5 h-5 text-[#67A177]" />
                        <span className="text-gray-800">{profileData.restaurant_owner_email}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="restaurant_owner_phone"
                        value={profileData.restaurant_owner_phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DBC96]"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Phone className="w-5 h-5 text-[#67A177]" />
                        <span className="text-gray-800">{profileData.restaurant_owner_phone}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="restaurant_owner_address"
                        value={profileData.restaurant_owner_address || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DBC96]"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <MapPin className="w-5 h-5 text-[#67A177]" />
                        <span className="text-gray-800">{profileData.restaurant_owner_address}</span>
                      </div>
                    )}
                  </div>
                  {/* Add more fields as needed, e.g. gender, dob, status, etc. */}
                </div>
                {/* Document Management Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-[#67A177]">Documents</h3>
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
                        className="px-4 py-2 bg-[#8DBC96] text-white rounded-lg hover:bg-[#67A177] transition-all text-sm"
                        disabled={uploadingDoc}
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      >
                        {uploadingDoc ? 'Uploading...' : 'Add Document'}
                      </button>
                    </label>
                  </div>
                  {docError && <div className="text-red-500 text-sm mb-2">{docError}</div>}
                  <div className="space-y-2">
                    {(profileData.restaurant_owner_documents && profileData.restaurant_owner_documents.length > 0) ? (
                      profileData.restaurant_owner_documents.map((doc, idx) => (
                        <div key={doc.public_id || idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[#67A177] font-semibold">Document {idx + 1}</span>
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline text-sm ml-2"
                              >
                                View
                              </a>
                            )}
                          </div>
                          <button
                            type="button"
                            className="text-red-500 hover:underline text-sm"
                            onClick={() => handleDeleteDoc(doc.public_id)}
                          >
                            Delete
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm">No documents uploaded.</div>
                    )}
                  </div>
                </div>
                {/* Save/Cancel Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-6 py-2 bg-[#8DBC96] text-white rounded-xl hover:bg-[#67A177] transition-all shadow-lg flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* ...existing code for statistics and account actions... */}
          </div>
        </main>
        {/* ...existing code for modals... */}
      </div>
    </div>
  );
};

export default Profile;
