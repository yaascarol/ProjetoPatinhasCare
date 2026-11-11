import { readFile } from "node:fs/promises";
import { pool } from "../src/db.js";

try {
    const sql = await readFile(
        new URL("../sql/005-saude.sql", import.meta.url),
        "utf8"
    );

    await pool.query(sql);

    console.log("Tabelas de saúde preparadas.");
} catch (erro) {
    console.error("Erro na preparação das tabelas de saúde:",
        erro.code || erro.name
    );

    process.exitCode = 1;
} finally {
    await pool.end();
}
