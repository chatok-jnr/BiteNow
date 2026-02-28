import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? "glass-dark shadow-large py-2 sm:py-3"
          : "bg-primary shadow-md py-3 sm:py-4"
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="group flex items-center space-x-2 transition-transform duration-300 hover:scale-105"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-accent rounded-lg sm:rounded-xl flex items-center justify-center shadow-glow-yellow transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-xl sm:text-2xl">🍔</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white font-display tracking-tight">
              BiteNow
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
