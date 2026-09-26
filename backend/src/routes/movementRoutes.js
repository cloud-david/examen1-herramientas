import { Router } from "express";
import { listMovements } from "../controllers/inventoryController.js";

const router = Router();

router.get("/", listMovements);

export default router;
