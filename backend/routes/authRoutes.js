import express from "express";
import {
  register,
  login,
  logout,
  sessionCheck,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/session-check", sessionCheck);

export default router;