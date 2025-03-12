import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  orderId: { type: Number, unique: true }, // Auto-incremented field
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  restaurantName: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  deliveryType: { type: String, enum: ["EatIn", "Takeaway"], required: true },
  note: { type: String },
  tableId: { type: String, default: null },
  items: [
    {
      itemName: String,
      itemCost: Number,
      itemCategory: String,
      quantity: Number,
    },
  ],
  couponCode: { type: String, default: null },
  discountPercentage: { type: Number, default: 0 },
  discountedTotal: { type: Number, default: 0 },
  orderStatus: { type: String, enum: ["New", "Preparing", "Completed", "Cancelled"], default: "New" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", OrderSchema);
