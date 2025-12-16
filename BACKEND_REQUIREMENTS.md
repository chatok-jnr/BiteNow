# Backend Requirements for Restaurant Owner System

## 🎯 IMPLEMENTATION STATUS

**Frontend Status:** ✅ Fully implemented with mock data  
**Backend Status:** ⏳ Awaiting implementation

---

## 🔴 CRITICAL - Must Implement Immediately

### 1. Order Management System
**Status:** Not created yet (HIGHEST PRIORITY)

**Required Order Model/Schema:**
```javascript
{
  _id: String,
  restaurant_id: String,
  customer_id: String,
  customer_name: String,
  customer_phone: String,
  items: [{
    food_id: String,
    food_name: String,
    quantity: Number,
    price: Number,
    discount_percentage: Number
  }],
  order_status: String, // "new", "accepted", "preparing", "ready", "picked_up", "delivered", "cancelled"
  total_amount: Number,
  delivery_address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  special_instructions: String,
  pin1: String, // Rider pickup PIN (4 digits, restaurant verifies this)
  pin2: String, // Customer delivery PIN (4 digits, rider uses this)
  assigned_rider_id: String,
  assigned_rider_name: String,  // NEW: Add rider name for display
  assigned_rider_phone: String,  // NEW: Add rider phone
  rejection_reason: String, // Optional - filled when order is rejected
  created_at: Date,
  updated_at: Date
}
```

**Required API Endpoints:**
```
GET    /api/orders/restaurant/:restaurantId              - Get all orders for a restaurant
GET    /api/orders/restaurant/:restaurantId?status=new   - Filter by status
GET    /api/orders/restaurant/:restaurantId?date=2025-12-16  - Filter by date
GET    /api/orders/:orderId                              - Get single order details
POST   /api/orders/:orderId/accept                       - Accept order (status: new → accepted)
POST   /api/orders/:orderId/reject                       - Reject order (body: {rejection_reason})
PUT    /api/orders/:orderId/status                       - Update status (body: {status})
POST   /api/orders/:orderId/verify-pin1                  - Verify rider pickup PIN (body: {pin})
```

---

### 2. Food/Menu Management
**Status:** Partially implemented (needs additions)

**Add to Food Model:**
```javascript
{
  food_category: String,  // "Appetizers", "Main Course", "Desserts", "Drinks"
  food_images: [String],  // Array of image URLs (NEEDS TO BE ADDED)
}
```

**Required API Endpoints:**
```
GET    /api/foods/restaurant/:restaurantId?category=Desserts  - Filter by category
PUT    /api/foods/:foodId/availability                        - Toggle availability (body: {is_available})
POST   /api/foods/:foodId/restock                            - Add quantity (body: {quantity})
POST   /api/foods/:foodId/upload-image                       - Upload food image
DELETE /api/foods/:foodId/image/:imageIndex                  - Delete food image
```

---

### 3. Restaurant Operational Status
**Status:** Not implemented

**Add to Restaurant Model:**
```javascript
{
  is_currently_open: Boolean,  // Toggle open/closed instantly (default: false)
  scheduled_closures: [{
    _id: String,
    date: String,        // "2025-12-25"
    reason: String       // "Christmas Holiday"
  }]
}
```

**Required API Endpoints:**
```
PUT    /api/restaurants/:restaurantId/toggle-status           - Toggle open/closed
POST   /api/restaurants/:restaurantId/schedule-closure        - Add closure (body: {date, reason})
DELETE /api/restaurants/:restaurantId/schedule-closure/:id   - Remove closure
GET    /api/restaurants/:restaurantId/closures                - Get all scheduled closures
```

---

### 4. Restaurant Owner Management
**Status:** Endpoints exist, need confirmation

**Existing Endpoints (Confirm these work):**
```
GET    /api/restaurant-owners/:ownerId                  - Get owner profile
PUT    /api/restaurant-owners/:ownerId                  - Update profile (allowed fields)
DELETE /api/restaurant-owners/:ownerId                  - Delete account
```

**Password Change Flow (Confirm with existing OTP system):**
```
POST   /api/auth/request-password-reset                 - Send OTP to email
POST   /api/auth/verify-otp                             - Verify OTP
POST   /api/auth/reset-password                         - Change password after OTP verification
```

---

## 🟡 IMPORTANT - Should Implement Soon

### 5. Image Upload System
**Status:** Not implemented

**Required Fields:**
```javascript
// Restaurant Model
{
  restaurant_images: [String]  // Array of image URLs
}

// Food Model
{
  food_images: [String]  // Array of image URLs (ADD THIS)
}
```

**Required API Endpoints:**
```
POST   /api/restaurants/:restaurantId/upload-image      - Upload restaurant image
DELETE /api/restaurants/:restaurantId/image/:imageIndex  - Delete restaurant image
POST   /api/foods/:foodId/upload-image                  - Upload food image
DELETE /api/foods/:foodId/image/:imageIndex             - Delete food image
```

---

### 6. Reviews System
**Status:** Not implemented

**Required Review Model/Schema:**
```javascript
{
  review_id: String,
  restaurant_id: String,
  food_id: String,           // Optional - for food-specific reviews
  customer_id: String,
  customer_name: String,
  rating: Number,            // 1-5
  review_text: String,
  created_at: Date
}
```

