import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import * as cartService from '../../utils/cartService';
import axiosInstance from '../../utils/axios';

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleGoogleAuthSuccess = async () => {
      try {
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const role = searchParams.get('role');
        const error = searchParams.get('error');

        if (error) {
          console.error('Google auth error:', error);
          navigate('/login?error=google_auth_failed');
          return;
        }

        if (!token || !userId || !role) {
          console.error('Missing token, userId, or role');
          navigate('/login?error=missing_credentials');
          return;
        }

        console.log(`✅ Google OAuth successful for ${role}, storing credentials...`);

        // Store token FIRST before any API calls
        localStorage.setItem('token', token);

        // Fetch complete user profile based on role
        let userData = {
          id: userId,
          userId: userId,
          role: role,
          token: token
        };

        // For restaurant owners, fetch full profile to get restaurant_owner_status
        if (role === 'restaurant') {
          try {
            console.log('🔄 Fetching restaurant owner profile for ID:', userId);
            const profileResponse = await axiosInstance.get(`/api/v1/restaurant-owner/${userId}`);
            
            if (profileResponse.data?.status === 'success' && profileResponse.data?.data?.restaurantOwner) {
              const ownerData = profileResponse.data.data.restaurantOwner;
              userData = {
                ...ownerData,
                id: ownerData._id || ownerData.id,
                userId: ownerData._id || ownerData.id,
                role: role,
                token: token
              };
              console.log('✅ Restaurant owner profile fetched:', userData);
            }
          } catch (profileError) {
            console.error('❌ Failed to fetch owner profile:', profileError);
            // Continue with basic userData if profile fetch fails
          }
        }

        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ User data stored in localStorage');

        // Migrate guest cart ONLY for customers
        if (role === 'customer') {
          try {
            console.log('🔄 Starting cart migration...');
            const migratedCart = await cartService.migrateGuestCart();
            if (migratedCart) {
              console.log('✅ Guest cart migrated successfully:', {
                cartId: migratedCart._id,
                itemCount: migratedCart.items?.length || 0
              });
            } else {
              console.log('ℹ️ No guest cart to migrate');
            }
          } catch (migrationError) {
            console.error('❌ Cart migration failed:', migrationError);
            // Don't block login if cart migration fails
          }
        }

        // Check for intended destination
        const intendedDestination = localStorage.getItem('intendedDestination');
        
        if (intendedDestination) {
          localStorage.removeItem('intendedDestination');
          navigate(intendedDestination);
        } else {
          // Navigate based on role
          if (role === 'customer') {
            navigate('/');
          } else if (role === 'restaurant') {
            navigate('/restaurant_owner/dashboard');
          } else if (role === 'rider') {
            navigate('/rider/home');
          }
        }
      } catch (error) {
        console.error('Error handling Google auth success:', error);
        navigate('/login?error=authentication_failed');
      }
    };

    handleGoogleAuthSuccess();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <Loader className="w-16 h-16 text-primary animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we set up your account</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
