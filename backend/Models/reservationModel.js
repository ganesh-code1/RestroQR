import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Customer", 
    required: true 
  },
  persons: {
    type: Number,
    required: true,
  },
  reservationDate: {
    type: String,
    required: true,
  },
  reservationTime: {
    type: String,
    required: true,
  },
  specialRequest: {
    type: String,
    default: "", 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
