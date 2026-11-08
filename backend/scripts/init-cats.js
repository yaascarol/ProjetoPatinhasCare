import { readFile } from "node:fs/promises";
import { pool } from "../src/db.js";

try {
    const sql = await readFile(
        new URL("../sql/002-gatos.sql", import.meta.url),
        "utf8"
    );

    await pool.query(sql);

    console.log("Tabela de gatos preparada.");
} catch (erro) {
    console.error("Erro na preparação da tabela:",
        erro.code || erro.name
    );

    process.exitCode = 1;
} finally {
    await pool.end();
}