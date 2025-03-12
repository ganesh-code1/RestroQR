import adminModel from "../Models/hotelAdmin.js";
import bcrypt from "bcrypt";
import slugify from "slugify";

export const register = async (req, res) => {
  try {
    const { HotelName, OwnerName, Email, Mnumber, Password, ConPass } = req.body;
    if (Password !== ConPass) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const existingUser = await adminModel.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);
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
    res.status(201).json({ message: "Account created successfully", UserId: savedUser.UserId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
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
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
};

export const sessionCheck = async (req, res) => {
  if (req.session && req.session.uid) {
    const user = await adminModel.findById(req.session.uid);
    if (user) {
      return res.status(200).json({ loggedIn: true, email: user.Email });
    }
  }
  return res.status(401).json({ loggedIn: false });
};
