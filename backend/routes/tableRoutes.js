import express from "express";
import { getAllTables, addTable, updateTable, deleteTable } from "../controllers/tableController.js";

const router = express.Router();

router.get("", getAllTables);
router.post("", addTable);
router.put("/:tableId", updateTable);
router.delete("/:tableId", deleteTable);

export default router;