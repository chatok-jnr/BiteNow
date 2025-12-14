import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 py-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link to="/" className="text-2xl font-bold text-primary">
          BiteNow
        </Link>
        <div className="flex items-center space-x-8">
          <Link
            to="/about"
            className="text-gray-700 hover:text-primary font-medium transition-colors"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-primary font-medium transition-colors"
          >
            Contact Us
          </Link>
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-5 py-2 text-primary font-semibold hover:bg-gray-50 rounded-lg transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
