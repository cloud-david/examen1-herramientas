import { HttpError } from "../middleware/error.js";

export function requireFields(body, fields) {
  const missing = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || String(value).trim() === "";
  });
  if (missing.length) {
    throw new HttpError(400, `Campos requeridos: ${missing.join(", ")}.`);
  }
}

export function parseId(value, name = "id") {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `${name} inválido.`);
  }
  return id;
}

export function pagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
  const skip = (page - 1) * pageSize;
  const sortOrder = String(query.sortOrder || "desc").toLowerCase() === "asc" ? "asc" : "desc";
  const search = String(query.search || "").trim();
  return { page, pageSize, skip, take: pageSize, sortOrder, search };
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export function toNumber(value, name, { min, integer } = {}) {
  const n = Number(value);
  if (Number.isNaN(n)) {
    throw new HttpError(400, `${name} debe ser numérico.`);
  }
  if (integer && !Number.isInteger(n)) {
    throw new HttpError(400, `${name} debe ser entero.`);
  }
  if (min !== undefined && n < min) {
    throw new HttpError(400, `${name} no puede ser menor que ${min}.`);
  }
  return n;
}
