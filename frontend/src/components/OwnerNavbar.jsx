import { useNavigate, useLocation } from "react-router-dom";
import { Store, BarChart3, LogOut, User } from "lucide-react";

const OwnerNavbar = () => {
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
      label: "Restaurants",
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("restaurantOwner");
    localStorage.clear();
    navigate("/restaurant-owner/login", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate("/restaurant_owner/dashboard")}
          >
            <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow-yellow transform group-hover:rotate-12 transition-all duration-300">
              <span className="text-2xl">🍔</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-display tracking-tight">BiteNow</p>
              <p className="text-xs text-white/80">Restaurant Owner</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-all ${
                    isActive
                      ? "bg-tertiary text-primary shadow-lg"
                      : "text-white hover:text-accent-light"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full font-semibold flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default OwnerNavbar;
