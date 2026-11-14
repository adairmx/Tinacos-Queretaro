-- Pláticas que atiende el agente por mensajes. Cada persona tiene una conversación por canal y en ella se guarda
-- lo que escribió ella, lo que contestó el agente y lo que contestó alguien de la casa.

CREATE TABLE conversaciones (
  id              serial PRIMARY KEY,
  canal           text NOT NULL DEFAULT 'whatsapp',
  telefono        text NOT NULL,
  nombre          text,
  -- agente: contesta el agente. humano: la casa tomó la plática y el agente ya no escribe.
  modo            text NOT NULL DEFAULT 'agente' CHECK (modo IN ('agente', 'humano')),
  motivo_humano   text,
  creado_en       timestamptz NOT NULL DEFAULT now(),
  actualizado_en  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (canal, telefono)
);

CREATE TABLE mensajes (
  id               serial PRIMARY KEY,
  conversacion_id  integer NOT NULL REFERENCES conversaciones (id) ON DELETE CASCADE,
  rol              text NOT NULL CHECK (rol IN ('cliente', 'agente', 'humano')),
  texto            text NOT NULL,
  -- Falso mientras el agente no haya contestado después de este mensaje del cliente.
  atendido         boolean NOT NULL DEFAULT false,
  creado_en        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX mensajes_por_conversacion ON mensajes (conversacion_id, id);
