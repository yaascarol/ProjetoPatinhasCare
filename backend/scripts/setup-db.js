import { readFile } from "node:fs/promises";
import { pool } from "../src/db.js";

// Preparação explícita: não é executada automaticamente durante o deploy.
const arquivos = [
  "001-usuarios.sql", "002-gatos.sql", "003-fotos-gatos.sql",
  "004-recuperacao-senha.sql", "005-saude.sql", "006-historias.sql", "007-equipe.sql",
];
const cliente = await pool.connect();
try {
  for (const arquivo of arquivos) {
    const sql = await readFile(new URL(`../sql/${arquivo}`, import.meta.url), "utf8");
    await cliente.query(sql);
    console.log(`Aplicado: ${arquivo}`);
  }
} catch (erro) {
  await cliente.query("ROLLBACK");
  console.error("Falha na preparação:", erro.code || erro.name);
  process.exitCode = 1;
} finally {
  cliente.release();
  await pool.end();
}
