import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as cartService from '../../utils/cartService';

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

        // Create basic user data object from token info
        const userData = {
          id: userId,
          userId: userId,
          role: role,
          token: token
        };

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
            navigate('/customer-dashboard');
          } else if (role === 'restaurant') {
            navigate('/owner-dashboard');
          } else if (role === 'rider') {
            navigate('/rider-dashboard');
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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-900">Completing sign in...</h2>
        <p className="text-gray-600 mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
