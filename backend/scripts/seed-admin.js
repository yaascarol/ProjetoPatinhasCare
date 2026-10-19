import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

import { pool } from "../src/db.js";

try {
  const nome = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.ADMIN_PASSWORD;

  if (
    !nome ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !senha ||
    senha.length < 12 ||
    Buffer.byteLength(senha, "utf8") > 72
  ) {
    throw new Error("Configuração inicial inválida.");
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const resultado = await pool.query(
    `
      INSERT INTO usuarios (id, nome, email, senha_hash, papel)
      VALUES ($1, $2, $3, $4, 'responsavel')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `,
    [randomUUID(), nome, email, senhaHash]
  );

  console.log(
    resultado.rowCount === 1
      ? "Responsável cadastrada."
      : "Esse e-mail já existe. Nenhuma senha foi alterada."
  );
} catch (error) {
  console.error("Falha no cadastro inicial:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}