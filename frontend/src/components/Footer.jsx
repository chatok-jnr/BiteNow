import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary py-8">
      <div className="container mx-auto grid grid-cols-2 gap-8 px-4">
        <div>
          <h3 className="text-xl font-bold mb-4">Main Pages</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-tertiary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-tertiary">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-tertiary">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Policies</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/privacy-policy" className="hover:text-tertiary">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-tertiary">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/cookies" className="hover:text-tertiary">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
