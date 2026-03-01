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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-large transition-all duration-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 py-2 sm:py-3">
          <div
            onClick={() => navigate("/restaurant_owner/dashboard")}
            className="group flex items-center space-x-2 sm:space-x-3 cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow-yellow transform group-hover:rotate-12 transition-all duration-300">
              <span className="text-xl sm:text-2xl">🍔</span>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white font-display tracking-tight">
                BiteNow
              </p>
              <p className="text-xs text-white/80">Restaurant Owner</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={
                    isActive
                      ? "glass-card text-textPrimary px-2.5 sm:px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 sm:gap-2 hover:shadow-soft transition-all text-sm"
                      : "text-white hover:text-accent-light transition-all font-medium px-2 sm:px-3 py-2 flex items-center gap-1.5 sm:gap-2 hover:scale-105 text-sm"
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="text-white hover:text-red-300 transition-all font-medium px-2 sm:px-3 py-2 flex items-center gap-1.5 sm:gap-2 hover:scale-105 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default OwnerNavbar;
