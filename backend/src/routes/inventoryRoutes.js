import { Router } from "express";
import { adjust, entry, exit, listInventory } from "../controllers/inventoryController.js";

const router = Router();

router.get("/", listInventory);
router.post("/entry", entry);
router.post("/exit", exit);
router.post("/adjust", adjust);

export default router;
