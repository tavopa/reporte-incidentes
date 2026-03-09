"use client";

import { X, User, Calendar, FileText, Tag } from "lucide-react";

export interface Incident {
  id: string;
  nombre: string | null;
  telefono: string | null;
  nivel_organizacional: string | null;
  compania: string | null;
  fecha_evento: string | null;
  hora_aproximada: string | null;
  que_ocurrio: string | null;
  por_que_ocurrio: string | null;
  impacto: string | null;
  clasificacion_principal: string | null;
  estado: string;
  created_at: string;
}

const clasifColor: Record<string, string> = {
  Seguridad: "bg-red-100 text-red-700 border-red-200",
  Salud: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Medio ambiente": "bg-teal-100 text-teal-700 border-teal-200",
};

const Row = ({ label, value }: { label: string; value: string | null }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-40 shrink-0">
      {label}
    </span>
    <span className="text-sm text-gray-700 break-words">{value ?? "—"}</span>
  </div>
);

interface IncidentModalProps {
  incident: Incident;
  onClose: () => void;
}

export default function IncidentModal({ incident, onClose }: IncidentModalProps) {
  const clasif = incident.clasificacion_principal ?? "";
  const badgeCls = clasifColor[clasif] ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Detalle del Incidente</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Registrado:{" "}
              {new Date(incident.created_at).toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 space-y-5">
          {/* Reportante */}
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
              <User size={13} /> Reportante
            </h3>
            <Row label="Nombre" value={incident.nombre} />
            <Row label="Teléfono" value={incident.telefono} />
            <Row label="Nivel" value={incident.nivel_organizacional} />
            <Row label="Compañía" value={incident.compania} />
          </section>

          {/* Evento */}
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
              <Calendar size={13} /> Evento
            </h3>
            <Row label="Fecha" value={incident.fecha_evento} />
            <Row label="Hora aprox." value={incident.hora_aproximada} />
          </section>

          {/* Descripción */}
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
              <FileText size={13} /> Descripción
            </h3>
            <Row label="¿Qué ocurrió?" value={incident.que_ocurrio} />
            <Row label="¿Por qué?" value={incident.por_que_ocurrio} />
            <Row label="Impacto" value={incident.impacto} />
          </section>

          {/* Clasificación */}
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
              <Tag size={13} /> Clasificación
            </h3>
            {clasif ? (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${badgeCls}`}
              >
                {clasif}
              </span>
            ) : (
              <span className="text-sm text-gray-400">—</span>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
