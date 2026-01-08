import { useState, useEffect } from "react";
import { getRiderById } from "../../../utils/riderService";
import EditRiderModal from "./EditRiderModal";

function RiderProfile({ riderId }) {
  const [riderData, setRiderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    console.log("RiderProfile riderId:", riderId);
    if (riderId) {
      fetchRiderData();
    } else {
      setLoading(false);
      setError("No rider ID found. Please log out and log in again.");
    }
  }, [riderId]);

  const fetchRiderData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching rider data for ID:", riderId);

      // Fetch rider data using service
      const response = await getRiderById(riderId);

      if (response.status === "success") {
        setRiderData(response.data.rider);
      } else {
        throw new Error("Failed to fetch rider data");
      }
    } catch (err) {
      console.error("Error fetching rider data:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load profile data";
      setError(`${errorMessage} (ID: ${riderId})`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    // Refresh rider data after successful update
    fetchRiderData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl">
        <p className="text-red-600 mb-4">{error}</p>
        <div className="space-y-3">
          {riderId && (
            <button
              onClick={fetchRiderData}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
            >
              Retry
            </button>
          )}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="block mx-auto px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
          >
            Clear Storage & Re-login
          </button>
        </div>
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
    <>
      {/* Edit Modal */}
      <EditRiderModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        riderId={riderId}
        riderData={riderData}
        onSuccess={handleEditSuccess}
      />

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
              onClick={() => setShowEditModal(true)}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
            >
              Edit Profile
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
        </div>

        {/* Documents Section */}
        {riderData.rider_documents && riderData.rider_documents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riderData.rider_documents.map((doc, index) => (
                <a
                  key={doc._id || index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <svg
                    className="w-8 h-8 text-red-600 flex-shrink-0"
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
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {doc.altText || `Document ${index + 1}`}
                    </p>
                    <p className="text-xs text-gray-500">Click to view</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

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
    </>
  );
}

export default RiderProfile;
