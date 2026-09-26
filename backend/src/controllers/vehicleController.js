import { prisma } from "../config/prisma.js";
import { HttpError } from "../middleware/error.js";
import { pagination, parseId, requireFields, toNumber } from "../utils/validate.js";

export async function listVehicles(req, res, next) {
  try {
    const { skip, take, page, pageSize, sortOrder, search } = pagination(req.query);
    const sortBy = ["id", "marca", "modelo", "anio", "placas", "vin"].includes(req.query.sortBy)
      ? req.query.sortBy
      : "id";
    const where = {};
    if (search) {
      where.OR = [
        { marca: { contains: search, mode: "insensitive" } },
        { modelo: { contains: search, mode: "insensitive" } },
        { placas: { contains: search, mode: "insensitive" } },
        { vin: { contains: search, mode: "insensitive" } },
        { version: { contains: search, mode: "insensitive" } },
        { motor: { contains: search, mode: "insensitive" } },
      ];
    }
    if (req.query.clienteId) {
      where.clienteId = parseId(req.query.clienteId, "clienteId");
    }

    const [total, items] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: { cliente: true },
      }),
    ]);
    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
}

export async function getVehicle(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { cliente: true },
    });
    if (!vehicle) {
      throw new HttpError(404, "Vehículo no encontrado.");
    }
    return res.json(vehicle);
  } catch (error) {
    return next(error);
  }
}

function vehicleData(body, isCreate) {
  if (isCreate) {
    requireFields(body, ["clienteId", "marca", "modelo", "anio"]);
  }
  const data = {};
  if (body.clienteId !== undefined) data.clienteId = parseId(body.clienteId, "clienteId");
  if (body.marca !== undefined) data.marca = String(body.marca).trim();
  if (body.modelo !== undefined) data.modelo = String(body.modelo).trim();
  if (body.anio !== undefined) data.anio = toNumber(body.anio, "año", { integer: true, min: 1900 });
  if (body.version !== undefined) data.version = body.version ? String(body.version).trim() : null;
  if (body.motor !== undefined) data.motor = body.motor ? String(body.motor).trim() : null;
  if (body.vin !== undefined) data.vin = body.vin ? String(body.vin).trim().toUpperCase() : null;
  if (body.placas !== undefined) data.placas = body.placas ? String(body.placas).trim().toUpperCase() : null;
  return data;
}

export async function createVehicle(req, res, next) {
  try {
    const data = vehicleData(req.body, true);
    const client = await prisma.client.findUnique({ where: { id: data.clienteId } });
    if (!client) {
      throw new HttpError(400, "El cliente no existe.");
    }
    const vehicle = await prisma.vehicle.create({ data, include: { cliente: true } });
    return res.status(201).json(vehicle);
  } catch (error) {
    return next(error);
  }
}

export async function updateVehicle(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "Vehículo no encontrado.");
    }
    const data = vehicleData(req.body, false);
    if (data.clienteId) {
      const client = await prisma.client.findUnique({ where: { id: data.clienteId } });
      if (!client) {
        throw new HttpError(400, "El cliente no existe.");
      }
    }
    const vehicle = await prisma.vehicle.update({ where: { id }, data, include: { cliente: true } });
    return res.json(vehicle);
  } catch (error) {
    return next(error);
  }
}

export async function deleteVehicle(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "Vehículo no encontrado.");
    }
    await prisma.vehicle.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
