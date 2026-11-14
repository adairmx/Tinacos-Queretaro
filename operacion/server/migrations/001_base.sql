-- Base de la operación: proveedores, su disponibilidad, los servicios agendados y lo que se le avisa a cada quien.

CREATE TABLE ciudades (
  slug    text PRIMARY KEY,
  nombre  text NOT NULL,
  zona    text NOT NULL DEFAULT 'America/Mexico_City',
  activa  boolean NOT NULL DEFAULT true
);

CREATE TABLE proveedores (
  id            serial PRIMARY KEY,
  nombre        text NOT NULL,
  telefono      text NOT NULL UNIQUE CHECK (telefono ~ '^\d{10}$'),
  -- pendiente: se registró y falta que la casa lo apruebe. suspendido: no ve ni toma servicios.
  estado        text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'activo', 'suspendido')),
  -- Parte del precio que le toca a la casa; puede ir en cero mientras se arma la red.
  comision_pct  integer NOT NULL DEFAULT 30 CHECK (comision_pct BETWEEN 0 AND 100),
  -- por_servicio: liquida al terminar cada servicio. semanal: para quien ya hizo historial.
  liquidacion   text NOT NULL DEFAULT 'por_servicio' CHECK (liquidacion IN ('por_servicio', 'semanal')),
  equipo        text,
  experiencia   text,
  notas         text,
  protocolos_version       integer,
  protocolos_aceptados_en  timestamptz,
  creado_en     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE proveedor_ciudades (
  proveedor_id  integer NOT NULL REFERENCES proveedores (id) ON DELETE CASCADE,
  ciudad        text NOT NULL REFERENCES ciudades (slug),
  PRIMARY KEY (proveedor_id, ciudad)
);

-- Un renglón por bloque que el proveedor ofrece en un día. Lo que no está aquí, no está disponible.
CREATE TABLE disponibilidad (
  proveedor_id  integer NOT NULL REFERENCES proveedores (id) ON DELETE CASCADE,
  fecha         date NOT NULL,
  bloque        text NOT NULL,
  PRIMARY KEY (proveedor_id, fecha, bloque)
);

CREATE TABLE servicios (
  id                serial PRIMARY KEY,
  cliente_nombre    text NOT NULL,
  cliente_telefono  text NOT NULL CHECK (cliente_telefono ~ '^\d{10}$'),
  ciudad            text NOT NULL REFERENCES ciudades (slug),
  colonia           text,
  direccion         text,
  tipo              text NOT NULL CHECK (tipo IN ('tinaco', 'cisterna', 'ambos', 'otro')),
  litros            integer,
  precio            integer NOT NULL CHECK (precio >= 0),
  fecha             date NOT NULL,
  bloque            text NOT NULL,
  -- agendado: ya tiene cita con el cliente y falta que un proveedor lo tome.
  estado            text NOT NULL DEFAULT 'agendado'
                    CHECK (estado IN ('agendado', 'tomado', 'en_camino', 'realizado', 'cancelado')),
  proveedor_id      integer REFERENCES proveedores (id),
  tomado_en         timestamptz,
  en_camino_en      timestamptz,
  realizado_en      timestamptz,
  cancelado_en      timestamptz,
  motivo_cancelacion text,
  -- La comisión se fija al tomar el servicio, para que un cambio posterior no altere lo ya pactado.
  comision_pct      integer,
  comision_monto    integer,
  liquidacion_estado text NOT NULL DEFAULT 'no_aplica'
                    CHECK (liquidacion_estado IN ('no_aplica', 'pendiente', 'reportada', 'pagada')),
  liquidacion_reportada_en timestamptz,
  liquidacion_pagada_en    timestamptz,
  liquidacion_nota  text,
  sin_proveedor_avisado_en timestamptz,
  origen            text NOT NULL DEFAULT 'panel',
  notas             text,
  creado_en         timestamptz NOT NULL DEFAULT now()
);

-- El candado: un proveedor no puede tener dos servicios vivos en el mismo bloque.
CREATE UNIQUE INDEX servicios_un_bloque_por_proveedor
  ON servicios (proveedor_id, fecha, bloque)
  WHERE proveedor_id IS NOT NULL AND estado <> 'cancelado';

CREATE INDEX servicios_por_cupo ON servicios (ciudad, fecha, bloque) WHERE estado <> 'cancelado';

-- Bitácora que no se edita: quién hizo qué y a qué hora, por si hay una disputa.
CREATE TABLE servicio_eventos (
  id           serial PRIMARY KEY,
  servicio_id  integer NOT NULL REFERENCES servicios (id) ON DELETE CASCADE,
  tipo         text NOT NULL,
  actor        text NOT NULL,           -- 'admin', 'sistema' o 'proveedor:<id>'
  detalle      text,
  creado_en    timestamptz NOT NULL DEFAULT now()
);

-- Lo que hay que decirle a alguien. Mientras WhatsApp no esté conectado, se mandan a mano desde el panel.
CREATE TABLE avisos (
  id            serial PRIMARY KEY,
  servicio_id   integer REFERENCES servicios (id) ON DELETE CASCADE,
  para          text NOT NULL CHECK (para IN ('proveedor', 'cliente', 'admin')),
  proveedor_id  integer REFERENCES proveedores (id) ON DELETE CASCADE,
  telefono      text,
  motivo        text NOT NULL,
  texto         text NOT NULL,
  estado        text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'descartado')),
  creado_en     timestamptz NOT NULL DEFAULT now(),
  enviado_en    timestamptz
);

CREATE INDEX avisos_pendientes ON avisos (estado, creado_en) WHERE estado = 'pendiente';

-- De cada sesión y de cada enlace de acceso sólo se guarda la huella del secreto, nunca el secreto.
CREATE TABLE sesiones (
  huella        text PRIMARY KEY,
  tipo          text NOT NULL CHECK (tipo IN ('admin', 'proveedor')),
  proveedor_id  integer REFERENCES proveedores (id) ON DELETE CASCADE,
  expira_en     timestamptz NOT NULL,
  creado_en     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE accesos (
  huella        text PRIMARY KEY,
  proveedor_id  integer NOT NULL REFERENCES proveedores (id) ON DELETE CASCADE,
  expira_en     timestamptz NOT NULL,
  usado_en      timestamptz
);
