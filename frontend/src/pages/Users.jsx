import { useState } from "react";
import { api } from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import FormActions, { dash } from "../components/FormActions";
import Modal from "../components/Modal";
import { ActionButtons, PageHeader } from "../components/PageBits";
import { useToast } from "../components/Toast";
import { usePagedList } from "../hooks/usePagedList";

const empty = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  password: "",
  rol: "EMPLEADO",
  activo: true,
};

export default function Users() {
  const { push } = useToast();
  const [rol, setRol] = useState("");
  const [activo, setActivo] = useState("");
  const list = usePagedList("/users", { rol, activo });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const openCreate = () => {
    setForm(empty);
    setModal("create");
  };

  const openEdit = (row) => {
    setForm({
      ...row,
      password: "",
      telefono: row.telefono || "",
    });
    setModal("edit");
  };

  const openView = (row) => {
    setForm(row);
    setModal("view");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, activo: Boolean(form.activo) };
      if (modal === "edit" && !payload.password) {
        delete payload.password;
      }
      if (modal === "create") {
        await api("/users", { method: "POST", body: payload });
        push("Usuario creado");
      } else {
        await api(`/users/${form.id}`, { method: "PUT", body: payload });
        push("Usuario actualizado");
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
      const result = await api(`/users/${toDelete.id}`, { method: "DELETE" });
      push(result?.message || "Usuario eliminado");
      setToDelete(null);
      list.reload();
    } catch (error) {
      push(error.message, "error");
    }
  };

  return (
    <div>
      <PageHeader title="Usuarios" actionLabel="Nuevo usuario" onAction={openCreate} />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <input placeholder="Buscar..." value={list.search} onChange={(e) => list.setSearch(e.target.value)} />
        <select
          value={rol}
          onChange={(e) => {
            setRol(e.target.value);
            list.setPage(1);
          }}
        >
          <option value="">Todos los roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="EMPLEADO">EMPLEADO</option>
        </select>
        <select
          value={activo}
          onChange={(e) => {
            setActivo(e.target.value);
            list.setPage(1);
          }}
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>
      <DataTable
        columns={[
          { key: "id", label: "ID", sort: true },
          { key: "nombre", label: "Nombre", sort: true },
          { key: "apellido", label: "Apellido", sort: true },
          { key: "email", label: "Email", sort: true },
          { key: "telefono", label: "Teléfono", render: (r) => dash(r.telefono) },
          { key: "rol", label: "Rol", sort: true },
          { key: "activo", label: "Activo", render: (r) => (r.activo ? "Sí" : "No") },
          {
            key: "actions",
            label: "Acciones",
            render: (r) => (
              <ActionButtons onView={() => openView(r)} onEdit={() => openEdit(r)} onDelete={() => setToDelete(r)} />
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
      <Modal open={modal === "view"} title="Usuario" onClose={() => setModal(null)}>
        <dl className="grid gap-2 text-sm">
          <p>
            <strong>Nombre:</strong> {form.nombre} {form.apellido}
          </p>
          <p>
            <strong>Email:</strong> {form.email}
          </p>
          <p>
            <strong>Teléfono:</strong> {dash(form.telefono)}
          </p>
          <p>
            <strong>Rol:</strong> {form.rol}
          </p>
          <p>
            <strong>Activo:</strong> {form.activo ? "Sí" : "No"}
          </p>
        </dl>
      </Modal>
      <Modal open={modal === "create" || modal === "edit"} title={modal === "create" ? "Nuevo usuario" : "Editar usuario"} onClose={() => setModal(null)}>
        <form onSubmit={submit} className="grid gap-3">
          <div>
            <label>Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div>
            <label>Apellido</label>
            <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label>Teléfono</label>
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div>
            <label>{modal === "edit" ? "Contraseña (opcional)" : "Contraseña"}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={modal === "create"}
              minLength={modal === "create" ? 8 : undefined}
            />
          </div>
          <div>
            <label>Rol</label>
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
              <option value="EMPLEADO">EMPLEADO</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={Boolean(form.activo)} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            Activo
          </label>
          <FormActions onCancel={() => setModal(null)} submitting={submitting} />
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar usuario"
        message="¿Eliminar este usuario? Si tiene movimientos, se desactivará."
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
