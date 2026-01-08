const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const http = require("http");
const { initSocket } = require("./configuration/socket");

const app = require("./app");
const server = http.createServer(app);
const io = initSocket(server);
console.log("Socket.IO initialized");

const DB = (process.env.DATABASE || "").replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD || ""
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running in port No = ${PORT}`);
  console.log(`WebSocket server ready at port: ${PORT}`);
});

//handle unhandled rejections on socket io and others
process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection! Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
