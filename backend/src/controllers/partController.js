import { prisma } from "../config/prisma.js";
import { HttpError } from "../middleware/error.js";
import { pagination, parseId, requireFields, toNumber } from "../utils/validate.js";

function partData(body, isCreate) {
  if (isCreate) {
    requireFields(body, ["codigo", "nombre", "precioCompra", "precioVenta"]);
  }
  const data = {};
  if (body.codigo !== undefined) data.codigo = String(body.codigo).trim().toUpperCase();
  if (body.nombre !== undefined) data.nombre = String(body.nombre).trim();
  if (body.descripcion !== undefined) data.descripcion = body.descripcion ? String(body.descripcion).trim() : null;
  if (body.categoria !== undefined) data.categoria = body.categoria ? String(body.categoria).trim() : null;
  if (body.marca !== undefined) data.marca = body.marca ? String(body.marca).trim() : null;
  if (body.precioCompra !== undefined) data.precioCompra = toNumber(body.precioCompra, "precio_compra", { min: 0 });
  if (body.precioVenta !== undefined) data.precioVenta = toNumber(body.precioVenta, "precio_venta", { min: 0 });
  if (body.stockMinimo !== undefined) data.stockMinimo = toNumber(body.stockMinimo, "stock_minimo", { integer: true, min: 0 });
  if (body.ubicacion !== undefined) data.ubicacion = body.ubicacion ? String(body.ubicacion).trim() : null;
  if (body.proveedorId !== undefined) {
    data.proveedorId = body.proveedorId ? parseId(body.proveedorId, "proveedorId") : null;
  }
  if (body.activo !== undefined) data.activo = Boolean(body.activo);
  if (isCreate && body.stock !== undefined) {
    data.stock = toNumber(body.stock, "stock", { integer: true, min: 0 });
  }
  return data;
}

function baseWhere(query, search) {
  const where = {};
  if (search) {
    where.OR = [
      { codigo: { contains: search, mode: "insensitive" } },
      { nombre: { contains: search, mode: "insensitive" } },
      { descripcion: { contains: search, mode: "insensitive" } },
      { categoria: { contains: search, mode: "insensitive" } },
      { marca: { contains: search, mode: "insensitive" } },
    ];
  }
  if (query.categoria) {
    where.categoria = { contains: String(query.categoria), mode: "insensitive" };
  }
  if (query.activo === "true" || query.activo === "false") {
    where.activo = query.activo === "true";
  }
  return where;
}

export async function listParts(req, res, next) {
  try {
    const { skip, take, page, pageSize, sortOrder, search } = pagination(req.query);
    const sortBy = ["id", "codigo", "nombre", "categoria", "marca", "stock", "precioVenta"].includes(req.query.sortBy)
      ? req.query.sortBy
      : "id";
    const where = baseWhere(req.query, search);

    if (req.query.lowStock === "true") {
      const all = await prisma.part.findMany({
        where,
        include: { proveedor: true },
        orderBy: { [sortBy]: sortOrder },
      });
      const filtered = all.filter((p) => p.stock <= p.stockMinimo);
      return res.json({
        items: filtered.slice(skip, skip + take),
        total: filtered.length,
        page,
        pageSize,
      });
    }

    const [total, items] = await Promise.all([
      prisma.part.count({ where }),
      prisma.part.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: { proveedor: true },
      }),
    ]);
    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
}

export async function getPart(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const part = await prisma.part.findUnique({
      where: { id },
      include: { proveedor: true },
    });
    if (!part) {
      throw new HttpError(404, "Pieza no encontrada.");
    }
    return res.json(part);
  } catch (error) {
    return next(error);
  }
}

export async function createPart(req, res, next) {
  try {
    const data = partData(req.body, true);
    if (data.proveedorId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: data.proveedorId } });
      if (!supplier) {
        throw new HttpError(400, "El proveedor no existe.");
      }
    }
    const part = await prisma.part.create({ data, include: { proveedor: true } });
    return res.status(201).json(part);
  } catch (error) {
    return next(error);
  }
}

export async function updatePart(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const existing = await prisma.part.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "Pieza no encontrada.");
    }
    const data = partData(req.body, false);
    if (data.proveedorId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: data.proveedorId } });
      if (!supplier) {
        throw new HttpError(400, "El proveedor no existe.");
      }
    }
    const part = await prisma.part.update({ where: { id }, data, include: { proveedor: true } });
    return res.json(part);
  } catch (error) {
    return next(error);
  }
}

export async function deletePart(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const existing = await prisma.part.findUnique({
      where: { id },
      include: { _count: { select: { movements: true } } },
    });
    if (!existing) {
      throw new HttpError(404, "Pieza no encontrada.");
    }
    if (existing._count.movements > 0) {
      const part = await prisma.part.update({
        where: { id },
        data: { activo: false },
        include: { proveedor: true },
      });
      return res.json({
        message: "La pieza tiene movimientos y no puede eliminarse. Se marcó como inactiva.",
        part,
      });
    }
    await prisma.part.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
