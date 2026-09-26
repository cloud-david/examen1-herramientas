import bcrypt from "bcrypt";
import { prisma } from "./prisma.js";

export async function ensureAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@refaccionaria.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin123!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Usuario ADMIN ya existe: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      nombre: "Admin",
      apellido: "Sistema",
      email,
      passwordHash,
      telefono: "0000000000",
      rol: "ADMIN",
      activo: true,
    },
  });
  console.log(`Usuario ADMIN creado: ${email}`);
}
