export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err, _req, res, _next) {
  let current = err;
  while (current && current.status == null && current.cause) {
    current = current.cause;
  }
  if (current?.status) {
    err = current;
  }

  if (err.type === "entity.parse.failed" || (err instanceof SyntaxError && err.status === 400)) {
    return res.status(400).json({ message: "JSON inválido." });
  }

  const prismaCode = err.code || err.cause?.code;
  if (prismaCode === "P2002") {
    return res.status(409).json({ message: "El registro ya existe (valor duplicado)." });
  }
  if (prismaCode === "P2003") {
    return res.status(400).json({ message: "Referencia inválida." });
  }
  if (prismaCode === "P2025") {
    return res.status(404).json({ message: "Registro no encontrado." });
  }

  const status = err.status || 500;
  const message = status === 500 ? "Error interno del servidor." : err.message;
  if (status === 500) {
    console.error(err);
  }
  return res.status(status).json({ message });
}

export function notFound(_req, res) {
  res.status(404).json({ message: "Ruta no encontrada." });
}
