import Reservation from "../Models/reservationModel.js";
import adminModel from "../Models/hotelAdmin.js";
import Customer from "../Models/customerModel.js";

export const createReservation = async (req, res) => {
  try {
    const { restaurantId, name, mobile, persons, reservationDate, reservationTime, specialRequest } = req.body;
    let customer = await Customer.findOne({ restaurantId, customerMobile:mobile });
    if (!customer) {
      customer = new Customer({
        restaurantId,
        customerName: name,
        customerMobile: mobile,
        customerDOB: null,
        totalSpent: 0,
        totalOrders: 0,
      });
      await customer.save();
    }
    const reservation = new Reservation({
      restaurantId,
      customerId: customer._id,
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
};

export const getRestaurantName = async (req, res) => {
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
};

export const getAllReservation = async (req, res) => {
  try {
    const userId = req.session.uid; 
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }
    const reservations = await Reservation.find({ restaurantId: userId }).sort({ reservationDate: 1 }).populate("customerId", "customerName customerMobile");
    res.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};