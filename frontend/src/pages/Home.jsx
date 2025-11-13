import { useEffect, useState } from "react";
import api from "../api/api";
import VehicleForm from "../components/VehicleForm";
import VehicleTable from "../components/VehicleTable";
import SummaryCard from "../components/SummaryCard";

export default function Home() {
  const [vehicles, setVehicles] = useState([]);

  const loadData = async () => {
    const res = await api.get("/vehiculos");
    setVehicles(res.data);
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Sistema de Parqueadero
      </h1>
      <VehicleForm onSuccess={loadData} />
      <div className="my-6">
        <VehicleTable vehicles={vehicles} refresh={loadData} />
      </div>
      <SummaryCard />
    </div>
  );
}
