import session from "express-session";
import cors from "cors";

export const sessionMiddleware = session({
  secret: "firstsession",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
});

export const corsMiddleware = cors({
  origin: ["https://restro-qr.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});