import { Router } from "express";
import { createClient, deleteClient, getClient, listClients, updateClient } from "../controllers/clientController.js";

const router = Router();

router.get("/", listClients);
router.get("/:id", getClient);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
