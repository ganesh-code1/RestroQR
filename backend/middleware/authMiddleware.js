import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";

export const sessionMiddleware = session({
  secret: "firstsession",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb+srv://hotel-admin:yourpassword@restroqr.mkvof.mongodb.net/RestroQR?retryWrites=true&w=majority",
    collectionName: "sessions",
  }),
  cookie: {
    secure: true, 
    httpOnly: true,
    sameSite: "None",
  },
});

export const corsMiddleware = cors({
  origin: ["https://restro-qr.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});