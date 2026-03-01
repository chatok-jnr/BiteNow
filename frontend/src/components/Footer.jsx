import { Link } from "react-router-dom";
import { getCurrentUserRole, getHomeRouteByRole } from "../utils/roleRoutes";

const Footer = () => {
  const homeRoute = getHomeRouteByRole(getCurrentUserRole());

  return (
    <footer className="bg-gradient-secondary text-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-10" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col items-center">
            {/* Quick Links */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 font-display text-center">
                Quick Links
              </h3>
              <ul className="flex flex-wrap justify-center gap-4 sm:gap-6">
                <li>
                  <Link
                    to={homeRoute}
                    className="text-white/80 hover:text-accent-light transition-all flex items-center space-x-2 group text-sm sm:text-base"
                  >
                    <span className="w-1.5 h-1.5 bg-accent-light rounded-full group-hover:w-3 transition-all"></span>
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-white/80 hover:text-accent-light transition-all flex items-center space-x-2 group text-sm sm:text-base"
                  >
                    <span className="w-1.5 h-1.5 bg-accent-light rounded-full group-hover:w-3 transition-all"></span>
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-white/80 hover:text-accent-light transition-all flex items-center space-x-2 group text-sm sm:text-base"
                  >
                    <span className="w-1.5 h-1.5 bg-accent-light rounded-full group-hover:w-3 transition-all"></span>
                    <span>Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 pt-4 sm:pt-6 w-full">
              <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
                <p className="text-white/70 text-xs sm:text-sm text-center">
                  © {new Date().getFullYear()} BiteNow. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
