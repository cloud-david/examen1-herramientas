import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@refaccionaria.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      nombre: "Admin",
      apellido: "Sistema",
      email,
      passwordHash,
      telefono: "0000000000",
      rol: "ADMIN",
      activo: true,
    },
  });

  console.log(`Usuario ADMIN listo: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
