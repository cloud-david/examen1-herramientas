import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../middleware/error.js";
import { isEmail, pagination, parseId, requireFields } from "../utils/validate.js";

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function listUsers(req, res, next) {
  try {
    const { skip, take, page, pageSize, sortOrder, search } = pagination(req.query);
    const sortBy = ["id", "nombre", "apellido", "email", "rol", "createdAt"].includes(req.query.sortBy)
      ? req.query.sortBy
      : "id";
    const where = search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { apellido: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { telefono: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};
    if (req.query.rol) {
      where.rol = req.query.rol;
    }
    if (req.query.activo === "true" || req.query.activo === "false") {
      where.activo = req.query.activo === "true";
    }

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return res.json({ items: items.map(publicUser), total, page, pageSize });
  } catch (error) {
    return next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpError(404, "Usuario no encontrado.");
    }
    return res.json(publicUser(user));
  } catch (error) {
    return next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    requireFields(req.body, ["nombre", "apellido", "email", "password"]);
    const { nombre, apellido, email, password, telefono, rol, activo } = req.body;
    if (!isEmail(email)) {
      throw new HttpError(400, "Email inválido.");
    }
    if (String(password).length < 8) {
      throw new HttpError(400, "La contraseña debe tener al menos 8 caracteres.");
    }
    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await prisma.user.create({
      data: {
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        email: String(email).trim().toLowerCase(),
        passwordHash,
        telefono: telefono ? String(telefono).trim() : null,
        rol: rol === "ADMIN" ? "ADMIN" : "EMPLEADO",
        activo: activo === false ? false : true,
      },
    });
    return res.status(201).json(publicUser(user));
  } catch (error) {
    return next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "Usuario no encontrado.");
    }

    const data = {};
    if (req.body.nombre !== undefined) data.nombre = String(req.body.nombre).trim();
    if (req.body.apellido !== undefined) data.apellido = String(req.body.apellido).trim();
    if (req.body.email !== undefined) {
      if (!isEmail(req.body.email)) {
        throw new HttpError(400, "Email inválido.");
      }
      data.email = String(req.body.email).trim().toLowerCase();
    }
    if (req.body.telefono !== undefined) {
      data.telefono = req.body.telefono ? String(req.body.telefono).trim() : null;
    }
    if (req.body.rol !== undefined) {
      data.rol = req.body.rol === "ADMIN" ? "ADMIN" : "EMPLEADO";
    }
    if (req.body.activo !== undefined) {
      data.activo = Boolean(req.body.activo);
    }
    if (req.body.password) {
      if (String(req.body.password).length < 8) {
        throw new HttpError(400, "La contraseña debe tener al menos 8 caracteres.");
      }
      data.passwordHash = await bcrypt.hash(String(req.body.password), 10);
    }

    const user = await prisma.user.update({ where: { id }, data });
    return res.json(publicUser(user));
  } catch (error) {
    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === req.user.id) {
      throw new HttpError(400, "No puedes eliminar tu propio usuario.");
    }
    const existing = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { movements: true } } },
    });
    if (!existing) {
      throw new HttpError(404, "Usuario no encontrado.");
    }
    if (existing._count.movements > 0) {
      const user = await prisma.user.update({ where: { id }, data: { activo: false } });
      return res.json({ message: "Usuario desactivado porque tiene movimientos asociados.", user: publicUser(user) });
    }
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
