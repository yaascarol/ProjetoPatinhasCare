import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const configuracao = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
} : {
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
};

export const pool = new Pool({ ...configuracao, max: 5, connectionTimeoutMillis: 15000 });
