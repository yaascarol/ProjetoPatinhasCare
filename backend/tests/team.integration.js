import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";

test("Equipe: autorização, persistência, primeiro acesso e proteção do último responsável", { timeout: 60000 }, async () => {
  const schema = "teste_equipe_" + randomBytes(8).toString("hex");
  const adminPool = new pg.Pool();
  const pool = new pg.Pool({ options: `-c search_path=${schema}` });
  let child, criado = false, output = "";
  try {
    await adminPool.query(`CREATE SCHEMA ${schema}`);
    criado = true;
    assert.equal((await pool.query("SELECT current_schema() AS nome")).rows[0].nome, schema);
    for (const arquivo of ["001-usuarios.sql", "002-gatos.sql", "003-fotos-gatos.sql", "004-recuperacao-senha.sql", "005-saude.sql", "006-equipe.sql"]) {
      await pool.query(await readFile(new URL(`../sql/${arquivo}`, import.meta.url), "utf8"));
    }
    const senha = "SenhaTesteEquipe123!";
    const hash = await bcrypt.hash(senha, 12);
    const adminId = randomUUID(), voluntarioId = randomUUID();
    for (const [id, email, papel] of [[adminId,"admin@example.invalid","responsavel"],[voluntarioId,"voluntario@example.invalid","voluntario"]]) {
      await pool.query("INSERT INTO usuarios(id,nome,email,papel,senha_hash) VALUES($1,'Teste',$2,$3,$4)", [id,email,papel,hash]);
    }
    const reserva = createServer();
    await new Promise(resolve => reserva.listen(0, "127.0.0.1", resolve));
    const port = reserva.address().port;
    await new Promise(resolve => reserva.close(resolve));
    child = spawn(process.execPath, ["src/server.js"], {
      cwd: fileURLToPath(new URL("../", import.meta.url)),
      env: { ...process.env, PORT: String(port), PGOPTIONS: `-c search_path=${schema}`, FRONTEND_ORIGIN: "http://localhost:5173", RECUPERACAO_LOCAL: "true", NODE_ENV: "test", SESSION_SECRET: randomBytes(32).toString("hex") },
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", data => { output += data.toString(); });
    child.stderr.on("data", () => {});
    for (let i=0;i<150 && !output.includes("API local disponível");i++) {
      if (child.exitCode !== null) throw new Error("API de teste não iniciou.");
      await new Promise(resolve => setTimeout(resolve,100));
    }
    assert.ok(output.includes("API local disponível"), "API de teste deve iniciar");
    async function call(route, method="GET", body, cookie, origin="http://localhost:5173") {
      const response = await fetch(`http://127.0.0.1:${port}/api${route}`, { method, headers: { Origin: origin, "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
      return { status: response.status, body: response.status === 204 ? null : await response.json(), cookie: response.headers.get("set-cookie")?.split(";")[0] };
    }
    async function login(email) {
      const r = await call("/auth/login", "POST", { email, senha });
      assert.equal(r.status,200);
      return r.cookie;
    }
    const admin = await login("admin@example.invalid");
    const voluntario = await login("voluntario@example.invalid");
    assert.equal((await call("/equipe")).status,401);
    for (const [route,method,body] of [["/equipe","GET"],["/equipe","POST",{}],[`/equipe/${adminId}`,"PATCH",{ativo:false}],[`/equipe/${adminId}/recuperacao`,"POST"]]) {
      assert.equal((await call(route,method,body,voluntario)).status,403);
    }
    const lista = await call("/equipe","GET",undefined,admin);
    assert.equal(lista.status,200);
    assert.equal(lista.body.integrantes.length,2);
    assert.ok(lista.body.integrantes.every(pessoa => !("senha_hash" in pessoa) && !("versao_senha" in pessoa)));
    assert.equal((await call("/equipe","POST",{},admin)).status,400);
    assert.equal((await call("/equipe","POST",{nome:"Outro",email:" ADMIN@example.invalid ",papel:"voluntario"},admin)).status,409);
    assert.equal((await call("/equipe","POST",{},admin,"http://origem-invalida.test")).status,403);
    assert.equal((await call("/equipe/invalido","PATCH",{ativo:false},admin)).status,400);
    assert.equal((await call(`/equipe/${randomUUID()}`,"PATCH",{ativo:false},admin)).status,404);
    const novo = await call("/equipe","POST",{nome:"Nova responsável",email:"nova@example.invalid",papel:"responsavel"},admin);
    assert.equal(novo.status,201);
    const novoId = novo.body.integrante.id;
    assert.equal(novo.body.integrante.senhaDefinida,false);
    assert.equal((await call(`/equipe/${adminId}`,"PATCH",{ativo:false},admin)).status,409);
    assert.equal((await call(`/equipe/${adminId}`,"PATCH",{papel:"voluntario"},admin)).status,409);
    assert.equal((await call("/auth/login","POST",{email:"nova@example.invalid",senha},undefined)).status,401);
    output = "";
    const envio = await call(`/equipe/${novoId}/recuperacao`,"POST",undefined,admin);
    assert.equal(envio.status,200);
    assert.ok(!JSON.stringify(envio.body).includes("#token="));
    for (let i=0;i<20 && !output.includes("#token=");i++) await new Promise(resolve => setTimeout(resolve,50));
    const token = output.match(/#token=([a-f0-9]{64})/)?.[1];
    assert.ok(token,"Deve gerar um link local");
    assert.equal((await call(`/equipe/${novoId}/recuperacao`,"POST",undefined,admin)).status,429);
    assert.equal((await call("/auth/reset-password","POST",{token,senha})).status,200);
    assert.equal((await call("/auth/reset-password","POST",{token,senha})).status,400);
    const nova = await login("nova@example.invalid");
    assert.equal((await pool.query("SELECT senha_definida FROM usuarios WHERE id=$1",[novoId])).rows[0].senha_definida,true);
    // Voluntários consultam, mas não podem excluir nem mesmo pela API diretamente.
    const gatoId = randomUUID(), registroId = randomUUID();
    await pool.query("INSERT INTO gatos(id,nome,sexo,status) VALUES($1,'Gato teste','macho','disponivel')",[gatoId]);
    await pool.query("INSERT INTO registros_saude(id,gato_id,tipo,titulo,data) VALUES($1,$2,'vacina','V3',CURRENT_DATE)",[registroId,gatoId]);
    assert.equal((await call('/saude/registros',"GET",undefined,voluntario)).status,200);
    assert.equal((await call(`/gatos/${gatoId}`,"GET",undefined,voluntario)).status,200);
    assert.equal((await call(`/saude/registros/${registroId}`,"DELETE",undefined,voluntario)).status,403);
    assert.equal((await call(`/gatos/${gatoId}`,"DELETE",undefined,voluntario)).status,403);
    assert.equal((await pool.query('SELECT id FROM gatos WHERE id=$1',[gatoId])).rowCount,1);
    assert.equal((await pool.query('SELECT id FROM registros_saude WHERE id=$1',[registroId])).rowCount,1);
    assert.equal((await call(`/saude/registros/${registroId}`,"DELETE",undefined,admin)).status,204);
    assert.equal((await call(`/gatos/${gatoId}`,"DELETE",undefined,admin)).status,204);
    assert.equal((await call(`/equipe/${voluntarioId}`,"PATCH",{ativo:false},admin)).status,200);
    assert.equal((await call("/auth/me","GET",undefined,voluntario)).status,401);
    assert.equal((await call(`/equipe/${voluntarioId}/recuperacao`,"POST",undefined,admin)).status,409);
    assert.equal((await call(`/equipe/${voluntarioId}`,"PATCH",{ativo:true},admin)).status,200);
    assert.equal((await call("/auth/me","GET",undefined,voluntario)).status,401);
    const novoLogin = await login("voluntario@example.invalid");
    assert.equal((await call("/auth/me","GET",undefined,novoLogin)).status,200);
    const concorrentes = await Promise.all([
      call(`/equipe/${adminId}`,"PATCH",{papel:"voluntario"},admin),
      call(`/equipe/${novoId}`,"PATCH",{papel:"voluntario"},nova),
    ]);
    assert.deepEqual(concorrentes.map(r=>r.status).sort(),[200,409]);
    const sobreviventes = await pool.query("SELECT id FROM usuarios WHERE ativo=TRUE AND senha_definida=TRUE AND papel='responsavel'");
    assert.equal(sobreviventes.rowCount,1);
    const rebaixadoCookie = sobreviventes.rows[0].id === adminId ? nova : admin;
    assert.equal((await call("/auth/me","GET",undefined,rebaixadoCookie)).status,401);
    const responsavelCookie = sobreviventes.rows[0].id === adminId ? admin : nova;
    assert.equal((await call(`/equipe/${sobreviventes.rows[0].id}`,"DELETE",undefined,responsavelCookie)).status,409);
    assert.equal((await call(`/equipe/${voluntarioId}`,"DELETE")).status,401);
    assert.equal((await call(`/equipe/${voluntarioId}`,"DELETE",undefined,novoLogin)).status,403);
    const historicoGato = randomUUID(), historicoId = randomUUID();
    await pool.query("INSERT INTO gatos(id,nome,sexo,status) VALUES($1,'Histórico preservado','macho','disponivel')",[historicoGato]);
    await pool.query("INSERT INTO registros_saude(id,gato_id,tipo,titulo,data,criado_por) VALUES($1,$2,'vacina','V3',CURRENT_DATE,$3)",[historicoId,historicoGato,voluntarioId]);
    const antigoToken = randomBytes(32).toString('hex');
    await pool.query("INSERT INTO recuperacoes_senha(usuario_id,token_hash,expira_em) VALUES($1,$2,NOW()+INTERVAL '15 minutes')",[voluntarioId,createHash('sha256').update(antigoToken).digest('hex')]);
    assert.equal((await call(`/equipe/${voluntarioId}`,"DELETE",undefined,responsavelCookie)).status,204);
    assert.equal((await pool.query('SELECT id FROM usuarios WHERE id=$1',[voluntarioId])).rowCount,0);
    assert.equal((await pool.query('SELECT usuario_id FROM recuperacoes_senha WHERE usuario_id=$1',[voluntarioId])).rowCount,0);
    assert.equal((await pool.query("SELECT sid FROM session WHERE sess::jsonb->>'usuarioId'=$1",[voluntarioId])).rowCount,0);
    assert.equal((await pool.query('SELECT criado_por FROM registros_saude WHERE id=$1',[historicoId])).rows[0].criado_por,null);
    assert.equal((await call("/auth/me","GET",undefined,novoLogin)).status,401);
    const listaApos = await call('/equipe','GET',undefined,responsavelCookie);
    assert.ok(!listaApos.body.integrantes.some(pessoa=>pessoa.id===voluntarioId));
    assert.equal((await call(`/equipe/${voluntarioId}`,"DELETE",undefined,responsavelCookie)).status,404);
    const recadastro = await call('/equipe','POST',{nome:'Recadastrado',email:'voluntario@example.invalid',papel:'voluntario'},responsavelCookie);
    assert.equal(recadastro.status,201);
    assert.notEqual(recadastro.body.integrante.id,voluntarioId);
    assert.equal(recadastro.body.integrante.senhaDefinida,false);
    assert.equal((await call("/auth/reset-password","POST",{token:antigoToken,senha})).status,400);
    assert.equal((await call("/auth/me","GET",undefined,novoLogin)).status,401);
  } finally {
    if (child && child.exitCode === null) {
      const terminou = once(child,"exit");
      child.kill();
      await terminou;
    }
    await pool.end();
    if (criado) await adminPool.query(`DROP SCHEMA ${schema} CASCADE`);
    await adminPool.end();
  }
});
