import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { corsMiddleware, sessionMiddleware } from "./middleware/authMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import { configureSocket } from "./utils/socket.js";

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(corsMiddleware);
app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", authRoutes);
app.use("/", superAdminRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/restaurant/settings", settingsRoutes);
app.use("/api/customer", customerRoutes);

// Serve static files from the "uploads" directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// WebSocket
configureSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});