import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance, { API_BASE_URL } from "../../utils/axios";
import * as cartService from "../../utils/cartService";

function Otp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo"); // Get redirect parameter
  
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Get email and userType from sessionStorage
  const registrationEmail = sessionStorage.getItem('registrationEmail');
  const userType = sessionStorage.getItem('userType');

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
    // Only allow numbers and max 5 digits
    if (/^\d{0,5}$/.test(value)) {
      setOtp(value);
      setError("");
      setMessage("");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length < 4) {
      setError("Please enter at least a 4-digit OTP");
      return;
    }
    if (otp.length > 5) {
      setError("OTP cannot be more than 5 digits");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Determine the API endpoint and request body
      let apiEndpoint;
      let requestBody;

      if (redirectTo === "owner-change-password") {
        setMessage("OTP verified successfully! Redirecting to change password...");
        setTimeout(() => {
          navigate("/owner-change-password");
        }, 1500);
        return;
      } else {
        if (!registrationEmail || !userType) {
          setError("Session expired. Please sign up again.");
          setIsVerifying(false);
          setTimeout(() => {
            navigate("/signup");
          }, 2000);
          return;
        }

        // Special case for restaurant owner
        if (userType === "restaurant_owner") {
          apiEndpoint = `${API_BASE_URL}/api/v1/auth/verify-otp/restaurant-owner`;
          requestBody = {
            email: registrationEmail,
            user_type: "restaurant_owner",
            otp: otp
          };
        } else {
          apiEndpoint = `${API_BASE_URL}/api/v1/auth/verify-otp/${userType}`;
          requestBody = {
            email: registrationEmail,
            user_type: userType,
            otp: otp
          };
        }
      }

      // Make API call to verify OTP
      const response = await axiosInstance.post(apiEndpoint, requestBody);

      if (response.data) {
        setError("");
        
        // Store token if provided (for immediate login after verification)
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          
          // Store user data
          const userData = {
            email: registrationEmail,
            role: userType === "restaurant_owner" ? "restaurant" : userType,
            token: response.data.token,
          };
          
          if (response.data.data) {
            Object.assign(userData, response.data.data);
          }
          
          localStorage.setItem("user", JSON.stringify(userData));
          
          // Migrate guest cart if customer
          if (userType === "customer") {
            try {
              await cartService.migrateGuestCart();
            } catch (migrationError) {
              console.error("Cart migration failed:", migrationError);
              // Don't block login if cart migration fails
            }
          }
        }
        
        setMessage("OTP verified successfully! Redirecting to login...");
        
        // Clear sessionStorage
        sessionStorage.removeItem('registrationEmail');
        sessionStorage.removeItem('userType');
        
        setTimeout(() => {
          // If token was provided, redirect to dashboard instead of login
          if (response.data.token && userType === "customer") {
            const intendedDestination = localStorage.getItem("intendedDestination");
            if (intendedDestination) {
              localStorage.removeItem("intendedDestination");
              navigate(intendedDestination);
            } else {
              navigate("/customer-dashboard");
            }
          } else {
            navigate("/login");
          }
        }, 1500);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      const errorMsg = error.response?.data?.message || "Invalid OTP. Please try again.";
      setError(errorMsg);
      setOtp("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      if (!registrationEmail || !userType) {
        setError("Session expired. Please sign up again.");
        setTimeout(() => {
          navigate("/signup");
        }, 2000);
        return;
      }

      // Make API call to resend OTP (you may need to create this endpoint)
      // For now, just reset the timer and show success message
      setTimeLeft(300);
      setIsResendDisabled(true);
      setMessage("OTP has been resent successfully!");
      setError("");
      setOtp("");
      
      // You can add API call here if backend supports resend OTP
      // await axios.post(`${API_BASE_URL}/api/v1/auth/resend-otp/${userType}`, {
      //   email: registrationEmail
      // });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Failed to resend OTP. Please try again.");
    }
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
          <p className="text-xs text-green-600 mt-1">
            {redirectTo === "owner-change-password" 
              ? "Enter this code to proceed to change password" 
              : "Enter this code to proceed to login"}
          </p>
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
              pattern="\d{4,5}"
              maxLength="5"
              minLength="4"
              required
              value={otp}
              onChange={handleInputChange}
              className="w-full px-4 py-4 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="•••••"
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
            disabled={isVerifying}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
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
            {redirectTo === "owner-change-password" ? (
              <>
                Changed your mind?{" "}
                <button
                  onClick={() => navigate("/owner-dashboard")}
                  className="text-primary font-medium hover:underline"
                >
                  Back to Dashboard
                </button>
              </>
            ) : (
              <>
                Didn't receive the code?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-primary font-medium hover:underline"
                >
                  Go back to Signup
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Otp;
