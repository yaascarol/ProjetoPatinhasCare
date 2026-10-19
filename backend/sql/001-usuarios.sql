CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL,
    senha_hash TEXT NOT NULL,

    papel VARCHAR(20) NOT NULL
        CHECK (papel IN ('responsavel', 'voluntario')),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (email = LOWER(TRIM(email)))
);