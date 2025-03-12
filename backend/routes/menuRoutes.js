import express from "express";
import { saveMenu, getMenu, getMenuBySlug } from "../controllers/menuController.js";
import { upload } from "../config/uploadConfig.js";

const router = express.Router();

router.post("", upload.array("itemImages"), saveMenu);
router.get("", getMenu);
router.get("/:restaurantSlug", getMenuBySlug);

export default router;