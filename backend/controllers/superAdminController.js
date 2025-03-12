import SuperAdmin from "../Models/superAdminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import adminModel from "../Models/hotelAdmin.js";

export const superAdminLogin = async (req, res) => {
  const { username, password } = req.body;
  const admin = await SuperAdmin.findOne({ username });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: admin._id, role: "superadmin" }, "secretkey", {
    expiresIn: "1h",
  });
  res.json({ token });
};

export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await adminModel.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};

export const updateRestaurantStatus = async (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;

  try {
    const restaurant = await adminModel.findByIdAndUpdate(id, { approved }, { new: true });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json({ message: `Restaurant ${approved ? "approved" : "deactivated"}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await adminModel.find({}, "HotelName subscription");
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscriptions" });
  }
};

export const updateSubscription = async (req, res) => {
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
};