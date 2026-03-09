"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Activity, Leaf, ClipboardList, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import IncidentsTable from "@/components/IncidentsTable";

interface Stats {
  total: string;
  seguridad: string;
  salud: string;
  medio_ambiente: string;
  pendiente: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/incidents/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));
  }, []);

  const n = (v: string | undefined) => parseInt(v ?? "0", 10);

  const today = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Panel de Control</h1>
            <p className="text-sm text-gray-400 mt-1">
              Gestión y seguimiento de reportes de incidentes laborales
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
            <Clock size={13} />
            <span className="capitalize">{today}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Reportes"
            value={statsLoading ? 0 : n(stats?.total)}
            subtitle="Todos los registros"
            icon={<ClipboardList size={22} />}
            color="indigo"
          />
          <StatCard
            title="Seguridad"
            value={statsLoading ? 0 : n(stats?.seguridad)}
            subtitle="Incidentes de seguridad"
            icon={<ShieldAlert size={22} />}
            color="red"
          />
          <StatCard
            title="Salud"
            value={statsLoading ? 0 : n(stats?.salud)}
            subtitle="Incidentes de salud"
            icon={<Activity size={22} />}
            color="green"
          />
          <StatCard
            title="Medio Ambiente"
            value={statsLoading ? 0 : n(stats?.medio_ambiente)}
            subtitle="Incidentes ambientales"
            icon={<Leaf size={22} />}
            color="teal"
          />
        </div>

        {/* Pending notice */}
        {!statsLoading && n(stats?.pendiente) > 0 && (
          <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-5 py-3 rounded-xl">
            <Clock size={15} className="shrink-0 text-amber-500" />
            <span>
              Hay <strong>{n(stats?.pendiente)}</strong> reporte
              {n(stats?.pendiente) !== 1 ? "s" : ""} pendiente
              {n(stats?.pendiente) !== 1 ? "s" : ""} de revisión.
            </span>
          </div>
        )}

        {/* Incidents table */}
        <IncidentsTable />
      </main>
    </div>
  );
}
