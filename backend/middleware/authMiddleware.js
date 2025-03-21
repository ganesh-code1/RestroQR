import session from "express-session";
import MongoStore from "connect-mongo";

const MONGO_URI = "mongodb+srv://hotel-admin:Mongo%402025@restroqr.mkvof.mongodb.net/?retryWrites=true&w=majority&appName=RestroQR&tls=true";

export const sessionMiddleware = session({
  secret: "firstsession",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI, 
    collectionName: "sessions",
  }),
  cookie: { 
    secure: true, 
    sameSite: "None",
    httpOnly: true
  },
});


export const corsMiddleware = cors({
  origin: ["https://restro-qr.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});