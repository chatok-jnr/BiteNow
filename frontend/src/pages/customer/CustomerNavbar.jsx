import { Link, useNavigate, useLocation } from "react-router-dom";

function CustomerNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Clear non-customer users from localStorage
  const userData = localStorage.getItem("user");
  let user = {};
  if (userData) {
    const parsedUser = JSON.parse(userData);
    // Only keep customer users logged in, clear all other roles
    if (parsedUser.role === "customer") {
      user = parsedUser;
    } else if (parsedUser.role && parsedUser.role !== "customer") {
      localStorage.removeItem("user");
    }
  }
  
  const isAuthenticated = user && user.email;

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    console.log('Before logout - localStorage:', {
      hasUser: !!localStorage.getItem('user'),
      hasToken: !!localStorage.getItem('token'),
      hasGuestSession: !!localStorage.getItem('guest_session_id')
    });
    
    // Clear all authentication data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("intendedDestination");
    
    // Also clear guest session to force a fresh start
    localStorage.removeItem("guest_session_id");
    
    console.log('After logout - localStorage:', {
      hasUser: !!localStorage.getItem('user'),
      hasToken: !!localStorage.getItem('token'),
      hasGuestSession: !!localStorage.getItem('guest_session_id')
    });
    
    // Reload to clear any cached state and ensure guest session is used
    window.location.href = "/customer-dashboard";
  };

  const handleLoginClick = () => {
    localStorage.setItem("intendedDestination", location.pathname);
    navigate("/login");
  };

  const handleSignupClick = () => {
    localStorage.setItem("intendedDestination", location.pathname);
    navigate("/signup");
  };

  const guestNavLinks = [
    { path: "/customer-dashboard", label: "Restaurants", icon: "🏠" },
  ];

  const authNavLinks = [
    { path: "/customer-dashboard", label: "Restaurants", icon: "🏠" },
    { path: "/customer-dashboard/orders", label: "Orders", icon: "📦" },
    { path: "/customer-dashboard/profile", label: "Profile", icon: "👤" },
  ];

  const navLinks = isAuthenticated ? authNavLinks : guestNavLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/customer-dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🍴</span>
              <span className="text-xl font-bold text-primary">BiteNow</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm text-gray-600">
                  Hi, <span className="font-semibold text-gray-900">{user.name || "Customer"}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={handleSignupClick}
                  className="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
                >
                  Signup
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-around border-t border-gray-200 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center px-3 py-1 rounded-lg ${
                isActive(link.path) ? "text-primary" : "text-gray-600"
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-xs font-medium mt-1">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default CustomerNavbar;
