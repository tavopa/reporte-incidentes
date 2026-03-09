import { Pool } from "pg";

// Single connection pool shared across all API-route invocations
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export default pool;
