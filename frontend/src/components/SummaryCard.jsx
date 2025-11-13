import api from "../api/api";
import { useState } from "react";

export default function SummaryCard() {
  const [summary, setSummary] = useState(null);

  const handleCloseDay = async () => {
    const res = await api.get("/ganancias/cierre");
    setSummary(res.data);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
      <h2 className="text-xl font-semibold">Cierre del Día</h2>
      <button
        onClick={handleCloseDay}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        Calcular Ganancias
      </button>
      {summary && (
        <p className="text-green-700 font-bold text-lg">
          Total: ${summary.ganancia_total.toFixed(2)}
        </p>
      )}
    </div>
  );
}
