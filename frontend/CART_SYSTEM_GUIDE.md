# Cart System Implementation Guide

## Overview
The BiteNow application now has a fully integrated cart system that works with both **authenticated users** and **guest users**. The cart data is managed on the backend and synchronized across the frontend.

## Key Features

### 1. **Guest User Support**
- Guest users can browse restaurants and add items to cart without logging in
- Each guest gets a unique session ID stored in `localStorage`
- Guest session ID is automatically included in API requests via axios interceptor
- Guest carts are stored on the backend linked to the session ID

### 2. **User Authentication**
- Logged-in customers can add items to cart with full account benefits
- Cart is linked to their user account
- Cart persists across sessions and devices

### 3. **Cart Migration**
- When a guest user logs in or signs up, their cart automatically migrates to their user account
- Migration happens seamlessly during the authentication flow
- Guest session is cleared after successful migration

### 4. **Restaurant Constraint**
- Users can only have items from ONE restaurant in their cart at a time
- Adding items from a different restaurant prompts the user to clear existing cart
- This ensures proper order management and delivery logistics

## API Endpoints Used

### Cart Operations

1. **Create/Get Cart**
   - `POST /api/v1/cart/`
   - Body: `{ "restaurant_id": "..." }`
   - Creates or retrieves cart for a specific restaurant

2. **Add to Cart**
   - `POST /api/v1/cart/add`
   - Body: `{ "food_id": "...", "quantity": 3 }`
   - Adds food item to cart with specified quantity

3. **Remove from Cart**
   - `POST /api/v1/cart/remove`
   - Body: `{ "food_id": "...", "quantity": "1" }` or `{ "food_id": "...", "quantity": "all" }`
   - Removes specified quantity or all of an item

4. **Get Active Cart**
   - `GET /api/v1/cart/`
   - Retrieves the current active cart

5. **Clear Cart**
   - `DELETE /api/v1/cart/`
   - Clears all items from cart

6. **Migrate Guest Cart**
   - `POST /api/v1/cart/migrate`
   - Body: `{ "guest_session_id": "..." }`
   - Migrates guest cart to authenticated user account

## Frontend Implementation

### File Structure

```
frontend/src/
├── utils/
│   ├── axios.js              # Updated with guest session support
│   └── cartService.js        # New cart service utilities
├── pages/
│   ├── common/
│   │   ├── Login.jsx         # Updated with cart migration
│   │   ├── Signup.jsx        # Updated with cart service import
│   │   └── Otp.jsx           # Updated with cart migration
│   └── customer/
│       ├── RestaurantMenu.jsx # Updated with backend cart API
│       └── Checkout.jsx       # Updated with backend cart API
```

### Key Components

#### 1. **Cart Service (`utils/cartService.js`)**
Provides utility functions for cart operations:
- `getGuestSessionId()` - Get or create guest session
- `clearGuestSession()` - Clear guest session
- `getCart()` - Fetch active cart
- `addToCart(foodId, quantity)` - Add item to cart
- `removeFromCart(foodId, quantity)` - Remove item from cart
- `clearCart()` - Clear entire cart
- `migrateGuestCart()` - Migrate guest cart to user account

#### 2. **Axios Interceptor (`utils/axios.js`)**
- Automatically adds JWT token for authenticated users
- Automatically adds `x-guest-session-id` header for guest users
- Creates guest session ID if it doesn't exist

#### 3. **Restaurant Menu Component**
- Uses backend cart API instead of local state
- Real-time cart updates from backend
- Handles restaurant switching with cart clearing
- Loading states for cart operations
- Error handling for API failures

#### 4. **Checkout Component**
- Fetches cart data from backend
- Places order via backend API
- Clears cart after successful order
- Requires user authentication

## User Flow

### Guest User Flow

1. **Browse & Add to Cart**
   ```
   User visits restaurant → Adds items to cart
   → Backend creates cart with guest_session_id
   → Cart stored in backend
   ```

