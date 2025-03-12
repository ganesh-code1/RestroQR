import Order from "../Models/orderModel.js";
import Customer from "../Models/customerModel.js";

export const getAllCustomers = async (req, res) => {
  try {
    const restaurantId = req.session.uid;
    if (!restaurantId) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }
    const customers = await Customer.find({ restaurantId }).sort({
      customerName: 1,
    });
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const restaurantId = req.session.uid;
    if (!restaurantId) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }
    const orders = await Order.find({ customerId, restaurantId }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};