import { useState, useEffect } from "react";

function RiderProfile({ riderId }) {
  const [riderData, setRiderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchRiderData();
  }, [riderId]);

  const fetchRiderData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Check if using mock ID
      if (riderId === "mock_rider_id_12345") {
        // Use mock data for visualization
        const mockRiderData = {
          _id: "mock_rider_id_12345",
          rider_name: "Mohammad Rahman",
          rider_email: "rahman.rider@bitenow.com",
          rider_password: "hashed_password",
          rider_is_verified: true,
          rider_date_of_birth: "1995-05-15",
          rider_gender: "Male",
          rider_address: "House 42, Road 7, Dhanmondi, Dhaka-1205",
          rider_status: "Approved",
          role: "rider",
          rider_image: {
            url: null,
            altText: "Rider image",
            public_id: null,
            uploadedAt: null,
          },
          rider_documents: [],
          rider_contact_info: {
            emergency_contact: "+880 1712-345678",
            alternative_phone: "+880 1812-345678",
          },
          rider_stats: {
            total_deliveries: 127,
            cancelled_deliveries: 3,
            average_rating: 4.8,
          },
          rider_approved_at: "2024-12-01T10:30:00.000Z",
          rider_last_active_at: "2025-12-22T08:15:00.000Z",
          rider_created_at: "2024-11-15T12:00:00.000Z",
          rider_updated_at: "2025-12-22T08:15:00.000Z",
          Completion_rate: 97.69,
          earning_display: "6350.00",
          status_color: "green",
        };
        
        setRiderData(mockRiderData);
        setFormData({
          rider_name: mockRiderData.rider_name,
          rider_email: mockRiderData.rider_email,
          rider_address: mockRiderData.rider_address,
          emergency_contact: mockRiderData.rider_contact_info?.emergency_contact,
          alternative_phone: mockRiderData.rider_contact_info?.alternative_phone,
        });
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `http://localhost:5000/api/riders/${riderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRiderData(data.data.rider);
        setFormData({
          rider_name: data.data.rider.rider_name,
          rider_email: data.data.rider.rider_email,
          rider_address: data.data.rider.rider_address,
          emergency_contact:
            data.data.rider.rider_contact_info?.emergency_contact,
          alternative_phone:
            data.data.rider.rider_contact_info?.alternative_phone,
        });
      }
    } catch (error) {
      console.error("Error fetching rider data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/riders/${riderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rider_name: formData.rider_name,
            rider_email: formData.rider_email,
            rider_address: formData.rider_address,
            "rider_contact_info.emergency_contact": formData.emergency_contact,
            "rider_contact_info.alternative_phone": formData.alternative_phone,
          }),
        }
      );

      if (response.ok) {
        await fetchRiderData();
        setEditMode(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!riderData) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl">
        <p className="text-gray-600">Unable to load profile data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-4xl">
            {riderData.rider_image?.url ? (
              <img
                src={riderData.rider_image.url}
                alt={riderData.rider_image.altText}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              "👤"
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {riderData.rider_name}
            </h2>
            <p className="text-gray-600">{riderData.rider_email}</p>
            <div className="mt-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold`}
                style={{
                  backgroundColor:
                    riderData.status_color === "green"
                      ? "#dcfce7"
                      : riderData.status_color === "orange"
                      ? "#fed7aa"
                      : "#fecaca",
                  color:
                    riderData.status_color === "green"
                      ? "#166534"
                      : riderData.status_color === "orange"
                      ? "#9a3412"
                      : "#991b1b",
                }}
              >
                {riderData.rider_status}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-1">Total Deliveries</p>
            <p className="text-2xl font-bold text-gray-900">
              {riderData.rider_stats?.total_deliveries || 0}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-gray-900">
              {riderData.rider_stats?.cancelled_deliveries || 0}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-1">Rating</p>
            <p className="text-2xl font-bold text-gray-900">
              ⭐ {riderData.rider_stats?.average_rating?.toFixed(1) || "0.0"}
            </p>
          </div>
          <div className="bg-secondary/10 p-4 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-secondary">
              ৳{riderData.earning_display || "0.00"}
            </p>
          </div>
        </div>

        {riderData.Completion_rate !== undefined && (
          <div className="mt-4 bg-primary/10 p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">Completion Rate</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${riderData.Completion_rate}%` }}
                ></div>
              </div>
              <span className="text-lg font-bold text-primary">
                {riderData.Completion_rate.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Profile Information
        </h3>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.rider_name}
                onChange={(e) =>
                  setFormData({ ...formData, rider_name: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.rider_email}
                onChange={(e) =>
                  setFormData({ ...formData, rider_email: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.rider_address}
                onChange={(e) =>
                  setFormData({ ...formData, rider_address: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="tel"
                value={formData.emergency_contact}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergency_contact: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alternative Phone
              </label>
              <input
                type="tel"
                value={formData.alternative_phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alternative_phone: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
              />
            </div>
            <button
              onClick={handleUpdate}
              className="w-full px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Gender</span>
              <span className="font-semibold">{riderData.rider_gender}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Date of Birth</span>
              <span className="font-semibold">
                {new Date(riderData.rider_date_of_birth).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Address</span>
              <span className="font-semibold">{riderData.rider_address}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Emergency Contact</span>
              <span className="font-semibold">
                {riderData.rider_contact_info?.emergency_contact || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Alternative Phone</span>
              <span className="font-semibold">
                {riderData.rider_contact_info?.alternative_phone || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Member Since</span>
              <span className="font-semibold">
                {new Date(riderData.rider_created_at).toLocaleDateString()}
              </span>
            </div>
            {riderData.rider_approved_at && (
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Approved At</span>
                <span className="font-semibold">
                  {new Date(riderData.rider_approved_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default RiderProfile;
