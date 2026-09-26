import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { authRequired, loadActiveUser } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/error.js";
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import movementRoutes from "./routes/movementRoutes.js";
import partRoutes from "./routes/partRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";

dotenv.config();

const app = express();
const origin = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", authRequired, loadActiveUser, userRoutes);
app.use("/api/clients", authRequired, loadActiveUser, clientRoutes);
app.use("/api/vehicles", authRequired, loadActiveUser, vehicleRoutes);
app.use("/api/parts", authRequired, loadActiveUser, partRoutes);
app.use("/api/suppliers", authRequired, loadActiveUser, supplierRoutes);
app.use("/api/inventory", authRequired, loadActiveUser, inventoryRoutes);
app.use("/api/movements", authRequired, loadActiveUser, movementRoutes);
app.use("/api/dashboard", authRequired, loadActiveUser, dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
