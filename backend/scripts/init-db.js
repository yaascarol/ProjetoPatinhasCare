import { readFile } from "node:fs/promises";
import { pool } from "../src/db.js";

try {
  const sql = await readFile(
    new URL("../sql/001-usuarios.sql", import.meta.url),
    "utf8"
  );

  await pool.query(sql);

  console.log("Tabela de usuários criada.");
} catch {
  console.error("Não foi possível preparar o banco. Confira a conexão.");
  process.exitCode = 1;
} finally {
  await pool.end();
}