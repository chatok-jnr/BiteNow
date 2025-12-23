# Map Integration Implementation

## Overview
Map functionality has been successfully integrated into the BiteNow frontend for Riders, Customers, and Restaurant Owners using Mapbox GL JS.

## Features Implemented

### 🏍️ Rider Side
1. **Forced Location Picker on Dashboard**
   - On first session load, riders MUST set their location
   - Session-based check ensures location is set once per session
   - "Refresh Location" button to update location anytime
   - Orders fetched from backend based on rider's location (15km radius)

2. **Active Delivery with Auto-Location Update**
   - When rider clicks "Picked Up Food", location automatically updates to restaurant location
   - Delivery route map shows path from restaurant to customer
   - Route fetched from backend `/api/location/delivery-route/:orderId`
   - Display shows distance and estimated time

3. **Components Created:**
   - `pages/rider/components/DeliveryMap.jsx` - Shows delivery route with markers

### 👤 Customer Side
1. **Location Header (Foodpanda-style)**
   - Displays current delivery location
   - Shows last updated time
   - Click to change location

2. **Auto-Load Nearby Restaurants**
   - Checks for saved location on dashboard load
   - If location exists, automatically fetches nearby restaurants
   - If no location, prompts user to set delivery location
   - Backend API call: `/api/location/nearby-restaurants?maxDistance=10`

3. **Components Created:**
   - `pages/customer/components/LocationHeader.jsx` - Location display header

### 🍽️ Restaurant Side
1. **Location Picker in Add Restaurant Modal**
   - Restaurant owners can pin exact location on map when adding restaurant
   - Visual confirmation of selected coordinates
   - Location stored in `restaurant_address.coordinates` array

2. **Updates Made:**
   - Modified `AddRestaurantModal.jsx` to include map picker button

### 🗺️ Shared Components
1. **LocationPickerModal** (`components/Map/LocationPickerModal.jsx`)
   - Reusable map-based location picker
   - Click or drag marker to select location
   - Geolocate control to use current GPS location
   - Used by all three user types

## Backend Integration

### APIs Used:
```javascript
// Rider APIs
POST   /api/location/update                    // Update rider location
GET    /api/location/nearby-orders?maxDistance=15  // Get orders near rider
GET    /api/location/delivery-route/:orderId   // Get restaurant→customer route

// Customer APIs  
POST   /api/location/update                    // Update customer location
GET    /api/location/nearby-restaurants?maxDistance=10  // Get nearby restaurants

// No backend changes made - using existing endpoints
```

## Configuration

### Environment Variables
Create `.env` file in `frontend/` folder:
```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
VITE_API_BASE_URL=http://localhost:5000/api
```

### Get Mapbox Token
1. Sign up at https://www.mapbox.com/
2. Go to https://account.mapbox.com/access-tokens/
3. Create a new token or use default public token
4. Copy token to `.env` file

## Dependencies Installed
```bash
npm install mapbox-gl
```

## Key Implementation Details

### Session-Based Location Requirement (Rider)
```javascript
// In Rider Dashboard
useEffect(() => {
  const locationSetThisSession = sessionStorage.getItem('rider_location_set');
  
  if (!locationSetThisSession) {
    setShowLocationPicker(true); // Force location picker
  } else {
    fetchPendingRequests(); // Use existing location
  }
}, []);
```

### Auto-Location Update (Rider - Picked Up Food)
```javascript
// In ActiveDelivery component
const handleFoodPickedUp = async () => {
  // Get restaurant coordinates
  const [lng, lat] = restaurantLocation.coordinates;
  
  // Auto-update rider location to restaurant
  await fetch('/api/location/update', {
    method: 'POST',
    body: JSON.stringify({ latitude: lat, longitude: lng })
  });
  
  // Fetch delivery route
  const route = await fetch(`/api/location/delivery-route/${orderId}`);
  setDeliveryRoute(route);
};
```

### Customer Auto-Load Restaurants
```javascript
// In Customer Dashboard
useEffect(() => {
  checkSavedLocation(); // Check if customer has saved location
}, []);

const checkSavedLocation = async () => {
  const response = await fetch('/api/customers/me');
  const { customer_location } = response.data;
  
  if (customer_location?.coordinates) {
    setCustomerLocation(customer_location);
    fetchNearbyRestaurants(); // Auto-fetch
  } else {
    setShowLocationPicker(true); // Prompt to set
  }
};
```

## Files Modified/Created

### Created:
- `frontend/src/components/Map/LocationPickerModal.jsx`
- `frontend/src/pages/rider/components/DeliveryMap.jsx`
- `frontend/src/pages/customer/components/LocationHeader.jsx`
- `frontend/.env.example`

### Modified:
- `frontend/src/pages/rider/Dashboard.jsx`
- `frontend/src/pages/rider/components/ActiveDelivery.jsx`
- `frontend/src/pages/customer/Dashboard.jsx`
- `frontend/src/pages/restaurant/components/AddRestaurantModal.jsx`
- `frontend/package.json` (mapbox-gl dependency)

## Testing Checklist

### Rider:
- [ ] Open rider dashboard → Location picker should appear (first session)
- [ ] Select location → Orders should load
- [ ] Click "Refresh Location" → Location picker reopens
- [ ] Accept order → Navigate to ActiveDelivery
- [ ] Click "Picked Up Food" → Map should appear with route
- [ ] Map shows restaurant (red marker) and customer (green marker)
- [ ] Route line displayed in blue

### Customer:
- [ ] Open customer dashboard
- [ ] If logged in with saved location → Restaurants load automatically
- [ ] If no location → Location picker appears
- [ ] Click location header → Can change delivery location
- [ ] After setting location → Nearby restaurants appear

### Restaurant:
- [ ] Click "Add Restaurant" button
- [ ] Fill form and click "Select Location on Map"
- [ ] Map opens, click to select location
- [ ] Coordinates update and show confirmation

## Notes

### Graceful Degradation:
- If Mapbox token is missing, uses public demo token (limited functionality)
- If backend APIs fail, falls back to mock data (customer dashboard)
- All existing features preserved - no breaking changes

### Location Persistence:
- **Rider:** Location stored in database, but session check forces refresh on new session
- **Customer:** Location stored and remembered between visits
- **Restaurant:** Location permanently saved during registration

### Backend Requirements:
- All backend endpoints must be running
- CORS must be configured to allow frontend requests
- Backend already has all necessary endpoints implemented

## Future Enhancements
1. Real-time GPS tracking for riders (requires WebSocket integration)
2. Geocoding to show address names instead of coordinates
3. Multiple delivery location saving for customers
4. Distance-based restaurant filtering in UI
5. Interactive route navigation with turn-by-turn directions

## Troubleshooting

### Map not loading:
- Check if Mapbox token is set in `.env`
- Ensure `mapbox-gl` is installed: `npm install mapbox-gl`
- Check browser console for errors

### Backend API errors:
- Ensure backend is running on `http://localhost:5000`
- Check if user is logged in and has valid token
- Verify CORS settings in backend

### Location picker not appearing:
- For riders: Clear sessionStorage and refresh
- For customers: Check if location already saved in profile
- Check browser console for JavaScript errors
