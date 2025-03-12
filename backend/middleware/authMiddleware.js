import session from "express-session";
import cors from "cors";

export const sessionMiddleware = session({
  secret: "firstsession",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
});

export const corsMiddleware = cors({
  origin: [/http:\/\/localhost(:\d+)?/, /http:\/\/192\.168\.29\.112(:\d+)?/],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});