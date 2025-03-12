import express from "express";
import { getAllCustomers, getCustomerOrders } from "../controllers/customerController.js";

const router = express.Router();

router.get("/orders/:customerId", getCustomerOrders);
router.get("", getAllCustomers);

export default router;