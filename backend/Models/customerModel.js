import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  customerName: { type: String, required: true },
  customerMobile: { type: String, required: true },
  customerDOB: { type: Date, default: null },
  totalSpent: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
});

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
