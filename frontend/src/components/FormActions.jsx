export default function FormActions({ onCancel, submitting, submitLabel = "Guardar" }) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
        Cancelar
      </button>
      <button type="submit" disabled={submitting} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60">
        {submitLabel}
      </button>
    </div>
  );
}

export function money(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return value ?? "—";
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export function dash(value) {
  return value === null || value === undefined || value === "" ? "—" : value;
}
