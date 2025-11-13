import { useState } from "react";
import api from "../api/api";

export default function VehicleEditModal({ vehicle, onClose, onUpdated }) {
  const [form, setForm] = useState({
    plate: vehicle.plate,
    type: vehicle.type,
    is_electric: vehicle.is_electric,
    entry_time: vehicle.entry_time ? vehicle.entry_time.slice(0, 16) : "",
    exit_time: vehicle.exit_time ? vehicle.exit_time.slice(0, 16) : "",
    slot: vehicle.slot || 1,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convertir a formato ISO antes de enviar
      const payload = {
        ...form,
        entry_time: form.entry_time ? new Date(form.entry_time).toISOString() : null,
        exit_time: form.exit_time ? new Date(form.exit_time).toISOString() : null,
      };

      await api.put(`/vehiculos/${vehicle.id}`, payload);
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al actualizar vehículo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Editar Vehículo</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Placa */}
          <input
            type="text"
            name="plate"
            value={form.plate}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Placa"
            required
          />

          {/* Tipo */}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="moto">Moto</option>
            <option value="carro">Carro</option>
          </select>

          {/* Eléctrico */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_electric"
              checked={form.is_electric}
              onChange={handleChange}
            />
            Eléctrico / Híbrido
          </label>

          {/* Hora de entrada */}
          <div>
            <label className="text-sm font-medium">Hora de entrada:</label>
            <input
              type="datetime-local"
              name="entry_time"
              value={form.entry_time}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Hora de salida */}
          <div>
            <label className="text-sm font-medium">Hora de salida:</label>
            <input
              type="datetime-local"
              name="exit_time"
              value={form.exit_time}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Slot */}
          <div>
            <label className="text-sm font-medium">Número de puesto:</label>
            <input
              type="number"
              name="slot"
              value={form.slot}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              min="1"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
