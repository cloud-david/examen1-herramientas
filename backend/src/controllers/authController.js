import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../middleware/error.js";
import { isEmail, requireFields } from "../utils/validate.js";

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    telefono: user.telefono,
    rol: user.rol,
    activo: user.activo,
    createdAt: user.createdAt,
  };
}

export async function register(req, res, next) {
  try {
    requireFields(req.body, ["nombre", "apellido", "email", "password"]);
    const { nombre, apellido, email, password, telefono, rol } = req.body;

    if (!isEmail(email)) {
      throw new HttpError(400, "Email inválido.");
    }
    if (String(password).length < 8) {
      throw new HttpError(400, "La contraseña debe tener al menos 8 caracteres.");
    }
    const nextRol = req.user?.rol === "ADMIN" && rol === "ADMIN" ? "ADMIN" : "EMPLEADO";

    const exists = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (exists) {
      throw new HttpError(409, "El email ya está registrado.");
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await prisma.user.create({
      data: {
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        email: String(email).trim().toLowerCase(),
        passwordHash,
        telefono: telefono ? String(telefono).trim() : null,
        rol: nextRol,
      },
    });

    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    requireFields(req.body, ["email", "password"]);
    const email = String(req.body.email).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.activo) {
      throw new HttpError(401, "Credenciales inválidas.");
    }

    const ok = await bcrypt.compare(String(req.body.password), user.passwordHash);
    if (!ok) {
      throw new HttpError(401, "Credenciales inválidas.");
    }

    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.activo) {
      throw new HttpError(401, "Usuario inactivo o inexistente.");
    }
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}
