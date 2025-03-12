import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User _id
    ref: "Hotel",
    required: true,
  },
  itemName: { type: String, required: true },
  itemDescription: { type: String },
  itemAvailable: { type: Boolean, default: true },
  itemCost: { type: Number, required: true },
  itemCategory: { type: String, required: true },
  itemImage: { type: String } //new
});

const MenuItem = mongoose.model("MenuItem", MenuItemSchema);
export default MenuItem;
