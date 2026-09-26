import { useEffect, useState } from "react";
import { api } from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import { dash } from "../components/FormActions";
import FormActions from "../components/FormActions";
import Modal from "../components/Modal";
import { ActionButtons, PageHeader } from "../components/PageBits";
import { useToast } from "../components/Toast";
import { usePagedList } from "../hooks/usePagedList";

const empty = {
  clienteId: "",
  marca: "",
  modelo: "",
  anio: "",
  version: "",
  motor: "",
  vin: "",
  placas: "",
};

export default function Vehicles() {
  const { push } = useToast();
  const [clienteId, setClienteId] = useState("");
  const list = usePagedList("/vehicles", { clienteId });
  const [clients, setClients] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    api("/clients?pageSize=100&sortBy=nombre&sortOrder=asc")
      .then((data) => setClients(data.items || []))
      .catch((error) => push(error.message, "error"));
  }, [push]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        clienteId: Number(form.clienteId),
        anio: Number(form.anio),
      };
      if (modal === "create") {
        await api("/vehicles", { method: "POST", body: payload });
        push("Vehículo creado");
      } else {
        await api(`/vehicles/${form.id}`, { method: "PUT", body: payload });
        push("Vehículo actualizado");
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
      await api(`/vehicles/${toDelete.id}`, { method: "DELETE" });
      push("Vehículo eliminado");
      setToDelete(null);
      list.reload();
    } catch (error) {
      push(error.message, "error");
    }
  };

  return (
    <div>
      <PageHeader title="Vehículos" actionLabel="Nuevo vehículo" onAction={() => { setForm(empty); setModal("create"); }} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <input placeholder="Buscar..." value={list.search} onChange={(e) => list.setSearch(e.target.value)} />
        <select
          value={clienteId}
          onChange={(e) => {
            setClienteId(e.target.value);
            list.setPage(1);
          }}
        >
          <option value="">Todos los clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        columns={[
          { key: "id", label: "ID", sort: true },
          { key: "cliente", label: "Cliente", render: (r) => r.cliente?.nombre },
          { key: "marca", label: "Marca", sort: true },
          { key: "modelo", label: "Modelo", sort: true },
          { key: "anio", label: "Año", sort: true },
          { key: "placas", label: "Placas", sort: true, render: (r) => dash(r.placas) },
          { key: "vin", label: "VIN", sort: true, render: (r) => dash(r.vin) },
          {
            key: "actions",
            label: "Acciones",
            render: (r) => (
              <ActionButtons
                onView={() => { setForm(r); setModal("view"); }}
                onEdit={() => { setForm({ ...empty, ...r, clienteId: r.clienteId }); setModal("edit"); }}
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
      <Modal open={modal === "view"} title="Vehículo" onClose={() => setModal(null)}>
        <div className="space-y-2 text-sm">
          <p><strong>Cliente:</strong> {form.cliente?.nombre || dash(form.clienteId)}</p>
          <p><strong>Marca / modelo:</strong> {form.marca} {form.modelo}</p>
          <p><strong>Año:</strong> {form.anio}</p>
          <p><strong>Versión:</strong> {dash(form.version)}</p>
          <p><strong>Motor:</strong> {dash(form.motor)}</p>
          <p><strong>VIN:</strong> {dash(form.vin)}</p>
          <p><strong>Placas:</strong> {dash(form.placas)}</p>
        </div>
      </Modal>
      <Modal open={modal === "create" || modal === "edit"} title={modal === "create" ? "Nuevo vehículo" : "Editar vehículo"} onClose={() => setModal(null)}>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label>Cliente</label>
            <select value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })} required>
              <option value="">Selecciona</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Marca</label>
            <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} required />
          </div>
          <div>
            <label>Modelo</label>
            <input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} required />
          </div>
          <div>
            <label>Año</label>
            <input type="number" value={form.anio} onChange={(e) => setForm({ ...form, anio: e.target.value })} required />
          </div>
          <div>
            <label>Versión</label>
            <input value={form.version || ""} onChange={(e) => setForm({ ...form, version: e.target.value })} />
          </div>
          <div>
            <label>Motor</label>
            <input value={form.motor || ""} onChange={(e) => setForm({ ...form, motor: e.target.value })} />
          </div>
          <div>
            <label>VIN</label>
            <input value={form.vin || ""} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
          </div>
          <div>
            <label>Placas</label>
            <input value={form.placas || ""} onChange={(e) => setForm({ ...form, placas: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <FormActions onCancel={() => setModal(null)} submitting={submitting} />
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={Boolean(toDelete)} title="Eliminar vehículo" message="¿Eliminar este vehículo?" onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />
    </div>
  );
}
