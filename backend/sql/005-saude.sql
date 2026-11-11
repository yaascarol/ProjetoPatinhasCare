BEGIN;

-- Opções dos campos de tipo (vacina, exame e procedimento).
-- Quando alguém escolhe "Outro" e digita um nome novo, ele vira opção aqui.
-- nome_normalizado (minúsculo, sem acento e sem espaços repetidos) impede
-- duplicatas como "antirrabica", "Antirrábica" e "ANTIRRABICA".
CREATE TABLE IF NOT EXISTS tipos_saude (
    id UUID PRIMARY KEY,

    categoria VARCHAR(20) NOT NULL
        CHECK (categoria IN ('vacina', 'exame', 'procedimento')),

    nome TEXT NOT NULL
        CHECK (CHAR_LENGTH(TRIM(nome)) BETWEEN 1 AND 120),

    nome_normalizado TEXT NOT NULL,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (categoria, nome_normalizado)
);

-- Registros de saúde de cada gato. Sem ON DELETE CASCADE: um gato com
-- registros não pode ser excluído (a rota de gatos responde 409).
CREATE TABLE IF NOT EXISTS registros_saude (
    id UUID PRIMARY KEY,

    gato_id UUID NOT NULL REFERENCES gatos(id),

    tipo VARCHAR(20) NOT NULL
        CHECK (tipo IN ('consulta', 'vacina', 'vermifugo', 'exame', 'procedimento')),

    titulo TEXT NOT NULL
        CHECK (CHAR_LENGTH(TRIM(titulo)) BETWEEN 1 AND 120),

    data DATE NOT NULL,

    proxima_data DATE
        CHECK (proxima_data IS NULL OR proxima_data >= data),

    observacoes TEXT NOT NULL DEFAULT '',

    anexo_dados BYTEA,
    anexo_nome TEXT,
    anexo_tipo VARCHAR(40)
        CHECK (anexo_tipo IS NULL OR anexo_tipo IN ('application/pdf', 'image/jpeg', 'image/png')),

    criado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK ((anexo_dados IS NULL) = (anexo_tipo IS NULL))
);

CREATE INDEX IF NOT EXISTS registros_saude_gato_data_idx
    ON registros_saude (gato_id, data DESC);

-- Opções iniciais (as mesmas que existiam fixas no frontend).
INSERT INTO tipos_saude (id, categoria, nome, nome_normalizado)
VALUES
    (gen_random_uuid(), 'vacina', 'Antirrábica', 'antirrabica'),
    (gen_random_uuid(), 'vacina', 'V3', 'v3'),
    (gen_random_uuid(), 'vacina', 'V4', 'v4'),
    (gen_random_uuid(), 'vacina', 'V5', 'v5'),
    (gen_random_uuid(), 'exame', 'Hemograma', 'hemograma'),
    (gen_random_uuid(), 'exame', 'Ultrassom', 'ultrassom'),
    (gen_random_uuid(), 'exame', 'FIV/FeLV', 'fiv/felv'),
    (gen_random_uuid(), 'procedimento', 'Castração', 'castracao'),
    (gen_random_uuid(), 'procedimento', 'Curativo', 'curativo'),
    (gen_random_uuid(), 'procedimento', 'Cirurgia', 'cirurgia')
ON CONFLICT (categoria, nome_normalizado) DO NOTHING;

COMMIT;
