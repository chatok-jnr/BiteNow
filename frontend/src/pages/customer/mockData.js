// Mock Restaurants Data
export const mockRestaurants = [
  {
    id: 1,
    name: "Dhaka Biryani House",
    cuisine: "Bangladeshi",
    rating: 4.8,
    deliveryTime: "25-35",
    deliveryFee: 40,
    minOrder: 150,
    image: "🍛",
    popular: true,
    priceRange: "$$",
    discount: 20,
    fastDelivery: false,
    topDeal: true,
  },
  {
    id: 2,
    name: "Pizza Paradise",
    cuisine: "Italian",
    rating: 4.6,
    deliveryTime: "30-40",
    deliveryFee: 50,
    minOrder: 200,
    image: "🍕",
    popular: true,
    priceRange: "$$$",
    discount: 0,
    fastDelivery: false,
    topDeal: true,
  },
  {
    id: 3,
    name: "Burger Kingdom",
    cuisine: "American",
    rating: 4.5,
    deliveryTime: "20-30",
    deliveryFee: 35,
    minOrder: 120,
    image: "🍔",
    popular: false,
    priceRange: "$$",
    discount: 30,
    fastDelivery: true,
    topDeal: false,
  },
  {
    id: 4,
    name: "Sushi Master",
    cuisine: "Japanese",
    rating: 4.9,
    deliveryTime: "35-45",
    deliveryFee: 60,
    minOrder: 250,
    image: "🍣",
    popular: true,
    priceRange: "$$$",
    discount: 0,
    fastDelivery: false,
    topDeal: true,
  },
  {
    id: 5,
    name: "Curry Express",
    cuisine: "Indian",
    rating: 4.4,
    deliveryTime: "25-35",
    deliveryFee: 40,
    minOrder: 150,
    image: "🍛",
    popular: false,
    priceRange: "$$",
    discount: 25,
    fastDelivery: false,
    topDeal: false,
  },
  {
    id: 6,
    name: "Thai Street Food",
    cuisine: "Thai",
    rating: 4.7,
    deliveryTime: "30-40",
    deliveryFee: 45,
    minOrder: 180,
    image: "🍜",
    popular: false,
    priceRange: "$$",
    discount: 15,
    fastDelivery: true,
    topDeal: false,
  },
];

// Cuisine Categories with Icons
export const cuisineCategories = [
  { id: "All", name: "All", icon: "🍽️" },
  { id: "Bangladeshi", name: "Bangladeshi", icon: "🍛" },
  { id: "Italian", name: "Italian", icon: "🍕" },
  { id: "American", name: "American", icon: "🍔" },
  { id: "Japanese", name: "Japanese", icon: "🍣" },
  { id: "Indian", name: "Indian", icon: "🍛" },
  { id: "Thai", name: "Thai", icon: "🍜" },
];

