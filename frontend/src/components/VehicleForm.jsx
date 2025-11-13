import { useState } from "react";
import api from "../api/api";

export default function VehicleForm({ onSuccess }) {
  const [plate, setPlate] = useState("");
  const [type, setType] = useState("moto");
  const [isElectric, setIsElectric] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/vehiculos", { plate, type, is_electric: isElectric });
      setPlate("");
      setIsElectric(false);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.error || "Error al registrar vehículo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between"
    >
      <input
        type="text"
        placeholder="Placa"
        value={plate}
        onChange={(e) => setPlate(e.target.value.toUpperCase())}
        className="border rounded-lg p-2 w-32 text-center"
        required
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border rounded-lg p-2"
      >
        <option value="moto">Moto</option>
        <option value="carro">Carro</option>
      </select>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isElectric}
          onChange={(e) => setIsElectric(e.target.checked)}
        />
        Eléctrico / Híbrido
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Guardando..." : "Ingresar"}
      </button>
    </form>
  );
}
