import { prisma } from "../config/prisma.js";

export async function getDashboard(_req, res, next) {
  try {
    const parts = await prisma.part.findMany({
      where: { activo: true },
      select: { stock: true, stockMinimo: true },
    });
    const lowStock = parts.filter((p) => p.stock <= p.stockMinimo).length;

    const [totalParts, totalClients, totalVehicles, totalSuppliers, recentMovements] = await Promise.all([
      prisma.part.count({ where: { activo: true } }),
      prisma.client.count(),
      prisma.vehicle.count(),
      prisma.supplier.count(),
      prisma.inventoryMovement.findMany({
        take: 8,
        orderBy: { fecha: "desc" },
        include: {
          pieza: { select: { id: true, codigo: true, nombre: true } },
          usuario: { select: { id: true, nombre: true, apellido: true } },
        },
      }),
    ]);

    return res.json({
      totalPiezas: totalParts,
      piezasStockBajo: lowStock,
      totalClientes: totalClients,
      totalVehiculos: totalVehicles,
      totalProveedores: totalSuppliers,
      movimientosRecientes: recentMovements,
    });
  } catch (error) {
    return next(error);
  }
}
