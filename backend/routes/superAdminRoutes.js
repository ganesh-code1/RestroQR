import express from "express";
import {
  superAdminLogin,
  getAllRestaurants,
  updateRestaurantStatus,
  getSubscriptions,
  updateSubscription,
} from "../controllers/superAdminController.js";
import { verifySuperAdmin } from "../middleware/superAdminAuth.js";

const router = express.Router();

router.post("/admin-login", superAdminLogin);
router.get("/restaurants", verifySuperAdmin, getAllRestaurants);
router.put("/restaurant/:id/status", verifySuperAdmin, updateRestaurantStatus);
router.get("/subscriptions", verifySuperAdmin, getSubscriptions);
router.put("/subscription/:id", verifySuperAdmin, updateSubscription);

export default router;