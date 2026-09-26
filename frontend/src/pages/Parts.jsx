import { useEffect, useState } from "react";
import { api } from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import { dash, money } from "../components/FormActions";
import FormActions from "../components/FormActions";
import Modal from "../components/Modal";
import { ActionButtons, PageHeader } from "../components/PageBits";
import { useToast } from "../components/Toast";
import { usePagedList } from "../hooks/usePagedList";

const empty = {
  codigo: "",
  nombre: "",
  descripcion: "",
  categoria: "",
  marca: "",
  precioCompra: "",
  precioVenta: "",
  stock: 0,
  stockMinimo: 0,
  ubicacion: "",
  proveedorId: "",
  activo: true,
};

export default function Parts() {
  const { push } = useToast();
  const [activo, setActivo] = useState("");
  const [lowStock, setLowStock] = useState("");
  const [categoria, setCategoria] = useState("");
  const list = usePagedList("/parts", { activo, lowStock, categoria });
  const [suppliers, setSuppliers] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    api("/suppliers?pageSize=100&sortBy=nombre&sortOrder=asc")
      .then((data) => setSuppliers(data.items || []))
      .catch((error) => push(error.message, "error"));
  }, [push]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        precioCompra: Number(form.precioCompra),
        precioVenta: Number(form.precioVenta),
        stock: Number(form.stock || 0),
        stockMinimo: Number(form.stockMinimo || 0),
        proveedorId: form.proveedorId ? Number(form.proveedorId) : null,
        activo: Boolean(form.activo),
      };
      if (modal === "edit") {
        delete payload.stock;
      }
      if (modal === "create") {
        await api("/parts", { method: "POST", body: payload });
        push("Refacción creada");
      } else {
        await api(`/parts/${form.id}`, { method: "PUT", body: payload });
        push("Refacción actualizada");
      }
      setModal(null);
      list.reload();
    } catch (error) {
      push(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const result = await api(`/parts/${toDelete.id}`, { method: "DELETE" });
      push(result?.message || "Refacción eliminada");
      setToDelete(null);
      list.reload();
    } catch (error) {
      push(error.message, "error");
    }
  };

  return (
    <div>
      <PageHeader title="Refacciones" actionLabel="Nueva refacción" onAction={() => { setForm(empty); setModal("create"); }} />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <input placeholder="Buscar..." value={list.search} onChange={(e) => list.setSearch(e.target.value)} />
        <input
          placeholder="Categoría"
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
            list.setPage(1);
          }}
        />
        <select
          value={activo}
          onChange={(e) => {
            setActivo(e.target.value);
            list.setPage(1);
          }}
        >
          <option value="">Estado</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
        <select
          value={lowStock}
          onChange={(e) => {
            setLowStock(e.target.value);
            list.setPage(1);
          }}
        >
          <option value="">Stock</option>
          <option value="true">Stock bajo</option>
        </select>
      </div>
      <DataTable
        columns={[
          { key: "codigo", label: "Código", sort: true },
          { key: "nombre", label: "Nombre", sort: true },
          { key: "categoria", label: "Categoría", sort: true, render: (r) => dash(r.categoria) },
          { key: "stock", label: "Stock", sort: true },
          { key: "precioVenta", label: "Precio venta", sort: true, render: (r) => money(r.precioVenta) },
          { key: "activo", label: "Activo", render: (r) => (r.activo ? "Sí" : "No") },
          {
            key: "actions",
            label: "Acciones",
            render: (r) => (
              <ActionButtons
                onView={() => { setForm(r); setModal("view"); }}
                onEdit={() => {
                  setForm({
                    ...empty,
                    ...r,
                    proveedorId: r.proveedorId || "",
                    precioCompra: r.precioCompra,
                    precioVenta: r.precioVenta,
                  });
                  setModal("edit");
                }}
                onDelete={() => setToDelete(r)}
              />
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
      <Modal open={modal === "view"} title="Refacción" onClose={() => setModal(null)} wide>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p><strong>Código:</strong> {form.codigo}</p>
          <p><strong>Nombre:</strong> {form.nombre}</p>
          <p className="sm:col-span-2"><strong>Descripción:</strong> {dash(form.descripcion)}</p>
          <p><strong>Categoría:</strong> {dash(form.categoria)}</p>
          <p><strong>Marca:</strong> {dash(form.marca)}</p>
          <p><strong>Compra:</strong> {money(form.precioCompra)}</p>
          <p><strong>Venta:</strong> {money(form.precioVenta)}</p>
          <p><strong>Stock:</strong> {form.stock} (mín. {form.stockMinimo})</p>
          <p><strong>Ubicación:</strong> {dash(form.ubicacion)}</p>
          <p><strong>Proveedor:</strong> {form.proveedor?.nombre || dash(form.proveedorId)}</p>
          <p><strong>Activo:</strong> {form.activo ? "Sí" : "No"}</p>
        </div>
      </Modal>
      <Modal open={modal === "create" || modal === "edit"} title={modal === "create" ? "Nueva refacción" : "Editar refacción"} onClose={() => setModal(null)} wide>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label>Código</label>
            <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required />
          </div>
          <div>
            <label>Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <label>Descripción</label>
            <textarea value={form.descripcion || ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} />
          </div>
          <div>
            <label>Categoría</label>
            <input value={form.categoria || ""} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
          </div>
          <div>
            <label>Marca</label>
            <input value={form.marca || ""} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
          </div>
          <div>
            <label>Precio compra</label>
            <input type="number" step="0.01" value={form.precioCompra} onChange={(e) => setForm({ ...form, precioCompra: e.target.value })} required />
          </div>
          <div>
            <label>Precio venta</label>
            <input type="number" step="0.01" value={form.precioVenta} onChange={(e) => setForm({ ...form, precioVenta: e.target.value })} required />
          </div>
          {modal === "create" && (
            <div>
              <label>Stock inicial</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
          )}
          <div>
            <label>Stock mínimo</label>
            <input type="number" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} />
          </div>
          <div>
            <label>Ubicación</label>
            <input value={form.ubicacion || ""} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />
          </div>
          <div>
            <label>Proveedor</label>
            <select value={form.proveedorId || ""} onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}>
              <option value="">Sin proveedor</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" checked={Boolean(form.activo)} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            Activa
          </label>
          <div className="sm:col-span-2">
            <FormActions onCancel={() => setModal(null)} submitting={submitting} />
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar refacción"
        message="Si tiene movimientos, se marcará como inactiva."
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
