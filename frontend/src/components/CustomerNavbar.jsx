import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Home as HomeIcon,
  User,
  Package,
  LogOut,
} from "lucide-react";

const CustomerNavbar = ({ activeTab = "", showCart = false, onCartClick, cartCount = 0 }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("guest_session_id");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-large transition-all duration-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          <div
            onClick={() => navigate("/")}
            className="group flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow-yellow transform group-hover:rotate-12 transition-all duration-300">
              <span className="text-2xl">🍔</span>
            </div>
            <span className="text-2xl font-bold text-white font-display tracking-tight">
              BiteNow
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {showCart && (
              <button
                onClick={onCartClick}
                className="relative p-2.5 text-white hover:text-accent-light transition-all duration-300 hover:scale-110"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-glow-red animate-pulse-slow">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => navigate("/")}
              className={activeTab === "home"
                ? "glass-card text-textPrimary px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:shadow-soft transition-all text-sm"
                : "text-white hover:text-accent-light transition-all font-medium px-3 py-2 flex items-center gap-2 hover:scale-105 text-sm"
              }
            >
              <HomeIcon className="w-4 h-4" />
              <span className="hidden md:inline">Home</span>
            </button>
            <button
              onClick={() => navigate("/orderStatus")}
              className={activeTab === "orders"
                ? "glass-card text-textPrimary px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:shadow-soft transition-all text-sm"
                : "text-white hover:text-accent-light transition-all font-medium px-3 py-2 flex items-center gap-2 hover:scale-105 text-sm"
              }
            >
              <Package className="w-4 h-4" />
              <span className="hidden md:inline">Orders</span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className={activeTab === "profile"
                ? "glass-card text-textPrimary px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:shadow-soft transition-all text-sm"
                : "text-white hover:text-accent-light transition-all font-medium px-3 py-2 flex items-center gap-2 hover:scale-105 text-sm"
              }
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-white hover:text-red-300 transition-all font-medium px-3 py-2 flex items-center gap-2 hover:scale-105 text-sm"
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

export default CustomerNavbar;
