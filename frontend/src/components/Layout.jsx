import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/usuarios", label: "Usuarios", admin: true },
  { to: "/clientes", label: "Clientes" },
  { to: "/vehiculos", label: "Vehículos" },
  { to: "/refacciones", label: "Refacciones" },
  { to: "/proveedores", label: "Proveedores" },
  { to: "/inventario", label: "Inventario" },
  { to: "/movimientos", label: "Movimientos" },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {open && <button type="button" aria-label="Cerrar menú" className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={`fixed inset-y-0 z-40 flex w-64 transform flex-col bg-slate-900 text-slate-100 transition lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 font-bold">R</div>
          <div>
            <p className="text-sm font-semibold">Refaccionaria</p>
            <p className="text-xs text-slate-400">Panel administrativo</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links
            .filter((link) => !link.admin || isAdmin)
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm ${isActive ? "bg-orange-600 text-white" : "hover:bg-slate-800"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
        </nav>
        <div className="shrink-0 border-t border-slate-800 p-4">
          <p className="truncate text-sm font-medium">
            {user?.nombre} {user?.apellido}
          </p>
          <p className="mb-3 text-xs text-slate-400">{user?.rol}</p>
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <button type="button" className="rounded-md border border-slate-300 px-3 py-1 text-sm lg:hidden" onClick={() => setOpen((v) => !v)}>
            Menú
          </button>
          <p className="hidden text-sm text-slate-500 lg:block">Gestión de inventario y clientes</p>
          <span className="max-w-[55%] truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {user?.email}
          </span>
        </header>
        <main className="min-w-0 flex-1 overflow-x-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
