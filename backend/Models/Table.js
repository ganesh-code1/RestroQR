import mongoose from "mongoose";

const TableSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  tableId: { type: String, required: true},
  peopleCount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Table", TableSchema);
