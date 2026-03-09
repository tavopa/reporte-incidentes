import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clasificacion = searchParams.get("clasificacion") ?? "";
  const estado = searchParams.get("estado") ?? "";
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 10;
  const offset = (page - 1) * limit;

  // Build dynamic WHERE clause
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (clasificacion && clasificacion !== "all") {
    conditions.push(`clasificacion_principal = $${idx++}`);
    params.push(clasificacion);
  }
  if (estado && estado !== "all") {
    conditions.push(`estado = $${idx++}`);
    params.push(estado);
  }
  if (search) {
    conditions.push(
      `(nombre ILIKE $${idx} OR compania ILIKE $${idx})`
    );
    params.push(`%${search}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataQuery = `
    SELECT id, nombre, telefono, nivel_organizacional, compania,
           fecha_evento, hora_aproximada, que_ocurrio, por_que_ocurrio,
           impacto, clasificacion_principal, estado, created_at
    FROM incidents
    ${where}
    ORDER BY created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const countQuery = `SELECT COUNT(*) FROM incidents ${where}`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [...params, limit, offset]),
    pool.query(countQuery, params),
  ]);

  return NextResponse.json({
    incidents: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page,
    limit,
  });
}
