'use client';
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, ArcElement, Tooltip, Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Charts() {
  const [monthlyData, setMonthly] = useState<{_id:{month:number}, totalQty:number}[]>([]);
  const [prodData, setProd] = useState<{_id:string, totalQty:number}[]>([]);

  useEffect(() => {
    fetch('/api/admin/orders/stats').then(r=>r.json()).then(setMonthly);
    fetch('/api/admin/orders/stats/product').then(r=>r.json()).then(setProd);
  }, []);

  const barData = {
    labels: monthlyData.map(m => `Mes ${m._id.month}`),
    datasets: [{
      label: 'Consumo mensual',
      data: monthlyData.map(m=>m.totalQty),
      backgroundColor: 'rgba(34,197,94,0.5)'
    }]
  };

  const doughnutData = {
    labels: prodData.map(p=>p._id),
    datasets: [{
      data: prodData.map(p=>p.totalQty),
      backgroundColor: ['#34D399','#60A5FA','#FBBF24','#F97316']
    }]
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 bg-white rounded-lg shadow">
      <div className="flex-1">
        <h2 className="font-semibold text-gray-700 mb-2">Consumo mensual</h2>
        <Bar data={barData} />
      </div>
      <div className="flex-1">
        <h2 className="font-semibold text-gray-700 mb-2">Producto más usado</h2>
        <Doughnut data={doughnutData} />
      </div>
    </div>
  );
}
