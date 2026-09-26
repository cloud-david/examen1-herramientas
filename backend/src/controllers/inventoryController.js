import { prisma } from "../config/prisma.js";
import { HttpError } from "../middleware/error.js";
import { pagination, parseId, requireFields, toNumber } from "../utils/validate.js";

export async function listInventory(req, res, next) {
  try {
    const { skip, take, page, pageSize, sortOrder, search } = pagination(req.query);
    const sortBy = ["id", "codigo", "nombre", "stock", "stockMinimo"].includes(req.query.sortBy)
      ? req.query.sortBy
      : "nombre";
    const where = { activo: true };
    if (search) {
      where.OR = [
        { codigo: { contains: search, mode: "insensitive" } },
        { nombre: { contains: search, mode: "insensitive" } },
      ];
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

async function applyMovement({ piezaId, cantidad, tipo, usuarioId, nota, stockNuevo }) {
  return prisma.$transaction(async (tx) => {
    const part = await tx.part.findUnique({ where: { id: piezaId } });
    if (!part || !part.activo) {
      throw new HttpError(400, "La pieza no existe o está inactiva.");
    }

    let nextStock = part.stock;
    let qty = cantidad;

    if (tipo === "ENTRADA") {
      nextStock = part.stock + cantidad;
    } else if (tipo === "SALIDA") {
      nextStock = part.stock - cantidad;
    } else if (tipo === "AJUSTE") {
      nextStock = stockNuevo;
      qty = stockNuevo - part.stock;
    }

    if (nextStock < 0) {
      throw new HttpError(400, "El stock no puede ser negativo.");
    }

    const updated = await tx.part.update({
      where: { id: piezaId },
      data: { stock: nextStock },
    });

    const movement = await tx.inventoryMovement.create({
      data: {
        tipo,
        cantidad: qty,
        piezaId,
        usuarioId,
        nota: nota ? String(nota).trim() : null,
      },
      include: {
        pieza: true,
        usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
      },
    });

    return { part: updated, movement };
  });
}

export async function entry(req, res, next) {
  try {
    requireFields(req.body, ["piezaId", "cantidad"]);
    const piezaId = parseId(req.body.piezaId, "piezaId");
    const cantidad = toNumber(req.body.cantidad, "cantidad", { integer: true, min: 1 });
    const result = await applyMovement({
      piezaId,
      cantidad,
      tipo: "ENTRADA",
      usuarioId: req.user.id,
      nota: req.body.nota,
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function exit(req, res, next) {
  try {
    requireFields(req.body, ["piezaId", "cantidad"]);
    const piezaId = parseId(req.body.piezaId, "piezaId");
    const cantidad = toNumber(req.body.cantidad, "cantidad", { integer: true, min: 1 });
    const result = await applyMovement({
      piezaId,
      cantidad,
      tipo: "SALIDA",
      usuarioId: req.user.id,
      nota: req.body.nota,
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function adjust(req, res, next) {
  try {
    requireFields(req.body, ["piezaId", "stockNuevo"]);
    const piezaId = parseId(req.body.piezaId, "piezaId");
    const stockNuevo = toNumber(req.body.stockNuevo, "stockNuevo", { integer: true, min: 0 });
    const result = await applyMovement({
      piezaId,
      cantidad: 0,
      tipo: "AJUSTE",
      usuarioId: req.user.id,
      nota: req.body.nota,
      stockNuevo,
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function listMovements(req, res, next) {
  try {
    const { skip, take, page, pageSize, sortOrder, search } = pagination(req.query);
    const sortBy = ["id", "fecha", "tipo", "cantidad"].includes(req.query.sortBy) ? req.query.sortBy : "fecha";
    const where = {};
    if (req.query.tipo) {
      where.tipo = req.query.tipo;
    }
    if (req.query.piezaId) {
      where.piezaId = parseId(req.query.piezaId, "piezaId");
    }
    if (search) {
      where.OR = [
        { nota: { contains: search, mode: "insensitive" } },
        { pieza: { nombre: { contains: search, mode: "insensitive" } } },
        { pieza: { codigo: { contains: search, mode: "insensitive" } } },
        { usuario: { nombre: { contains: search, mode: "insensitive" } } },
        { usuario: { apellido: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.inventoryMovement.count({ where }),
      prisma.inventoryMovement.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          pieza: true,
          usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
        },
      }),
    ]);
    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
}
