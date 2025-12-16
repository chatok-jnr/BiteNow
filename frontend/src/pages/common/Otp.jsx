import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Otp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // Mock OTP for testing
  const MOCK_OTP = "1234";

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsResendDisabled(false);
      setMessage("Time expired! Please resend OTP.");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and max 4 digits
    if (/^\d{0,4}$/.test(value)) {
      setOtp(value);
      setError("");
      setMessage("");
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    if (otp.length !== 4) {
      setError("Please enter a 4-digit OTP");
      return;
    }

    if (otp === MOCK_OTP) {
      setError("");
      setMessage("OTP verified successfully! Redirecting to login...");
      
      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setError("Invalid OTP. Please try again.");
      setOtp("");
    }
  };

  const handleResendOtp = () => {
    // Reset timer and disable resend button
    setTimeLeft(300);
    setIsResendDisabled(true);
    setMessage("OTP has been resent successfully!");
    setError("");
    setOtp("");
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">Verify OTP</h2>
          <p className="mt-2 text-gray-600">
            Enter the 4-digit code sent to your email
          </p>
        </div>

        {/* Demo OTP Info */}
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
          <p className="text-sm font-semibold text-green-900 mb-1">🔑 Demo OTP Code:</p>
          <p className="text-3xl font-bold text-green-700 tracking-wider">1234</p>
          <p className="text-xs text-green-600 mt-1">Enter this code to proceed to login</p>
        </div>

        {/* Timer Display */}
        <div className="text-center">
          <div className={`inline-block px-6 py-3 rounded-lg ${
            timeLeft <= 60 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
          }`}>
            <p className="text-sm font-medium">Time Remaining</p>
            <p className="text-3xl font-bold">{formatTime(timeLeft)}</p>
          </div>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2 text-center"
            >
              Enter OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength="4"
              required
              value={otp}
              onChange={handleInputChange}
              className="w-full px-4 py-4 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••"
              autoComplete="off"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className={`border px-4 py-3 rounded-lg text-sm text-center ${
              message.includes("expired") 
                ? "bg-yellow-50 border-yellow-200 text-yellow-700" 
                : "bg-green-50 border-green-200 text-green-600"
            }`}>
              {message}
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Verify OTP
          </button>

          {/* Resend OTP Button */}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResendDisabled}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isResendDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500"
            }`}
          >
            {isResendDisabled
              ? `Resend OTP (${formatTime(timeLeft)})`
              : "Resend OTP"}
          </button>
        </form>

        {/* Back to Signup Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-primary font-medium hover:underline"
            >
              Go back to Signup
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Otp;
