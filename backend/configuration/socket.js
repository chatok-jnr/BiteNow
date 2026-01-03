const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");

let io;
const initSocket = (server) => {
  //Initialize io
  io = socketIO(server, {
    //CORS => connect frontend to backend
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true, //for verify JWT tokens
    },
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
  });

  //verify user by JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  //Setup connection for each client
  io.on("connection", (socket) => {
    //for debug
    console.log(`User connected: ${socket.userId} - Role: ${socket.userRole}`);

    //join role specific room
    socket.join(socket.userRole);
    //join id specific room
    socket.join(socket.userId);
    //rider location update
    socket.on("location:update", async (data) => {
      const { latitude, longitude } = data;

      //for debug
      console.log(
        `Location updated from User: ${socket.userId}, Role: ${socket.userRole}`
      );
      if (socket.userRole === "rider") {
        //update location by using broadcast and emit methods
        socket.boardcast.emit("rider:location", {
          riderId: socket.userId,
          latitude,
          longitude,
          timestamp: new Date(),
        });
      }
    });

    //Track order by customer
    socket.on("order:track", (orderId) => {
      socket.join(orderId);
    });

    //Untrack order
    socket.on("order:untrack", (orderId) => {
      socket.leave(orderId);
    });
    //Rider avaiability
    socket.on("rider:available", (isAvailable) => {
      socket.boardcast.to("admin").emit("rider:status:change", {
        riderId: socket.userId,
        isAvailable,
        timestamp: new Date(),
      });
    });

    //disconnect socket
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  });

  return io;
};

//get io => Access socket anywhere in the app
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized! Call initSocket first");
  }
  return io;
};

module.exports = {initSocket, getIO};
