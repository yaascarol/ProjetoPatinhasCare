CREATE TABLE IF NOT EXISTS gatos (
    id UUID PRIMARY KEY,

    nome TEXT NOT NULL
        CHECK (CHAR_LENGTH(TRIM(nome)) > 0),

    data_nascimento DATE,

    sexo VARCHAR(20) NOT NULL
        CHECK (sexo IN ('macho', 'femea', 'nao_informado')),
    
    status VARCHAR(30) NOT NULL
        CHECK(
            status IN (
                'disponivel',
                'indisponivel',
                'em_observacao',
                'adotado(a)',
                'nao_informado'
            )
        ),

        personalidade TEXT[] NOT NULL DEFAULT '{}',

        descricao TEXT NOT NULL DEFAULT '',

        foto_url TEXT NOT NULL DEFAULT '',

        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);