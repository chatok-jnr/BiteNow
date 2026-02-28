import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Home,
  Briefcase,
  MoreVertical,
  Plus,
  Edit2,
  Trash2,
  ShoppingCart,
  User as UserIcon,
  LogOut,
  Home as HomeIcon,
  Package,
  ArrowLeft,
  Star,
} from "lucide-react";
import {
  getCustomerAddresses,
  deleteCustomerAddress,
  setDefaultAddress,
} from "../../utils/customerService";
import { useNotification } from "../../contexts/NotificationContext";

const AddressList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, confirm } = useNotification();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const userString = localStorage.getItem("user");
      if (!userString) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(userString);
      const customerId = user.id || user.userId || user._id || user.customer_id;

      const response = await getCustomerAddresses(customerId);
      setAddresses(response.data?.addresses || []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError(err.message || "Failed to load addresses");
      showError("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const userString = localStorage.getItem("user");
      const user = JSON.parse(userString);
      const customerId = user.id || user.userId || user._id || user.customer_id;

      await setDefaultAddress(customerId, addressId);
      showSuccess("Default address updated successfully");
      fetchAddresses();
      setActiveDropdown(null);
    } catch (err) {
      console.error("Error setting default address:", err);
      showError(err.response?.data?.message || "Failed to set default address");
    }
  };

  const handleDelete = async (addressId) => {
    const confirmed = await confirm({
      title: "Delete Address",
      message:
        "Are you sure you want to delete this address? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      const userString = localStorage.getItem("user");
      const user = JSON.parse(userString);
      const customerId = user.id || user.userId || user._id || user.customer_id;

      await deleteCustomerAddress(customerId, addressId);
      showSuccess("Address deleted successfully");
      fetchAddresses();
      setActiveDropdown(null);
    } catch (err) {
      console.error("Error deleting address:", err);
      showError(err.response?.data?.message || "Failed to delete address");
    }
  };

  const handleEdit = (address) => {
    navigate("/address/edit", { state: { address } });
    setActiveDropdown(null);
  };

  const getLabelIcon = (label) => {
    switch (label?.toLowerCase()) {
      case "home":
        return <Home className="w-5 h-5" />;
      case "office":
      case "work":
        return <Briefcase className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getLabelColor = (label) => {
    switch (label?.toLowerCase()) {
      case "home":
        return "bg-blue-100 text-blue-600";
      case "office":
      case "work":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-green-100 text-green-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgPrimary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-primary shadow-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">
                BiteNow
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              <button
                onClick={() => navigate("/")}
                className="text-white hover:text-tertiary transition-colors font-medium px-2 py-2 sm:px-4 flex items-center gap-1 sm:gap-2"
                title="Home"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="hidden md:inline">Home</span>
              </button>
              <button
                onClick={() => navigate("/orderStatus")}
                className="text-white hover:text-tertiary transition-colors font-medium px-2 py-2 sm:px-4 flex items-center gap-1 sm:gap-2"
                title="Orders"
              >
                <Package className="w-5 h-5" />
                <span className="hidden md:inline">Orders</span>
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="text-white hover:text-tertiary transition-colors font-medium px-2 py-2 sm:px-4 flex items-center gap-1 sm:gap-2"
                title="Profile"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden md:inline">Profile</span>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  localStorage.removeItem("guest_session_id");
                  navigate("/login");
                }}
                className="text-white hover:text-red-300 transition-colors font-medium px-2 py-2 sm:px-4 flex items-center gap-1 sm:gap-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={() => navigate("/profile")}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                My Addresses
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">
                Manage your saved delivery addresses
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Address List */}
          {addresses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-lg">
              <MapPin className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                No addresses saved yet
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                Add your first delivery address to get started
              </p>
              <button
                onClick={() => navigate("/address/add")}
                className="bg-primary text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-semibold inline-flex items-center gap-2 hover:bg-accent-dark transition-all text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Address
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-4">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all relative"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3">
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getLabelColor(address.label)}`}
                          >
                            {getLabelIcon(address.label)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base sm:text-lg font-bold text-gray-800">
                                {address.label || "Other"}
                              </h3>
                              {address.isDefault && (
                                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-current" />
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm sm:text-base text-gray-600 mt-1 break-words">
                              {address.address}
                            </p>
                          </div>
                        </div>

                        {address.latitude && address.longitude && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 ml-10 sm:ml-13">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {address.latitude.toFixed(6)},{" "}
                              {address.longitude.toFixed(6)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dropdown Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === address._id
                                ? null
                                : address._id,
                            )
                          }
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {activeDropdown === address._id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveDropdown(null)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-20">
                              {!address.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(address._id)}
                                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Star className="w-4 h-4" />
                                  Set as Default
                                </button>
                              )}
                              <button
                                onClick={() => handleEdit(address)}
                                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(address._id)}
                                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/address/add")}
                className="w-full bg-primary text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-accent-dark transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Address
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressList;
