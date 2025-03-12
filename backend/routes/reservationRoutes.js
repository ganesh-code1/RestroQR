import express from "express";
import { createReservation, getRestaurantName, getAllReservation } from "../controllers/reservationController.js";

const router = express.Router();

router.post("/book", createReservation);
router.get("/:slug", getRestaurantName);
router.get("", getAllReservation);

export default router;