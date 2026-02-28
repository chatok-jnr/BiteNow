import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Linkedin, Code2, User } from "lucide-react";
import Footer from "../components/Footer";
import { getCurrentUserRole, getHomeRouteByRole } from "../utils/roleRoutes";

const Contact = () => {
  const homeRoute = getHomeRouteByRole(getCurrentUserRole());
  const developers = [
    {
      name: "Suraia Mim",
      role: "Frontend Developer",
      email: "msuraia55@gmail.com",
      linkedin: "https://www.linkedin.com/in/suraia-mim/",
    },
    {
      name: "A.O.M. Ramim Chowdhury",
      role: "Frontend Developer",
      email: "0432220005101146@uits.edu.bd",
      linkedin: "https://www.linkedin.com/in/a-o-m-ramim-chowdhury/",
    },
    {
      name: "Md. Sakib Hosen",
      role: "Backend Developer",
      email: "md.sakib.hos3n@gmail.com",
      linkedin: "https://www.linkedin.com/in/chatok-junior/",
    },
    {
      name: "Atik Shahriar Opu",
      role: "Backend Developer",
      email: "0432220005101079@uits.edu.bd",
      linkedin: "https://www.linkedin.com/in/atikshahriaopu/",
    },
  ];

  return (
    <div className="min-h-screen bg-tertiary flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary text-white shadow-soft sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={homeRoute}
              className="flex items-center space-x-2 text-white hover:text-accent-light transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow-yellow">
                <span className="text-2xl">🍔</span>
              </div>
              <span className="text-2xl font-bold font-display">BiteNow</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-5xl font-bold text-textPrimary mb-3 sm:mb-4 font-display">
              Meet the Developers
            </h1>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions or want to connect? Feel free to reach out to our
              development team.
            </p>
          </div>

          {/* Developer Cards */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-16">
            {developers.map((developer, index) => (
              <div
                key={index}
                className="bg-white shadow-soft p-5 sm:p-6 border border-gray-200 hover:border-black transition-colors"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-textPrimary mb-1 font-display">
                    {developer.name}
                  </h2>
                  <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
                    <Code2 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {developer.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Email */}
                  <div className="bg-tertiary rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Email</p>
                        <a
                          href={`mailto:${developer.email}`}
                          className="text-sm text-textPrimary hover:text-primary transition-colors font-medium break-all"
                        >
                          {developer.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div className="bg-tertiary rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Linkedin className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-0.5">LinkedIn</p>
                        <a
                          href={developer.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium inline-flex items-center space-x-1"
                        >
                          <span>View Profile</span>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Section */}
          <div className="bg-gradient-primary rounded-2xl sm:rounded-3xl shadow-soft p-6 sm:p-8 text-center text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 font-display">
              Want to Collaborate?
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto">
              We're always open to discussing new projects, creative ideas, or
              opportunities to be part of your vision. Don't hesitate to reach
              out!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;
