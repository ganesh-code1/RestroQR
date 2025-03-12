import Offer from "../Models/Offer.js";
import adminModel from "../Models/hotelAdmin.js";

export const createOffer = async (req, res) => {
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
};

export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ error: "Offer not found" });
    res.json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete offer" });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOffer) return res.status(404).json({ error: "Offer not found" });
    res.json(updatedOffer);
  } catch (error) {
    res.status(500).json({ error: "Failed to update offer" });
  }
};

export const getOffers = async (req, res) => {
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
};

export const verifyCoupon = async (req, res) => {
  try {
    const { couponCode, restaurantSlug } = req.body;
    const restaurant = await adminModel.findOne({ slug: restaurantSlug });
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
    couponEndDate.setHours(23, 59, 59, 999);
    if (currentDate < couponStartDate || currentDate > couponEndDate) {
      return res.status(400).json({ error: "Coupon has expired or is not yet active" });
    }
    res.json({ discountPercentage: coupon.discountPercentage });
  } catch (error) {
    console.error("Error verifying coupon:", error);
    res.status(500).json({ error: "Failed to verify coupon" });
  }
};