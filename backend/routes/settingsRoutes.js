import express from "express";
import {getRestaurantSettings, putRestaurantSettings} from "../controllers/settingsController.js";

const router = express.Router();

router.get("", getRestaurantSettings);
router.put("", putRestaurantSettings);

export default router;