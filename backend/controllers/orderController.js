import Order from "../Models/orderModel.js";
import adminModel from "../Models/hotelAdmin.js";
import Offer from "../Models/Offer.js";
import Counter from "../Models/counterModel.js";
import Customer from "../Models/customerModel.js";

export const createOrder = async (req, res) => {
  try {
    const {
      restaurantName,
      items,
      customerName,
      customerMobile,
      customerDOB,
      deliveryType,
      note,
      couponCode,
      tableId,
    } = req.body;
    if (!restaurantName || !items || items.length === 0 || !deliveryType || !customerMobile) {
      return res.status(400).json({ error: "Invalid order data" });
    }
    const restaurant = await adminModel.findOne({ slug: restaurantName });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    let customer = await Customer.findOne({ 
      restaurantId: restaurant._id, 
      customerMobile 
    });
    const updatedItems = items.map((item) => ({
      itemName: item.itemName,
      itemCost: item.itemCost,
      itemCategory: item.itemCategory,
      quantity: item.quantity || 1,
    }));
    let totalCost = updatedItems.reduce((acc, item) => acc + item.itemCost * item.quantity, 0);
    let discountPercentage = 0;
    let couponCode1 = couponCode;
    if (couponCode) {
      const coupon = await Offer.findOne({
        restaurantId: restaurant._id,
        couponCode,
      });
      if (coupon) {
        const currentDate = new Date();
        const couponStartDate = new Date(coupon.startDate);
        const couponEndDate = new Date(coupon.endDate);
        couponEndDate.setHours(23, 59, 59, 999);
        if (currentDate < couponStartDate || currentDate > couponEndDate) {
          discountPercentage = 0;
          couponCode1 = "";
        } else {
          discountPercentage = coupon.discountPercentage;
          totalCost -= (totalCost * discountPercentage) / 100;
        }
      } else {
        couponCode1 = "";
      }
    }
    if (customer) {
      customer.totalSpent += totalCost;
      customer.totalOrders += 1;
      await customer.save();
    } else {
      customer = new Customer({
        restaurantId: restaurant._id,
        customerName,
        customerMobile,
        customerDOB: customerDOB || null,
        totalSpent: totalCost,
        totalOrders: 1,
      });
      await customer.save();
    }
    const counter = await Counter.findOneAndUpdate(
      { name: "orderId" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const order = new Order({
      orderId: counter.value,
      restaurantId: restaurant._id,
      restaurantName,
      customerId: customer._id,
      deliveryType,
      note: note || "",
      items: updatedItems,
      couponCode: couponCode1 || null,
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
};

export const getOrders = async (req, res) => {
  try {
    const restaurantId = req.session.uid;
    if (!restaurantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 }).populate("customerId", "customerName");
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
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
};