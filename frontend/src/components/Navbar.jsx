import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-primary p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-custom_black">
          LOGO
        </Link>
        <div className="space-x-6">
          <Link to="/about" className="text-custom_black hover:text-tertiary">
            About Us
          </Link>
          <Link to="/contact" className="text-custom_black hover:text-tertiary">
            Contact Us
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
