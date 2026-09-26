export function ActionButtons({ onView, onEdit, onDelete }) {
  return (
    <div className="flex flex-wrap gap-2">
      {onView && (
        <button type="button" onClick={onView} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">
          Ver
        </button>
      )}
      {onEdit && (
        <button type="button" onClick={onEdit} className="rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100">
          Editar
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100">
          Eliminar
        </button>
      )}
    </div>
  );
}

export function PageHeader({ title, actionLabel, onAction, children }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        {children}
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
