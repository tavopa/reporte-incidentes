"use client";

import { signOut, useSession } from "next-auth/react";
import { ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="text-gray-900 font-bold text-lg tracking-tight">
              Reporte<span className="text-brand-600">Bot</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm font-medium text-brand-600 border-b-2 border-brand-600 pb-0.5"
            >
              <LayoutDashboard size={15} />
              Panel
            </a>
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-800">
                {session?.user?.name ?? "Administrador"}
              </span>
              <span className="text-xs text-gray-400">{session?.user?.email}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm select-none">
              {session?.user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors ml-1"
              title="Cerrar sesión"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
