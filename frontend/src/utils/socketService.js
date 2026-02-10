import { io } from "socket.io-client";

/**
 * Socket Service - Manages Socket.IO connections
 * Note: Run 'npm install socket.io-client' if not already installed
 */

let socket = null;

// Initialize socket connection
export const initializeSocket = (token) => {
  if (socket?.connected) {
    return socket;
  }

  const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  return socket;
};

// Get current socket instance
export const getSocket = () => {
  if (!socket) {
    console.warn("Socket not initialized. Call initializeSocket first.");
  }
  return socket;
};

// Emit rider location update
export const emitRiderLocation = (latitude, longitude) => {
  if (socket?.connected) {
    socket.emit("location:update", {
      latitude,
      longitude,
      timestamp: new Date(),
    });
  }
};

// Join order tracking room
export const joinOrderRoom = (orderId) => {
  if (socket?.connected) {
    socket.emit("order:track", orderId);
  }
};

// Leave order tracking room
export const leaveOrderRoom = (orderId) => {
  if (socket?.connected) {
    socket.emit("order:untrack", orderId);
  }
};

// Update rider availability status
export const updateRiderAvailability = (isAvailable) => {
  if (socket?.connected) {
    socket.emit("rider:available", isAvailable);
  }
};

// Listen for rider location broadcasts
export const onRiderLocationUpdate = (callback) => {
  if (socket) {
    socket.on("rider:location", callback);
  }
};

// Remove rider location listener
export const offRiderLocationUpdate = () => {
  if (socket) {
    socket.off("rider:location");
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
