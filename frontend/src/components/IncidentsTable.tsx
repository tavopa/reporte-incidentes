"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, Filter } from "lucide-react";
import IncidentModal, { Incident } from "./IncidentModal";

// ── Badge helpers ──────────────────────────────────────────────────────────

const clasifBadge: Record<string, string> = {
  Seguridad: "bg-red-100 text-red-700",
  Salud: "bg-emerald-100 text-emerald-700",
  "Medio ambiente": "bg-teal-100 text-teal-700",
};

const estadoBadge: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  en_proceso: "bg-blue-100 text-blue-700",
  cerrado: "bg-gray-100 text-gray-600",
};

function Badge({ text, map }: { text: string | null; map: Record<string, string> }) {
  if (!text) return <span className="text-gray-300 text-xs">—</span>;
  const cls = map[text] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{text}</span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function IncidentsTable() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [clasificacion, setClasificacion] = useState("all");
  const [estado, setEstado] = useState("all");

  const [selected, setSelected] = useState<Incident | null>(null);

  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, clasificacion, estado]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        clasificacion,
        estado,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await fetch(`/api/incidents?${params}`);
      const json = await res.json();
      setIncidents(json.incidents ?? []);
      setTotal(json.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, clasificacion, estado]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <h2 className="text-base font-bold text-gray-900 whitespace-nowrap">
              Reportes de Incidentes
            </h2>
            <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {total}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar por nombre o empresa…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 w-56"
              />
            </div>

            {/* Clasificación filter */}
            <div className="relative">
              <Filter
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                value={clasificacion}
                onChange={(e) => setClasificacion(e.target.value)}
                className="pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none bg-white cursor-pointer"
              >
                <option value="all">Todas las clasificaciones</option>
                <option value="Seguridad">Seguridad</option>
                <option value="Salud">Salud</option>
                <option value="Medio ambiente">Medio ambiente</option>
              </select>
            </div>

            {/* Estado filter */}
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none bg-white cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Nombre", "Compañía", "Nivel", "Fecha evento", "Clasificación", "Estado", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Cargando registros…</span>
                    </div>
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-300">
                    <p className="text-4xl mb-2">🗂️</p>
                    <p className="text-sm font-medium text-gray-400">
                      No se encontraron incidentes
                    </p>
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                    onClick={() => setSelected(inc)}
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {inc.nombre ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{inc.compania ?? "—"}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {inc.nivel_organizacional ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {inc.fecha_evento ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge text={inc.clasificacion_principal} map={clasifBadge} />
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge text={inc.estado} map={estadoBadge} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        className="flex items-center gap-1 text-xs text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(inc);
                        }}
                      >
                        <Eye size={14} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Mostrando{" "}
            <span className="font-medium text-gray-600">
              {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)}
            </span>{" "}
            de <span className="font-medium text-gray-600">{total}</span> registros
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                    p === page
                      ? "bg-brand-600 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <IncidentModal incident={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
