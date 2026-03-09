"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Correo o contraseña incorrectos. Verifica tus datos.");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-brand-700 flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">ReporteBot</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Sistema de Reporte
            <br />
            <span className="text-indigo-200">de Incidentes</span>
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed max-w-sm">
            Gestiona, visualiza y da seguimiento a todos los reportes de incidentes
            y accidentes laborales desde un solo lugar.
          </p>
        </div>

        {/* Stats chips */}
        <div className="relative z-10 flex gap-4 flex-wrap">
          {[
            { label: "Seguridad", emoji: "🛡️" },
            { label: "Salud", emoji: "❤️" },
            { label: "Medio Ambiente", emoji: "🌿" },
          ].map(({ label, emoji }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full border border-white/20"
            >
              <span>{emoji}</span>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">ReporteBot</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido de vuelta</h2>
          <p className="text-gray-400 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder-gray-300 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder-gray-300 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Iniciando sesión…
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <p className="text-xs text-gray-300 text-center mt-8">
            © {new Date().getFullYear()} ReporteBot — Uso interno
          </p>
        </div>
      </div>
    </div>
  );
}
