/** Columna de fecha con hora como texto ISO en UTC, igual venga de Postgres o del Postgres local. */
export const iso = (columna: string, alias = columna.split(".").pop()) =>
  `to_char(${columna} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS ${alias}`;
