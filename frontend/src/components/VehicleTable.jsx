import { useState, useMemo } from "react";
import api from "../api/api";
import VehicleEditModal from "./VehicleEditModal";

export default function VehicleTable({ vehicles, refresh }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    return vehicles.filter((v) =>
      v.plate.toLowerCase().includes(search.toLowerCase())
    );
  }, [vehicles, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const currentData = filtered.slice((page - 1) * perPage, page * perPage);

  const handleExit = async (plate) => {
    if (!confirm(`¿Registrar salida de ${plate}?`)) return;
    await api.put(`/salida/${plate}`);
    refresh();
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este registro?")) return;
    await api.delete(`/vehiculos/${id}`);
    refresh();
  };

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Buscar por placa..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded-lg w-full md:w-64"
        />

        <select
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
          className="border p-2 rounded-lg"
        >
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Placa</th>
              <th>Tipo</th>
              <th>Eléctrico</th>
              <th>Ingreso</th>
              <th>Salida</th>
              <th>Costo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((v) => (
              <tr key={v.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-semibold">{v.plate}</td>
                <td>{v.type}</td>
                <td>{v.is_electric ? "Sí" : "No"}</td>
                <td>{new Date(v.entry_time).toLocaleString()}</td>
                <td>{v.exit_time ? new Date(v.exit_time).toLocaleString() : "—"}</td>
                <td>{v.cost ? `$${v.cost.toFixed(2)}` : "Pendiente"}</td>
                <td className="flex gap-2 flex-wrap">
                  {!v.exit_time && (
                    <button
                      onClick={() => handleExit(v.plate)}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Salida
                    </button>
                  )}
                  <button
                    onClick={() => setEditing(v)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {currentData.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No hay resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginador */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ←
        </button>
        <span>
          Página {page} de {totalPages || 1}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages || totalPages === 0}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          →
        </button>
      </div>

      {/* Modal de edición */}
      {editing && (
        <VehicleEditModal
          vehicle={editing}
          onClose={() => setEditing(null)}
          onUpdated={refresh}
        />
      )}
    </div>
  );
}