**Required API Endpoints:**
```
GET    /api/reviews/restaurant/:restaurantId           - Get all reviews
GET    /api/reviews/restaurant/:restaurantId?rating=5  - Filter by rating
GET    /api/reviews/restaurant/:restaurantId?limit=10  - Limit results
```

---

### 7. Analytics & Statistics
**Status:** Basic data exists in restaurant model

**Ensure Restaurant Model has:**
```javascript
{
  restaurant_total_revenue: Number,    // ✅ Already exists
  restaurant_total_sales: Number,      // ✅ Already exists
  restaurant_rating: {                 // ✅ Already exists
    average: Number,
    count: Number
  }
}
```

**Additional Endpoints Needed:**
```
GET    /api/restaurants/:restaurantId/analytics/today       - Today's stats
GET    /api/restaurants/:restaurantId/analytics/week        - Weekly stats
GET    /api/restaurants/:restaurantId/analytics/best-items  - Best-selling items
GET    /api/restaurants/:restaurantId/analytics/worst-items - Worst-performing items
```

---

## 🟢 MINOR FIXES NEEDED

### 8. Restaurant Category Field Name
**Issue:** Inconsistency between create and update

**In Create Restaurant Body:**
```javascript
restaurant_categories: ["BBQ", "Grill"]  // Plural ✅
```

**In Update Allowed Fields:**
```javascript
restaurant_category  // Singular ❌
```

**Fix Required:** Change to `restaurant_categories` (plural) in allowed updates

---

### 9. Restaurant Listing by Owner
**Required Endpoint:**
```
GET    /api/restaurants/owner/:ownerId  - Get all restaurants owned by this owner
```

---

## 📋 COMPLETE API SUMMARY FOR BACKEND TEAM

### Restaurant Owner APIs
- `GET /api/restaurant-owners/:ownerId`
- `PUT /api/restaurant-owners/:ownerId`
- `DELETE /api/restaurant-owners/:ownerId`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/verify-otp`
- `POST /api/auth/reset-password`

### Restaurant APIs  
- `GET /api/restaurants/owner/:ownerId`
- `POST /api/restaurants`
- `GET /api/restaurants/:restaurantId`
- `PUT /api/restaurants/:restaurantId`
- `DELETE /api/restaurants/:restaurantId`
- `PUT /api/restaurants/:restaurantId/toggle-status`
- `POST /api/restaurants/:restaurantId/schedule-closure`
- `DELETE /api/restaurants/:restaurantId/schedule-closure/:id`
- `POST /api/restaurants/:restaurantId/upload-image`
- `DELETE /api/restaurants/:restaurantId/image/:imageIndex`
- `GET /api/restaurants/:restaurantId/analytics/today`
- `GET /api/restaurants/:restaurantId/analytics/week`
- `GET /api/restaurants/:restaurantId/analytics/best-items`

### Order APIs (NEW - PRIORITY)
- `GET /api/orders/restaurant/:restaurantId`
- `GET /api/orders/:orderId`
- `POST /api/orders/:orderId/accept`
- `POST /api/orders/:orderId/reject`
- `PUT /api/orders/:orderId/status`
- `POST /api/orders/:orderId/verify-pin1`

### Food/Menu APIs
- `GET /api/foods/restaurant/:restaurantId`
- `POST /api/foods`
- `GET /api/foods/:foodId`
- `PUT /api/foods/:foodId`
- `DELETE /api/foods/:foodId`
- `PUT /api/foods/:foodId/availability`
- `POST /api/foods/:foodId/restock`
- `POST /api/foods/:foodId/upload-image`
- `GET /api/foods/restaurant/:restaurantId/price-range` (existing)
- `GET /api/foods/restaurant/:restaurantId/discounted` (existing)

### Review APIs (NEW)
- `GET /api/reviews/restaurant/:restaurantId`

---

## 🎨 Frontend Implementation Status

### ✅ Completed with Mock Data:
1. **Owner Dashboard (Level 1)**
   - View all restaurants
   - Add new restaurant (full form)
   - Edit owner profile (full form)
   - Change password (OTP integration)
   - Delete account confirmation
   - Multi-restaurant overview stats

2. **Restaurant Manager (Level 2) - In Progress**
   - Order Management component (fully functional with mock data)
   - Menu Management (planned)
   - Analytics dashboard (planned)
   - Reviews section (planned)
   - Restaurant Settings (planned)

### 📦 Mock Data Available:
- `mockOrders` - Sample orders with all statuses
- `mockFoodItems` - Sample menu items with categories
- `mockReviews` - Sample customer reviews

All mock data is in `frontend/src/utils/mockData.js`

---

## 🚀 Next Steps for Backend Team

**Phase 1 (CRITICAL):**
1. Implement Order Management System
2. Fix restaurant_category → restaurant_categories
3. Add is_currently_open field to restaurant model
4. Add food_category field to food model

**Phase 2 (IMPORTANT):**
5. Implement restaurant toggle status APIs
6. Add food availability toggle
7. Add analytics endpoints

**Phase 3 (NICE TO HAVE):**
8. Image upload system
9. Reviews system
10. Scheduled closures

---

**Frontend is ready to integrate once backend APIs are available!**
All API calls are marked with `// TODO: Replace with actual API call` comments.