// Mock Menu Items by Restaurant
export const mockMenuItems = {
  1: [ // Dhaka Biryani House
    {
      id: 101,
      name: "Kacchi Biryani",
      category: "Main Course",
      description: "Authentic Dhaka-style mutton biryani with basmati rice",
      price: 320,
      image: "🍛",
      food_image: {
        url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
        altText: "Kacchi Biryani"
      },
      variants: [
        { name: "Regular", price: 320 },
        { name: "Large", price: 450 },
      ],
      popular: true,
    },
    {
      id: 102,
      name: "Chicken Roast",
      category: "Main Course",
      description: "Spicy marinated chicken with traditional spices",
      price: 180,
      image: "🍗",
      food_image: {
        url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop",
        altText: "Chicken Roast"
      },
      variants: [
        { name: "Half", price: 180 },
        { name: "Full", price: 320 },
      ],
    },
    {
      id: 103,
      name: "Beef Tehari",
      category: "Main Course",
      description: "Flavorful beef cooked with aromatic rice",
      price: 280,
      image: "🍚",
      food_image: {
        url: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=400&h=300&fit=crop",
        altText: "Beef Tehari"
      },
      variants: [
        { name: "Regular", price: 280 },
        { name: "Large", price: 380 },
      ],
    },
    {
      id: 104,
      name: "Borhani",
      category: "Beverages",
      description: "Traditional yogurt drink",
      price: 40,
      image: "🥤",
      food_image: {
        url: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop",
        altText: "Borhani"
      },
    },
    {
      id: 105,
      name: "Shahi Firni",
      category: "Desserts",
      description: "Creamy rice pudding with cardamom",
      price: 80,
      image: "🍮",
      food_image: {
        url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
        altText: "Shahi Firni"
      },
    },
  ],
  2: [ // Pizza Paradise
    {
      id: 201,
      name: "Margherita Pizza",
      category: "Pizza",
      description: "Classic tomato sauce, mozzarella, and basil",
      price: 450,
      image: "🍕",
      food_image: {
        url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
        altText: "Margherita Pizza"
      },
      variants: [
        { name: "Small (8\")", price: 450 },
        { name: "Medium (12\")", price: 680 },
        { name: "Large (16\")", price: 950 },
      ],
      popular: true,
    },
    {
      id: 202,
      name: "Pepperoni Feast",
      category: "Pizza",
      description: "Loaded with pepperoni and extra cheese",
      price: 550,
      image: "🍕",
      food_image: {
        url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop",
        altText: "Pepperoni Feast"
      },
      variants: [
        { name: "Small (8\")", price: 550 },
        { name: "Medium (12\")", price: 780 },
        { name: "Large (16\")", price: 1050 },
      ],
      popular: true,
    },
    {
      id: 203,
      name: "Garlic Bread",
      category: "Appetizers",
      description: "Crispy bread with garlic butter",
      price: 150,
      image: "🥖",
      food_image: {
        url: "https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=400&h=300&fit=crop",
        altText: "Garlic Bread"
      },
    },
    {
      id: 204,
      name: "Caesar Salad",
      category: "Salads",
      description: "Fresh romaine with parmesan and croutons",
      price: 250,
      image: "🥗",
      food_image: {
        url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
        altText: "Caesar Salad"
      },
    },
    {
      id: 205,
      name: "Tiramisu",
      category: "Desserts",
      description: "Classic Italian dessert",
      price: 280,
      image: "🍰",
      food_image: {
        url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
        altText: "Tiramisu"
      },
    },
  ],
  3: [ // Burger Kingdom
    {
      id: 301,
      name: "Classic Beef Burger",
      category: "Burgers",
      description: "Juicy beef patty with lettuce, tomato, and cheese",
      price: 280,
      image: "🍔",
      food_image: {
        url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
        altText: "Classic Beef Burger"
      },
      variants: [
        { name: "Single", price: 280 },
        { name: "Double", price: 420 },
      ],
      popular: true,
    },
    {
      id: 302,
      name: "Chicken Burger",
      category: "Burgers",
      description: "Crispy chicken with special sauce",
      price: 250,
      image: "🍔",
      food_image: {
        url: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop",
        altText: "Chicken Burger"
      },
      variants: [
        { name: "Single", price: 250 },
        { name: "Double", price: 380 },
      ],
    },
    {
      id: 303,
      name: "French Fries",
      category: "Sides",
      description: "Crispy golden fries",
      price: 120,
      image: "🍟",
      food_image: {
        url: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&h=300&fit=crop",
        altText: "French Fries"
      },
      variants: [
        { name: "Regular", price: 120 },
        { name: "Large", price: 180 },
      ],
    },
    {
      id: 304,
      name: "Onion Rings",
      category: "Sides",
      description: "Crispy battered onion rings",
      price: 150,
      image: "🧅",
      food_image: {
        url: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=300&fit=crop",
        altText: "Onion Rings"
      },
    },
    {
      id: 305,
      name: "Chocolate Shake",
      category: "Beverages",
      description: "Thick chocolate milkshake",
      price: 180,
      image: "🥤",
      food_image: {
        url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop",
        altText: "Chocolate Shake"
      },
    },
  ],
  4: [ // Sushi Master
    {
      id: 401,
      name: "California Roll",
      category: "Sushi Rolls",
      description: "Crab, avocado, and cucumber",
      price: 380,
      image: "🍣",
      food_image: {
        url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
        altText: "California Roll"
      },
      popular: true,
    },
    {
      id: 402,
      name: "Spicy Tuna Roll",
      category: "Sushi Rolls",
      description: "Fresh tuna with spicy mayo",
      price: 420,
      image: "🍣",
      food_image: {
        url: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop",
        altText: "Spicy Tuna Roll"
      },
      popular: true,
    },
    {
      id: 403,
      name: "Salmon Sashimi",
      category: "Sashimi",
      description: "Fresh salmon slices (6 pieces)",
      price: 480,
      image: "🍣",
      food_image: {
        url: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400&h=300&fit=crop",
        altText: "Salmon Sashimi"
      },
    },
    {
      id: 404,
      name: "Miso Soup",
      category: "Soups",
      description: "Traditional Japanese soup",
      price: 150,
      image: "🍜",
      food_image: {
        url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop",
        altText: "Miso Soup"
      },
    },
    {
      id: 405,
      name: "Green Tea Ice Cream",
      category: "Desserts",
      description: "Authentic matcha ice cream",
      price: 180,
      image: "🍨",
      food_image: {
        url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
        altText: "Green Tea Ice Cream"
      },
    },
  ],
};

