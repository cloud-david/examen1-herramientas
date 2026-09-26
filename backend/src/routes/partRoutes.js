import { Router } from "express";
import { createPart, deletePart, getPart, listParts, updatePart } from "../controllers/partController.js";

const router = Router();

router.get("/", listParts);
router.get("/:id", getPart);
router.post("/", createPart);
router.put("/:id", updatePart);
router.delete("/:id", deletePart);

export default router;
