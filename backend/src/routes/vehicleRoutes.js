import { Router } from "express";
import { createVehicle, deleteVehicle, getVehicle, listVehicles, updateVehicle } from "../controllers/vehicleController.js";

const router = Router();

router.get("/", listVehicles);
router.get("/:id", getVehicle);
router.post("/", createVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

export default router;
