import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import slugify from "slugify";
import adminModel from "./Models/hotelAdmin.js";
import MenuItem from "./Models/productMenu.js";
import Offer from "./Models/Offer.js";
import Order from "./Models/orderModel.js";
import Counter from "./Models/counterModel.js"; 
import Reservation from "./Models/reservationModel.js"; 
import { Server } from "socket.io";
import http from "http";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import SuperAdmin from "./Models/superAdminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();

// Configure Express session
app.use(
  session({
    secret: "firstsession",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set true in production (HTTPS)
  })
);

// Enable CORS with credentials
app.use(
  cors({
    origin: [/http:\/\/localhost(:\d+)?/, /http:\/\/192\.168\.29\.112(:\d+)?/], // Allow frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/Hotel", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB connection error:", error));
db.once("open", () => console.log("Connected to MongoDB"));

// Session Checker Endpoint
app.get("/session-check", async (req, res) => {
  if (req.session && req.session.uid) {
    const user = await adminModel.findById(req.session.uid);
    if (user) {
      return res.status(200).json({ loggedIn: true, email: user.Email });
    }
  }
  return res.status(401).json({ loggedIn: false });
});

// Registration Endpoint
app.post("/register", async (req, res) => {
  try {
    const { HotelName, OwnerName, Email, Mnumber, Password, ConPass } = req.body;
    if (Password !== ConPass) {   // Validate passwords match
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const existingUser = await adminModel.findOne({ Email }); // Check if email already exists
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);
    // Generate a unique slug
    let slug = slugify(HotelName, { lower: true, strict: true });
    let existingSlug = await adminModel.findOne({ slug });
    let counter = 1;
    while (existingSlug) {
      slug = `${slug}-${counter++}`;
      existingSlug = await adminModel.findOne({ slug });
    }
    let isOpen = true;
    const newHotelAdmin = new adminModel({
      HotelName,
      OwnerName,
      Email,
      Mnumber,
      Password: hashedPassword,
      slug,
      isOpen,
    });
    const savedUser = await newHotelAdmin.save();
    res.status(201).json({message: "Account created successfully", UserId: savedUser.UserId, });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login Endpoint
app.post("/login", async (req, res) => {
  try {
    const { Email, Password } = req.body;
    const user = await adminModel.findOne({ Email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });
    req.session.uid = user._id;
    res.status(200).json({
      message: "Login successful",
      restaurantSlug: user.slug,
      upiId: user.upiId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Logout Endpoint
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
});

// Get restaurant settings based on logged-in user
app.get("/api/restaurant/settings", async (req, res) => {
  try {
    const userId = req.session.uid;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const restaurant = await adminModel.findOne({ _id: userId });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant settings" });
  }
});

// Update restaurant settings based on logged-in user
app.put("/api/restaurant/settings", async (req, res) => {
  try {
    const userId = req.session.uid;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { isOpen, upiId, email, Mnumber } = req.body;

    const updated = await adminModel.findOneAndUpdate(
      { _id: userId },
      { isOpen, upiId, Email: email, Mnumber },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Restaurant not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating settings" });
  }
});

// Upload Menu Item Image - Multer Storage Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Save or Update Menu
app.post("/api/menu", upload.array("itemImages"), async (req, res) => {
  try {
    const userId = req.session.uid;
    const items = req.body.items;
    if (!userId || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid data format" });
    }
    let fileIndex = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.itemImage && req.files[fileIndex]) {
        item.itemImage = `/uploads/${req.files[fileIndex].filename}`;
        fileIndex++;
      }
    }
    await MenuItem.deleteMany({ userId }); // Delete previous menu items for this user
    const menuItems = items.map((item, index) => ({ // Insert new menu items with userId
      ...item,
      userId,
      itemImage: item.itemImage || `/uploads/${req.files[fileIndex++]?.filename}`,
    }));
    await MenuItem.insertMany(menuItems);
    res.status(201).json({ message: "Menu items saved successfully!" });
  } catch (error) {
    console.error("Error saving menu:", error);
    res.status(500).json({ error: "Failed to save menu items" });
  }
});

// Fetch restaurant ID by slug
app.get("/api/restaurants/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const restaurant = await adminModel.findOne({ slug });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(200).json({ _id: restaurant._id });
  } catch (error) {
    console.error("Error fetching restaurant ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a reservation
app.post("/api/reservations/book", async (req, res) => {
  try {
    const { restaurantId, name, mobile, persons, reservationDate, reservationTime, specialRequest } = req.body;
    const reservation = new Reservation({
      restaurantId,
      name,
      mobile,
      persons,
      reservationDate,
      reservationTime,
      specialRequest,
    });
    await reservation.save();
    res.status(201).json({ message: "Table booked successfully!" });
  } catch (error) {
    console.error("Booking failed:", error);
    res.status(500).json({ message: "Failed to book table" });
  }
});

// Fetch all reservations for the logged-in user
app.get("/api/reservations", async (req, res) => {
  try {
    const userId = req.session.uid; 
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }
    const reservations = await Reservation.find({ restaurantId: userId }).sort({ reservationDate: 1 });
    res.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch Menu for Logged-in User
app.get("/api/menu", async (req, res) => {
  try {
    const userId = req.session.uid; 
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const menuItems = await MenuItem.find({ userId });
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

app.get("/api/menu/:restaurantSlug", async (req, res) => {
  try {
    const { restaurantSlug } = req.params;
    const restaurant = await adminModel.findOne({ slug: restaurantSlug });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    if(!restaurant.isOpen) {
      return res.status(404).json({ error: "Restaurant is Closed" });
    }
    const menuItems = await MenuItem.find({
      userId: restaurant._id,
      itemAvailable: true,
    });
    if (!menuItems.length) {
      return res
        .status(404)
        .json({ error: "No available menu items found for this restaurant" });
    }
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

app.post("/order", async (req, res) => {
  try {
    console.log("Incoming order request:", req.body);
    const {
      restaurantName,
      items,
      customerName,
      customerMobile,
      deliveryType,
      note,
      couponCode,
      tableId,
    } = req.body;
    if (!restaurantName || !items || items.length === 0 || !deliveryType) {
      return res.status(400).json({ error: "Invalid order data" });
    }
    const restaurant = await adminModel.findOne({ slug: restaurantName });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    const updatedItems = items.map((item) => ({
      itemName: item.itemName,
      itemCost: item.itemCost,
      itemCategory: item.itemCategory,
      quantity: item.quantity || 1,
    }));
    let totalCost = updatedItems.reduce(
      (acc, item) => acc + item.itemCost * item.quantity,
      0
    );
    let discountPercentage = 0;
    if (couponCode) { // Verify and apply coupon discount
      const coupon = await Offer.findOne({
        restaurantId: restaurant._id,
        couponCode,
      });
      if (coupon) {
        discountPercentage = coupon.discountPercentage;
        totalCost -= (totalCost * discountPercentage) / 100;
      }
    }
    const counter = await Counter.findOneAndUpdate( // Auto-increment orderId
      { name: "orderId" }, 
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const order = new Order({
      orderId: counter.value,
      restaurantId: restaurant._id,
      restaurantName,
      customerName: customerName || "",
      customerMobile: customerMobile || "",
      deliveryType,
      note: note || "",
      items: updatedItems,
      couponCode: couponCode || null,
      discountPercentage,
      discountedTotal: totalCost,
      tableId: tableId || null,
    });
    await order.save();
    res.status(201).json({ message: "Order placed successfully!", order });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const restaurantId = req.session.uid;
    if (!restaurantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.put("/api/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!["New", "Preparing", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const order = await Order.findOneAndUpdate(
      { orderId: Number(orderId) }, 
      { orderStatus: status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Offer and Coupons
app.post("/api/offers", async (req, res) => {
  try {
    const { couponCode, description, discountPercentage, startDate, endDate } = req.body;
    const restaurantId = req.session.uid;
    if (!restaurantId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }
    const existingOffer = await Offer.findOne({ couponCode, restaurantId });
    if (existingOffer) {
      return res.status(400).json({ error: "Coupon code already exists." });
    }
    const newOffer = new Offer({
      restaurantId,
      couponCode,
      description,
      discountPercentage,
      startDate,
      endDate,
    });
    await newOffer.save();
    res.status(201).json(newOffer);
  } catch (error) {
    console.error("Error adding offer:", error);
    res.status(500).json({ error: "Failed to add offer" });
  }
});

app.delete("/api/offers/:id", async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ error: "Offer not found" });
    res.json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete offer" });
  }
});

app.put("/api/offers/:id", async (req, res) => {
  try {
    const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOffer) return res.status(404).json({ error: "Offer not found" });
    res.json(updatedOffer);
  } catch (error) {
    res.status(500).json({ error: "Failed to update offer" });
  }
});

// Fetch all offers for the logged-in restaurant
app.get("/api/offers", async (req, res) => {
  try {
    const restaurantId = req.session.uid;
    if (!restaurantId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }
    const offers = await Offer.find({ restaurantId });
    res.json(offers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
});

app.post("/api/verify-coupon", async (req, res) => {
  try {
    const { couponCode, restaurantSlug  } = req.body;
    const restaurant = await adminModel.findOne({ slug: restaurantSlug  });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    const coupon = await Offer.findOne({
      restaurantId: restaurant._id,
      couponCode,
    });
    if (!coupon) {
      return res.status(400).json({ error: "Invalid or expired coupon code" });
    }
    const currentDate = new Date();
    const couponStartDate = new Date(coupon.startDate);
    const couponEndDate = new Date(coupon.endDate);
    couponEndDate.setHours(23, 59, 59, 999); // Set end time to the last moment of the day
    if (currentDate < couponStartDate || currentDate > couponEndDate) {
      return res.status(400).json({ error: "Coupon has expired or is not yet active" });
    }
    res.json({ discountPercentage: coupon.discountPercentage });
  } catch (error) {
    console.error("Error verifying coupon:", error);
    res.status(500).json({ error: "Failed to verify coupon" });
  }
});

// SUPER ADMIN
// Super Admin Login
app.post("/admin-login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await SuperAdmin.findOne({ username });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: admin._id, role: "superadmin" }, "secretkey", {
    expiresIn: "1h",
  });
  res.json({ token });
});

const verifySuperAdmin = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(403).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token.split(" ")[1], "secretkey");
    if (verified.role !== "superadmin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

// Get all restaurants
app.get("/restaurants", verifySuperAdmin, async (req, res) => {
  try {
    const restaurants = await adminModel.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants" });
  }
});

// Approve or deactivate restaurant
app.put("/restaurant/:id/status", verifySuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;

  try {
    const restaurant = await adminModel.findByIdAndUpdate(id, { approved }, { new: true });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json({ message: `Restaurant ${approved ? "approved" : "deactivated"}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
});

// Get subscription details
app.get("/subscriptions", verifySuperAdmin, async (req, res) => {
  try {
    const subscriptions = await adminModel.find({}, "HotelName subscription");
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscriptions" });
  }
});

// Update subscription status
app.put("/subscription/:id", verifySuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, startDate, endDate } = req.body;

  try {
    const restaurant = await adminModel.findByIdAndUpdate(
      id,
      { subscription: { status, startDate, endDate } },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json({ message: "Subscription updated", restaurant });
  } catch (error) {
    res.status(500).json({ message: "Error updating subscription" });
  }
});

// WEB SOCKET
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: "http://192.168.29.112:5175",
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

server.listen(5000, () => console.log("Server running on port 5000"));


// Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on port ${PORT}`);
// });
