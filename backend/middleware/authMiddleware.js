import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URI = "mongodb+srv://hotel-admin:Mongo%402025@restroqr.mkvof.mongodb.net/?retryWrites=true&w=majority&appName=RestroQR&tls=true";

export const sessionMiddleware = session({
  secret: "firstsession",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true },
});

export const corsMiddleware = cors({
  origin: ["https://restro-qr.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});