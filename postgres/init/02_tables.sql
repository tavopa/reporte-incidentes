-- ───────────────────────────────────────────────────────────────
-- Conversation memory (LangChain PostgresChatMessageHistory format)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS message_store (
    id          SERIAL PRIMARY KEY,
    session_id  VARCHAR(255) NOT NULL,
    message     JSONB        NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_store_session ON message_store (session_id);

-- ───────────────────────────────────────────────────────────────
-- Incident / accident reports
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_user_id        BIGINT       NOT NULL,
    session_id              VARCHAR(255) NOT NULL,

    -- Reportante
    nombre                  VARCHAR(255),
    telefono                VARCHAR(50),
    nivel_organizacional    VARCHAR(100),  -- Ejecutivo | Supervisor | Operador
    compania                VARCHAR(255),

    -- Evento
    fecha_evento            VARCHAR(50),
    hora_aproximada         VARCHAR(50),

    -- Descripción
    que_ocurrio             TEXT,
    por_que_ocurrio         TEXT,
    impacto                 TEXT,

    -- Clasificación
    clasificacion_principal VARCHAR(100),  -- Seguridad | Salud | Medio ambiente

    -- Control
    estado                  VARCHAR(50)  DEFAULT 'pendiente',
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_user            ON incidents (telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_clasificacion   ON incidents (clasificacion_principal);
CREATE INDEX IF NOT EXISTS idx_incidents_estado          ON incidents (estado);
