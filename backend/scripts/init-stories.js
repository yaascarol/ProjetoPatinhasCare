import { readFile } from "node:fs/promises";
import { pool } from "../src/db.js";

try {
  await pool.query(await readFile(new URL("../sql/006-historias.sql", import.meta.url), "utf8"));
  console.log("Tabela de histórias do Mural preparada.");
} catch (erro) {
  console.error("Falha ao preparar o Mural:", erro.code || erro.name);
  process.exitCode = 1;
} finally { await pool.end(); }