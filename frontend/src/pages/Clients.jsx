import { useState } from "react";
import { api } from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import { dash } from "../components/FormActions";
import FormActions from "../components/FormActions";
import Modal from "../components/Modal";
import { ActionButtons, PageHeader } from "../components/PageBits";
import { useToast } from "../components/Toast";
import { usePagedList } from "../hooks/usePagedList";

const empty = { nombre: "", telefono: "", email: "", direccion: "" };

export default function Clients() {
  const { push } = useToast();
  const list = usePagedList("/clients");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal === "create") {
        await api("/clients", { method: "POST", body: form });
        push("Cliente creado");
      } else {
        await api(`/clients/${form.id}`, { method: "PUT", body: form });
        push("Cliente actualizado");
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
      await api(`/clients/${toDelete.id}`, { method: "DELETE" });
      push("Cliente eliminado");
      setToDelete(null);
      list.reload();
    } catch (error) {
      push(error.message, "error");
    }
  };

  return (
    <div>
      <PageHeader title="Clientes" actionLabel="Nuevo cliente" onAction={() => { setForm(empty); setModal("create"); }} />
      <div className="mb-4">
        <input placeholder="Buscar..." value={list.search} onChange={(e) => list.setSearch(e.target.value)} />
      </div>
      <DataTable
        columns={[
          { key: "id", label: "ID", sort: true },
          { key: "nombre", label: "Nombre", sort: true },
          { key: "telefono", label: "Teléfono", sort: true, render: (r) => dash(r.telefono) },
          { key: "email", label: "Email", sort: true, render: (r) => dash(r.email) },
          { key: "direccion", label: "Dirección", render: (r) => dash(r.direccion) },
          {
            key: "actions",
            label: "Acciones",
            render: (r) => (
              <ActionButtons onView={() => { setForm(r); setModal("view"); }} onEdit={() => { setForm({ ...empty, ...r }); setModal("edit"); }} onDelete={() => setToDelete(r)} />
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
      <Modal open={modal === "view"} title="Cliente" onClose={() => setModal(null)}>
        <div className="space-y-2 text-sm">
          <p><strong>Nombre:</strong> {form.nombre}</p>
          <p><strong>Teléfono:</strong> {dash(form.telefono)}</p>
          <p><strong>Email:</strong> {dash(form.email)}</p>
          <p><strong>Dirección:</strong> {dash(form.direccion)}</p>
        </div>
      </Modal>
      <Modal open={modal === "create" || modal === "edit"} title={modal === "create" ? "Nuevo cliente" : "Editar cliente"} onClose={() => setModal(null)}>
        <form onSubmit={submit} className="grid gap-3">
          <div>
            <label>Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div>
            <label>Teléfono</label>
            <input value={form.telefono || ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label>Dirección</label>
            <input value={form.direccion || ""} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          </div>
          <FormActions onCancel={() => setModal(null)} submitting={submitting} />
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar cliente"
        message="¿Eliminar este cliente?"
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
