/**
 * Returns the correct home route for a given user role.
 * Role values match what the backend stores in localStorage ("customer", "restaurant", "rider").
 *
 * @param {string|null} role - The user's role string
 * @returns {string} The route path for their home/dashboard
 */
export const getHomeRouteByRole = (role) => {
  switch (role) {
    case "rider":
      return "/rider/home";
    case "restaurant":
      return "/restaurant_owner/dashboard";
    case "customer":
    default:
      return "/";
  }
};

/**
 * Reads the current user's role from localStorage.
 * Returns null if no user is stored.
 *
 * @returns {string|null}
 */
export const getCurrentUserRole = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user?.role || null;
  } catch {
    return null;
  }
};
