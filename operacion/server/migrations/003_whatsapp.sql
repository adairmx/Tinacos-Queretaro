-- Envío de avisos por la API de WhatsApp de Meta y registro de lo que la gente contesta.

-- Fuera de las 24 horas de la última respuesta, WhatsApp sólo deja mandar plantillas aprobadas:
-- cada aviso guarda qué plantilla usa y con qué valores, además del texto ya armado.
ALTER TABLE avisos
  ADD COLUMN plantilla          text,
  ADD COLUMN variables          jsonb,
  ADD COLUMN intentos           integer NOT NULL DEFAULT 0,
  ADD COLUMN ultimo_intento_en  timestamptz,
  ADD COLUMN error              text,
  ADD COLUMN wamid              text,          -- identificador del mensaje en WhatsApp
  ADD COLUMN entregado_en       timestamptz,
  ADD COLUMN leido_en           timestamptz;

-- fallido: WhatsApp no lo pudo mandar; queda en el panel para mandarlo a mano.
ALTER TABLE avisos DROP CONSTRAINT avisos_estado_check;
ALTER TABLE avisos ADD CONSTRAINT avisos_estado_check CHECK (estado IN ('pendiente', 'enviado', 'fallido', 'descartado'));

CREATE UNIQUE INDEX avisos_por_wamid ON avisos (wamid) WHERE wamid IS NOT NULL;

DROP INDEX avisos_pendientes;
CREATE INDEX avisos_por_atender ON avisos (estado, id) WHERE estado IN ('pendiente', 'fallido');

CREATE TABLE mensajes_entrantes (
  id            serial PRIMARY KEY,
  wamid         text NOT NULL UNIQUE,          -- WhatsApp puede repetir una entrega: no se guarda dos veces
  telefono      text NOT NULL,
  nombre        text,
  texto         text NOT NULL,
  servicio_id   integer REFERENCES servicios (id) ON DELETE SET NULL,
  proveedor_id  integer REFERENCES proveedores (id) ON DELETE SET NULL,
  recibido_en   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX mensajes_entrantes_por_telefono ON mensajes_entrantes (telefono, recibido_en DESC);