// Mock Orders Data
export const mockOrders = [
  {
    id: "ORD001",
    restaurantId: 1,
    restaurantName: "Dhaka Biryani House",
    items: [
      { name: "Kacchi Biryani", variant: "Regular", quantity: 2, price: 320 },
      { name: "Borhani", quantity: 2, price: 40 },
    ],
    subtotal: 720,
    deliveryFee: 40,
    total: 760,
    status: "rider_assigned",
    orderTime: "2025-12-16 12:30 PM",
    pin: "8899",
    isActive: true,
    riderLocation: {
      lng: 90.4150,
      lat: 23.8120
    },
    deliveryLocation: {
      lng: 90.4225,
      lat: 23.8203
    },
    riderLocationUpdatedAt: new Date(Date.now() - 2 * 60000).toISOString(), // 2 minutes ago
  },
  {
    id: "ORD002",
    restaurantId: 2,
    restaurantName: "Pizza Paradise",
    items: [
      { name: "Margherita Pizza", variant: "Medium (12\")", quantity: 1, price: 680 },
      { name: "Garlic Bread", quantity: 1, price: 150 },
    ],
    subtotal: 830,
    deliveryFee: 50,
    total: 880,
    status: "accepted",
    orderTime: "2025-12-16 01:15 PM",
    isActive: true,
  },
  {
    id: "ORD003",
    restaurantId: 3,
    restaurantName: "Burger Kingdom",
    items: [
      { name: "Classic Beef Burger", variant: "Double", quantity: 1, price: 420 },
      { name: "French Fries", variant: "Large", quantity: 1, price: 180 },
    ],
    subtotal: 600,
    deliveryFee: 35,
    total: 635,
    status: "delivered",
    orderTime: "2025-12-15 07:30 PM",
    deliveredTime: "2025-12-15 08:15 PM",
    isActive: false,
  },
  {
    id: "ORD004",
    restaurantId: 4,
    restaurantName: "Sushi Master",
    items: [
      { name: "California Roll", quantity: 2, price: 380 },
      { name: "Miso Soup", quantity: 1, price: 150 },
    ],
    subtotal: 910,
    deliveryFee: 60,
    total: 970,
    status: "delivered",
    orderTime: "2025-12-14 06:00 PM",
    deliveredTime: "2025-12-14 07:10 PM",
    isActive: false,
  },
];

// Order Status Configuration
export const orderStatuses = {
  pending: {
    label: "Pending",
    message: "Waiting for Restaurant...",
    color: "yellow",
    icon: "⏳",
  },
  accepted: {
    label: "Accepted",
    message: "Restaurant is preparing...",
    color: "orange",
    icon: "👨‍🍳",
  },
  rider_assigned: {
    label: "Rider Assigned",
    message: "Rider is coming!",
    color: "green",
    icon: "🏍️",
  },
  delivered: {
    label: "Delivered",
    message: "Order delivered successfully",
    color: "blue",
    icon: "✅",
  },
};
