import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-primary p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-custom_black">
          LOGO
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
