import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Target, Award, Heart } from "lucide-react";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-tertiary flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary text-white shadow-soft sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
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
              About BiteNow
            </h1>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Bringing delicious food from your favorite restaurants straight to
              your doorstep, one bite at a time.
            </p>
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft p-6 sm:p-8 md:p-12 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-4 sm:mb-6 font-display">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                BiteNow was born from a simple idea: everyone deserves access to
                great food, delivered quickly and conveniently. Founded in 2025,
                we set out to revolutionize the food delivery experience by
                connecting food lovers with the best local restaurants.
              </p>
              <p>
                What started as a small team with big dreams has grown into a
                thriving platform that serves thousands of customers daily.
                We're not just about delivering food – we're about delivering
                happiness, convenience, and unforgettable culinary experiences.
              </p>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-10 sm:mb-16">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft p-5 sm:p-8 text-center transform hover:scale-105 transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-accent rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-glow-yellow">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-xl font-bold text-textPrimary mb-1 sm:mb-2">
                Customer First
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Your satisfaction is our top priority, always.
              </p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft p-5 sm:p-8 text-center transform hover:scale-105 transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-glow">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-xl font-bold text-textPrimary mb-1 sm:mb-2">
                Speed &amp; Quality
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Fast delivery without compromising quality.
              </p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft p-5 sm:p-8 text-center transform hover:scale-105 transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-secondary rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-xl font-bold text-textPrimary mb-1 sm:mb-2">
                Excellence
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                We strive for excellence in every delivery.
              </p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft p-5 sm:p-8 text-center transform hover:scale-105 transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-xl font-bold text-textPrimary mb-1 sm:mb-2">
                Community
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Supporting local restaurants and communities.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
