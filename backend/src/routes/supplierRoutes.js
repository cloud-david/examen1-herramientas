import { Router } from "express";
import { createSupplier, deleteSupplier, getSupplier, listSuppliers, updateSupplier } from "../controllers/supplierController.js";

const router = Router();

router.get("/", listSuppliers);
router.get("/:id", getSupplier);
router.post("/", createSupplier);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

export default router;
