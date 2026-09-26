import { useState } from "react";
import DataTable from "../components/DataTable";
import { dash } from "../components/FormActions";
import { PageHeader } from "../components/PageBits";
import { usePagedList } from "../hooks/usePagedList";

export default function Movements() {
  const [tipo, setTipo] = useState("");
  const list = usePagedList("/movements", { tipo });

  return (
    <div>
      <PageHeader title="Movimientos" />
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <input placeholder="Buscar..." value={list.search} onChange={(e) => list.setSearch(e.target.value)} />
        <select
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            list.setPage(1);
          }}
        >
          <option value="">Todos los tipos</option>
          <option value="ENTRADA">ENTRADA</option>
          <option value="SALIDA">SALIDA</option>
          <option value="AJUSTE">AJUSTE</option>
        </select>
      </div>
      <DataTable
        columns={[
          { key: "fecha", label: "Fecha", sort: true, render: (r) => new Date(r.fecha).toLocaleString() },
          { key: "tipo", label: "Tipo", sort: true },
          { key: "pieza", label: "Pieza", render: (r) => `${r.pieza?.codigo} — ${r.pieza?.nombre}` },
          { key: "cantidad", label: "Cantidad", sort: true },
          { key: "usuario", label: "Usuario", render: (r) => `${r.usuario?.nombre} ${r.usuario?.apellido}` },
          { key: "nota", label: "Nota", render: (r) => dash(r.nota) },
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
    </div>
  );
}
