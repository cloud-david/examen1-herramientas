import { prisma } from "../config/prisma.js";
import { HttpError } from "../middleware/error.js";
import { isEmail, pagination, parseId, requireFields } from "../utils/validate.js";

export async function listClients(req, res, next) {
  try {
    const { skip, take, page, pageSize, sortOrder, search } = pagination(req.query);
    const sortBy = ["id", "nombre", "email", "telefono", "createdAt"].includes(req.query.sortBy)
      ? req.query.sortBy
      : "id";
    const where = search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { telefono: { contains: search, mode: "insensitive" } },
            { direccion: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { vehicles: true } } },
      }),
    ]);
    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
}

export async function getClient(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const client = await prisma.client.findUnique({
      where: { id },
      include: { vehicles: true },
    });
    if (!client) {
      throw new HttpError(404, "Cliente no encontrado.");
    }
    return res.json(client);
  } catch (error) {
    return next(error);
  }
}

export async function createClient(req, res, next) {
  try {
    requireFields(req.body, ["nombre"]);
    if (req.body.email && !isEmail(req.body.email)) {
      throw new HttpError(400, "Email inválido.");
    }
    const client = await prisma.client.create({
      data: {
        nombre: String(req.body.nombre).trim(),
        telefono: req.body.telefono ? String(req.body.telefono).trim() : null,
        email: req.body.email ? String(req.body.email).trim().toLowerCase() : null,
        direccion: req.body.direccion ? String(req.body.direccion).trim() : null,
      },
    });
    return res.status(201).json(client);
  } catch (error) {
    return next(error);
  }
}

export async function updateClient(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "Cliente no encontrado.");
    }
    if (req.body.email && !isEmail(req.body.email)) {
      throw new HttpError(400, "Email inválido.");
    }
    const client = await prisma.client.update({
      where: { id },
      data: {
        nombre: req.body.nombre !== undefined ? String(req.body.nombre).trim() : undefined,
        telefono: req.body.telefono !== undefined ? (req.body.telefono ? String(req.body.telefono).trim() : null) : undefined,
        email: req.body.email !== undefined ? (req.body.email ? String(req.body.email).trim().toLowerCase() : null) : undefined,
        direccion: req.body.direccion !== undefined ? (req.body.direccion ? String(req.body.direccion).trim() : null) : undefined,
      },
    });
    return res.json(client);
  } catch (error) {
    return next(error);
  }
}

export async function deleteClient(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const existing = await prisma.client.findUnique({
      where: { id },
      include: { _count: { select: { vehicles: true } } },
    });
    if (!existing) {
      throw new HttpError(404, "Cliente no encontrado.");
    }
    if (existing._count.vehicles > 0) {
      throw new HttpError(400, "No se puede eliminar un cliente con vehículos asociados.");
    }
    await prisma.client.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
