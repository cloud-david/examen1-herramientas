import { useState } from "react";
import { api } from "../api/client";
import DataTable from "../components/DataTable";
import FormActions from "../components/FormActions";
import Modal from "../components/Modal";
import { PageHeader } from "../components/PageBits";
import { useToast } from "../components/Toast";
import { usePagedList } from "../hooks/usePagedList";

export default function Inventory() {
  const { push } = useToast();
  const list = usePagedList("/inventory");
  const [modal, setModal] = useState(null);
  const [part, setPart] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [stockNuevo, setStockNuevo] = useState("");
  const [nota, setNota] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const open = (type, row) => {
    setPart(row);
    setCantidad("");
    setStockNuevo(row.stock);
    setNota("");
    setModal(type);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal === "entry") {
        await api("/inventory/entry", { method: "POST", body: { piezaId: part.id, cantidad: Number(cantidad), nota } });
        push("Entrada registrada");
      } else if (modal === "exit") {
        await api("/inventory/exit", { method: "POST", body: { piezaId: part.id, cantidad: Number(cantidad), nota } });
        push("Salida registrada");
      } else {
        await api("/inventory/adjust", { method: "POST", body: { piezaId: part.id, stockNuevo: Number(stockNuevo), nota } });
        push("Ajuste registrado");
      }
      setModal(null);
      list.reload();
    } catch (error) {
      push(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const titles = { entry: "Entrada de stock", exit: "Salida de stock", adjust: "Ajuste de stock" };

  return (
    <div>
      <PageHeader title="Inventario" />
      <div className="mb-4">
        <input placeholder="Buscar pieza..." value={list.search} onChange={(e) => list.setSearch(e.target.value)} />
      </div>
      <DataTable
        columns={[
          { key: "codigo", label: "Código", sort: true },
          { key: "nombre", label: "Pieza", sort: true },
          { key: "stock", label: "Stock", sort: true },
          { key: "stockMinimo", label: "Mínimo", sort: true },
          {
            key: "estado",
            label: "Estado",
            render: (r) =>
              r.stock <= r.stockMinimo ? (
                <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">Bajo</span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">OK</span>
              ),
          },
          {
            key: "actions",
            label: "Acciones",
            render: (r) => (
              <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700" onClick={() => open("entry", r)}>
                  Entrada
                </button>
                <button type="button" className="rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700" onClick={() => open("exit", r)}>
                  Salida
                </button>
                <button type="button" className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700" onClick={() => open("adjust", r)}>
                  Ajuste
                </button>
              </div>
            ),
          },
        ]}
        rows={list.items}
        total={list.total}
        page={list.page}
        pageSize={list.pageSize}
        sortBy={list.sortBy}
        sortOrder={list.sortOrder}
        onSort={list.onSort}
        onPage={list.setPage}
        loading={list.loading}
      />
      <Modal open={Boolean(modal)} title={titles[modal] || "Movimiento"} onClose={() => setModal(null)}>
        <form onSubmit={submit} className="grid gap-3">
          <p className="text-sm text-slate-600">
            {part?.codigo} — {part?.nombre} (stock actual: {part?.stock})
          </p>
          {modal === "adjust" ? (
            <div>
              <label>Stock nuevo</label>
              <input type="number" min="0" value={stockNuevo} onChange={(e) => setStockNuevo(e.target.value)} required />
            </div>
          ) : (
            <div>
              <label>Cantidad</label>
              <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
            </div>
          )}
          <div>
            <label>Nota</label>
            <input value={nota} onChange={(e) => setNota(e.target.value)} />
          </div>
          <FormActions onCancel={() => setModal(null)} submitting={submitting} submitLabel="Registrar" />
        </form>
      </Modal>
    </div>
  );
}
