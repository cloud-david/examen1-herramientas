import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useToast } from "../components/Toast";

function Card({ label, value, to }) {
  return (
    <Link to={to} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-orange-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-800">{value}</p>
    </Link>
  );
}

export default function Dashboard() {
  const { push } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/dashboard")
      .then((payload) => {
        setData(payload);
        setError("");
      })
      .catch((err) => {
        setError(err.message);
        push(err.message, "error");
      });
  }, [push]);

  if (error && !data) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="text-slate-500">Cargando dashboard...</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Dashboard</h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card label="Total de piezas" value={data.totalPiezas} to="/refacciones" />
        <Card label="Piezas con stock bajo" value={data.piezasStockBajo} to="/refacciones" />
        <Card label="Total de clientes" value={data.totalClientes} to="/clientes" />
        <Card label="Total de vehículos" value={data.totalVehiculos} to="/vehiculos" />
        <Card label="Total de proveedores" value={data.totalProveedores} to="/proveedores" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Movimientos recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Pieza</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {data.movimientosRecientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Sin movimientos
                  </td>
                </tr>
              ) : (
                data.movimientosRecientes.map((m) => (
                  <tr key={m.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{new Date(m.fecha).toLocaleString()}</td>
                    <td className="px-4 py-3">{m.tipo}</td>
                    <td className="px-4 py-3">
                      {m.pieza.codigo} — {m.pieza.nombre}
                    </td>
                    <td className="px-4 py-3">{m.cantidad}</td>
                    <td className="px-4 py-3">
                      {m.usuario.nombre} {m.usuario.apellido}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
