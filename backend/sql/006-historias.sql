CREATE TABLE IF NOT EXISTS historias (
    id UUID PRIMARY KEY,
    gato_id UUID REFERENCES gatos(id) ON DELETE SET NULL,
    nome_gato TEXT NOT NULL DEFAULT '',
    titulo VARCHAR(120) NOT NULL CHECK (CHAR_LENGTH(TRIM(titulo)) > 0),
    texto TEXT NOT NULL CHECK (CHAR_LENGTH(TRIM(texto)) > 0),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicada')),
    foto_dados BYTEA,
    autor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);