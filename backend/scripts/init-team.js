import { readFile } from "node:fs/promises";
import { pool } from "../src/db.js";

try {
  await pool.query(await readFile(new URL("../sql/007-equipe.sql", import.meta.url), "utf8"));
  console.log("Equipe preparada. Contas existentes preservadas.");
} catch (erro) {
  console.error("Falha ao preparar Equipe:", erro.code || erro.name);
  process.exitCode = 1;
} finally { await pool.end(); }
