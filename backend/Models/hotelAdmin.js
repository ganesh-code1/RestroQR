import mongoose from "mongoose";

const userData = new mongoose.Schema({
  HotelName: {
    type: String,
    required: true,
  },
  OwnerName: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Mnumber: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  isOpen: {
    type: Boolean,
    required: false,
  },
  upiId: {
    type: String,
    required: false,
  },
  approved: { 
    type: Boolean, 
    default: false 
  },
  subscription: {
    status: { type: String, default: "inactive" }, 
    startDate: { type: Date },
    endDate: { type: Date },
  },
});

const adminModel = mongoose.model("Hotel", userData);
export default adminModel;
