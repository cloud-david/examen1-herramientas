import { prisma } from "../config/prisma.js";
import { HttpError } from "../middleware/error.js";
import { isEmail, pagination, parseId, requireFields } from "../utils/validate.js";

export async function listSuppliers(req, res, next) {
  try {
    const { skip, take, page, pageSize, sortOrder, search } = pagination(req.query);
    const sortBy = ["id", "nombre", "empresa", "email"].includes(req.query.sortBy) ? req.query.sortBy : "id";
    const where = search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { empresa: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { telefono: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};
    const [total, items] = await Promise.all([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({ where, skip, take, orderBy: { [sortBy]: sortOrder } }),
    ]);
    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
}

export async function getSupplier(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new HttpError(404, "Proveedor no encontrado.");
    }
    return res.json(supplier);
  } catch (error) {
    return next(error);
  }
}

export async function createSupplier(req, res, next) {
  try {
    requireFields(req.body, ["nombre"]);
    if (req.body.email && !isEmail(req.body.email)) {
      throw new HttpError(400, "Email inválido.");
    }
    const supplier = await prisma.supplier.create({
      data: {
        nombre: String(req.body.nombre).trim(),
        empresa: req.body.empresa ? String(req.body.empresa).trim() : null,
        telefono: req.body.telefono ? String(req.body.telefono).trim() : null,
        email: req.body.email ? String(req.body.email).trim().toLowerCase() : null,
        direccion: req.body.direccion ? String(req.body.direccion).trim() : null,
      },
    });
    return res.status(201).json(supplier);
  } catch (error) {
    return next(error);
  }
}

export async function updateSupplier(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "Proveedor no encontrado.");
    }
    if (req.body.email && !isEmail(req.body.email)) {
      throw new HttpError(400, "Email inválido.");
    }
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        nombre: req.body.nombre !== undefined ? String(req.body.nombre).trim() : undefined,
        empresa: req.body.empresa !== undefined ? (req.body.empresa ? String(req.body.empresa).trim() : null) : undefined,
        telefono: req.body.telefono !== undefined ? (req.body.telefono ? String(req.body.telefono).trim() : null) : undefined,
        email: req.body.email !== undefined ? (req.body.email ? String(req.body.email).trim().toLowerCase() : null) : undefined,
        direccion: req.body.direccion !== undefined ? (req.body.direccion ? String(req.body.direccion).trim() : null) : undefined,
      },
    });
    return res.json(supplier);
  } catch (error) {
    return next(error);
  }
}

export async function deleteSupplier(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const existing = await prisma.supplier.findUnique({
      where: { id },
      include: { _count: { select: { parts: true } } },
    });
    if (!existing) {
      throw new HttpError(404, "Proveedor no encontrado.");
    }
    if (existing._count.parts > 0) {
      throw new HttpError(400, "No se puede eliminar un proveedor con piezas asociadas.");
    }
    await prisma.supplier.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
