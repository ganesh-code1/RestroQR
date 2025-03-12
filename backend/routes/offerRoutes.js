import express from "express";
import {
  createOffer,
  deleteOffer,
  updateOffer,
  getOffers,
  verifyCoupon,
} from "../controllers/offerController.js";

const router = express.Router();

router.post("", createOffer);
router.delete("/:id", deleteOffer);
router.put("/:id", updateOffer);
router.get("", getOffers);
router.post("/verify-coupon", verifyCoupon);

export default router;