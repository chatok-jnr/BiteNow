import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Store, BarChart3, LogOut, X, User } from "lucide-react";

const OwnerSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      path: "/restaurant_owner/dashboard",
    },
    {
      id: "restaurants",
      label: "All Restaurants",
      icon: Store,
      path: "/restaurant_owner/restaurants",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/restaurant_owner/profile",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("restaurantOwner");
    localStorage.clear(); // Clear everything to be safe

    // Redirect to login page
    navigate("/restaurant-owner/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full bg-secondary w-64 sm:w-72 z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 sm:p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-white">
                  BiteNow
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <p className="text-white/80 text-xs sm:text-sm mt-2">
              Restaurant Owner
            </p>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-3 sm:p-4">
            <ul className="space-y-1.5 sm:space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-lg"
                          : "text-white hover:bg-primary/50"
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-semibold text-sm sm:text-base">
                        {item.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-3 sm:p-4 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-white hover:bg-red-500 transition-all"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-sm sm:text-base">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default OwnerSidebar;
