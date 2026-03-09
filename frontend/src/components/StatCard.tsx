import { ReactNode } from "react";

type Color = "indigo" | "red" | "green" | "teal";

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  color: Color;
}

const colorMap: Record<Color, { bg: string; icon: string; badge: string; text: string }> = {
  indigo: {
    bg: "bg-indigo-50",
    icon: "bg-brand-600 text-white",
    badge: "bg-brand-100 text-brand-700",
    text: "text-brand-700",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-500 text-white",
    badge: "bg-red-100 text-red-700",
    text: "text-red-700",
  },
  green: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-500 text-white",
    badge: "bg-emerald-100 text-emerald-700",
    text: "text-emerald-700",
  },
  teal: {
    bg: "bg-teal-50",
    icon: "bg-teal-500 text-white",
    badge: "bg-teal-100 text-teal-700",
    text: "text-teal-700",
  },
};

export default function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 truncate">
          {title}
        </p>
        <p className={`text-3xl font-bold mt-0.5 ${c.text}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>
      </div>
    </div>
  );
}
