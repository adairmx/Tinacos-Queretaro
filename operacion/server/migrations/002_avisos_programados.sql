-- Avisos al cliente que salen por reloj: confirmación la noche anterior, confirmación en la mañana del servicio
-- y recordatorio a los seis meses. Cada columna guarda cuándo se atendió ese aviso (se haya generado o se haya
-- decidido que no hacía falta), para que el vigía no lo repita.

ALTER TABLE servicios
  ADD COLUMN confirmacion_noche_en   timestamptz,
  ADD COLUMN confirmacion_manana_en  timestamptz,
  ADD COLUMN recordatorio_en         timestamptz;

CREATE INDEX servicios_por_confirmar ON servicios (fecha)
  WHERE estado IN ('agendado', 'tomado') AND (confirmacion_noche_en IS NULL OR confirmacion_manana_en IS NULL);

CREATE INDEX servicios_por_recordar ON servicios (realizado_en)
  WHERE estado = 'realizado' AND recordatorio_en IS NULL;
