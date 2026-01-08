export const orderStatuses = {
  pending: {
    label: "Pending",
    icon: "⏳",
    color: "yellow",
  },
  accepted: {
    label: "Accepted",
    icon: "✓",
    color: "blue",
  },
  preparing: {
    label: "Preparing",
    icon: "👨‍🍳",
    color: "orange",
  },
  rider_assigned: {
    label: "Rider Assigned",
    icon: "🏍️",
    color: "blue",
  },
  on_the_way: {
    label: "On the Way",
    icon: "🚚",
    color: "blue",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: "🚚",
    color: "blue",
  },
  delivered: {
    label: "Delivered",
    icon: "✓",
    color: "green",
  },
  cancelled: {
    label: "Cancelled",
    icon: "✗",
    color: "red",
  },
};

export const cuisineCategories = [
  { id: "All", name: "All", icon: "🍽️" },
  { id: "Filipino", name: "Filipino", icon: "🇵🇭" },
  { id: "Chinese", name: "Chinese", icon: "🥢" },
  { id: "Japanese", name: "Japanese", icon: "🍣" },
  { id: "Korean", name: "Korean", icon: "🍜" },
  { id: "Italian", name: "Italian", icon: "🍕" },
  { id: "American", name: "American", icon: "🍔" },
  { id: "Thai", name: "Thai", icon: "🌶️" },
  { id: "Indian", name: "Indian", icon: "🍛" },
  { id: "Vietnamese", name: "Vietnamese", icon: "🥡" },
  { id: "Mexican", name: "Mexican", icon: "🌮" },
  { id: "Fast Food", name: "Fast Food", icon: "🍟" },
  { id: "Desserts", name: "Desserts", icon: "🍰" },
  { id: "Beverages", name: "Beverages", icon: "🥤" },
];
