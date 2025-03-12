import mongoose from "mongoose";

const url = "mongodb+srv://hotel-admin:Mongo%402025@restroqr.mkvof.mongodb.net/?retryWrites=true&w=majority&appName=RestroQR&tls=true";
const local = "mongodb://localhost:27017/Hotel";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://hotel-admin:Mongo%402025@restroqr.mkvof.mongodb.net/?retryWrites=true&w=majority&appName=RestroQR&tls=true"
      , {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;