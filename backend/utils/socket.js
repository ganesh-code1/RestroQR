import { Server } from "socket.io";

export const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5175",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("orderPlaced", ({ restaurantSlug }) => {
      io.emit(`newOrder:${restaurantSlug}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
};