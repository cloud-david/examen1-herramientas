import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { HttpError } from "./error.js";

export function authRequired(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return next(new HttpError(401, "No autenticado."));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return next(new HttpError(401, "Token inválido o expirado."));
  }
}

export function requireRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(new HttpError(403, "No autorizado."));
    }
    return next();
  };
}

export async function loadActiveUser(req, _res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.activo) {
      return next(new HttpError(401, "Usuario inactivo o inexistente."));
    }
    req.currentUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