2. **Proceed to Checkout**
   ```
   User clicks checkout → Redirected to login/signup
   → After auth, cart is migrated to user account
   → User completes order
   ```

### Authenticated User Flow

1. **Browse & Add to Cart**
   ```
   User visits restaurant → Adds items to cart
   → Backend creates cart with user_id
   → Cart stored in backend
   ```

2. **Checkout**
   ```
   User clicks checkout → Goes to checkout page
   → Confirms order → Backend processes order
   → Cart is cleared
   ```

## Backend Authentication Middleware

The backend uses `optionalProtect` middleware for cart routes:
- Accepts both authenticated users (with JWT token)
- Accepts guest users (with guest session ID)
- Validates user identity or creates/finds guest session

## Guest Session Management

### Guest Session Structure
```javascript
{
  session_id: "guest_1234567890_abc123",
  expires_at: Date (7 days from creation),
  migrated_to_user: null | ObjectId,
  is_active: true
}
```

### Automatic Cleanup
- Guest sessions expire after 7 days
- MongoDB TTL index automatically removes expired sessions
- Inactive sessions are cleaned up periodically

## Cart Data Structure

```javascript
{
  user_id: ObjectId | null,           // For authenticated users
  guest_session_id: String | null,    // For guest users
  restaurant_id: ObjectId,             // Restaurant reference
  items: [
    {
      food_id: ObjectId,
      quantity: Number,
      price_at_time: Number,
      discount_at_time: Number,
      total_price: Number
    }
  ],
  subtotal: Number,
  delivery_charge: Number,
  total_amount: Number,
  expires_at: Date,
  is_active: Boolean
}
```

## Error Handling

### Common Errors
1. **Different Restaurant Error**
   - Message: "Cannot add items from different restaurants to the same cart"
   - Solution: Clear current cart before adding from new restaurant

2. **No Cart Found**
   - Message: "No active cart found"
   - Solution: Create new cart by adding items

3. **Migration Failure**
   - Logs error but doesn't block login
   - Guest session is cleared regardless

## Testing Checklist

- [ ] Guest user can add items to cart
- [ ] Guest user can update quantities
- [ ] Guest user can remove items
- [ ] Guest cart persists across page refreshes
- [ ] Guest redirected to login on checkout
- [ ] Cart migrates after login/signup
- [ ] Authenticated user can manage cart
- [ ] Cart clears after order placement
- [ ] Cannot add items from multiple restaurants
- [ ] Cart shows correct totals
- [ ] Loading states work correctly
- [ ] Error messages display properly

## Environment Variables

Ensure `.env` file has:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Important Notes

1. **Guest Session Storage**: Guest session ID is stored in `localStorage` with key `guest_session_id`

2. **Token Storage**: JWT tokens are stored separately in `localStorage` with key `token`

3. **Cart Migration**: Happens automatically during:
   - Login (after successful authentication)
   - OTP verification (if token is provided)

4. **Cart Clearing**: 
   - Automatically after order placement
   - Manually by user
   - When switching restaurants

5. **Minimum Order**: Set to ৳50 in the frontend

## Future Enhancements

1. Add cart item count badge in navbar
2. Show cart preview on hover/click
3. Add saved carts feature
4. Implement wishlist/favorites
5. Add promotional code support
6. Show estimated delivery time in cart
7. Add cart expiry notifications

## Troubleshooting

### Cart not persisting
- Check if guest_session_id exists in localStorage
- Verify axios interceptor is adding correct headers
- Check backend logs for session creation

### Migration not working
- Ensure migrateGuestCart is called after token storage
- Check backend migration endpoint logs
- Verify guest_session_id is available before migration

### Cart showing wrong items
- Clear browser localStorage and try again
- Check if multiple carts exist for user in database
- Verify is_active flag in cart document

## Contact & Support

For issues or questions about the cart implementation, check:
- Backend: `/backend/controllers/cartController.js`
- Cart Model: `/backend/models/cartModel.js`
- Frontend Service: `/frontend/src/utils/cartService.js`
