import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await pool.query(`
    SELECT
      COUNT(*)                                                           AS total,
      COUNT(*) FILTER (WHERE clasificacion_principal = 'Seguridad')     AS seguridad,
      COUNT(*) FILTER (WHERE clasificacion_principal = 'Salud')         AS salud,
      COUNT(*) FILTER (WHERE clasificacion_principal = 'Medio ambiente') AS medio_ambiente,
      COUNT(*) FILTER (WHERE estado = 'pendiente')                      AS pendiente
    FROM incidents
  `);

  return NextResponse.json(result.rows[0]);
}
