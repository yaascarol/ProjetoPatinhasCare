import { readFile } from "node:fs/promises";
import { pool } from "../src/db.js";
try {
  await pool.query(await readFile(new URL("../sql/004-recuperacao-senha.sql", import.meta.url), "utf8"));
  console.log("Recuperação de senha preparada.");
} catch (error) {
  console.error("Falha ao preparar recuperação:", error.message);
  process.exitCode = 1;
} finally { await pool.end(); }
