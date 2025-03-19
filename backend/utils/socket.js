import { Server } from "socket.io";

export const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://restro-qr.netlify.app",
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