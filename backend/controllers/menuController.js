import MenuItem from "../Models/productMenu.js";
import adminModel from "../Models/hotelAdmin.js";
// import { upload } from "../config/uploadConfig.js";

export const saveMenu = async (req, res) => {
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
    await MenuItem.deleteMany({ userId });
    const menuItems = items.map((item, index) => ({
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
};

export const getMenu = async (req, res) => {
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
};

export const getMenuBySlug = async (req, res) => {
  try {
    const { restaurantSlug } = req.params;
    const restaurant = await adminModel.findOne({ slug: restaurantSlug });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    if (!restaurant.isOpen) {
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
};