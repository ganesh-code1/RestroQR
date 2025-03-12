import adminModel from "../Models/hotelAdmin.js";

export const getRestaurantSettings = async (req, res) => {
  try {
    const userId = req.session.uid;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const restaurant = await adminModel.findOne({ _id: userId });
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant settings" });
  }
};

export const putRestaurantSettings = async (req, res) => {
  try {
    const userId = req.session.uid;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { isOpen, upiId, email, Mnumber } = req.body;

    const updated = await adminModel.findOneAndUpdate(
      { _id: userId },
      { isOpen, upiId, Email: email, Mnumber },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Restaurant not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating settings" });
  }
};
