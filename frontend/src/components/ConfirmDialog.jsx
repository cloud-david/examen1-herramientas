import Modal from "./Modal";

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  return (
    <Modal open={open} title={title || "Confirmar"} onClose={onCancel}>
      <p className="mb-6 text-sm text-slate-600">{message}</p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
          Cancelar
        </button>
        <button type="button" onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
          Eliminar
        </button>
      </div>
    </Modal>
  );
}
