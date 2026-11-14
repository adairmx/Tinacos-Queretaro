-- Bandeja de leads: gente que pidió informes (formulario del sitio, y después mensajes y llamadas) y todavía no
-- tiene cita. Al agendarla, el lead queda ligado a su servicio.

CREATE TABLE prospectos (
  id               serial PRIMARY KEY,
  nombre           text NOT NULL,
  -- 10 dígitos cuando se pudo reconocer; si no, lo que la persona escribió, para que alguien lo revise.
  telefono         text NOT NULL,
  telefono_valido  boolean NOT NULL,
  ciudad           text REFERENCES ciudades (slug),   -- vacío: falta preguntarle
  colonia          text,
  tipo             text NOT NULL DEFAULT 'tinaco' CHECK (tipo IN ('tinaco', 'cisterna', 'ambos', 'otro')),
  litros           integer,
  notas            text,
  origen           text NOT NULL DEFAULT 'web',
  estado           text NOT NULL DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'contactado', 'agendado', 'descartado')),
  motivo_descarte  text,
  servicio_id      integer REFERENCES servicios (id) ON DELETE SET NULL,
  creado_en        timestamptz NOT NULL DEFAULT now(),
  actualizado_en   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX prospectos_por_estado ON prospectos (estado, creado_en DESC);
CREATE INDEX prospectos_por_telefono ON prospectos (telefono, creado_en DESC);
